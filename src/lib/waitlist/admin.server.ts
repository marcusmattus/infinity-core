import "@tanstack/react-start/server-only";
import { readAdminToken } from "./config.server";
import { waitlistDb, type SubscriberRow } from "./db.server";
import {
  PERSONAS,
  SUBSCRIBER_STATUSES,
  type BroadcastSummary,
  type Persona,
  type Segment,
  type SubscriberEvent,
  type SubscriberStatus,
  type SubscriberSummary,
  type WaitlistStats,
} from "./types";

/**
 * Reads behind the dashboard.
 *
 * Every function here starts with `assertAdmin`, because the data is personal:
 * addresses people gave for product news, not a public list.
 */

/** Length-independent compare, so a wrong token leaks nothing through timing. */
function constantTimeEquals(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const left = encoder.encode(a);
  const right = encoder.encode(b);
  // Comparing lengths early is safe: the length of a secret is not the secret.
  if (left.length !== right.length) return false;

  let diff = 0;
  for (let i = 0; i < left.length; i += 1) diff |= (left[i] ?? 0) ^ (right[i] ?? 0);
  return diff === 0;
}

export class AdminAuthError extends Error {
  constructor() {
    super("Invalid waitlist admin token.");
    this.name = "AdminAuthError";
  }
}

export function assertAdmin(token: string): void {
  if (!token || !constantTimeEquals(token, readAdminToken())) throw new AdminAuthError();
}

function toSummary(row: SubscriberRow): SubscriberSummary {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    company: row.company,
    persona: row.persona,
    deployment: row.deployment,
    source: row.source,
    tags: row.tags,
    status: row.status,
    confirmedAt: row.confirmed_at,
    lastEmailedAt: row.last_emailed_at,
    createdAt: row.created_at,
  };
}

export type ListFilters = {
  status?: SubscriberStatus;
  persona?: Persona;
  /** Matches on email, name or company. */
  search?: string;
  limit?: number;
  offset?: number;
};

export async function listSubscribers(
  filters: ListFilters,
): Promise<{ rows: SubscriberSummary[]; total: number }> {
  const limit = Math.min(Math.max(filters.limit ?? 50, 1), 200);
  const offset = Math.max(filters.offset ?? 0, 0);

  let query = waitlistDb.from("waitlist_subscribers").select("*", { count: "exact" });

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.persona) query = query.eq("persona", filters.persona);
  if (filters.search) {
    // Escape PostgREST's `or` syntax: a comma or paren would otherwise split
    // the filter expression and let a search box rewrite the query.
    const term = filters.search.replace(/[,()*]/g, " ").trim();
    if (term)
      query = query.or(`email.ilike.%${term}%,name.ilike.%${term}%,company.ilike.%${term}%`);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(`waitlist list failed: ${error.message}`);
  return { rows: (data ?? []).map(toSummary), total: count ?? 0 };
}

export async function subscriberTimeline(
  subscriberId: string,
): Promise<{ subscriber: SubscriberSummary | null; events: SubscriberEvent[] }> {
  const { data: row, error } = await waitlistDb
    .from("waitlist_subscribers")
    .select("*")
    .eq("id", subscriberId)
    .maybeSingle();

  if (error) throw new Error(`waitlist detail failed: ${error.message}`);
  if (!row) return { subscriber: null, events: [] };

  const { data: events, error: eventsError } = await waitlistDb
    .from("waitlist_events")
    .select("*")
    .eq("subscriber_id", subscriberId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (eventsError) throw new Error(`waitlist timeline failed: ${eventsError.message}`);

  return {
    subscriber: toSummary(row),
    events: (events ?? []).map((event) => ({
      id: event.id,
      type: event.type,
      detail: event.detail,
      createdAt: event.created_at,
    })),
  };
}

export async function stats(): Promise<WaitlistStats> {
  const { data, error } = await waitlistDb
    .from("waitlist_subscribers")
    .select("status, persona, created_at");

  if (error) throw new Error(`waitlist stats failed: ${error.message}`);

  const byStatus = Object.fromEntries(SUBSCRIBER_STATUSES.map((status) => [status, 0])) as Record<
    SubscriberStatus,
    number
  >;
  const byPersona = Object.fromEntries(PERSONAS.map((persona) => [persona, 0])) as Record<
    Persona,
    number
  >;

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  let last7Days = 0;

  for (const row of data ?? []) {
    byStatus[row.status] = (byStatus[row.status] ?? 0) + 1;
    byPersona[row.persona] = (byPersona[row.persona] ?? 0) + 1;
    if (Date.parse(row.created_at) >= weekAgo) last7Days += 1;
  }

  return { total: (data ?? []).length, byStatus, byPersona, last7Days };
}

export async function listBroadcasts(): Promise<BroadcastSummary[]> {
  const { data, error } = await waitlistDb
    .from("waitlist_broadcasts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(25);

  if (error) throw new Error(`waitlist broadcasts failed: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id,
    subject: row.subject,
    status: row.status,
    segment: row.segment as Segment,
    recipientCount: row.recipient_count,
    sentCount: row.sent_count,
    failedCount: row.failed_count,
    createdAt: row.created_at,
    sentAt: row.sent_at,
  }));
}

const CSV_COLUMNS = [
  "email",
  "name",
  "company",
  "persona",
  "deployment",
  "status",
  "source",
  "tags",
  "confirmed_at",
  "last_emailed_at",
  "created_at",
] as const;

/** Prefixing is what stops `=cmd()` in a name field executing in a spreadsheet. */
function csvCell(value: unknown): string {
  const text = value == null ? "" : Array.isArray(value) ? value.join(" ") : String(value);
  const guarded = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${guarded.replace(/"/g, '""')}"`;
}

/** The hand-off to any other CRM: one row per subscriber, no pagination. */
export async function exportCsv(filters: Omit<ListFilters, "limit" | "offset">): Promise<string> {
  let query = waitlistDb.from("waitlist_subscribers").select("*");
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.persona) query = query.eq("persona", filters.persona);

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw new Error(`waitlist export failed: ${error.message}`);

  const lines = [CSV_COLUMNS.join(",")];
  for (const row of data ?? []) {
    lines.push(CSV_COLUMNS.map((column) => csvCell(row[column])).join(","));
  }
  return lines.join("\n");
}
