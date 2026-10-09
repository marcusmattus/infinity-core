import "@tanstack/react-start/server-only";
import { createEmailWebhookHandler } from "@lovable.dev/email-js";
import { readWaitlistConfig } from "./config.server";
import { applyProviderEvent, confirm, unsubscribe } from "./funnel.server";

/**
 * The parts of the funnel that are reached from outside the app: confirmation
 * links, unsubscribe links, and the provider's webhook.
 *
 * These cannot be server functions — those are POST-only and CSRF-guarded,
 * which is right for the browser and wrong for a link in an email client.
 * `src/server.ts` offers each request here first and falls through when the
 * path is not ours.
 */

const PREFIX = "/api/waitlist/";

function redirect(location: string): Response {
  return new Response(null, { status: 302, headers: { location } });
}

function text(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
  });
}

async function tokenFromRequest(request: Request, url: URL): Promise<string> {
  const fromQuery = url.searchParams.get("token");
  if (fromQuery) return fromQuery;
  if (request.method !== "POST") return "";

  const contentType = request.headers.get("content-type") ?? "";
  try {
    if (contentType.includes("application/x-www-form-urlencoded")) {
      return String(new URLSearchParams(await request.text()).get("token") ?? "");
    }
    if (contentType.includes("application/json")) {
      const body = (await request.json()) as { token?: unknown };
      return typeof body.token === "string" ? body.token : "";
    }
  } catch {
    return "";
  }
  return "";
}

export async function handleWaitlistRequest(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith(PREFIX)) return null;

  const action = url.pathname.slice(PREFIX.length);

  try {
    if (action === "confirm" && request.method === "GET") {
      const result = await confirm(url.searchParams.get("token") ?? "");
      return redirect(result.ok ? "/waitlist/confirmed" : "/waitlist/confirmed?state=invalid");
    }

    if (action === "unsubscribe") {
      // A GET only *offers* to unsubscribe. Mail scanners and link previewers
      // fetch every URL in a message; if GET did the deed, they would quietly
      // unsubscribe people who never clicked.
      if (request.method === "GET") {
        const token = url.searchParams.get("token") ?? "";
        return redirect(`/waitlist/unsubscribe?token=${encodeURIComponent(token)}`);
      }

      if (request.method === "POST") {
        const result = await unsubscribe(await tokenFromRequest(request, url));

        // RFC 8058 one-click: the mail client wants a bare 200, not a redirect.
        const wantsPage = (request.headers.get("accept") ?? "").includes("text/html");
        if (!wantsPage)
          return text(result.ok ? "unsubscribed" : "invalid token", result.ok ? 200 : 404);

        return redirect(
          result.ok ? "/waitlist/unsubscribed" : "/waitlist/unsubscribed?state=invalid",
        );
      }
    }

    if (action === "webhook" && request.method === "POST") {
      const config = readWaitlistConfig();
      const handler = createEmailWebhookHandler({
        apiKey: config.apiKey,
        on: {
          "email.bounced": (event) =>
            applyProviderEvent("email.bounced", event.data.recipient, event.data.message_id),
          "email.complaint": (event) =>
            applyProviderEvent("email.complaint", event.data.recipient, event.data.message_id),
          "email.unsubscribed": (event) =>
            applyProviderEvent("email.unsubscribed", event.data.recipient, event.data.message_id),
          "email.resubscribed": (event) =>
            applyProviderEvent("email.resubscribed", event.data.recipient, event.data.message_id),
        },
      });
      return handler(request);
    }

    return text("Not found", 404);
  } catch (error) {
    console.error("[waitlist] request failed:", error instanceof Error ? error.message : error);
    return text("Something went wrong handling that link.", 500);
  }
}
