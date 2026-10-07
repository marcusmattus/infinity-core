import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Send, Users } from "lucide-react";
import { sendWaitlistUpdate, waitlistSegmentCount } from "@/lib/waitlist.functions";
import { renderBodyHtml } from "@/lib/waitlist/markdown";
import {
  DEPLOYMENTS,
  DEPLOYMENT_LABELS,
  PERSONAS,
  PERSONA_LABELS,
  type Deployment,
  type Persona,
  type Segment,
} from "@/lib/waitlist/types";

const PLACEHOLDER = `The dev kit has a date.

## What ships first
- HoloDock dev kit, 200 units, shipping from March.
- SpatialOS simulator access on the same day.

Full detail on the site: [read the update](https://infinityid.labs/holodock)`;

/**
 * Writing and sending an update.
 *
 * Two guards worth noting: the recipient count is fetched from the same query
 * the send uses, so the number on the button is the number that will receive
 * it; and a send asks for confirmation naming that count, because this is the
 * one action in the dashboard that cannot be undone.
 */
export function BroadcastComposer({ token, onSent }: { token: string; onSent: () => void }) {
  const [subject, setSubject] = useState("");
  const [preheader, setPreheader] = useState("");
  const [body, setBody] = useState("");
  const [persona, setPersona] = useState<Persona | null>(null);
  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const [testTo, setTestTo] = useState("");
  const [confirming, setConfirming] = useState(false);

  const segment: Segment = useMemo(
    () => ({ ...(persona ? { persona } : {}), ...(deployment ? { deployment } : {}) }),
    [persona, deployment],
  );

  const countFn = useServerFn(waitlistSegmentCount);
  const count = useMutation({
    mutationFn: (next: Segment) => countFn({ data: { token, segment: next } }),
  });

  // Recount whenever the segment changes, so the button never promises a stale number.
  useEffect(() => {
    count.mutate(segment);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segment]);

  const sendFn = useServerFn(sendWaitlistUpdate);
  const send = useMutation({
    mutationFn: (input: { test: boolean }) =>
      sendFn({
        data: {
          token,
          subject: subject.trim(),
          body,
          segment,
          ...(preheader.trim() ? { preheader: preheader.trim() } : {}),
          ...(input.test ? { testTo: testTo.trim() } : {}),
        },
      }),
    onSuccess: (_result, input) => {
      if (!input.test) {
        setConfirming(false);
        onSent();
      }
    },
  });

  const recipients = count.data?.count ?? 0;
  const ready = subject.trim().length > 0 && body.trim().length > 0;
  const previewHtml = useMemo(() => renderBodyHtml(body || PLACEHOLDER), [body]);

  return (
    <div className="rule-grid lg:grid-cols-[1.15fr_1fr]">
      <div className="bg-background p-6 sm:p-8">
        <p className="label-mono text-steel">Compose an update</p>

        <label className="mt-7 block">
          <span className="label-mono text-steel">Subject</span>
          <input
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            maxLength={200}
            placeholder="The dev kit has a date"
            className="mt-3 h-11 w-full border border-input bg-background px-4 text-sm outline-none focus:border-electric"
          />
        </label>

        <label className="mt-5 block">
          <span className="label-mono text-steel">Preheader</span>
          <input
            value={preheader}
            onChange={(event) => setPreheader(event.target.value)}
            maxLength={200}
            placeholder="The line shown after the subject in the inbox"
            className="mt-3 h-11 w-full border border-input bg-background px-4 text-sm outline-none focus:border-electric"
          />
        </label>

        <label className="mt-5 block">
          <span className="label-mono text-steel">
            Body — blank line between paragraphs, `## heading`, `- bullet`, `[text](url)`
          </span>
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={12}
            maxLength={20000}
            placeholder={PLACEHOLDER}
            className="mt-3 w-full border border-input bg-background p-4 font-mono text-xs leading-relaxed outline-none focus:border-electric"
          />
        </label>

        <fieldset className="mt-7">
          <legend className="label-mono text-steel">Segment</legend>
          <div className="mt-4 flex flex-wrap gap-2">
            {PERSONAS.filter((option) => option !== "unspecified").map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setPersona(persona === option ? null : option)}
                aria-pressed={persona === option}
                className={`border px-3 py-2 font-mono text-xs transition-colors ${
                  persona === option
                    ? "gradient-fill border-transparent text-primary-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {PERSONA_LABELS[option]}
              </button>
            ))}
            {DEPLOYMENTS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setDeployment(deployment === option ? null : option)}
                aria-pressed={deployment === option}
                className={`border px-3 py-2 font-mono text-xs transition-colors ${
                  deployment === option
                    ? "gradient-fill border-transparent text-primary-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {DEPLOYMENT_LABELS[option]}
              </button>
            ))}
          </div>
          <p className="label-mono mt-3 flex items-center gap-2 text-steel">
            <Users className="size-3.5" />
            {count.isPending
              ? "Counting…"
              : `${recipients} confirmed recipient${recipients === 1 ? "" : "s"}`}
            {" · unconfirmed and unsubscribed are never included"}
          </p>
        </fieldset>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          <input
            value={testTo}
            onChange={(event) => setTestTo(event.target.value)}
            placeholder="you@studio.dev"
            className="h-11 min-w-[14rem] flex-1 border border-input bg-background px-4 font-mono text-sm outline-none focus:border-electric"
          />
          <button
            type="button"
            disabled={!ready || !/.+@.+\..+/.test(testTo) || send.isPending}
            onClick={() => send.mutate({ test: true })}
            className="h-11 border border-border px-5 text-sm font-semibold transition-colors hover:border-electric hover:text-electric disabled:opacity-40"
          >
            Send test
          </button>
        </div>

        <div className="mt-4">
          {confirming ? (
            <div className="hairline bg-surface p-5">
              <p className="text-sm text-foreground">
                Send “{subject.trim()}” to {recipients} confirmed subscriber
                {recipients === 1 ? "" : "s"}? This cannot be undone.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={send.isPending}
                  onClick={() => send.mutate({ test: false })}
                  className="gradient-fill flex items-center gap-2 px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-40"
                >
                  {send.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                  Yes, send it
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="border border-border px-5 py-3 text-sm font-semibold text-steel"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              disabled={!ready || recipients === 0}
              onClick={() => setConfirming(true)}
              className="gradient-fill flex items-center gap-2 px-5 py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              <Send className="size-4" />
              Send to {recipients}
            </button>
          )}
        </div>

        {send.isError && (
          <p className="mt-4 text-sm text-destructive">
            {send.error instanceof Error ? send.error.message : "The send failed."}
          </p>
        )}
        {send.isSuccess && (
          <p className="mt-4 text-sm text-electric">
            {send.data.broadcastId
              ? `Sent to ${send.data.sent} of ${send.data.recipients}${send.data.failed ? `, ${send.data.failed} failed` : ""}.`
              : `Test sent to ${testTo}.`}
          </p>
        )}
      </div>

      <div className="bg-surface p-6 sm:p-8">
        <p className="label-mono text-steel">Preview</p>
        <div className="hairline mt-6 bg-[#111725] p-6">
          <p className="label-mono text-electric">InfinityID Labs</p>
          <h3 className="mt-4 font-display text-xl font-semibold tracking-[-0.02em] text-foreground">
            {subject.trim() || "Subject line"}
          </h3>
          {/* The renderer escapes the body before applying any markup, so what
              lands here is text the composer wrote, never markup it pasted. */}
          <div
            className="mt-4 [&_a]:text-electric [&_a]:underline [&_h2]:mt-6 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground [&_li]:text-sm [&_li]:text-muted-foreground [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-muted-foreground [&_ul]:list-disc [&_ul]:pl-5"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
          <p className="label-mono mt-8 border-t border-border pt-4 text-steel">Unsubscribe</p>
        </div>
      </div>
    </div>
  );
}
