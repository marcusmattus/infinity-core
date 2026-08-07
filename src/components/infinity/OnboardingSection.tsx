import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { Check, KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { submitDevLead } from "@/lib/leads.functions";

const objectives = [
  { value: "hardware", label: "Hardware", context: "Adapts documentation preview → Infinity-1 hardware bring-up guide" },
  { value: "mcp-sdk", label: "MCP SDK", context: "Adapts documentation preview → Camera MCP server reference" },
  { value: "app-dev", label: "App Dev", context: "Adapts documentation preview → Spatial UI component library" },
] as const;

const deployments = [
  { value: "mobile", label: "Mobile", context: "Pre-configures sample downloads → Swift + Kotlin sensory bridge" },
  { value: "holographic-web", label: "Holographic Web", context: "Pre-configures sample downloads → WebXR volumetric canvas starter" },
  { value: "wearable", label: "Wearable", context: "Pre-configures sample downloads → low-power always-on wake pipeline" },
] as const;

type Objective = (typeof objectives)[number]["value"];
type Deployment = (typeof deployments)[number]["value"];

export function OnboardingSection() {
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
    <section id="onboarding" className="border-b border-border">
      <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 sm:py-24">
        <p className="label-mono text-primary">AI trend 03</p>
        <h2 className="mt-4 font-display text-4xl font-bold tracking-[-0.03em] sm:text-5xl">
          Progressive lead nurturing &amp; dev kit access
        </h2>
        <p className="mt-5 max-w-2xl leading-relaxed text-muted-foreground">
          Adaptive workflows learn your developer persona over time. Instead of dynamic friction,
          smart onboarding tailors technical follow-ups, device allocations, and software tools
          based on your ongoing interactions.
        </p>

        <div className="mt-12 grid gap-px bg-border lg:grid-cols-[1.3fr_1fr]">
          <form
            className="space-y-10 bg-background p-6 sm:p-10"
            onSubmit={(event) => {
              event.preventDefault();
              if (!ready) return;
              mutation.mutate({ objective, deployment, email: email.trim() });
            }}
          >
            <fieldset>
              <legend className="label-mono text-muted-foreground">01 — Primary objective</legend>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {objectives.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setObjective(option.value)}
                    aria-pressed={objective === option.value}
                    className={`border px-4 py-3 text-left text-sm font-semibold transition-colors ${
                      objective === option.value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary hover:text-primary"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="label-mono text-muted-foreground">02 — Target deployment</legend>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {deployments.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setDeployment(option.value)}
                    aria-pressed={deployment === option.value}
                    className={`border px-4 py-3 text-left text-sm font-semibold transition-colors ${
                      deployment === option.value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary hover:text-primary"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="label-mono text-muted-foreground">03 — Access key request</legend>
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
                  className="h-12 w-full border border-input bg-background px-4 font-mono text-sm outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  disabled={!ready || mutation.isPending}
                  className="flex h-12 shrink-0 items-center justify-center gap-2 bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
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

          <aside className="bg-surface p-6 sm:p-10">
            <p className="label-mono text-muted-foreground">AI context adaptation</p>
            <ul className="mt-6 space-y-5">
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
                    ? "Instant API & MCP credentials generated"
                    : "Generates instant API & MCP credentials"
                }
              />
            </ul>

            {accessKey && (
              <div className="mt-8 hairline bg-background p-5">
                <p className="label-mono text-primary">Developer access key</p>
                <p className="mt-3 break-all font-mono text-sm">{accessKey}</p>
                <p className="mt-4 label-mono text-muted-foreground">MCP endpoint</p>
                <p className="mt-2 break-all font-mono text-sm text-muted-foreground">
                  mcp://device.local:8080/camera
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}

function ContextRow({ active, text }: { active: boolean; text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span
        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center border ${
          active ? "border-primary text-primary" : "border-border text-muted-foreground"
        }`}
      >
        {active ? <Check className="size-3" /> : <span className="size-1.5 bg-current" />}
      </span>
      <span className={`text-sm ${active ? "text-foreground" : "text-muted-foreground"}`}>
        {text}
      </span>
    </li>
  );
}
