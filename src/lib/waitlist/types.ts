/** Shared waitlist vocabulary. Safe to import from client code. */

export const SUBSCRIBER_STATUSES = [
  "pending",
  "confirmed",
  "unsubscribed",
  "bounced",
  "complained",
] as const;
export type SubscriberStatus = (typeof SUBSCRIBER_STATUSES)[number];

export const PERSONAS = ["hardware", "mcp-sdk", "app-dev", "unspecified"] as const;
export type Persona = (typeof PERSONAS)[number];

export const DEPLOYMENTS = ["mobile", "holographic-web", "wearable"] as const;
export type Deployment = (typeof DEPLOYMENTS)[number];

export const PERSONA_LABELS: Record<Persona, string> = {
  hardware: "Hardware",
  "mcp-sdk": "MCP SDK",
  "app-dev": "Openware",
  unspecified: "Not said",
};

export const DEPLOYMENT_LABELS: Record<Deployment, string> = {
  mobile: "Mobile",
  "holographic-web": "Spatial web",
  wearable: "Wearable",
};

export const STATUS_LABELS: Record<SubscriberStatus, string> = {
  pending: "Awaiting confirmation",
  confirmed: "Confirmed",
  unsubscribed: "Unsubscribed",
  bounced: "Bounced",
  complained: "Complained",
};

/**
 * Who a broadcast goes to. Every field is a narrowing filter; an empty segment
 * means "every confirmed subscriber", because an unconfirmed or unsubscribed
 * address is never a valid recipient — that rule lives in the query, not here.
 */
export type Segment = {
  persona?: Persona | undefined;
  deployment?: Deployment | undefined;
  /** Subscriber must carry all of these tags. */
  tags?: string[] | undefined;
  /** Only people who joined on or after this ISO date. */
  since?: string | undefined;
};

export type SubscriberSummary = {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  persona: Persona;
  deployment: Deployment | null;
  source: string;
  tags: string[];
  status: SubscriberStatus;
  confirmedAt: string | null;
  lastEmailedAt: string | null;
  createdAt: string;
};

/** Flat scalars only: the timeline crosses the server-function boundary. */
export type EventDetail = Record<string, string | number | boolean | null>;

export type SubscriberEvent = {
  id: string;
  type: string;
  detail: EventDetail;
  createdAt: string;
};

export type WaitlistStats = {
  total: number;
  byStatus: Record<SubscriberStatus, number>;
  byPersona: Record<Persona, number>;
  last7Days: number;
};

export type BroadcastSummary = {
  id: string;
  subject: string;
  status: string;
  segment: Segment;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  createdAt: string;
  sentAt: string | null;
};

/** Normalises an address the one way the database will accept it. */
export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}
