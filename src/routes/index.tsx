import { createFileRoute } from "@tanstack/react-router";
import { useCallback } from "react";
import { SiteNav } from "@/components/infinity/SiteNav";
import { Hero } from "@/components/infinity/Hero";
import { Ticker } from "@/components/infinity/Ticker";
import { ThesisSection } from "@/components/infinity/ThesisSection";
import { DeviceSection } from "@/components/infinity/DeviceSection";
import { StackSection } from "@/components/infinity/StackSection";
import { SpatialOSSection } from "@/components/infinity/SpatialOSSection";
import { OpenwareSection } from "@/components/infinity/OpenwareSection";
import { McpGatewaySection } from "@/components/infinity/McpGatewaySection";
import { DevOnboardingSection } from "@/components/infinity/DevOnboardingSection";
import { DashboardSection } from "@/components/infinity/DashboardSection";
import { PillarsSection } from "@/components/infinity/PillarsSection";
import { VoiceSection } from "@/components/infinity/VoiceSection";
import { CodeSection } from "@/components/infinity/CodeSection";
import { AccessSection } from "@/components/infinity/AccessSection";
import { SiteFooter } from "@/components/infinity/SiteFooter";
import { useVoiceCommands, type VoiceCommand } from "@/hooks/use-voice-commands";

const TITLE = "InfinityID Labs — HoloDock spatial engine & the human interface layer";
const DESCRIPTION =
  "HoloDock is a pocket-sized optical engine that turns an ordinary phone into a spatial computer — with SpatialOS as the operating layer, an MCP gateway for the tools you already run, Openware plugins for existing apps, and a developer path from first project to published spatial app.";

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
  const runCommand = useCallback((command: VoiceCommand) => {
    document.getElementById(command.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const voice = useVoiceCommands(runCommand);
  const toggle = () => (voice.listening ? voice.stop() : voice.start());

  return (
    <div className="min-h-screen bg-background">
      <SiteNav listening={voice.listening} onToggleVoice={toggle} />
      <main>
        <Hero />
        <Ticker />
        <ThesisSection />
        <DeviceSection />
        <StackSection />
        <SpatialOSSection />
        <OpenwareSection />
        <McpGatewaySection />
        <DevOnboardingSection />
        <DashboardSection />
        <PillarsSection />
        <VoiceSection
          listening={voice.listening}
          supported={voice.supported}
          transcript={voice.transcript}
          status={voice.status}
          onToggle={toggle}
          onSubmitText={voice.handleText}
        />
        <CodeSection />
        <AccessSection />
      </main>
      <SiteFooter />
    </div>
  );
}
