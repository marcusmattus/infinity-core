import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChevronRight, Loader2 } from "lucide-react";
import { waitlistTimeline } from "@/lib/waitlist.functions";
import {
  DEPLOYMENT_LABELS,
  PERSONA_LABELS,
  STATUS_LABELS,
  type SubscriberSummary,
} from "@/lib/waitlist/types";

const STATUS_TONE: Record<string, string> = {
  confirmed: "text-electric",
  pending: "text-muted-foreground",
  unsubscribed: "text-steel",
  bounced: "text-destructive",
  complained: "text-destructive",
};

const when = (value: string | null) =>
  value ? new Date(value).toLocaleDateString(undefined, { day: "2-digit", month: "short" }) : "—";

/** The list, plus the per-person timeline that makes it a record rather than a table. */
export function SubscriberTable({ rows, token }: { rows: SubscriberSummary[]; token: string }) {
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useServerFn(waitlistTimeline);
  const timeline = useMutation({
    mutationFn: (subscriberId: string) => load({ data: { token, subscriberId } }),
  });

  function toggle(row: SubscriberSummary) {
    if (openId === row.id) {
      setOpenId(null);
      return;
    }
    setOpenId(row.id);
    timeline.mutate(row.id);
  }

  if (rows.length === 0) {
    return (
      <p className="bg-background p-6 text-sm text-muted-foreground">
        Nobody matches those filters yet.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {rows.map((row) => {
        const open = openId === row.id;
        return (
          <li key={row.id} className="bg-background">
            <button
              type="button"
              onClick={() => toggle(row)}
              aria-expanded={open}
              className="flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-surface sm:px-7"
            >
              <ChevronRight
                className={`size-3.5 shrink-0 text-steel transition-transform ${open ? "rotate-90" : ""}`}
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate font-mono text-sm text-foreground">
                {row.email}
              </span>
              <span className="label-mono hidden w-28 shrink-0 text-steel sm:block">
                {PERSONA_LABELS[row.persona]}
              </span>
              <span
                className={`label-mono hidden w-40 shrink-0 sm:block ${STATUS_TONE[row.status] ?? "text-steel"}`}
              >
                {STATUS_LABELS[row.status]}
              </span>
              <span className="label-mono w-12 shrink-0 text-right text-steel">
                {when(row.createdAt)}
              </span>
            </button>

            {open && (
              <div className="grid gap-px bg-border lg:grid-cols-[1fr_1.2fr]">
                <dl className="grid gap-x-6 gap-y-3 bg-surface px-5 py-5 sm:grid-cols-2 sm:px-7">
                  {[
                    ["Status", STATUS_LABELS[row.status]],
                    ["Persona", PERSONA_LABELS[row.persona]],
                    ["Deployment", row.deployment ? DEPLOYMENT_LABELS[row.deployment] : "—"],
                    ["Source", row.source],
                    ["Company", row.company ?? "—"],
                    ["Confirmed", when(row.confirmedAt)],
                    ["Last emailed", when(row.lastEmailedAt)],
                    ["Tags", row.tags.length ? row.tags.join(", ") : "—"],
                  ].map(([term, value]) => (
                    <div key={term}>
                      <dt className="label-mono text-steel">{term}</dt>
                      <dd className="mt-1 font-mono text-xs text-foreground/85">{value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="bg-surface px-5 py-5 sm:px-7">
                  <p className="label-mono text-steel">Timeline</p>
                  {timeline.isPending && (
                    <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="size-3.5 animate-spin" /> Loading…
                    </p>
                  )}
                  {timeline.isError && (
                    <p className="mt-4 text-sm text-destructive">Could not load the timeline.</p>
                  )}
                  {timeline.isSuccess && (
                    <ol className="mt-4 space-y-3">
                      {timeline.data.events.length === 0 && (
                        <li className="text-sm text-muted-foreground">Nothing recorded yet.</li>
                      )}
                      {timeline.data.events.map((event) => (
                        <li key={event.id} className="flex items-baseline gap-3">
                          <span className="label-mono w-24 shrink-0 text-steel">
                            {new Date(event.createdAt).toLocaleDateString(undefined, {
                              day: "2-digit",
                              month: "short",
                            })}
                          </span>
                          <span className="font-mono text-xs text-foreground/85">
                            {event.type}
                            {typeof event.detail["subject"] === "string"
                              ? ` — ${event.detail["subject"]}`
                              : ""}
                          </span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
