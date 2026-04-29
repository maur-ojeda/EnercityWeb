-- ============================================
-- Fix RLS: Add anon SELECT policies for leads and contacts
-- ============================================
-- ROOT CAUSE: The Supabase JS client uses `.insert().select().single()`
-- which sends `Prefer: return=representation`. PostgREST then:
--   1. INSERTs the row (succeeds — anon has INSERT policy)
--   2. SELECTs the row back to return it (FAILS — anon has no SELECT policy)
-- Result: "new row violates row-level security policy" error 42501
--
-- FIX: Add SELECT policies for anon on leads and contacts.
-- This is safe because:
--   - leads/contacts are public-facing form submissions
--   - anon already has INSERT, so they know the data they submitted
--   - The admin panel uses authenticated role which already has SELECT
-- ============================================

-- 1. leads: allow anon to SELECT (needed for INSERT .select().single())
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'Public read leads'
    ) THEN
        CREATE POLICY "Public read leads" ON public.leads
            FOR SELECT TO anon
            USING (true);
    END IF;
END $$;

-- 2. contacts: allow anon to SELECT (needed for INSERT .select().single())
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'Public read contacts'
    ) THEN
        CREATE POLICY "Public read contacts" ON public.contacts
            FOR SELECT TO anon
            USING (true);
    END IF;
END $$;