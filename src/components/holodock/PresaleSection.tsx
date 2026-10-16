import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Loader2, Lock } from "lucide-react";
import { Reveal } from "@/components/infinity/Reveal";
import { startPresaleCheckout } from "@/lib/presale.functions";
import {
  MAX_QTY,
  balanceAfterDeposit,
  formatMoney,
  unitAmount,
  type EditionId,
  type PaymentMode,
  type PresaleConfig,
} from "@/lib/presale/pricing";

const FIELD =
  "h-12 w-full border border-input bg-background px-4 text-sm outline-none focus:border-electric";

/**
 * The HoloDock presale: pick an edition, a quantity and how to pay, then hand
 * off to Stripe Checkout. Every price on screen comes from `config`, which is
 * the same object the server charges from.
 */
export function PresaleSection({
  config,
  cancelled = false,
}: {
  config: PresaleConfig;
  cancelled?: boolean;
}) {
  const checkout = useServerFn(startPresaleCheckout);
  const [edition, setEdition] = useState<EditionId>(config.editions[0]?.id ?? "devkit");
  const [quantity, setQuantity] = useState(1);
  const [mode, setMode] = useState<PaymentMode>("deposit");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [trap, setTrap] = useState("");

  const selected = config.editions.find((e) => e.id === edition) ?? config.editions[0]!;
  const fullOpen = selected.price !== null;
  const effectiveMode: PaymentMode = mode === "full" && !fullOpen ? "deposit" : mode;
  const unit = unitAmount(config, edition, effectiveMode) ?? config.depositAmount;
  const total = unit * quantity;
  const balance = effectiveMode === "deposit" ? balanceAfterDeposit(config, edition, quantity) : null;
  const money = (n: number) => formatMoney(n, config.currency);

  const mutation = useMutation({
    mutationFn: () =>
      checkout({
        data: {
          fullName,
          email,
          ...(company ? { company } : {}),
          edition,
          mode: effectiveMode,
          quantity,
          marketingConsent,
          ...(trap ? { website: trap } : {}),
        },
      }),
    onSuccess: ({ url }) => window.location.assign(url),
  });

  const ready = fullName.trim().length > 0 && /\S+@\S+\.\S+/.test(email) && config.open;

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (ready && !mutation.isPending) mutation.mutate();
  }

  return (
    <section id="presale" className="relative scroll-mt-16 overflow-hidden border-b border-border">
      <div className="blueprint-fade pointer-events-none absolute inset-0 opacity-40" aria-hidden />

      <div className="shell relative py-20 sm:py-28">
        <Reveal>
          <p className="label-mono text-electric">Presale · first production run</p>
          <h2 className="display-tight mt-6 max-w-3xl text-[2.25rem] sm:text-[3.25rem]">
            Pre-order <span className="gradient-text">HoloDock.</span>
          </h2>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Hold units in the first run with a refundable deposit, or pay in full now. Either way,
            payment is handled by Stripe — card details never reach our servers.
          </p>
        </Reveal>

        {cancelled && (
          <p
            role="status"
            className="label-mono mt-8 border border-border bg-surface px-4 py-3 text-steel"
          >
            Checkout was cancelled. No payment was taken.
          </p>
        )}

        <Reveal className="mt-12 grid gap-px bg-border lg:grid-cols-[1.25fr_1fr]" delay={80}>
          <form onSubmit={onSubmit} className="bg-background p-6 sm:p-10" noValidate>
            {/* 1 — Edition */}
            <fieldset>
              <legend className="label-mono text-steel">1 — Edition</legend>
              <div className="mt-4 grid gap-px bg-border sm:grid-cols-2">
                {config.editions.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    aria-pressed={edition === e.id}
                    onClick={() => setEdition(e.id)}
                    className={`p-5 text-left transition-colors ${
                      edition === e.id ? "bg-surface" : "bg-background hover:bg-surface"
                    }`}
                  >
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="font-display text-lg font-semibold tracking-[-0.03em]">
                        {e.name}
                      </span>
                      <span
                        aria-hidden
                        className={`size-2 rounded-full ${
                          edition === e.id ? "gradient-fill" : "border border-border"
                        }`}
                      />
                    </span>
                    <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">
                      {e.body}
                    </span>
                    <span className="label-mono mt-4 block text-electric">
                      {e.price ? `Presale ${money(e.price)}` : "Price announced soon"}
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>

            {/* 2 — Quantity and payment */}
            <div className="mt-10 grid gap-10 sm:grid-cols-[auto_1fr]">
              <div>
                <span id="qty-label" className="label-mono text-steel">
                  2 — Quantity
                </span>
                <div
                  role="group"
                  aria-labelledby="qty-label"
                  className="mt-4 flex h-12 items-stretch border border-input"
                >
                  <button
                    type="button"
                    aria-label="One fewer"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-12 text-lg text-steel transition-colors hover:text-foreground"
                  >
                    −
                  </button>
                  <span
                    aria-live="polite"
                    className="flex w-12 items-center justify-center font-mono text-sm"
                  >
                    {quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="One more"
                    onClick={() => setQuantity((q) => Math.min(MAX_QTY, q + 1))}
                    className="w-12 text-lg text-steel transition-colors hover:text-foreground"
                  >
                    +
                  </button>
                </div>
              </div>

              <fieldset>
                <legend className="label-mono text-steel">3 — Payment</legend>
                <div className="mt-4 grid grid-cols-2 gap-px bg-border">
                  {(
                    [
                      ["deposit", "Refundable deposit"],
                      ["full", "Pre-order in full"],
                    ] as const
                  ).map(([id, label]) => {
                    const disabled = id === "full" && !fullOpen;
                    return (
                      <button
                        key={id}
                        type="button"
                        disabled={disabled}
                        aria-pressed={effectiveMode === id}
                        onClick={() => setMode(id)}
                        className={`h-12 px-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                          effectiveMode === id
                            ? "gradient-fill text-primary-foreground"
                            : "bg-background text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                <p className="label-mono mt-3 text-steel">
                  {effectiveMode === "deposit"
                    ? `${money(config.depositAmount)} per unit today, counted towards the price. Balance due before dispatch.`
                    : "Pay the full presale price today. Stripe collects your shipping address."}
                  {!fullOpen && " Full pre-orders for this edition open once pricing is set."}
                </p>
              </fieldset>
            </div>

            {/* 4 — Details */}
            <div className="mt-10">
              <span className="label-mono text-steel">4 — Your details</span>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <input
                  aria-label="Full name"
                  placeholder="Full name"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={FIELD}
                />
                <input
                  aria-label="Email"
                  type="email"
                  inputMode="email"
                  placeholder="you@studio.dev"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${FIELD} font-mono`}
                />
              </div>
              <input
                aria-label="Company (optional)"
                placeholder="Company (optional)"
                autoComplete="organization"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className={`${FIELD} mt-3`}
              />
              <label className="mt-4 flex items-start gap-3 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={marketingConsent}
                  onChange={(e) => setMarketingConsent(e.target.checked)}
                  className="mt-1"
                />
                <span>Also email me HoloDock updates. Optional, and one-click to stop.</span>
              </label>
            </div>

            {/* Honeypot: off-screen and hidden from assistive tech, so only a bot fills it. */}
            <div aria-hidden className="sr-only">
              <label htmlFor="presale-website">Leave this field empty</label>
              <input
                id="presale-website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={trap}
                onChange={(e) => setTrap(e.target.value)}
              />
            </div>

            {mutation.isError && (
              <p role="alert" className="mt-6 text-sm text-destructive">
                {mutation.error instanceof Error
                  ? mutation.error.message
                  : "We couldn't start checkout just now. No payment was taken."}
              </p>
            )}

            {!config.open && (
              <p role="status" className="label-mono mt-6 text-steel">
                The presale isn't open yet.{" "}
                <a href="/waitlist" className="text-electric underline underline-offset-4">
                  Join the waitlist
                </a>{" "}
                and we'll email you when it is.
              </p>
            )}

            <button
              type="submit"
              disabled={!ready || mutation.isPending}
              className="gradient-fill mt-8 flex h-12 w-full items-center justify-center gap-2 px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Opening secure checkout…
                </>
              ) : (
                <>
                  <Lock className="size-4" />
                  Continue to secure checkout · {money(total)}
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>

          {/* Order summary */}
          <aside className="bg-surface p-6 sm:p-10" aria-label="Order summary">
            <p className="label-mono text-steel">Order summary</p>
            <dl className="mt-6 space-y-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">{selected.name}</dt>
                <dd className="font-mono">
                  {money(unit)} × {quantity}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-border pt-4">
                <dt className="font-semibold">
                  {effectiveMode === "deposit" ? "Due today" : "Total today"}
                </dt>
                <dd className="font-display text-2xl font-semibold tracking-[-0.03em]">
                  {money(total)}
                </dd>
              </div>
              {balance !== null && (
                <div className="flex justify-between gap-4 text-muted-foreground">
                  <dt>Balance before dispatch</dt>
                  <dd className="font-mono">{money(balance)}</dd>
                </div>
              )}
            </dl>

            <ul className="mt-8 space-y-3 border-t border-border pt-6 text-sm leading-relaxed text-muted-foreground">
              <li>Deposits are refundable until you confirm your order.</li>
              <li>Full pre-orders are refundable until dispatch.</li>
              <li>Shipping address is collected by Stripe for full pre-orders.</li>
            </ul>
            <p className="label-mono mt-6 text-steel">Terms to be confirmed before launch.</p>
          </aside>
        </Reveal>
      </div>
    </section>
  );
}
