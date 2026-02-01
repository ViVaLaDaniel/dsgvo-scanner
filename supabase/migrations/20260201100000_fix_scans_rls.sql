-- SECURITY FIX: Allow users to update their own scans
-- Required because the Scan API runs as the authenticated user and needs to save results (status, score, violations).

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'scans'
      AND policyname = 'Users can update own scans'
  ) THEN
    CREATE POLICY "Users can update own scans"
      ON public.scans
      FOR UPDATE
      USING (
        EXISTS (
          SELECT 1
          FROM public.websites w
          WHERE w.id = scans.website_id
            AND w.owner_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.websites w
          WHERE w.id = scans.website_id
            AND w.owner_id = auth.uid()
        )
      );
  END IF;
END $$;
