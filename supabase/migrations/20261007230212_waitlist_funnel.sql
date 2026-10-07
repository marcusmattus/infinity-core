-- Waitlist funnel + CRM
--
-- Four tables behind one rule: nothing public touches them directly. The
-- anon and authenticated roles get no grants at all, so every read and write
-- goes through a server function holding the service-role key. That is a
-- deliberate departure from `dev_leads`, which grants anon INSERT: a waitlist
-- carries confirmation and unsubscribe tokens, and those must never be
-- selectable from the browser.

-- 64 hex characters from two UUIDs — unguessable, and no extension needed.
CREATE OR REPLACE FUNCTION public.waitlist_token()
RETURNS TEXT
LANGUAGE sql
VOLATILE
SET search_path = public
AS $$
  SELECT replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
$$;

CREATE OR REPLACE FUNCTION public.waitlist_touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------- subscribers

CREATE TABLE IF NOT EXISTS public.waitlist_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Always stored lowercased, so uniqueness is real uniqueness.
  email TEXT NOT NULL UNIQUE
    CHECK (email = lower(email) AND email LIKE '%_@_%.__%' AND char_length(email) BETWEEN 3 AND 320),
  name TEXT,
  company TEXT,
  -- What they said they are here for; mirrors the developer form's objective.
  persona TEXT NOT NULL DEFAULT 'unspecified'
    CHECK (persona IN ('hardware', 'mcp-sdk', 'app-dev', 'unspecified')),
  deployment TEXT
    CHECK (deployment IS NULL OR deployment IN ('mobile', 'holographic-web', 'wearable')),
  -- Which surface they came from: 'waitlist', 'access-section', 'holodock', …
  source TEXT NOT NULL DEFAULT 'waitlist',
  tags TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'unsubscribed', 'bounced', 'complained')),
  confirm_token TEXT NOT NULL DEFAULT public.waitlist_token(),
  unsubscribe_token TEXT NOT NULL DEFAULT public.waitlist_token(),
  confirmed_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  -- Throttles the confirmation resend, and shows recency in the dashboard.
  last_emailed_at TIMESTAMPTZ,
  utm JSONB NOT NULL DEFAULT '{}'::jsonb,
  referrer TEXT,
  -- Set when the developer-access form issued a key for this person.
  access_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS waitlist_subscribers_confirm_token_key
  ON public.waitlist_subscribers (confirm_token);
CREATE UNIQUE INDEX IF NOT EXISTS waitlist_subscribers_unsubscribe_token_key
  ON public.waitlist_subscribers (unsubscribe_token);
CREATE INDEX IF NOT EXISTS waitlist_subscribers_status_idx
  ON public.waitlist_subscribers (status);
CREATE INDEX IF NOT EXISTS waitlist_subscribers_created_at_idx
  ON public.waitlist_subscribers (created_at DESC);

DROP TRIGGER IF EXISTS waitlist_subscribers_touch ON public.waitlist_subscribers;
CREATE TRIGGER waitlist_subscribers_touch
  BEFORE UPDATE ON public.waitlist_subscribers
  FOR EACH ROW EXECUTE FUNCTION public.waitlist_touch_updated_at();

-- --------------------------------------------------------------------- events

-- The CRM timeline: one row per thing that happened to a subscriber.
CREATE TABLE IF NOT EXISTS public.waitlist_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscriber_id UUID NOT NULL REFERENCES public.waitlist_subscribers(id) ON DELETE CASCADE,
  type TEXT NOT NULL
    CHECK (type IN (
      'signup', 'confirm_requested', 'confirmed', 'welcomed',
      'broadcast_sent', 'unsubscribed', 'resubscribed',
      'bounced', 'complained', 'note'
    )),
  detail JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS waitlist_events_subscriber_idx
  ON public.waitlist_events (subscriber_id, created_at DESC);
CREATE INDEX IF NOT EXISTS waitlist_events_type_idx
  ON public.waitlist_events (type, created_at DESC);

-- ----------------------------------------------------------------- broadcasts

-- An update sent to a segment. Kept as a row so the dashboard can show what
-- went out, to whom, and what happened — a send is not a fire-and-forget.
CREATE TABLE IF NOT EXISTS public.waitlist_broadcasts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL CHECK (char_length(subject) BETWEEN 1 AND 200),
  preheader TEXT,
  body TEXT NOT NULL,
  -- {"status": "confirmed", "persona": "mcp-sdk", "deployment": null, "tags": []}
  segment JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'sending', 'sent', 'failed')),
  recipient_count INTEGER NOT NULL DEFAULT 0,
  sent_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS waitlist_broadcasts_created_at_idx
  ON public.waitlist_broadcasts (created_at DESC);

-- One row per recipient per broadcast. The unique constraint is what makes a
-- retried send idempotent instead of a second copy in someone's inbox.
CREATE TABLE IF NOT EXISTS public.waitlist_deliveries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  broadcast_id UUID NOT NULL REFERENCES public.waitlist_broadcasts(id) ON DELETE CASCADE,
  subscriber_id UUID NOT NULL REFERENCES public.waitlist_subscribers(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'skipped')),
  message_id TEXT,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (broadcast_id, subscriber_id)
);

CREATE INDEX IF NOT EXISTS waitlist_deliveries_broadcast_idx
  ON public.waitlist_deliveries (broadcast_id);

-- ------------------------------------------------------------------ lockdown

ALTER TABLE public.waitlist_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist_broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist_deliveries ENABLE ROW LEVEL SECURITY;

-- No policies for anon/authenticated: with RLS on and nothing granted, the
-- browser cannot reach these tables at all. service_role bypasses RLS.
REVOKE ALL ON public.waitlist_subscribers FROM anon, authenticated;
REVOKE ALL ON public.waitlist_events FROM anon, authenticated;
REVOKE ALL ON public.waitlist_broadcasts FROM anon, authenticated;
REVOKE ALL ON public.waitlist_deliveries FROM anon, authenticated;

GRANT ALL ON public.waitlist_subscribers TO service_role;
GRANT ALL ON public.waitlist_events TO service_role;
GRANT ALL ON public.waitlist_broadcasts TO service_role;
GRANT ALL ON public.waitlist_deliveries TO service_role;

REVOKE ALL ON FUNCTION public.waitlist_token() FROM anon, authenticated;
