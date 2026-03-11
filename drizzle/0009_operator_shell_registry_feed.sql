ALTER TABLE "operator_shells"
ADD COLUMN "registry_feed_source" text,
ADD COLUMN "registry_feed_label" text,
ADD COLUMN "last_seen_in_registry_feed" text,
ADD COLUMN "deprecated_status" text DEFAULT 'active' NOT NULL,
ADD COLUMN "deprecated_checked_at" text,
ADD COLUMN "deprecated_reason" text;
