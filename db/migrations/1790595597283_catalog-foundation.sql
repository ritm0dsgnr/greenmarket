-- Up Migration

CREATE OR REPLACE FUNCTION catalog_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES categories (id),
  source_key TEXT NOT NULL,
  public_slug TEXT NOT NULL,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT categories_source_key_nonempty CHECK (char_length(btrim(source_key)) > 0),
  CONSTRAINT categories_public_slug_format CHECK (public_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CONSTRAINT categories_name_nonempty CHECK (char_length(btrim(name)) > 0),
  CONSTRAINT categories_status_allowed CHECK (status IN ('active', 'archived')),
  CONSTRAINT categories_source_key_unique UNIQUE (source_key),
  CONSTRAINT categories_public_slug_unique UNIQUE (public_slug)
);

CREATE INDEX categories_parent_id_idx ON categories (parent_id);
CREATE INDEX categories_status_sort_idx ON categories (status, sort_order);

CREATE TRIGGER categories_set_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION catalog_set_updated_at();

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories (id),
  public_slug TEXT NOT NULL,
  name TEXT NOT NULL,
  latin_name TEXT,
  description TEXT,
  description_owner TEXT NOT NULL DEFAULT 'none',
  description_import_draft TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT products_public_slug_format CHECK (public_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CONSTRAINT products_name_nonempty CHECK (char_length(btrim(name)) > 0),
  CONSTRAINT products_description_owner_allowed CHECK (
    description_owner IN ('none', 'editor', 'import')
  ),
  CONSTRAINT products_status_allowed CHECK (status IN ('draft', 'published', 'archived')),
  CONSTRAINT products_public_slug_unique UNIQUE (public_slug)
);

CREATE INDEX products_category_status_idx ON products (category_id, status);

CREATE TRIGGER products_set_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION catalog_set_updated_at();

CREATE TABLE product_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products (id),
  container_label TEXT,
  size_label TEXT,
  price_minor BIGINT NOT NULL,
  availability_status TEXT NOT NULL DEFAULT 'unknown',
  availability_note TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT product_offers_price_nonnegative CHECK (price_minor >= 0),
  CONSTRAINT product_offers_availability_allowed CHECK (
    availability_status IN ('unknown', 'available', 'unavailable', 'expected')
  )
);

CREATE INDEX product_offers_product_active_idx
  ON product_offers (product_id)
  WHERE active;

CREATE TRIGGER product_offers_set_updated_at
BEFORE UPDATE ON product_offers
FOR EACH ROW
EXECUTE FUNCTION catalog_set_updated_at();

CREATE TABLE catalog_import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adapter_key TEXT NOT NULL,
  adapter_version TEXT NOT NULL,
  status TEXT NOT NULL,
  file_checksum_sha256 TEXT NOT NULL,
  original_filename_safe TEXT NOT NULL,
  stored_object_key TEXT NOT NULL,
  summary_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by_actor_ref TEXT NOT NULL,
  confirmed_revision TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT catalog_import_jobs_adapter_key_nonempty CHECK (char_length(btrim(adapter_key)) > 0),
  CONSTRAINT catalog_import_jobs_adapter_version_nonempty CHECK (char_length(btrim(adapter_version)) > 0),
  CONSTRAINT catalog_import_jobs_status_allowed CHECK (
    status IN (
      'uploaded',
      'parsed',
      'validated',
      'preview_ready',
      'confirmed',
      'applying',
      'applied',
      'rejected',
      'failed'
    )
  ),
  CONSTRAINT catalog_import_jobs_checksum_sha256 CHECK (file_checksum_sha256 ~ '^[a-f0-9]{64}$'),
  CONSTRAINT catalog_import_jobs_filename_safe CHECK (
    char_length(btrim(original_filename_safe)) > 0
    AND original_filename_safe !~ '[\\/]'
  ),
  CONSTRAINT catalog_import_jobs_stored_key_nonempty CHECK (char_length(btrim(stored_object_key)) > 0),
  CONSTRAINT catalog_import_jobs_actor_nonempty CHECK (char_length(btrim(created_by_actor_ref)) > 0),
  CONSTRAINT catalog_import_jobs_stored_object_key_unique UNIQUE (stored_object_key)
);

CREATE INDEX catalog_import_jobs_status_created_idx
  ON catalog_import_jobs (status, created_at DESC);

CREATE TRIGGER catalog_import_jobs_set_updated_at
BEFORE UPDATE ON catalog_import_jobs
FOR EACH ROW
EXECUTE FUNCTION catalog_set_updated_at();

CREATE TABLE catalog_source_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  source_schema_version TEXT NOT NULL,
  product_id UUID NOT NULL REFERENCES products (id),
  offer_id UUID NOT NULL REFERENCES product_offers (id),
  source_fingerprint TEXT NOT NULL,
  source_sheet_name TEXT NOT NULL,
  source_row_number INTEGER NOT NULL,
  mapping_status TEXT NOT NULL,
  first_confirmed_at TIMESTAMPTZ,
  last_seen_import_job_id UUID REFERENCES catalog_import_jobs (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT catalog_source_mappings_source_nonempty CHECK (char_length(btrim(source)) > 0),
  CONSTRAINT catalog_source_mappings_schema_nonempty CHECK (char_length(btrim(source_schema_version)) > 0),
  CONSTRAINT catalog_source_mappings_fingerprint_nonempty CHECK (char_length(btrim(source_fingerprint)) > 0),
  CONSTRAINT catalog_source_mappings_sheet_nonempty CHECK (char_length(btrim(source_sheet_name)) > 0),
  CONSTRAINT catalog_source_mappings_row_positive CHECK (source_row_number > 0),
  CONSTRAINT catalog_source_mappings_status_allowed CHECK (
    mapping_status IN ('provisional', 'confirmed', 'conflict', 'retired')
  ),
  CONSTRAINT catalog_source_mappings_confirmed_at_consistent CHECK (
    (mapping_status = 'confirmed' AND first_confirmed_at IS NOT NULL)
    OR (mapping_status <> 'confirmed')
  )
);

