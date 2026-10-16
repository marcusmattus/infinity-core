import "@tanstack/react-start/server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { EditionId, PaymentMode } from "./pricing";

/**
 * Hand-written row type for `presale_orders`, for the same reason
 * `waitlist/db.server.ts` has one: the generated Supabase types predate the
 * table. Delete this once they are regenerated.
 */

export type OrderStatus = "created" | "pending" | "paid" | "expired" | "refunded";

export type OrderRow = {
  id: string;
  email: string;
  full_name: string;
  company: string | null;
  edition: EditionId;
  quantity: number;
  order_type: PaymentMode;
  status: OrderStatus;
  unit_amount: number;
  amount_total: number | null;
  currency: string;
  marketing_consent: boolean;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_customer_id: string | null;
  shipping: unknown | null;
  hubspot_contact_id: string | null;
  created_at: string;
  paid_at: string | null;
  updated_at: string;
};

type NewOrder = Pick<
  OrderRow,
  "email" | "full_name" | "edition" | "quantity" | "order_type" | "unit_amount" | "currency"
> &
  Partial<Pick<OrderRow, "company" | "marketing_consent">>;

type PresaleDatabase = {
  public: {
    Tables: {
      presale_orders: {
        Row: OrderRow;
        Insert: NewOrder & Partial<OrderRow>;
        Update: Partial<OrderRow>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};

const db = supabaseAdmin as unknown as SupabaseClient<PresaleDatabase, "public">;

export async function createOrder(input: NewOrder): Promise<OrderRow> {
  const { data, error } = await db.from("presale_orders").insert(input).select("*").single();
  if (error) throw new Error(`could not create order: ${error.message}`);
  return data;
}

export async function updateOrder(id: string, patch: Partial<OrderRow>): Promise<OrderRow | null> {
  const { data, error } = await db
    .from("presale_orders")
    .update(patch)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw new Error(`could not update order: ${error.message}`);
  return data;
}

export async function findOrder(
  column: "id" | "stripe_checkout_session_id" | "stripe_payment_intent_id",
  value: string,
): Promise<OrderRow | null> {
  const { data, error } = await db
    .from("presale_orders")
    .select("*")
    .eq(column, value)
    .maybeSingle();
  if (error) throw new Error(`could not read order: ${error.message}`);
  return data;
}
