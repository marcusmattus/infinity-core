import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { DEPLOYMENTS, PERSONAS, SUBSCRIBER_STATUSES } from "./waitlist/types";

/**
 * The client-callable surface of the waitlist.
 *
 * This module ships to the browser, so every server-only import happens inside
 * a handler — the same rule `leads.functions.ts` follows.
 */

const SOURCES = ["waitlist", "access-section", "holodock", "footer"] as const;

const segmentSchema = z.object({
  persona: z.enum(PERSONAS).optional(),
  deployment: z.enum(DEPLOYMENTS).optional(),
  tags: z.array(z.string().min(1).max(40)).max(10).optional(),
  since: z.string().datetime().optional(),
});

const joinSchema = z.object({
  email: z.string().email().max(320),
  persona: z.enum(PERSONAS).optional(),
  deployment: z.enum(DEPLOYMENTS).optional(),
  name: z.string().max(120).optional(),
  company: z.string().max(120).optional(),
  source: z.enum(SOURCES).default("waitlist"),
  utm: z.record(z.string().max(60), z.string().max(200)).optional(),
  referrer: z.string().max(500).optional(),
  /** Honeypot: a real person never sees this field, so a value means a bot. */
  website: z.string().max(200).optional(),
});

export type JoinWaitlistResult = {
  state: "confirmation_sent" | "confirmation_throttled" | "already_confirmed" | "blocked";
};

export const joinWaitlist = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => joinSchema.parse(input))
  .handler(async ({ data }): Promise<JoinWaitlistResult> => {
    // Bots fill every field they find. Answer as if it worked; tell them nothing.
    if (data.website) return { state: "confirmation_sent" };

    const { join } = await import("./waitlist/funnel.server");

    try {
      const result = await join({
        email: data.email,
        source: data.source,
        ...(data.persona ? { persona: data.persona } : {}),
        ...(data.deployment ? { deployment: data.deployment } : {}),
        ...(data.name ? { name: data.name } : {}),
        ...(data.company ? { company: data.company } : {}),
        ...(data.utm ? { utm: data.utm } : {}),
        ...(data.referrer ? { referrer: data.referrer } : {}),
      });
      return { state: result.state };
    } catch (error) {
      console.error("[waitlist] join failed:", error instanceof Error ? error.message : error);
      throw new Error("Could not add you to the waitlist. Please try again.");
    }
  });

/* -------------------------------------------------------------------- admin */

const tokenSchema = z.string().min(24).max(200);

const listSchema = z.object({
  token: tokenSchema,
  status: z.enum(SUBSCRIBER_STATUSES).optional(),
  persona: z.enum(PERSONAS).optional(),
  search: z.string().max(120).optional(),
  limit: z.number().int().min(1).max(200).optional(),
  offset: z.number().int().min(0).optional(),
});

/** One round trip for the dashboard's first paint. */
export const waitlistOverview = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => listSchema.parse(input))
  .handler(async ({ data }) => {
    const [{ assertAdmin, listSubscribers, listBroadcasts, stats }] = await Promise.all([
      import("./waitlist/admin.server"),
    ]);
    assertAdmin(data.token);

    const [summary, subscribers, broadcasts] = await Promise.all([
      stats(),
      listSubscribers({
        ...(data.status ? { status: data.status } : {}),
        ...(data.persona ? { persona: data.persona } : {}),
        ...(data.search ? { search: data.search } : {}),
        ...(data.limit ? { limit: data.limit } : {}),
        ...(data.offset ? { offset: data.offset } : {}),
      }),
      listBroadcasts(),
    ]);

    return { stats: summary, subscribers, broadcasts };
  });

export const waitlistTimeline = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ token: tokenSchema, subscriberId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    const { assertAdmin, subscriberTimeline } = await import("./waitlist/admin.server");
    assertAdmin(data.token);
    return subscriberTimeline(data.subscriberId);
  });

export const waitlistSegmentCount = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ token: tokenSchema, segment: segmentSchema }).parse(input),
  )
  .handler(async ({ data }) => {
    const { assertAdmin } = await import("./waitlist/admin.server");
    const { countSegment } = await import("./waitlist/funnel.server");
    assertAdmin(data.token);
    return { count: await countSegment(data.segment) };
  });

export const sendWaitlistUpdate = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        token: tokenSchema,
        subject: z.string().min(1).max(200),
        preheader: z.string().max(200).optional(),
        body: z.string().min(1).max(20000),
        segment: segmentSchema,
        testTo: z.string().email().max(320).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { assertAdmin } = await import("./waitlist/admin.server");
    const { sendBroadcast } = await import("./waitlist/funnel.server");
    assertAdmin(data.token);

    return sendBroadcast({
      subject: data.subject,
      body: data.body,
      segment: data.segment,
      ...(data.preheader ? { preheader: data.preheader } : {}),
      ...(data.testTo ? { testTo: data.testTo } : {}),
    });
  });

export const exportWaitlistCsv = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        token: tokenSchema,
        status: z.enum(SUBSCRIBER_STATUSES).optional(),
        persona: z.enum(PERSONAS).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { assertAdmin, exportCsv } = await import("./waitlist/admin.server");
    assertAdmin(data.token);
    return {
      csv: await exportCsv({
        ...(data.status ? { status: data.status } : {}),
        ...(data.persona ? { persona: data.persona } : {}),
      }),
    };
  });
