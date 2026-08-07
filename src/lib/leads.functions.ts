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

    return { accessKey: row.access_key as string };
  });
