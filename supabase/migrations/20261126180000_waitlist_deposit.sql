-- Waitlist deposit
--
-- A refundable reservation deposit taken through Stripe Checkout once someone
-- has joined the waitlist. The deposit lives on the subscriber row (one person,
-- one reservation) and every change lands on the CRM timeline as an event.
-- Same lockdown as the funnel: only the service role reads or writes these.

ALTER TABLE public.waitlist_subscribers
  ADD COLUMN IF NOT EXISTS deposit_status TEXT NOT NULL DEFAULT 'none'
    CHECK (deposit_status IN ('none', 'pending', 'paid', 'refunded')),
  ADD COLUMN IF NOT EXISTS deposit_amount INTEGER,
  ADD COLUMN IF NOT EXISTS deposit_currency TEXT,
  ADD COLUMN IF NOT EXISTS deposit_paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

CREATE INDEX IF NOT EXISTS waitlist_subscribers_deposit_status_idx
  ON public.waitlist_subscribers (deposit_status);
CREATE UNIQUE INDEX IF NOT EXISTS waitlist_subscribers_checkout_session_key
  ON public.waitlist_subscribers (stripe_checkout_session_id)
  WHERE stripe_checkout_session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS waitlist_subscribers_payment_intent_idx
  ON public.waitlist_subscribers (stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

-- Widen the timeline vocabulary with the four deposit events.
ALTER TABLE public.waitlist_events DROP CONSTRAINT IF EXISTS waitlist_events_type_check;
ALTER TABLE public.waitlist_events
  ADD CONSTRAINT waitlist_events_type_check CHECK (type IN (
    'signup', 'confirm_requested', 'confirmed', 'welcomed',
    'broadcast_sent', 'unsubscribed', 'resubscribed',
    'bounced', 'complained', 'note',
    'deposit_started', 'deposit_paid', 'deposit_expired', 'deposit_refunded'
  ));
