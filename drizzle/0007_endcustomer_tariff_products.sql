CREATE TABLE IF NOT EXISTS tariff_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id uuid NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
  source_catalog_id uuid REFERENCES source_catalog(id) ON DELETE SET NULL,
  source_snapshot_id uuid REFERENCES source_snapshots(id) ON DELETE SET NULL,
  network_level text NOT NULL,
  module_key text NOT NULL,
  metering_mode text NOT NULL,
  valid_from date NOT NULL,
  valid_until date,
  human_review_status text NOT NULL DEFAULT 'pending',
  source_quote text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tariff_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tariff_product_id uuid NOT NULL REFERENCES tariff_products(id) ON DELETE CASCADE,
  component_key text NOT NULL,
  value_numeric numeric(12, 4) NOT NULL,
  unit text NOT NULL,
  raw_label text,
  source_quote text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tariff_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tariff_product_id uuid NOT NULL REFERENCES tariff_products(id) ON DELETE CASCADE,
  requirement_key text NOT NULL,
  requirement_value text NOT NULL,
  source_quote text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tariff_time_windows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tariff_product_id uuid NOT NULL REFERENCES tariff_products(id) ON DELETE CASCADE,
  quarter_key text NOT NULL,
  band_key text NOT NULL,
  starts_at text NOT NULL,
  ends_at text NOT NULL,
  days_rule text,
  source_quote text,
  created_at timestamptz NOT NULL DEFAULT now()
);
