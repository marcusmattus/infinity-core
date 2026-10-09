import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const leadSchema = z.object({
  objective: z.enum(["hardware", "mcp-sdk", "app-dev"]),
  deployment: z.enum(["mobile", "holographic-web", "wearable"]),
  email: z.string().email().max(320),
});

export const submitDevLead = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => leadSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: row, error } = await supabaseAdmin
      .from("dev_leads")
      .insert({
        objective: data.objective,
        deployment: data.deployment,
        email: data.email,
      })
      .select("access_key")
      .single();

    if (error) {
      console.error("dev_lead insert failed", error.message);
      throw new Error("Could not register your developer access request.");
    }

    const accessKey = row.access_key as string;

    // The access form is the top of the waitlist funnel: the same answers
    // become the subscriber's persona and deployment. A mail failure must
    // never cost someone the key they just asked for, so this cannot throw.
    let waitlist: "confirmation_sent" | "already_confirmed" | "none" = "none";
    try {
      const { join } = await import("./waitlist/funnel.server");
      const result = await join({
        email: data.email,
        persona: data.objective,
        deployment: data.deployment,
        source: "access-section",
        accessKey,
      });
      waitlist =
        result.state === "already_confirmed"
          ? "already_confirmed"
          : result.state === "blocked"
            ? "none"
            : "confirmation_sent";
    } catch (waitlistError) {
      console.error(
        "waitlist join from dev lead failed",
        waitlistError instanceof Error ? waitlistError.message : waitlistError,
      );
    }

    return { accessKey, waitlist };
  });
