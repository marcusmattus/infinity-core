import "@tanstack/react-start/server-only";
import {
  EDITION_COPY,
  EDITION_IDS,
  type PresaleConfig,
} from "./pricing";

/**
 * Presale settings, read from the deployment's environment.
 *
 *   STRIPE_SECRET_KEY        sk_test_… until launch
 *   STRIPE_WEBHOOK_SECRET    whsec_… for /api/stripe/webhook
 *   DEPOSIT_AMOUNT           minor units per unit, default 4900 (£49)
 *   DEPOSIT_CURRENCY         default gbp
 *   PRESALE_PRICE_DEVKIT     minor units; empty = "price announced soon"
 *   PRESALE_PRICE_STANDARD   minor units; empty = "price announced soon"
 *   PRESALE_SHIP_COUNTRIES   comma-separated ISO codes, default GB
 */

function positiveInt(name: string): number | null {
  const n = Number.parseInt(process.env[name] ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

const PRICE_ENV: Record<(typeof EDITION_IDS)[number], string> = {
  devkit: "PRESALE_PRICE_DEVKIT",
  standard: "PRESALE_PRICE_STANDARD",
};

export function readPresaleConfig(): PresaleConfig {
  const currency = (process.env["DEPOSIT_CURRENCY"] ?? "gbp").toLowerCase();
  return {
    currency,
    depositAmount: positiveInt("DEPOSIT_AMOUNT") ?? 4900,
    editions: EDITION_IDS.map((id) => ({
      id,
      ...EDITION_COPY[id],
      price: positiveInt(PRICE_ENV[id]),
    })),
    open: Boolean(process.env["STRIPE_SECRET_KEY"]),
  };
}

export function readShipCountries(): string[] {
  return (process.env["PRESALE_SHIP_COUNTRIES"] ?? "GB")
    .split(",")
    .map((c) => c.trim().toUpperCase())
    .filter((c) => /^[A-Z]{2}$/.test(c));
}

export function readSiteUrl(): string {
  return (process.env["SITE_URL"] ?? "https://infinityid.labs").replace(/\/+$/, "");
}
