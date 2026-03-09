ALTER TABLE source_catalog
  ADD COLUMN IF NOT EXISTS source_slug text,
  ADD COLUMN IF NOT EXISTS provider_hint text,
  ADD COLUMN IF NOT EXISTS refresh_window_days integer NOT NULL DEFAULT 90,
  ADD COLUMN IF NOT EXISTS last_checked_at timestamp with time zone;

UPDATE source_catalog
SET source_slug = COALESCE(source_slug, md5(source_url))
WHERE source_slug IS NULL;

ALTER TABLE source_catalog
  ALTER COLUMN source_slug SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'source_catalog_source_slug_unique'
  ) THEN
    ALTER TABLE source_catalog
      ADD CONSTRAINT source_catalog_source_slug_unique UNIQUE (source_slug);
  END IF;
END $$;

ALTER TABLE ingest_runs
  ADD COLUMN IF NOT EXISTS run_type text NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS error_message text;

ALTER TABLE tariff_versions
  ADD COLUMN IF NOT EXISTS normalization_status text NOT NULL DEFAULT 'pending';
