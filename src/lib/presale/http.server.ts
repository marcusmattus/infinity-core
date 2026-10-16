import "@tanstack/react-start/server-only";
import { findOrder, updateOrder, type OrderRow } from "./orders.server";
import { splitName, syncHubSpotContact } from "./hubspot.server";
import { verifyWebhook, type StripeEvent } from "./stripe.server";

/**
 * Stripe → Supabase + HubSpot.
 *
 * Reached from outside the app (Stripe POSTs it), so like the waitlist's email
 * links it can't be a server function. `src/server.ts` offers each request
 * here first and falls through when the path is not ours.
 *
 * Subscribe the endpoint to: checkout.session.completed,
 * checkout.session.async_payment_succeeded, checkout.session.expired,
 * charge.refunded.
 */

const PATH = "/api/stripe/webhook";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

type Session = {
  id: string;
  payment_status?: string;
  payment_intent?: string | { id: string } | null;
  customer?: string | { id: string } | null;
  amount_total?: number | null;
  currency?: string | null;
  metadata?: Record<string, string> | null;
  shipping_details?: unknown;
  collected_information?: { shipping_details?: unknown } | null;
};

const idOf = (v: string | { id: string } | null | undefined): string | null =>
  typeof v === "string" ? v : (v?.id ?? null);

async function orderForSession(session: Session): Promise<OrderRow | null> {
  const id = session.metadata?.["order_id"];
  if (id) {
    const byId = await findOrder("id", id);
    if (byId) return byId;
  }
  return findOrder("stripe_checkout_session_id", session.id);
}

async function handle(event: StripeEvent): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as unknown as Session;
      if (session.payment_status !== "paid") return;
      const order = await orderForSession(session);
      // Unknown order, or Stripe retried an event we have already handled.
      if (!order || order.status === "paid") return;

      const shipping =
        session.collected_information?.shipping_details ?? session.shipping_details ?? null;
      await updateOrder(order.id, {
        status: "paid",
        paid_at: new Date().toISOString(),
        stripe_payment_intent_id: idOf(session.payment_intent),
        stripe_customer_id: idOf(session.customer),
        amount_total: session.amount_total ?? order.amount_total,
        ...(shipping ? { shipping } : {}),
      });

      const { first, last } = splitName(order.full_name);
      await syncHubSpotContact({
        email: order.email,
        firstname: first,
        lastname: last,
        lifecyclestage: order.order_type === "full" ? "customer" : "opportunity",
        holodock: { deposit_status: "paid", order_type: order.order_type },
      });
      return;
    }

    case "checkout.session.expired": {
      const session = event.data.object as unknown as Session;
      const order = await orderForSession(session);
      if (order && order.status === "pending" && order.stripe_checkout_session_id === session.id) {
        await updateOrder(order.id, { status: "expired" });
        await syncHubSpotContact({ email: order.email, holodock: { deposit_status: "abandoned" } });
      }
      return;
    }

    case "charge.refunded": {
      const charge = event.data.object as {
        refunded?: boolean;
        payment_intent?: string | { id: string } | null;
      };
      if (!charge.refunded) return; // a partial refund leaves the order as paid
      const intent = idOf(charge.payment_intent);
      if (!intent) return;
      const order = await findOrder("stripe_payment_intent_id", intent);
      if (!order) return;
      await updateOrder(order.id, { status: "refunded" });
      await syncHubSpotContact({ email: order.email, holodock: { deposit_status: "refunded" } });
      return;
    }

    default:
      return;
  }
}

export async function handleStripeRequest(request: Request): Promise<Response | null> {
  if (new URL(request.url).pathname !== PATH) return null;
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const secret = process.env["STRIPE_WEBHOOK_SECRET"];
  if (!secret) return json({ error: "Stripe is not configured" }, 503);

  let event: StripeEvent;
  try {
    event = await verifyWebhook(
      await request.text(),
      request.headers.get("stripe-signature"),
      secret,
    );
  } catch (error) {
    console.error(
      "[presale] webhook signature check failed:",
      error instanceof Error ? error.message : error,
    );
    return json({ error: "Invalid signature" }, 400);
  }

  try {
    await handle(event);
  } catch (error) {
    console.error(
      `[presale] webhook handler failed for ${event.type}:`,
      error instanceof Error ? error.message : error,
    );
    return json({ error: "Handler failed" }, 500); // a 500 makes Stripe retry
  }
  return json({ received: true });
}
