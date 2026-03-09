CREATE TABLE IF NOT EXISTS tariff_metering_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id uuid NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
  source_catalog_id uuid REFERENCES source_catalog(id) ON DELETE SET NULL,
  valid_from date NOT NULL,
  valid_until date,
  component_key text NOT NULL,
  value_numeric numeric(12, 4) NOT NULL,
  unit text NOT NULL,
  source_quote text,
  created_at timestamptz NOT NULL DEFAULT now()
);
