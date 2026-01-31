-- Migration: Add missing columns to scans table
-- Created at: 2026-01-31

ALTER TABLE public.scans 
ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS error_log TEXT;

-- Update updated_at if it was intended, although not in original schema.sql
-- For consistency with other tables, we might want it, but let's stick to fixing the error first.
