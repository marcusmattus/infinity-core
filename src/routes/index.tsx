import { createFileRoute } from "@tanstack/react-router";
import { useCallback } from "react";
import { SiteNav } from "@/components/infinity/SiteNav";
import { Hero } from "@/components/infinity/Hero";
import { Ticker } from "@/components/infinity/Ticker";
import { ThesisSection } from "@/components/infinity/ThesisSection";
import { DeviceSection } from "@/components/infinity/DeviceSection";
import { StackSection } from "@/components/infinity/StackSection";
import { OpenwareSection } from "@/components/infinity/OpenwareSection";
import { PillarsSection } from "@/components/infinity/PillarsSection";
import { VoiceSection } from "@/components/infinity/VoiceSection";
import { CodeSection } from "@/components/infinity/CodeSection";
import { AccessSection } from "@/components/infinity/AccessSection";
import { SiteFooter } from "@/components/infinity/SiteFooter";
import { useVoiceCommands, type VoiceCommand } from "@/hooks/use-voice-commands";

const TITLE = "InfinityID Labs — HoloDock spatial engine & the human interface layer";
const DESCRIPTION =
  "HoloDock is a pocket-sized optical engine that turns an ordinary phone into a spatial computer — with SpatialOS on the phone, Openware plugins for existing apps, and Camera MCP servers for AI agents.";

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
        <OpenwareSection />
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
