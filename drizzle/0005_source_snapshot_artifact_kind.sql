ALTER TABLE "source_snapshots"
ADD COLUMN IF NOT EXISTS "artifact_kind" text NOT NULL DEFAULT 'document';
