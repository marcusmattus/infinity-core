import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Download, KeyRound, Loader2, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/infinity/PageHeader";
import { BroadcastComposer } from "@/components/waitlist/studio/BroadcastComposer";
import { SubscriberTable } from "@/components/waitlist/studio/SubscriberTable";
import { exportWaitlistCsv, waitlistOverview } from "@/lib/waitlist.functions";
import {
  PERSONAS,
  PERSONA_LABELS,
  STATUS_LABELS,
  SUBSCRIBER_STATUSES,
  type Persona,
  type SubscriberStatus,
} from "@/lib/waitlist/types";

export const Route = createFileRoute("/studio/waitlist")({
  head: () => ({
    meta: [
      { title: "Waitlist — InfinityID Studio" },
      // Internal tool: keep it out of search results even if the URL leaks.
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: WaitlistStudio,
});

const TOKEN_KEY = "infinityid.waitlist.token";

/**
 * The CRM surface: who joined, what happened to them, and the composer that
 * sends the next update.
 *
 * Access is a shared admin token rather than user accounts — the site has no
 * auth yet, and subscriber data should not wait for it. The token lives in
 * sessionStorage, so it is gone when the tab closes.
 */
function WaitlistStudio() {
  const [token, setToken] = useState("");
  const [entry, setEntry] = useState("");
  const [status, setStatus] = useState<SubscriberStatus | null>(null);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"people" | "compose">("people");

  useEffect(() => {
    const stored = sessionStorage.getItem(TOKEN_KEY);
    if (stored) setToken(stored);
  }, []);

  const load = useServerFn(waitlistOverview);
  const overview = useQuery({
    queryKey: ["waitlist-overview", token, status, persona, search],
    queryFn: () =>
      load({
        data: {
          token,
          ...(status ? { status } : {}),
          ...(persona ? { persona } : {}),
          ...(search.trim() ? { search: search.trim() } : {}),
        },
      }),
    enabled: token.length >= 24,
    retry: false,
  });

  const exportFn = useServerFn(exportWaitlistCsv);
  const download = useMutation({
    mutationFn: () => exportFn({ data: { token } }),
    onSuccess: ({ csv }) => {
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `waitlist-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    },
  });

  function signOut() {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken("");
  }

  if (token.length < 24 || overview.isError) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader cta={{ label: "Back to the site", href: "/" }} />
        <main className="shell flex min-h-screen items-center pt-16">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              sessionStorage.setItem(TOKEN_KEY, entry.trim());
              setToken(entry.trim());
            }}
            className="hairline w-full max-w-md bg-surface p-7 sm:p-10"
          >
            <p className="label-mono text-electric">InfinityID Studio</p>
            <h1 className="mt-5 font-display text-3xl font-semibold tracking-[-0.035em]">
              Waitlist
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Enter the admin token. It is the `WAITLIST_ADMIN_TOKEN` set on the deployment, and it
              is kept only for this tab.
            </p>

            <input
              type="password"
              value={entry}
              onChange={(event) => setEntry(event.target.value)}
              placeholder="waitlist admin token"
              autoComplete="off"
              className="mt-7 h-12 w-full border border-input bg-background px-4 font-mono text-sm outline-none focus:border-electric"
            />

            <button
              type="submit"
              disabled={entry.trim().length < 24}
              className="gradient-fill mt-3 flex h-12 w-full items-center justify-center gap-2 text-sm font-semibold text-primary-foreground disabled:opacity-40"
            >
              <KeyRound className="size-4" />
              Open the dashboard
            </button>

            {overview.isError && (
              <p className="mt-4 text-sm text-destructive">
                {overview.error instanceof Error
                  ? overview.error.message
                  : "That token was not accepted."}
              </p>
            )}
          </form>
        </main>
      </div>
    );
  }

  const stats = overview.data?.stats;

  return (
    <div className="min-h-screen bg-background">
      <PageHeader cta={{ label: "Back to the site", href: "/" }} />

      <main className="pt-16">
        <section className="border-b border-border">
          <div className="shell py-12 sm:py-16">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="label-mono text-electric">InfinityID Studio</p>
                <h1 className="display-tight mt-5 text-[2.25rem] sm:text-[2.75rem]">Waitlist</h1>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => overview.refetch()}
                  className="label-mono flex items-center gap-2 border border-border px-4 py-2.5 text-steel transition-colors hover:border-electric hover:text-electric"
                >
                  <RefreshCw className={`size-3.5 ${overview.isFetching ? "animate-spin" : ""}`} />
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={() => download.mutate()}
                  className="label-mono flex items-center gap-2 border border-border px-4 py-2.5 text-steel transition-colors hover:border-electric hover:text-electric"
                >
                  {download.isPending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Download className="size-3.5" />
                  )}
                  Export CSV
                </button>
                <button
                  type="button"
                  onClick={signOut}
                  className="label-mono border border-border px-4 py-2.5 text-steel transition-colors hover:text-foreground"
                >
                  Lock
                </button>
              </div>
            </div>

            {stats && (
              <dl className="mt-10 flex flex-wrap gap-px bg-border">
                {[
                  ["Total", String(stats.total)],
                  ["Confirmed", String(stats.byStatus.confirmed)],
                  ["Awaiting confirmation", String(stats.byStatus.pending)],
                  ["Unsubscribed", String(stats.byStatus.unsubscribed)],
                  ["Bounced", String(stats.byStatus.bounced + stats.byStatus.complained)],
                  ["Joined this week", String(stats.last7Days)],
                ].map(([term, value]) => (
                  <div key={term} className="min-w-[10rem] flex-1 bg-background px-5 py-5">
                    <dt className="label-mono text-steel">{term}</dt>
                    <dd className="mt-2 font-display text-2xl font-semibold tracking-[-0.03em]">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="mt-8 flex flex-wrap gap-px bg-border">
              {(["people", "compose"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setTab(option)}
                  aria-pressed={tab === option}
                  className={`label-mono px-4 py-2.5 transition-colors ${
                    tab === option
                      ? "bg-elevated text-foreground"
                      : "bg-background text-steel hover:text-foreground"
                  }`}
                >
                  {option === "people" ? "People" : "Compose update"}
                </button>
              ))}
            </div>
          </div>
        </section>

        {tab === "people" ? (
          <section className="border-b border-border">
            <div className="shell py-10 sm:py-14">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search email, name or company"
                  className="h-11 min-w-[16rem] flex-1 border border-input bg-background px-4 text-sm outline-none focus:border-electric"
                />
                {SUBSCRIBER_STATUSES.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setStatus(status === option ? null : option)}
                    aria-pressed={status === option}
                    className={`border px-3 py-2 font-mono text-xs transition-colors ${
                      status === option
                        ? "gradient-fill border-transparent text-primary-foreground"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {STATUS_LABELS[option]}
                  </button>
                ))}
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
              </div>

              <div className="hairline mt-6">
                {overview.isPending ? (
                  <p className="flex items-center gap-2 bg-background p-6 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" /> Loading subscribers…
                  </p>
                ) : (
                  <SubscriberTable rows={overview.data?.subscribers.rows ?? []} token={token} />
                )}
              </div>

              <p className="label-mono mt-4 text-steel">
                Showing {overview.data?.subscribers.rows.length ?? 0} of{" "}
                {overview.data?.subscribers.total ?? 0}
              </p>

              {overview.data && overview.data.broadcasts.length > 0 && (
                <div className="mt-14">
                  <p className="label-mono text-steel">Updates sent</p>
                  <ul className="hairline mt-5 divide-y divide-border">
                    {overview.data.broadcasts.map((broadcast) => (
                      <li
                        key={broadcast.id}
                        className="flex flex-wrap items-center gap-x-6 gap-y-1 bg-background px-5 py-3.5"
                      >
                        <span className="flex-1 text-sm text-foreground">{broadcast.subject}</span>
                        <span className="label-mono text-steel">
                          {broadcast.sentCount}/{broadcast.recipientCount} sent
                        </span>
                        {broadcast.failedCount > 0 && (
                          <span className="label-mono text-destructive">
                            {broadcast.failedCount} failed
                          </span>
                        )}
                        <span className="label-mono text-steel">
                          {broadcast.sentAt
                            ? new Date(broadcast.sentAt).toLocaleDateString()
                            : broadcast.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        ) : (
          <section className="border-b border-border">
            <div className="shell py-10 sm:py-14">
              <div className="hairline">
                <BroadcastComposer token={token} onSent={() => void overview.refetch()} />
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
