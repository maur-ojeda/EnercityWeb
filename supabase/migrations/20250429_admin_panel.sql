-- =============================================
-- Admin Panel: Schema changes
-- =============================================

-- 1. Add notas and updated_at to leads
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS notas TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

-- 2. Add notas and updated_at to contacts
ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS notas TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

-- 3. Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER contacts_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 4. Update RLS policies — allow authenticated users to UPDATE
CREATE POLICY "Allow authenticated update on leads" ON public.leads
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update on contacts" ON public.contacts
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5. Ensure authenticated SELECT on leads (already exists as "Authenticated read leads")
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'Authenticated read leads'
  ) THEN
    CREATE POLICY "Authenticated read leads" ON public.leads
      FOR SELECT TO authenticated
      USING (true);
  END IF;
END $$;

-- 6. Allow authenticated SELECT and UPDATE on settings
-- Note: "Authenticated read settings" already exists from initial schema
CREATE POLICY "Allow authenticated update on settings" ON public.settings
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);