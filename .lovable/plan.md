# InfinityID Labs — Spatial Computing Landing Site

A single-page marketing/developer site for the Infinity-1 Spatial Node, with a voice command layer, a hero product showcase, a progressive developer onboarding flow, and a code example for the Camera MCP server. Backend enabled so onboarding leads are actually captured.

## Visual direction

Dark technical-brutalist, drawing on the uploaded references: deep near-black canvas, a faint blueprint grid, one electric accent (cyan-green), oversized tight-tracked display headline, monospace labels and uppercase micro-copy, thin hairline dividers boxing content into grid cells. No purple-on-white gradients, no rounded pastel cards.

## Sections (top to bottom)

1. **Fixed nav** — infinity mark + wordmark, links: Why Us / Device / MCP SDK / App, plus a persistent mic button that opens the Voice Command Center.
2. **Hero** — huge "Beyond the interface" style headline, sub-copy about spatial computing, primary CTA "Start onboarding", secondary "Read the SDK". Ticker strip along the bottom edge (sensory input · spatial canvas · holographic mesh).
3. **AI Trend 2 — Voice-Activated Interface** — explainer copy plus a live Voice Command Center panel: press-to-talk, transcript readout, and recognized commands that actually act on the page ("show hardware specs", "launch MCP inspector", "start onboarding" → scroll/expand the matching section). Includes a text input fallback and a short list of supported commands. Brand logos row (Walmart, Domino's, Nike, ASOS, H&M, Sephora) as text marks.
4. **Hero product — Infinity-1 Spatial Node** — a generated product image of the handheld device, with annotated callouts for Spatial Camera Sensor, Array Microphones, Holographic Ray Projector, MCP Server Node. Spec table underneath.
5. **Core capabilities** — three grid cells: Camera Access MCP Server, Holographic Software Tools, Sensory Input Fusion.
6. **Developer code example** — syntax-styled Python block for connecting to the Camera MCP server, with a copy button.
7. **AI Trend 3 — Progressive onboarding** — 3-step form: Primary Objective (Hardware / MCP SDK / App Dev), Target Deployment (Mobile / Holographic Web / Wearable), Developer Email. Each step updates a live "AI context" panel beside it (documentation preview, pre-configured sample downloads, credential preview). On submit, the lead is saved and a generated developer key + MCP endpoint is shown.
8. **Footer** — mark, nav repeat, legal line.

## Backend (Lovable Cloud)

- `dev_leads` table: objective, deployment target, email, generated access key, created_at. Public insert only (no public reads), so the form works for anonymous visitors while lead data stays private.
- Key generation happens server-side on insert, not in the browser.

## Technical notes

- Voice uses the browser Web Speech API behind a client-only guard, with graceful fallback to the text command input where unsupported (Safari/iOS). Commands are matched against a small keyword map — no AI model call needed.
- Product image generated as an asset; annotation callouts are absolutely positioned overlays, stacked below the image on mobile.
- Single route at `/` replacing the placeholder, with its own SEO head (title, description, og/twitter tags). Section anchors for nav.
- Design tokens (colors, grid line, accent, mono/display fonts) defined in `src/styles.css`; no hardcoded color utilities in components.

## Not included

No real hardware/MCP connectivity, no shipping/checkout, no auth or dashboard. The code sample is illustrative.
