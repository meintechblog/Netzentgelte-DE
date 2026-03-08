CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS operators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  country_code varchar(2) NOT NULL DEFAULT 'DE',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS source_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id uuid NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
  source_url text NOT NULL,
  document_type text NOT NULL,
  update_strategy text NOT NULL,
  parser_mode text NOT NULL DEFAULT 'pending',
  review_status text NOT NULL DEFAULT 'unverified',
  notes text,
  last_successful_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS source_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_catalog_id uuid NOT NULL REFERENCES source_catalog(id) ON DELETE CASCADE,
  fetched_at timestamp with time zone NOT NULL DEFAULT now(),
  content_hash text NOT NULL,
  storage_path text,
  parser_status text NOT NULL DEFAULT 'pending',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS ingest_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id uuid REFERENCES operators(id) ON DELETE SET NULL,
  source_catalog_id uuid REFERENCES source_catalog(id) ON DELETE SET NULL,
  status text NOT NULL,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  summary jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS tariff_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id uuid NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
  source_snapshot_id uuid REFERENCES source_snapshots(id) ON DELETE SET NULL,
  model_key text NOT NULL DEFAULT '14a-model-3',
  valid_from date NOT NULL,
  valid_until date,
  value_ct_per_kwh numeric(10, 4) NOT NULL,
  unit text NOT NULL DEFAULT 'ct/kWh',
  currency text NOT NULL DEFAULT 'EUR',
  published_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS operator_geometries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id uuid NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
  source_label text NOT NULL,
  precision text NOT NULL,
  geometry geometry(MultiPolygon, 4326) NOT NULL,
  imported_at timestamp with time zone NOT NULL DEFAULT now()
);
