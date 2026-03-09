ALTER TABLE source_snapshots
  ADD COLUMN IF NOT EXISTS page_url text,
  ADD COLUMN IF NOT EXISTS file_url text,
  ADD COLUMN IF NOT EXISTS file_name text,
  ADD COLUMN IF NOT EXISTS mime_type text;

ALTER TABLE tariff_versions
  ADD COLUMN IF NOT EXISTS raw_label text,
  ADD COLUMN IF NOT EXISTS raw_value text,
  ADD COLUMN IF NOT EXISTS source_page_url text,
  ADD COLUMN IF NOT EXISTS source_quote text,
  ADD COLUMN IF NOT EXISTS confidence_score numeric(3, 2),
  ADD COLUMN IF NOT EXISTS human_review_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS human_review_notes text,
  ADD COLUMN IF NOT EXISTS human_reviewed_at timestamp with time zone;
