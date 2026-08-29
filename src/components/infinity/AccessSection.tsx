import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { Check, KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { submitDevLead } from "@/lib/leads.functions";
import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";

const objectives = [
  {
    value: "hardware",
    label: "Hardware",
    context: "Documentation preview → HoloDock bring-up and calibration guide",
  },
  {
    value: "mcp-sdk",
    label: "MCP SDK",
    context: "Documentation preview → Camera MCP server reference",
  },
  {
    value: "app-dev",
    label: "Openware",
    context: "Documentation preview → plugin manifest and surface components",
  },
] as const;

const deployments = [
  {
    value: "mobile",
    label: "Mobile",
    context: "Samples pre-configured → Swift + Kotlin sensory bridge",
  },
  {
    value: "holographic-web",
    label: "Spatial web",
    context: "Samples pre-configured → WebXR volumetric canvas starter",
  },
  {
    value: "wearable",
    label: "Wearable",
    context: "Samples pre-configured → low-power always-on wake pipeline",
  },
] as const;

type Objective = (typeof objectives)[number]["value"];
type Deployment = (typeof deployments)[number]["value"];

export function AccessSection() {
  const [objective, setObjective] = useState<Objective | null>(null);
  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const [email, setEmail] = useState("");
  const [accessKey, setAccessKey] = useState<string | null>(null);

  const submit = useServerFn(submitDevLead);
  const mutation = useMutation({
    mutationFn: (input: { objective: Objective; deployment: Deployment; email: string }) =>
      submit({ data: input }),
    onSuccess: (result) => {
      setAccessKey(result.accessKey);
      toast.success("Developer credentials issued");
    },
    onError: () => toast.error("Could not issue credentials. Please try again."),
  });

  const objectiveContext = objectives.find((item) => item.value === objective)?.context;
  const deploymentContext = deployments.find((item) => item.value === deployment)?.context;
  const ready = objective && deployment && /.+@.+\..+/.test(email);

  return (
    <section id="access" className="border-b border-border">
      <div className="shell py-20 sm:py-28">
        <Reveal>
          <SectionHeader
            index="08"
            eyebrow="Developer access"
            title={
              <>
                Get a key.
                <br />
                <span className="text-steel">Start building.</span>
              </>
            }
            standfirst="Tell us what you are building and where it runs. The kit, the samples and the documentation you receive are shaped by those two answers."
          />
        </Reveal>

        <Reveal className="rule-grid mt-16 lg:grid-cols-[1.35fr_1fr]" delay={80}>
          <form
            className="space-y-10 bg-background p-7 sm:p-10"
            onSubmit={(event) => {
              event.preventDefault();
              if (!ready) return;
              mutation.mutate({ objective, deployment, email: email.trim() });
            }}
          >
            <fieldset>
              <legend className="label-mono text-steel">01 — Primary objective</legend>
              <div className="mt-4 grid gap-px bg-border sm:grid-cols-3">
                {objectives.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setObjective(option.value)}
                    aria-pressed={objective === option.value}
                    className={`px-4 py-3.5 text-left text-sm font-semibold transition-colors ${
                      objective === option.value
                        ? "gradient-fill text-primary-foreground"
                        : "bg-background text-foreground hover:text-electric"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="label-mono text-steel">02 — Target deployment</legend>
              <div className="mt-4 grid gap-px bg-border sm:grid-cols-3">
                {deployments.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setDeployment(option.value)}
                    aria-pressed={deployment === option.value}
                    className={`px-4 py-3.5 text-left text-sm font-semibold transition-colors ${
                      deployment === option.value
                        ? "gradient-fill text-primary-foreground"
                        : "bg-background text-foreground hover:text-electric"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="label-mono text-steel">03 — Access key request</legend>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <label htmlFor="dev-email" className="sr-only">
                  Developer email
                </label>
                <input
                  id="dev-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="developer@studio.dev"
                  className="h-12 w-full border border-input bg-background px-4 font-mono text-sm outline-none focus:border-electric"
                />
                <button
                  type="submit"
                  disabled={!ready || mutation.isPending}
                  className="gradient-fill flex h-12 shrink-0 items-center justify-center gap-2 px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  {mutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <KeyRound className="size-4" />
                  )}
                  Generate credentials
                </button>
              </div>
            </fieldset>
          </form>

          <aside className="bg-surface p-7 sm:p-10">
            <p className="label-mono text-steel">What your answers change</p>
            <ul className="mt-7 space-y-5">
              <ContextRow
                active={Boolean(objective)}
                text={objectiveContext ?? "Awaiting primary objective…"}
              />
              <ContextRow
                active={Boolean(deployment)}
                text={deploymentContext ?? "Awaiting deployment target…"}
              />
              <ContextRow
                active={Boolean(accessKey)}
                text={
                  accessKey
                    ? "API and MCP credentials issued"
                    : "Issues your API and MCP credentials"
                }
              />
            </ul>

            {accessKey && (
              <div className="hairline mt-8 bg-background p-5">
                <p className="label-mono text-electric">Developer access key</p>
                <p className="mt-3 font-mono text-sm break-all">{accessKey}</p>
                <p className="label-mono mt-5 text-steel">MCP endpoint</p>
                <p className="mt-2 font-mono text-sm break-all text-muted-foreground">
                  mcp://dock.local:8080/camera
                </p>
              </div>
            )}
          </aside>
        </Reveal>
      </div>
    </section>
  );
}

function ContextRow({ active, text }: { active: boolean; text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span
        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center border ${
          active ? "border-electric text-electric" : "border-border text-steel"
        }`}
      >
        {active ? <Check className="size-3" /> : <span className="size-1 bg-current" />}
      </span>
      <span className={`text-sm ${active ? "text-foreground" : "text-muted-foreground"}`}>
        {text}
      </span>
    </li>
  );
}
