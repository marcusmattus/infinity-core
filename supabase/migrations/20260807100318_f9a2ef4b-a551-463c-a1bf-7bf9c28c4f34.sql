CREATE OR REPLACE FUNCTION public.generate_access_key()
RETURNS TEXT
LANGUAGE sql
VOLATILE
SET search_path = public
AS $$
  SELECT 'inf_' || replace(gen_random_uuid()::text, '-', '') ;
$$;

CREATE TABLE IF NOT EXISTS public.dev_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  objective TEXT NOT NULL,
  deployment TEXT NOT NULL,
  email TEXT NOT NULL,
  access_key TEXT NOT NULL DEFAULT public.generate_access_key(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT INSERT ON public.dev_leads TO anon, authenticated;
GRANT ALL ON public.dev_leads TO service_role;

ALTER TABLE public.dev_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit a developer lead" ON public.dev_leads;
CREATE POLICY "Anyone can submit a developer lead"
ON public.dev_leads FOR INSERT TO anon, authenticated
WITH CHECK (
  char_length(email) BETWEEN 3 AND 320
  AND email LIKE '%_@_%.__%'
  AND objective IN ('hardware', 'mcp-sdk', 'app-dev')
  AND deployment IN ('mobile', 'holographic-web', 'wearable')
);