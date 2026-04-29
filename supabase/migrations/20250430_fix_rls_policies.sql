-- ============================================
-- Fix RLS Policies for leads, contacts, settings
-- Problem: anon INSERT fails on leads/contacts despite policies existing
-- Solution: Drop and recreate INSERT policies cleanly to ensure no conflicts
-- ============================================

-- 1. leads: ensure anon + authenticated can INSERT
DROP POLICY IF EXISTS "Public insert leads" ON public.leads;
CREATE POLICY "Public insert leads" ON public.leads
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- 2. contacts: ensure anon + authenticated can INSERT
DROP POLICY IF EXISTS "Allow anon insert on contacts" ON public.contacts;
CREATE POLICY "Anyone can insert contacts" ON public.contacts
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- 3. leads: ensure authenticated can SELECT (idempotent)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'Authenticated read leads'
    ) THEN
        CREATE POLICY "Authenticated read leads" ON public.leads
            FOR SELECT TO authenticated
            USING (true);
    END IF;
END $$;

-- 4. leads: ensure authenticated can UPDATE (idempotent)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'Allow authenticated update on leads'
    ) THEN
        CREATE POLICY "Allow authenticated update on leads" ON public.leads
            FOR UPDATE TO authenticated
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;

-- 5. contacts: ensure authenticated can SELECT (idempotent)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'Allow authenticated read on contacts'
    ) THEN
        CREATE POLICY "Allow authenticated read on contacts" ON public.contacts
            FOR SELECT TO authenticated
            USING (true);
    END IF;
END $$;

-- 6. contacts: ensure authenticated can UPDATE (idempotent)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'Allow authenticated update on contacts'
    ) THEN
        CREATE POLICY "Allow authenticated update on contacts" ON public.contacts
            FOR UPDATE TO authenticated
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;

-- 7. settings: ensure authenticated can SELECT (idempotent)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'settings' AND policyname = 'Authenticated read settings'
    ) THEN
        CREATE POLICY "Authenticated read settings" ON public.settings
            FOR SELECT TO authenticated
            USING (true);
    END IF;
END $$;

-- 8. settings: ensure anon can SELECT (idempotent)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'settings' AND policyname = 'Public read settings'
    ) THEN
        CREATE POLICY "Public read settings" ON public.settings
            FOR SELECT TO anon
            USING (true);
    END IF;
END $$;

-- 9. settings: ensure authenticated can UPDATE (idempotent)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'settings' AND policyname = 'Allow authenticated update on settings'
    ) THEN
        CREATE POLICY "Allow authenticated update on settings" ON public.settings
            FOR UPDATE TO authenticated
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;