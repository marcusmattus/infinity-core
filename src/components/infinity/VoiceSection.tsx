import { useState, type FormEvent } from "react";
import { Mic, MicOff, CornerDownLeft } from "lucide-react";
import { VOICE_COMMANDS, type VoiceCommand } from "@/hooks/use-voice-commands";

const brands = ["Walmart", "Domino's", "Nike", "ASOS", "H&M", "Sephora"];

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
    <section id="why" className="border-b border-border">
      <div className="mx-auto grid max-w-[1400px] gap-px bg-border lg:grid-cols-2">
        <div className="bg-background p-6 sm:p-10 lg:p-14">
          <p className="label-mono text-primary">AI trend 02</p>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-[-0.03em] sm:text-5xl">
            Voice-activated interface
          </h2>
          <p className="mt-6 font-mono text-sm leading-relaxed text-primary">
            &ldquo;Hey Infinity, calibrate holographic camera feed and initialize spatial
            canvas.&rdquo;
          </p>
          <p className="mt-6 max-w-lg leading-relaxed text-muted-foreground">
            Tap or speak to navigate effortlessly. Voice-activated interfaces provide hands-free
            control, enhanced accessibility, and personalized assistance — taking control far beyond
            standard search.
          </p>
          <dl className="mt-8 space-y-5 border-t border-border pt-8">
            <div>
              <dt className="label-mono">Voice command center</dt>
              <dd className="mt-1 text-sm text-muted-foreground">
                Speak intents like &ldquo;show hardware specs&rdquo; or &ldquo;launch MCP
                inspector&rdquo; and the page responds.
              </dd>
            </div>
            <div>
              <dt className="label-mono">Intelligent console</dt>
              <dd className="mt-1 text-sm text-muted-foreground">
                Ask technical questions naturally by voice, or type them into the fallback console.
              </dd>
            </div>
            <div>
              <dt className="label-mono">Pioneered by industry leaders</dt>
              <dd className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                {brands.map((brand) => (
                  <span key={brand} className="font-display text-sm font-semibold text-foreground/70">
                    {brand}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-surface p-6 sm:p-10 lg:p-14">
          <div className="hairline bg-background p-5 sm:p-7">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <span className="label-mono text-muted-foreground">Voice command center</span>
              <span
                className={`label-mono ${listening ? "text-primary" : "text-muted-foreground"}`}
              >
                {listening ? "● live" : "○ standby"}
              </span>
            </div>

            <div className="flex items-center gap-4 py-7">
              <button
                type="button"
                onClick={onToggle}
                aria-label={listening ? "Stop listening" : "Press to talk"}
                className={`flex size-16 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  listening
                    ? "listening-ring border-primary bg-primary text-primary-foreground"
                    : "border-border text-foreground hover:border-primary hover:text-primary"
                }`}
              >
                {listening ? <Mic className="size-6" /> : <MicOff className="size-6" />}
              </button>
              <div className="min-w-0">
                <p className="font-mono text-sm text-foreground">
                  {transcript || "awaiting voice input…"}
                </p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">{status}</p>
              </div>
            </div>

            <form onSubmit={submit} className="flex items-center gap-2 border-t border-border pt-5">
              <label htmlFor="voice-fallback" className="sr-only">
                Type a command
              </label>
              <input
                id="voice-fallback"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="type a command…"
                className="h-10 w-full border border-input bg-background px-3 font-mono text-sm outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="flex h-10 items-center gap-2 bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Run <CornerDownLeft className="size-4" />
              </button>
            </form>

            {!supported && (
              <p className="mt-3 font-mono text-xs text-muted-foreground">
                Live speech capture is unavailable in this browser — the text console runs the same
                intents.
              </p>
            )}

            <ul className="mt-7 space-y-2 border-t border-border pt-5">
              {VOICE_COMMANDS.map((command: VoiceCommand) => (
                <li key={command.id} className="flex items-baseline justify-between gap-4">
                  <span className="font-mono text-xs text-primary">{command.phrase}</span>
                  <span className="label-mono text-muted-foreground">{command.id}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
