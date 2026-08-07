import { createFileRoute } from "@tanstack/react-router";
import { useCallback } from "react";
import { SiteNav } from "@/components/infinity/SiteNav";
import { Hero } from "@/components/infinity/Hero";
import { VoiceSection } from "@/components/infinity/VoiceSection";
import { DeviceSection } from "@/components/infinity/DeviceSection";
import { CapabilitiesSection } from "@/components/infinity/CapabilitiesSection";
import { CodeSection } from "@/components/infinity/CodeSection";
import { OnboardingSection } from "@/components/infinity/OnboardingSection";
import { SiteFooter } from "@/components/infinity/SiteFooter";
import { useVoiceCommands, type VoiceCommand } from "@/hooks/use-voice-commands";

const TITLE = "InfinityID Labs — Infinity-1 Spatial Node & Camera MCP Servers";
const DESCRIPTION =
  "Handheld spatial computing hardware, voice-activated interfaces, and Camera MCP servers that connect live sensory feeds to AI agents.";

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
    const target = document.getElementById(command.id === "top" ? "top" : command.id);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const voice = useVoiceCommands(runCommand);

  const toggle = () => (voice.listening ? voice.stop() : voice.start());

  return (
    <div className="min-h-screen bg-background">
      <SiteNav listening={voice.listening} onToggleVoice={toggle} />
      <main>
        <Hero />
        <VoiceSection
          listening={voice.listening}
          supported={voice.supported}
          transcript={voice.transcript}
          status={voice.status}
          onToggle={toggle}
          onSubmitText={voice.handleText}
        />
        <DeviceSection />
        <CapabilitiesSection />
        <CodeSection />
        <OnboardingSection />
      </main>
      <SiteFooter />
    </div>
  );
}
