ALTER TABLE operators
ADD COLUMN IF NOT EXISTS region_label text;

ALTER TABLE operators
ADD COLUMN IF NOT EXISTS website_url text;

ALTER TABLE tariff_versions
ADD COLUMN IF NOT EXISTS band_key text;
