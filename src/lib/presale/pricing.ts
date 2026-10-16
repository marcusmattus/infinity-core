/**
 * The presale pricing model, shared by the page and the server.
 *
 * Nothing here reads the environment, so it is safe in the browser bundle.
 * Prices themselves are set in the deployment (see `config.server.ts`) and
 * reach the page as a `PresaleConfig`, which means the number a buyer sees
 * and the number Stripe charges come from one place.
 *
 * Amounts are minor units (pence).
 */

export const EDITION_IDS = ["devkit", "standard"] as const;
export type EditionId = (typeof EDITION_IDS)[number];

export const PAYMENT_MODES = ["deposit", "full"] as const;
export type PaymentMode = (typeof PAYMENT_MODES)[number];

export const MAX_QTY = 5;

export const EDITION_COPY: Record<EditionId, { name: string; body: string }> = {
  devkit: {
    name: "Developer kit",
    body: "HoloDock with Openware SDK access, for building and testing spatial apps.",
  },
  standard: {
    name: "Standard unit",
    body: "HoloDock for everyday spatial use with the InfinityID app.",
  },
};

export type PresaleEdition = {
  id: EditionId;
  name: string;
  body: string;
  /** Full presale price per unit, or null until it is set. */
  price: number | null;
};

export type PresaleConfig = {
  currency: string;
  /** Refundable deposit per unit. */
  depositAmount: number;
  editions: PresaleEdition[];
  /** False when Stripe is not configured; the form then says so instead of failing. */
  open: boolean;
};

export function formatMoney(minor: number, currency: string): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: minor % 100 === 0 ? 0 : 2,
  }).format(minor / 100);
}

/** Per-unit charge for an edition and payment mode; null when that combination is not open yet. */
export function unitAmount(
  config: Pick<PresaleConfig, "depositAmount" | "editions">,
  edition: EditionId,
  mode: PaymentMode,
): number | null {
  if (mode === "deposit") return config.depositAmount;
  return config.editions.find((e) => e.id === edition)?.price ?? null;
}

/** What is still owed before dispatch after a deposit. Null while the price is unset. */
export function balanceAfterDeposit(
  config: Pick<PresaleConfig, "depositAmount" | "editions">,
  edition: EditionId,
  quantity: number,
): number | null {
  const price = config.editions.find((e) => e.id === edition)?.price;
  if (!price) return null;
  return Math.max(0, price - config.depositAmount) * quantity;
}
