import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { getDepositOffer, startWaitlistDeposit } from "@/lib/waitlist.functions";
import { CONTACT_MAILTO, SITE } from "@/lib/site";

const STATE_COPY = {
  already_paid: "This address already has a paid reservation. Nothing more to do.",
  not_on_list: "We couldn't find that address on the waitlist yet. Give it a moment and try again.",
  closed: "Reservations open soon — you'll be among the first to hear when they do.",
} as const;

/**
 * Step two of the waitlist: an optional, refundable deposit that holds a place
 * in the first production run. Hands off to Stripe Checkout; the webhook marks
 * the subscriber as paid.
 */
export function DepositStep({ email }: { email: string }) {
  const loadOffer = useServerFn(getDepositOffer);
  const offer = useQuery({ queryKey: ["deposit-offer"], queryFn: () => loadOffer() });

  const start = useServerFn(startWaitlistDeposit);
  const checkout = useMutation({
    mutationFn: () => start({ data: { email } }),
    onSuccess: (result) => {
      if (result.state === "checkout") window.location.assign(result.url);
    },
  });

  const label = offer.data?.label ?? "£49";
  const open = offer.data?.open ?? false;
  const settled = checkout.data && checkout.data.state !== "checkout" ? checkout.data.state : null;

  return (
    <div className="mt-6 rounded-[14px] border border-gold/40 bg-void p-5 sm:p-6">
      <p className="label-mono text-gold">Step 2 · Optional</p>
      <h3 className="mt-3 text-lg font-bold tracking-tight">
        Hold a HoloDock from the first run for {label}.
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-ash">
        A fully refundable deposit that counts towards the price. The balance is only due before
        dispatch, and you can ask for it back at any time before then.
      </p>

      {offer.isPending ? (
        <p className="mt-5 flex items-center gap-2 text-sm text-ash">
          <Loader2 className="size-4 animate-spin" /> Checking availability…
        </p>
      ) : !open || settled === "closed" ? (
        <p className="mt-5 text-sm text-ash">{STATE_COPY.closed}</p>
      ) : settled ? (
        <p className="mt-5 text-sm text-ash">{STATE_COPY[settled]}</p>
      ) : (
        <button
          type="button"
          onClick={() => checkout.mutate()}
          disabled={checkout.isPending || checkout.isSuccess}
          className="mt-5 inline-flex h-12 items-center gap-2 rounded-[14px] bg-gold px-6 text-sm font-semibold text-void transition-colors hover:bg-gold-light disabled:opacity-60"
        >
          {checkout.isPending || checkout.isSuccess ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ArrowRight className="size-4" />
          )}
          Reserve with a {label} deposit
        </button>
      )}

      {checkout.isError && (
        <p className="mt-4 text-sm text-destructive">
          {checkout.error instanceof Error ? checkout.error.message : "Could not start checkout."}
        </p>
      )}

      <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-ash">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-blue-light" />
        <span>
          Payment is handled by Stripe; we never see your card. Questions:{" "}
          <a href={CONTACT_MAILTO} className="text-blue-light hover:underline">
            {SITE.contactEmail}
          </a>
        </span>
      </p>
    </div>
  );
}
