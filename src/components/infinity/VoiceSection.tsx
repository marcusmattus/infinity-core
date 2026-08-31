import { useState, type FormEvent } from "react";
import { CornerDownLeft, Mic, MicOff } from "lucide-react";
import { VOICE_COMMANDS, type VoiceCommand } from "@/hooks/use-voice-commands";
import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";

const modes: Array<[string, string]> = [
  ["Wake", "A far-field phrase opens the channel without touching anything."],
  ["Intent", "Speech resolves to an intent, not a transcript to search."],
  ["Fallback", "Every intent is reachable by typing, on any browser or device."],
];

export function VoiceSection({
  listening,
  supported,
  transcript,
  status,
  onToggle,
  onSubmitText,
}: {
  listening: boolean;
  supported: boolean;
  transcript: string;
  status: string;
  onToggle: () => void;
  onSubmitText: (text: string) => void;
}) {
  const [value, setValue] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!value.trim()) return;
    onSubmitText(value.trim());
    setValue("");
  }

  return (
    <section id="voice" className="border-b border-border">
      <div className="shell py-20 sm:py-28">
        <Reveal>
          <SectionHeader
            index="10"
            eyebrow="Human input"
            title={
              <>
                Talk to the page
                <br />
                <span className="text-steel">the way you would the device.</span>
              </>
            }
            standfirst="The same intent router that drives the dock runs this site. Say a command, or type it — both resolve through one grammar."
          />
        </Reveal>

        <Reveal className="rule-grid mt-16 lg:grid-cols-[1fr_1fr]" delay={80}>
          <div className="bg-background p-7 sm:p-10 lg:p-12">
            <p className="font-mono text-sm leading-relaxed text-electric">
              &ldquo;Hey Infinity — show me the device, then open the developer access form.&rdquo;
            </p>

            <dl className="mt-10 border-t border-border">
              {modes.map(([term, detail]) => (
                <div key={term} className="border-b border-border py-6">
                  <dt className="label-mono text-foreground">{term}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{detail}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
              Speech recognition runs in your browser. Nothing is recorded, and no audio leaves the
              device — the transcript is matched against the intents listed opposite and then
              discarded.
            </p>
          </div>

          <div className="bg-surface p-7 sm:p-10 lg:p-12">
            <div className="hairline bg-background p-5 sm:p-7">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <span className="label-mono text-steel">Voice command centre</span>
                <span className={`label-mono ${listening ? "text-electric" : "text-steel"}`}>
                  {listening ? "● live" : "○ standby"}
                </span>
              </div>

              <div className="flex items-center gap-5 py-7">
                <button
                  type="button"
                  onClick={onToggle}
                  aria-label={listening ? "Stop listening" : "Press to talk"}
                  className={`flex size-16 shrink-0 items-center justify-center border transition-colors ${
                    listening
                      ? "listening-ring border-electric text-electric"
                      : "border-border text-foreground hover:border-electric hover:text-electric"
                  }`}
                >
                  {listening ? <Mic className="size-6" /> : <MicOff className="size-6" />}
                </button>
                <div className="min-w-0">
                  <p className="font-mono text-sm break-words text-foreground">
                    {transcript || "awaiting voice input…"}
                  </p>
                  <p className="mt-1.5 font-mono text-xs text-muted-foreground">{status}</p>
                </div>
              </div>

              <form
                onSubmit={submit}
                className="flex items-center gap-2 border-t border-border pt-5"
              >
                <label htmlFor="voice-fallback" className="sr-only">
                  Type a command
                </label>
                <input
                  id="voice-fallback"
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  placeholder="type a command…"
                  className="h-11 w-full border border-input bg-background px-3 font-mono text-sm outline-none focus:border-electric"
                />
                <button
                  type="submit"
                  className="gradient-fill flex h-11 shrink-0 items-center gap-2 px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Run <CornerDownLeft className="size-4" />
                </button>
              </form>

              {!supported && (
                <p className="mt-3 font-mono text-xs text-muted-foreground">
                  Live speech capture is unavailable in this browser — the text console runs the
                  same intents.
                </p>
              )}

              <ul className="mt-7 space-y-2.5 border-t border-border pt-5">
                {VOICE_COMMANDS.map((command: VoiceCommand) => (
                  <li key={command.id} className="flex items-baseline justify-between gap-4">
                    <span className="font-mono text-xs text-electric">{command.phrase}</span>
                    <span className="label-mono text-steel">{command.id}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
