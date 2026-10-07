import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { PageHeader } from "@/components/infinity/PageHeader";
import { SiteFooter } from "@/components/infinity/SiteFooter";
import { WaitlistOutcome } from "@/components/waitlist/WaitlistOutcome";

export const Route = createFileRoute("/waitlist/unsubscribe")({
  validateSearch: z.object({ token: z.string().max(200).optional() }),
  head: () => ({ meta: [{ title: "Unsubscribe — InfinityID Labs" }] }),
  component: Unsubscribe,
});

/**
 * The confirmation step a one-click unsubscribe link lands on.
 *
 * The GET never unsubscribes anyone — link scanners fetch every URL in a
 * message — so the actual opt-out is this form's POST.
 */
function Unsubscribe() {
  const { token } = Route.useSearch();

  return (
    <div className="min-h-screen bg-background">
      <PageHeader cta={{ label: "Explore the device", href: "/holodock" }} />
      <main className="pt-16">
        <WaitlistOutcome
          eyebrow="Unsubscribe"
          title="Stop these emails?"
          body="One click and we stop mailing you about the dev kit, the SDK and the MCP Gateway. Your address stays on file only so we do not mail it again."
        >
          {token ? (
            <form method="post" action="/api/waitlist/unsubscribe" className="flex flex-wrap gap-2">
              <input type="hidden" name="token" value={token} />
              <button
                type="submit"
                className="gradient-fill px-5 py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Unsubscribe me
              </button>
              <a
                href="/"
                className="border border-border px-5 py-3.5 text-sm font-semibold text-foreground transition-colors hover:border-electric hover:text-electric"
              >
                Keep me subscribed
              </a>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground">
              This link is missing its token. Use the unsubscribe link at the bottom of any mail we
              sent you.
            </p>
          )}
        </WaitlistOutcome>
      </main>
      <SiteFooter base="/" />
    </div>
  );
}
