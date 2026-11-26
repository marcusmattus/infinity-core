import { createFileRoute } from "@tanstack/react-router";
import { BrandNav } from "@/components/brand/BrandNav";
import {
  BrandFooter,
  BrandHero,
  ContactBand,
  HoloDockPanel,
  PillarsBand,
  PlatformSection,
  WaitlistBand,
} from "@/components/brand/LandingSections";
import { WaitlistForm } from "@/components/waitlist/WaitlistForm";

const TITLE = "InfinityID Labs — the interface leaves the screen";
const DESCRIPTION =
  "InfinityID Labs connects people, AI agents and the spaces around them — from your phone, to HoloDock, to the city. Join the HoloDock waitlist and reserve a unit from the first run.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-void">
      <BrandNav />
      <main>
        <BrandHero />
        <PlatformSection />
        <HoloDockPanel />
        <PillarsBand />
        <WaitlistBand form={<WaitlistForm source="waitlist" />} />
        <ContactBand />
      </main>
      <BrandFooter />
    </div>
  );
}
