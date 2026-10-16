-- HoloDock presale orders
--
-- One row per Stripe Checkout attempt. Same rule as the waitlist tables:
-- nothing public touches this directly. anon and authenticated get no grants,
-- so every read and write goes through a server function or the Stripe webhook
-- holding the service-role key.

CREATE TABLE IF NOT EXISTS public.presale_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL
    CHECK (email = lower(email) AND email LIKE '%_@_%.__%' AND char_length(email) BETWEEN 3 AND 320),
  full_name TEXT NOT NULL,
  company TEXT,
  edition TEXT NOT NULL CHECK (edition IN ('devkit', 'standard')),
  quantity INTEGER NOT NULL CHECK (quantity BETWEEN 1 AND 5),
  -- deposit: refundable, per unit, counts towards the price.
  -- full:    the whole presale price, with a shipping address.
  order_type TEXT NOT NULL CHECK (order_type IN ('deposit', 'full')),
  status TEXT NOT NULL DEFAULT 'created'
    CHECK (status IN ('created', 'pending', 'paid', 'expired', 'refunded')),
  -- Minor units (pence). Unit price is what the buyer was shown at checkout.
  unit_amount INTEGER NOT NULL CHECK (unit_amount > 0),
  amount_total INTEGER,
  currency TEXT NOT NULL DEFAULT 'gbp',
  marketing_consent BOOLEAN NOT NULL DEFAULT false,
  stripe_checkout_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  stripe_customer_id TEXT,
  shipping JSONB,
  hubspot_contact_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS presale_orders_email_idx ON public.presale_orders (email);
CREATE INDEX IF NOT EXISTS presale_orders_payment_intent_idx
  ON public.presale_orders (stripe_payment_intent_id);

DROP TRIGGER IF EXISTS presale_orders_touch_updated_at ON public.presale_orders;
CREATE TRIGGER presale_orders_touch_updated_at
  BEFORE UPDATE ON public.presale_orders
  FOR EACH ROW EXECUTE FUNCTION public.waitlist_touch_updated_at();

ALTER TABLE public.presale_orders ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.presale_orders FROM anon, authenticated;
