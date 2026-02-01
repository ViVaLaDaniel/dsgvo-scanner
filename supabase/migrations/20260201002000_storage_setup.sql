-- 1. Create a bucket for agency logos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('agency-logos', 'agency-logos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Security Policies for Storage

-- Allow public access to read logos (so clients can see them in reports)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'agency-logos' );

-- Allow authenticated users to upload their own logo
-- We use a folder per user for security
CREATE POLICY "User Upload Access"
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'agency-logos' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update/delete their own logo
CREATE POLICY "User Update Access"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'agency-logos' AND (storage.foldername(name))[1] = auth.uid()::text );

CREATE POLICY "User Delete Access"
ON storage.objects FOR DELETE
USING ( bucket_id = 'agency-logos' AND (storage.foldername(name))[1] = auth.uid()::text );
