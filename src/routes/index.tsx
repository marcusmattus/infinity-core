import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/iid/SiteNav";
import { Hero } from "@/components/iid/Hero";
import { ProblemSection } from "@/components/iid/ProblemSection";
import { LayerSection } from "@/components/iid/LayerSection";
import { CoreLayers } from "@/components/iid/CoreLayers";
import { HumanOSSection } from "@/components/iid/HumanOSSection";
import { AgentsSection } from "@/components/iid/AgentsSection";
import { MetatronSection } from "@/components/iid/MetatronSection";
import { IdentitySecuritySection } from "@/components/iid/IdentitySecuritySection";
import { FinalSection } from "@/components/iid/FinalSection";

const TITLE = "InfinityID Labs — The Human Interface Layer";
const DESCRIPTION =
  "InfinityID connects human intelligence, identity, spatial context and AI agents into one secure, seamless computing layer.";

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
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main>
        <Hero />
        <ProblemSection />
        <LayerSection />
        <CoreLayers />
        <HumanOSSection />
        <AgentsSection />
        <MetatronSection />
        <IdentitySecuritySection />
        <FinalSection />
      </main>
    </div>
  );
}
