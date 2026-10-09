import { useEffect, useRef, useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, Loader2, Mail } from "lucide-react";
import { joinWaitlist, type JoinWaitlistResult } from "@/lib/waitlist.functions";
import { PERSONA_LABELS, PERSONAS, type Persona } from "@/lib/waitlist/types";

const OFFERED_PERSONAS = PERSONAS.filter((persona) => persona !== "unspecified");

type JoinPayload = {
  email: string;
  source: "waitlist" | "holodock" | "footer";
  persona?: Persona;
  website?: string;
  utm?: Record<string, string>;
  referrer?: string;
};

const RESULT_COPY: Record<JoinWaitlistResult["state"], string> = {
  confirmation_sent: "Check your inbox — confirm the address and you're on the list.",
  confirmation_throttled:
    "A confirmation link is already on its way to that address. Check your inbox, and spam.",
  already_confirmed: "You're already on the list. Nothing more to do.",
  blocked:
    "That address was marked as spam, so it can't be re-added automatically. Reply to any of our mail and we'll sort it out.",
};

/** UTM tags and the referrer, read once so the record says where someone came from. */
function useArrivalContext() {
  const context = useRef<{ utm: Record<string, string>; referrer?: string }>({ utm: {} });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const utm: Record<string, string> = {};
    for (const [key, value] of new URLSearchParams(window.location.search)) {
      if (key.startsWith("utm_") && value) utm[key] = value.slice(0, 200);
    }
    context.current = {
      utm,
      ...(document.referrer ? { referrer: document.referrer.slice(0, 500) } : {}),
    };
  }, []);

  return context;
}

export function WaitlistForm({
  source = "waitlist",
  askPersona = true,
}: {
  source?: "waitlist" | "holodock" | "footer";
  askPersona?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [persona, setPersona] = useState<Persona | null>(null);
  const [trap, setTrap] = useState("");
  const arrival = useArrivalContext();

  const submit = useServerFn(joinWaitlist);
  const mutation = useMutation({
    mutationFn: (input: JoinPayload) => submit({ data: input }),
  });

  const ready = /.+@.+\..+/.test(email);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!ready || mutation.isPending) return;
    mutation.mutate({
      email: email.trim(),
      source,
      ...(persona ? { persona } : {}),
      ...(trap ? { website: trap } : {}),
      ...(Object.keys(arrival.current.utm).length ? { utm: arrival.current.utm } : {}),
      ...(arrival.current.referrer ? { referrer: arrival.current.referrer } : {}),
    });
  }

  if (mutation.isSuccess) {
    return (
      <div className="hairline bg-surface p-6 sm:p-8">
        <p className="label-mono flex items-center gap-2 text-electric">
          <Check className="size-3.5" />
          {mutation.data.state === "already_confirmed" ? "Already on the list" : "One more step"}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {RESULT_COPY[mutation.data.state]}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="hairline bg-surface p-6 sm:p-8">
      {askPersona && (
        <fieldset>
          <legend className="label-mono text-steel">What brings you here</legend>
          <div className="mt-4 flex flex-wrap gap-2">
            {OFFERED_PERSONAS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setPersona(persona === option ? null : option)}
                aria-pressed={persona === option}
                className={`border px-4 py-2.5 text-sm font-semibold transition-colors ${
                  persona === option
                    ? "gradient-fill border-transparent text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground"
                }`}
              >
                {PERSONA_LABELS[option]}
              </button>
            ))}
          </div>
          <p className="label-mono mt-3 text-steel">Optional — it only shapes what we send you.</p>
        </fieldset>
      )}

      <div className={askPersona ? "mt-8" : ""}>
        <label htmlFor="waitlist-email" className="label-mono text-steel">
          Email
        </label>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            id="waitlist-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@studio.dev"
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
              <Mail className="size-4" />
            )}
            Join the waitlist
          </button>
        </div>
      </div>

      {/* Honeypot: off-screen and hidden from assistive tech, so only a bot fills it. */}
      <div aria-hidden className="sr-only">
        <label htmlFor="waitlist-website">Leave this field empty</label>
        <input
          id="waitlist-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={trap}
          onChange={(event) => setTrap(event.target.value)}
        />
      </div>

      <p className="label-mono mt-5 text-steel">
        Double opt-in. One unsubscribe link in every mail, and no list sharing.
      </p>

      {mutation.isError && (
        <p className="mt-4 text-sm text-destructive">
          {mutation.error instanceof Error
            ? mutation.error.message
            : "Could not add you to the waitlist."}
        </p>
      )}
    </form>
  );
}
