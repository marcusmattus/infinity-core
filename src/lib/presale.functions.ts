import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  EDITION_IDS,
  MAX_QTY,
  PAYMENT_MODES,
  type PresaleConfig,
} from "./presale/pricing";

/**
 * The client-callable surface of the HoloDock presale.
 *
 * This module ships to the browser, so every server-only import happens inside
 * a handler — the same rule `waitlist.functions.ts` follows.
 */

const checkoutSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Enter your full name so we know who the order is for.")
    .max(120),
  email: z
    .string()
    .trim()
    .email("Enter an email address, like name@example.com.")
    .max(254),
  company: z.string().trim().max(120).optional(),
  edition: z.enum(EDITION_IDS),
  mode: z.enum(PAYMENT_MODES),
  quantity: z.number().int().min(1).max(MAX_QTY),
  /** Optional: mail about the order doesn't need it, product updates do. */
  marketingConsent: z.boolean().default(false),
  /** Honeypot: a real person never sees this field, so a value means a bot. */
  website: z.string().max(200).optional(),
});

/** Prices and availability for the page: what the buyer is about to be charged, so safe to expose. */
export const getPresaleConfig = createServerFn({ method: "GET" }).handler(
  async (): Promise<PresaleConfig> => {
    const { readPresaleConfig } = await import("./presale/config.server");
    return readPresaleConfig();
  },
);

export const startPresaleCheckout = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => checkoutSchema.parse(input))
  .handler(async ({ data }): Promise<{ url: string }> => {
    if (data.website) throw new Error("Something went wrong. Try again.");

    const { readPresaleConfig, readShipCountries, readSiteUrl } = await import(
      "./presale/config.server"
    );
    const { unitAmount } = await import("./presale/pricing");
    const { createCheckoutSession, StripeNotConfiguredError } = await import(
      "./presale/stripe.server"
    );
    const { createOrder, updateOrder } = await import("./presale/orders.server");
    const { splitName, syncHubSpotContact } = await import("./presale/hubspot.server");

    const config = readPresaleConfig();
    if (!config.open) {
      throw new Error(
        "The presale isn't open yet. Join the waitlist and we'll email you when it is.",
      );
    }

    const edition = config.editions.find((e) => e.id === data.edition)!;
    const unit = unitAmount(config, data.edition, data.mode);
    if (!unit) {
      throw new Error(
        `Full pre-orders for the ${edition.name} open once pricing is set. You can reserve one with a deposit today.`,
      );
    }

    const email = data.email.toLowerCase();
    const isFull = data.mode === "full";
    const siteUrl = readSiteUrl();

    try {
      const order = await createOrder({
        email,
        full_name: data.fullName,
        company: data.company || null,
        edition: data.edition,
        quantity: data.quantity,
        order_type: data.mode,
        unit_amount: unit,
        currency: config.currency,
        marketing_consent: data.marketingConsent,
      });

      const session = await createCheckoutSession({
        email,
        quantity: data.quantity,
        unitAmount: unit,
        currency: config.currency,
        productName: isFull
          ? `HoloDock ${edition.name} — presale`
          : `HoloDock ${edition.name} — reservation deposit`,
        productDescription: isFull
          ? "First production run. Refundable until dispatch."
          : "Refundable. Counts towards the price; balance due before dispatch.",
        paymentDescription: `HoloDock ${isFull ? "presale" : "deposit"} (${edition.name} × ${data.quantity})`,
        metadata: {
          order_id: order.id,
          edition: data.edition,
          quantity: String(data.quantity),
          order_type: data.mode,
        },
        successUrl: `${siteUrl}/holodock/reserved?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${siteUrl}/holodock?reservation=cancelled#presale`,
        ...(isFull ? { shippingCountries: readShipCountries() } : {}),
      });

      await updateOrder(order.id, {
        status: "pending",
        stripe_checkout_session_id: session.id,
        amount_total: unit * data.quantity,
      });

      const { first, last } = splitName(data.fullName);
      const hubspotId = await syncHubSpotContact({
        email,
        firstname: first,
        lastname: last,
        company: data.company,
        lifecyclestage: "marketingqualifiedlead",
        holodock: {
          edition: data.edition,
          units: String(data.quantity),
          order_type: data.mode,
          deposit_status: "pending",
          source: "presale",
        },
      });
      if (hubspotId) await updateOrder(order.id, { hubspot_contact_id: hubspotId });

      return { url: session.url };
    } catch (error) {
      if (error instanceof StripeNotConfiguredError) {
        throw new Error(
          "The presale isn't open yet. Join the waitlist and we'll email you when it is.",
        );
      }
      console.error("[presale] checkout failed:", error instanceof Error ? error.message : error);
      throw new Error(
        "We couldn't start checkout just now. No payment was taken. Try again in a minute.",
      );
    }
  });
