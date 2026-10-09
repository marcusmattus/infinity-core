import "@tanstack/react-start/server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Deployment, EventDetail, Persona, SubscriberStatus } from "./types";

/**
 * Hand-written row types for the four waitlist tables.
 *
 * `src/integrations/supabase/types.ts` is generated and only knows about
 * `dev_leads`; rather than edit a generated file by hand, the admin client is
 * re-typed here. When the Supabase types are next regenerated this can be
 * deleted and the generated `Database` used directly.
 */

export type SubscriberRow = {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  persona: Persona;
  deployment: Deployment | null;
  source: string;
  tags: string[];
  status: SubscriberStatus;
  confirm_token: string;
  unsubscribe_token: string;
  confirmed_at: string | null;
  unsubscribed_at: string | null;
  last_emailed_at: string | null;
  utm: Record<string, string>;
  referrer: string | null;
  access_key: string | null;
  created_at: string;
  updated_at: string;
};

export type EventRow = {
  id: string;
  subscriber_id: string;
  type: string;
  detail: EventDetail;
  created_at: string;
};

export type BroadcastRow = {
  id: string;
  subject: string;
  preheader: string | null;
  body: string;
  segment: Record<string, unknown>;
  status: "draft" | "sending" | "sent" | "failed";
  recipient_count: number;
  sent_count: number;
  failed_count: number;
  created_at: string;
  sent_at: string | null;
};

export type DeliveryRow = {
  id: string;
  broadcast_id: string;
  subscriber_id: string;
  status: "sent" | "failed" | "skipped";
  message_id: string | null;
  error: string | null;
  created_at: string;
};

type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type WaitlistDatabase = {
  public: {
    Tables: {
      waitlist_subscribers: Table<
        SubscriberRow,
        Pick<SubscriberRow, "email"> & Partial<SubscriberRow>
      >;
      waitlist_events: Table<
        EventRow,
        Pick<EventRow, "subscriber_id" | "type"> & Partial<EventRow>
      >;
      waitlist_broadcasts: Table<
        BroadcastRow,
        Pick<BroadcastRow, "subject" | "body"> & Partial<BroadcastRow>
      >;
      waitlist_deliveries: Table<
        DeliveryRow,
        Pick<DeliveryRow, "broadcast_id" | "subscriber_id" | "status"> & Partial<DeliveryRow>
      >;
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};

export const waitlistDb = supabaseAdmin as unknown as SupabaseClient<WaitlistDatabase, "public">;

/** Appends to the subscriber timeline. Never throws — a lost event must not fail a send. */
export async function logEvent(
  subscriberId: string,
  type: EventRow["type"],
  detail: EventDetail = {},
): Promise<void> {
  const { error } = await waitlistDb
    .from("waitlist_events")
    .insert({ subscriber_id: subscriberId, type, detail });
  if (error) console.error(`[waitlist] could not log ${type}:`, error.message);
}
