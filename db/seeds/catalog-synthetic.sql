-- Synthetic catalogue seed for local/dev only.
-- No real prices, customer data, or production product names.
-- Apply after: npm run db:up

BEGIN;

INSERT INTO categories (id, source_key, public_slug, name, sort_order, status)
VALUES
  ('11111111-1111-4111-8111-111111111101', 'fixture-fruit', 'fixture-fruit', 'Fixture Fruit', 10, 'active'),
  ('11111111-1111-4111-8111-111111111102', 'fixture-conifer', 'fixture-conifer', 'Fixture Conifer', 20, 'active');

INSERT INTO products (
  id, category_id, public_slug, name, latin_name,
  description, description_owner, status
) VALUES
  (
    '22222222-2222-4222-8222-222222222201',
    '11111111-1111-4111-8111-111111111101',
    'fixture-apple-demo',
    'Fixture Apple Demo',
    'Malus domestica cv. Demo',
    'Synthetic description for layout checks.',
    'editor',
    'published'
  ),
  (
    '22222222-2222-4222-8222-222222222202',
    '11111111-1111-4111-8111-111111111102',
    'fixture-spruce-draft',
    'Fixture Spruce Draft',
    NULL,
    NULL,
    'none',
    'draft'
  );

INSERT INTO product_offers (
  id, product_id, container_label, size_label, price_minor,
  availability_status, availability_note, active
) VALUES
  (
    '33333333-3333-4333-8333-333333333301',
    '22222222-2222-4222-8222-222222222201',
    'C5',
    '40-60 см',
    19900,
    'available',
    NULL,
    TRUE
  ),
  (
    '33333333-3333-4333-8333-333333333302',
    '22222222-2222-4222-8222-222222222201',
    'C10',
    '80-100 см',
    45900,
    'expected',
    'с мая (fixture)',
    TRUE
  ),
  (
    '33333333-3333-4333-8333-333333333303',
    '22222222-2222-4222-8222-222222222202',
    'P9',
    NULL,
    0,
    'unknown',
    NULL,
    FALSE
  );

INSERT INTO catalog_change_audit (
  entity_type, entity_id, action, actor_ref, safe_payload
) VALUES
  (
    'product',
    '22222222-2222-4222-8222-222222222201',
    'seed_insert',
    'system:synthetic-seed',
    '{"seed":"catalog-synthetic"}'::jsonb
  );

COMMIT;
