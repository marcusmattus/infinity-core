import "@tanstack/react-start/server-only";

/**
 * Mirrors presale buyers into HubSpot as contacts. Optional: with no
 * `HUBSPOT_ACCESS_TOKEN` every call is a quiet no-op, and a HubSpot failure
 * never fails a payment.
 */

const API = "https://api.hubapi.com";

const STAGE_ORDER = [
  "subscriber",
  "lead",
  "marketingqualifiedlead",
  "salesqualifiedlead",
  "opportunity",
  "customer",
  "evangelist",
];

function rank(stage: string | null | undefined): number {
  return stage ? STAGE_ORDER.indexOf(stage) : -1;
}

export type HubSpotContact = {
  email: string;
  firstname?: string | null;
  lastname?: string | null;
  company?: string | null;
  lifecyclestage?: "marketingqualifiedlead" | "opportunity" | "customer";
  /** Written to `holodock_<key>` contact properties. */
  holodock?: Record<string, string | null | undefined>;
};

export function splitName(full: string): { first: string; last: string | null } {
  const [first = "", ...rest] = full.trim().split(/\s+/);
  return { first, last: rest.join(" ") || null };
}

/** Creates or updates a contact by email. Lifecycle stage only ever moves forward. */
export async function syncHubSpotContact(c: HubSpotContact): Promise<string | null> {
  const token = process.env["HUBSPOT_ACCESS_TOKEN"];
  if (!token) return null;
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  try {
    let current: string | null = null;
    const existing = await fetch(
      `${API}/crm/v3/objects/contacts/${encodeURIComponent(c.email)}?idProperty=email&properties=lifecyclestage`,
      { headers },
    );
    if (existing.ok) {
      const json = (await existing.json()) as { properties?: { lifecyclestage?: string } };
      current = json.properties?.lifecyclestage || null;
    }

    const properties: Record<string, string> = { email: c.email };
    const put = (k: string, v: string | null | undefined) => {
      if (v) properties[k] = v;
    };
    put("firstname", c.firstname);
    put("lastname", c.lastname);
    put("company", c.company);
    if (c.lifecyclestage && rank(c.lifecyclestage) > rank(current)) {
      properties["lifecyclestage"] = c.lifecyclestage;
    }
    for (const [k, v] of Object.entries(c.holodock ?? {})) put(`holodock_${k}`, v);

    const response = await fetch(`${API}/crm/v3/objects/contacts/batch/upsert`, {
      method: "POST",
      headers,
      body: JSON.stringify({ inputs: [{ idProperty: "email", id: c.email, properties }] }),
    });
    if (!response.ok) {
      console.error("[presale] HubSpot upsert failed:", response.status, await response.text());
      return null;
    }
    const out = (await response.json()) as { results?: { id: string }[] };
    return out.results?.[0]?.id ?? null;
  } catch (error) {
    console.error("[presale] HubSpot sync error:", error instanceof Error ? error.message : error);
    return null;
  }
}
