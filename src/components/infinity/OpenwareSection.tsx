import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";

const MANIFEST = `# infinityid.plugin.toml
[plugin]
app = "com.example.fitness"
sdk = "openware/1.0"

[capabilities]
spatial            = "required"
holographic_output = "required"
camera             = "required"
motion             = "required"
microphone         = "optional"

[[surface]]
kind   = "model"
id     = "body.skeleton"
anchor = "user.front"

[[surface]]
kind   = "panel"
id     = "rep.counter"
anchor = "world.left"

[[surface]]
kind   = "agent"
id     = "form.coach"
voice  = true`;

/** Categories, not partners — these are the shapes a plugin can take. */
const surfaces: Array<[string, string]> = [
  ["Music", "Playback controls become an anchored spatial visualiser."],
  ["Maps", "Turn-by-turn navigation laid over the room and the route ahead."],
  ["Fitness", "A live skeleton beside you, with form correction from an agent."],
  ["Camera", "Captured depth replayed as a volumetric photo you can walk around."],
  ["Messaging", "Conversations as floating panels anchored where you left them."],
  ["CAD", "Models lifted off the screen at true scale before they are machined."],
];

export function OpenwareSection() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(MANIFEST);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* Clipboard permission refused — the manifest is selectable in place. */
    }
  }

  return (
    <section id="openware" className="border-b border-border">
      <div className="shell py-20 sm:py-28">
        <Reveal>
          <SectionHeader
            index="04"
            eyebrow="Openware"
            title={
              <>
                Give an app
                <br />
                <span className="text-steel">somewhere to stand.</span>
              </>
            }
            standfirst="Openware is an extension model, not a way to modify apps you do not own. A developer adds the SDK, declares capabilities in a manifest, and the app gains a spatial surface on any paired dock."
          />
        </Reveal>

        <Reveal className="rule-grid mt-16 lg:grid-cols-[1fr_1fr]" delay={80}>
          <div className="bg-background">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <span className="label-mono text-steel">infinityid.plugin.toml</span>
              <button
                type="button"
                onClick={copy}
                className="flex items-center gap-2 border border-border px-2.5 py-1 transition-colors hover:border-electric hover:text-electric"
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                <span className="label-mono">{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <pre className="overflow-x-auto p-5 font-mono text-xs leading-relaxed text-foreground/85 sm:p-7">
              <code>{MANIFEST}</code>
            </pre>
          </div>

          <ul className="rule-grid sm:grid-cols-2">
            {surfaces.map(([name, body], i) => (
              <li key={name} className="bg-background p-6 sm:p-7">
                <span className="label-mono text-steel">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-6 font-display text-xl font-semibold tracking-[-0.02em]">
                  {name}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal className="mt-px border border-border bg-surface p-7 sm:p-10" delay={140}>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
            <span className="text-foreground">On platform rules:</span> Openware never injects into
            third-party applications. Both mobile platforms restrict that, and it would be the wrong
            architecture regardless — a declared manifest scales, a hack does not. Plugins ship
            because their authors chose to ship them.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
