import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { PageHeader } from "@/components/infinity/PageHeader";
import { SiteFooter } from "@/components/infinity/SiteFooter";
import { WaitlistOutcome } from "@/components/waitlist/WaitlistOutcome";

export const Route = createFileRoute("/waitlist/confirmed")({
  validateSearch: z.object({ state: z.enum(["invalid"]).optional() }),
  head: () => ({ meta: [{ title: "Waitlist confirmed — InfinityID Labs" }] }),
  component: Confirmed,
});

function Confirmed() {
  const { state } = Route.useSearch();
  const invalid = state === "invalid";

  return (
    <div className="min-h-screen bg-background">
      <PageHeader cta={{ label: "Explore the device", href: "/holodock" }} />
      <main className="pt-16">
        <WaitlistOutcome
          eyebrow={invalid ? "Link not recognised" : "Confirmed"}
          title={invalid ? "That link has expired." : "You're on the list."}
          body={
            invalid
              ? "Confirmation links are single use, and they stop working once used. If you have not confirmed yet, join again and we will send a fresh one."
              : "Nothing else to do. You will hear from us when the dev kit, the SDK or the MCP Gateway opens up — and from nobody else."
          }
          actions={
            invalid
              ? [
                  { label: "Join again", href: "/waitlist", primary: true },
                  { label: "Explore the HoloDock", href: "/holodock" },
                ]
              : [
                  { label: "Explore the HoloDock", href: "/holodock", primary: true },
                  { label: "Start building", href: "/#build" },
                ]
          }
        />
      </main>
      <SiteFooter base="/" />
    </div>
  );
}