CREATE UNIQUE INDEX catalog_source_mappings_confirmed_fingerprint_uidx
  ON catalog_source_mappings (source, source_schema_version, source_fingerprint)
  WHERE mapping_status = 'confirmed';

CREATE INDEX catalog_source_mappings_product_offer_idx
  ON catalog_source_mappings (product_id, offer_id);

CREATE INDEX catalog_source_mappings_last_seen_job_idx
  ON catalog_source_mappings (last_seen_import_job_id);

CREATE TRIGGER catalog_source_mappings_set_updated_at
BEFORE UPDATE ON catalog_source_mappings
FOR EACH ROW
EXECUTE FUNCTION catalog_set_updated_at();

CREATE TABLE catalog_import_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_job_id UUID NOT NULL REFERENCES catalog_import_jobs (id) ON DELETE CASCADE,
  sheet_name TEXT NOT NULL,
  row_number INTEGER NOT NULL,
  decision TEXT NOT NULL,
  validation_status TEXT NOT NULL,
  fingerprint TEXT,
  raw_cells_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  safe_error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT catalog_import_rows_sheet_nonempty CHECK (char_length(btrim(sheet_name)) > 0),
  CONSTRAINT catalog_import_rows_row_positive CHECK (row_number > 0),
  CONSTRAINT catalog_import_rows_decision_allowed CHECK (
    decision IN ('add', 'update', 'unchanged', 'manual_review', 'skipped', 'error')
  ),
  CONSTRAINT catalog_import_rows_validation_allowed CHECK (
    validation_status IN ('ok', 'error', 'skipped')
  ),
  CONSTRAINT catalog_import_rows_job_sheet_row_unique UNIQUE (import_job_id, sheet_name, row_number)
);

CREATE INDEX catalog_import_rows_job_decision_idx
  ON catalog_import_rows (import_job_id, decision);

CREATE TABLE media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_key TEXT NOT NULL,
  content_sha256 TEXT NOT NULL,
  byte_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  width_px INTEGER,
  height_px INTEGER,
  status TEXT NOT NULL DEFAULT 'pending_scan',
  created_by_actor_ref TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT media_files_storage_key_nonempty CHECK (char_length(btrim(storage_key)) > 0),
  CONSTRAINT media_files_checksum_sha256 CHECK (content_sha256 ~ '^[a-f0-9]{64}$'),
  CONSTRAINT media_files_byte_size_positive CHECK (byte_size > 0),
  CONSTRAINT media_files_mime_allowed CHECK (
    mime_type IN ('image/jpeg', 'image/png', 'image/webp')
  ),
  CONSTRAINT media_files_width_positive CHECK (width_px IS NULL OR width_px > 0),
  CONSTRAINT media_files_height_positive CHECK (height_px IS NULL OR height_px > 0),
  CONSTRAINT media_files_status_allowed CHECK (
    status IN ('pending_scan', 'ready', 'rejected', 'deleted')
  ),
  CONSTRAINT media_files_actor_nonempty CHECK (char_length(btrim(created_by_actor_ref)) > 0),
  CONSTRAINT media_files_storage_key_unique UNIQUE (storage_key)
);

CREATE TRIGGER media_files_set_updated_at
BEFORE UPDATE ON media_files
FOR EACH ROW
EXECUTE FUNCTION catalog_set_updated_at();

CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  media_file_id UUID NOT NULL REFERENCES media_files (id),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_cover BOOLEAN NOT NULL DEFAULT FALSE,
  alt_text TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT product_images_sort_order_nonnegative CHECK (sort_order >= 0),
  CONSTRAINT product_images_product_media_unique UNIQUE (product_id, media_file_id),
  CONSTRAINT product_images_product_sort_unique UNIQUE (product_id, sort_order)
);

CREATE UNIQUE INDEX product_images_one_cover_per_product_uidx
  ON product_images (product_id)
  WHERE is_cover;

CREATE INDEX product_images_product_sort_idx
  ON product_images (product_id, sort_order);

CREATE TRIGGER product_images_set_updated_at
BEFORE UPDATE ON product_images
FOR EACH ROW
EXECUTE FUNCTION catalog_set_updated_at();

CREATE TABLE catalog_change_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  actor_ref TEXT NOT NULL,
  import_job_id UUID REFERENCES catalog_import_jobs (id),
  safe_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT catalog_change_audit_entity_type_nonempty CHECK (char_length(btrim(entity_type)) > 0),
  CONSTRAINT catalog_change_audit_action_nonempty CHECK (char_length(btrim(action)) > 0),
  CONSTRAINT catalog_change_audit_actor_nonempty CHECK (char_length(btrim(actor_ref)) > 0)
);

CREATE INDEX catalog_change_audit_entity_created_idx
  ON catalog_change_audit (entity_type, entity_id, created_at DESC);

CREATE INDEX catalog_change_audit_import_job_idx
  ON catalog_change_audit (import_job_id)
  WHERE import_job_id IS NOT NULL;

-- Down Migration

DROP TABLE IF EXISTS catalog_change_audit;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS media_files;
DROP TABLE IF EXISTS catalog_import_rows;
DROP TABLE IF EXISTS catalog_source_mappings;
DROP TABLE IF EXISTS catalog_import_jobs;
DROP TABLE IF EXISTS product_offers;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP FUNCTION IF EXISTS catalog_set_updated_at();
