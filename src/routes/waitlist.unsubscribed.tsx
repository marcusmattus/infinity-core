import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { PageHeader } from "@/components/infinity/PageHeader";
import { SiteFooter } from "@/components/infinity/SiteFooter";
import { WaitlistOutcome } from "@/components/waitlist/WaitlistOutcome";

export const Route = createFileRoute("/waitlist/unsubscribed")({
  validateSearch: z.object({ state: z.enum(["invalid"]).optional() }),
  head: () => ({ meta: [{ title: "Unsubscribed — InfinityID Labs" }] }),
  component: Unsubscribed,
});

function Unsubscribed() {
  const { state } = Route.useSearch();
  const invalid = state === "invalid";

  return (
    <div className="min-h-screen bg-background">
      <PageHeader cta={{ label: "Explore the device", href: "/holodock" }} />
      <main className="pt-16">
        <WaitlistOutcome
          eyebrow={invalid ? "Link not recognised" : "Unsubscribed"}
          title={invalid ? "We could not find that link." : "Done — no more mail."}
          body={
            invalid
              ? "The token on that link is not one of ours, or it has already been replaced. Use the unsubscribe link at the bottom of a recent mail."
              : "You are off the list. If you change your mind, you can join again at any time and confirm the new address."
          }
          actions={[
            { label: "Back to the site", href: "/", primary: true },
            { label: "Join again", href: "/waitlist" },
          ]}
        />
      </main>
      <SiteFooter base="/" />
    </div>
  );
}
