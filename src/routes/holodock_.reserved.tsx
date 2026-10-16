import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { PageHeader } from "@/components/infinity/PageHeader";
import { SiteFooter } from "@/components/infinity/SiteFooter";
import { WaitlistOutcome } from "@/components/waitlist/WaitlistOutcome";

// `holodock_` (trailing underscore) keeps this route out of the /holodock
// layout, which has no <Outlet /> — the URL is still /holodock/reserved.
export const Route = createFileRoute("/holodock_/reserved")({
  validateSearch: z.object({ session_id: z.string().optional() }),
  head: () => ({ meta: [{ title: "Order received — InfinityID Labs" }] }),
  component: Reserved,
});

function Reserved() {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader cta={{ label: "Explore the HoloDock", href: "/holodock" }} />
      <main className="pt-16">
        <WaitlistOutcome
          eyebrow="Order received"
          title="You're in the first run."
          body="Stripe will email your receipt. We'll write to you before anything ships, with the balance due if you paid a deposit and your dispatch date. Need to change or cancel? Email hello@infinityidlabs.com."
          actions={[
            { label: "Explore the HoloDock", href: "/holodock", primary: true },
            { label: "Start building", href: "/#build" },
          ]}
        />
      </main>
      <SiteFooter base="/" />
    </div>
  );
}
