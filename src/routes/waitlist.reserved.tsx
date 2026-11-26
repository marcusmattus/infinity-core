import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { PageHeader } from "@/components/infinity/PageHeader";
import { SiteFooter } from "@/components/infinity/SiteFooter";
import { WaitlistOutcome } from "@/components/waitlist/WaitlistOutcome";
import { getDepositSession } from "@/lib/waitlist.functions";
import { SITE } from "@/lib/site";

/** Where Stripe Checkout sends people back to after paying the deposit. */
export const Route = createFileRoute("/waitlist/reserved")({
  validateSearch: z.object({ session_id: z.string().max(200).optional() }),
  head: () => ({
    meta: [
      { title: "HoloDock reserved — InfinityID Labs" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Reserved,
});

function Reserved() {
  const { session_id: sessionId } = Route.useSearch();
  const lookup = useServerFn(getDepositSession);
  const session = useQuery({
    queryKey: ["deposit-session", sessionId],
    queryFn: () => lookup({ data: { sessionId: sessionId ?? "" } }),
    enabled: Boolean(sessionId && sessionId.startsWith("cs_")),
    retry: 1,
  });

  const paid = session.data?.paid ?? false;
  const checking = session.isPending && Boolean(sessionId);

  return (
    <div className="min-h-screen bg-background">
      <PageHeader cta={{ label: "Explore the device", href: "/holodock" }} />
      <main className="pt-16">
        <WaitlistOutcome
          eyebrow={checking ? "Checking payment" : paid ? "Reserved" : "Payment pending"}
          title={
            checking
              ? "One moment…"
              : paid
                ? "Your HoloDock is on hold."
                : "We haven't seen the payment yet."
          }
          body={
            checking
              ? "Confirming your deposit with Stripe."
              : paid
                ? `Thank you — your ${session.data?.label ?? "deposit"} deposit is in and a receipt from Stripe is on its way${
                    session.data?.email ? ` to ${session.data.email}` : ""
                  }. It counts towards the price, and it's fully refundable until dispatch: just write to ${SITE.contactEmail}.`
                : `If you completed checkout, it can take a minute to come through and Stripe will email your receipt. If anything looks wrong, write to ${SITE.contactEmail} and we'll sort it out.`
          }
          actions={[
            { label: "Explore the HoloDock", href: "/holodock", primary: true },
            { label: "Back to the site", href: "/" },
          ]}
        />
      </main>
      <SiteFooter base="/platform" />
    </div>
  );
}
