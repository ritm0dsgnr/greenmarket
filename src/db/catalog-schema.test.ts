import { createHash, randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import pg from 'pg'

const databaseUrl =
  process.env.CATALOG_SCHEMA_TEST_DATABASE_URL ?? process.env.DATABASE_URL ?? ''

const describeSchema = databaseUrl ? describe : describe.skip

function sha256Hex(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

async function expectRejectsWithConstraint(
  client: pg.PoolClient,
  sql: string,
  params: unknown[],
  constraint: string,
) {
  try {
    await client.query(sql, params)
    expect.fail(`expected constraint ${constraint}`)
  } catch (error) {
    expect(error).toMatchObject({ code: '23514', constraint })
  }
}

async function expectRejectsUnique(
  client: pg.PoolClient,
  sql: string,
  params: unknown[],
) {
  try {
    await client.query(sql, params)
    expect.fail('expected unique violation')
  } catch (error) {
    expect(error).toMatchObject({ code: '23505' })
  }
}

describeSchema('catalog schema constraints', () => {
  const pool = new pg.Pool({ connectionString: databaseUrl })
  let categoryId = ''
  let productId = ''
  let offerId = ''

  beforeAll(async () => {
    const client = await pool.connect()
    try {
      const tables = await client.query<{ exists: boolean }>(
        `SELECT EXISTS (
           SELECT 1 FROM information_schema.tables
           WHERE table_schema = 'public' AND table_name = 'products'
         ) AS exists`,
      )
      if (!tables.rows[0]?.exists) {
        throw new Error(
          'Catalog tables missing. Run: docker compose -f docker-compose.dev.yml up -d && npm run db:up',
        )
      }

      categoryId = randomUUID()
      productId = randomUUID()
      offerId = randomUUID()

      await client.query('BEGIN')
      await client.query(
        `INSERT INTO categories (id, source_key, public_slug, name, status)
         VALUES ($1, $2, $3, $4, 'active')`,
        [categoryId, `test-cat-${categoryId}`, `test-cat-${categoryId.slice(0, 8)}`, 'Schema Test Category'],
      )
      await client.query(
        `INSERT INTO products (id, category_id, public_slug, name, status)
         VALUES ($1, $2, $3, $4, 'draft')`,
        [productId, categoryId, `test-product-${productId.slice(0, 8)}`, 'Schema Test Product'],
      )
      await client.query(
        `INSERT INTO product_offers (id, product_id, price_minor, availability_status)
         VALUES ($1, $2, 100, 'available')`,
        [offerId, productId],
      )
      await client.query('COMMIT')
    } catch (error) {
      await client.query('ROLLBACK')
      client.release()
      await pool.end()
      throw error
    }
    client.release()
  })

  afterAll(async () => {
    const client = await pool.connect()
    try {
      await client.query('DELETE FROM product_offers WHERE id = $1', [offerId])
      await client.query('DELETE FROM products WHERE id = $1', [productId])
      await client.query('DELETE FROM categories WHERE id = $1', [categoryId])
    } finally {
      client.release()
      await pool.end()
    }
  })

  it('rejects negative price_minor', async () => {
    const client = await pool.connect()
    try {
      await expectRejectsWithConstraint(
        client,
        `INSERT INTO product_offers (product_id, price_minor, availability_status)
         VALUES ($1, -1, 'available')`,
        [productId],
        'product_offers_price_nonnegative',
      )
    } finally {
      client.release()
    }
  })

  it('rejects invalid availability_status', async () => {
    const client = await pool.connect()
    try {
      await expectRejectsWithConstraint(
        client,
        `INSERT INTO product_offers (product_id, price_minor, availability_status)
         VALUES ($1, 10, 'in_stock')`,
        [productId],
        'product_offers_availability_allowed',
      )
    } finally {
      client.release()
    }
  })

  it('rejects invalid product slug', async () => {
    const client = await pool.connect()
    try {
      await expectRejectsWithConstraint(
        client,
        `INSERT INTO products (category_id, public_slug, name, status)
         VALUES ($1, 'Bad_Slug', 'X', 'draft')`,
        [categoryId],
        'products_public_slug_format',
      )
    } finally {
      client.release()
    }
  })

  it('allows only one cover image per product', async () => {
    const client = await pool.connect()
    const mediaA = randomUUID()
    const mediaB = randomUUID()
    try {
      await client.query('BEGIN')
      await client.query(
        `INSERT INTO media_files (
           id, storage_key, content_sha256, byte_size, mime_type, status, created_by_actor_ref
         ) VALUES
           ($1, $2, $3, 12, 'image/jpeg', 'ready', 'system:test'),
           ($4, $5, $6, 12, 'image/png', 'ready', 'system:test')`,
        [
          mediaA,
          `test/${mediaA}.jpg`,
          sha256Hex(mediaA),
          mediaB,
          `test/${mediaB}.png`,
          sha256Hex(mediaB),
        ],
      )
      await client.query(
        `INSERT INTO product_images (product_id, media_file_id, sort_order, is_cover)
         VALUES ($1, $2, 0, TRUE)`,
        [productId, mediaA],
      )
      await expectRejectsUnique(
        client,
        `INSERT INTO product_images (product_id, media_file_id, sort_order, is_cover)
         VALUES ($1, $2, 1, TRUE)`,
        [productId, mediaB],
      )
      await client.query('ROLLBACK')
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  })

  it('allows only one confirmed mapping per fingerprint', async () => {
    const client = await pool.connect()
    const fingerprint = `fp-${randomUUID()}`
    const jobId = randomUUID()
    try {
      await client.query('BEGIN')
      await client.query(
        `INSERT INTO catalog_import_jobs (
           id, adapter_key, adapter_version, status, file_checksum_sha256,
           original_filename_safe, stored_object_key, created_by_actor_ref
         ) VALUES (
           $1, 'greenmarket-price-v1', '1', 'uploaded', $2,
           'fixture.xlsx', $3, 'system:test'
         )`,
        [jobId, sha256Hex(jobId), `imports/${jobId}`],
      )
      await client.query(
        `INSERT INTO catalog_source_mappings (
           source, source_schema_version, product_id, offer_id,
           source_fingerprint, source_sheet_name, source_row_number,
           mapping_status, first_confirmed_at, last_seen_import_job_id
         ) VALUES (
           'excel_greenmarket_price_v1', 'v1', $1, $2,
           $3, 'Fixture', 10, 'confirmed', NOW(), $4
         )`,
        [productId, offerId, fingerprint, jobId],
      )
      await expectRejectsUnique(
        client,
        `INSERT INTO catalog_source_mappings (
           source, source_schema_version, product_id, offer_id,
           source_fingerprint, source_sheet_name, source_row_number,
           mapping_status, first_confirmed_at, last_seen_import_job_id
         ) VALUES (
           'excel_greenmarket_price_v1', 'v1', $1, $2,
           $3, 'Fixture', 11, 'confirmed', NOW(), $4
         )`,
        [productId, offerId, fingerprint, jobId],
      )
      await client.query('ROLLBACK')
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  })

  it('rejects svg media mime types', async () => {
    const client = await pool.connect()
    try {
      await expectRejectsWithConstraint(
        client,
        `INSERT INTO media_files (
           storage_key, content_sha256, byte_size, mime_type, created_by_actor_ref
         ) VALUES ($1, $2, 10, 'image/svg+xml', 'system:test')`,
        [`test/${randomUUID()}.svg`, sha256Hex('svg')],
        'media_files_mime_allowed',
      )
    } finally {
      client.release()
    }
  })

  it('rejects path separators in import original filename', async () => {
    const client = await pool.connect()
    try {
      await expectRejectsWithConstraint(
        client,
        `INSERT INTO catalog_import_jobs (
           adapter_key, adapter_version, status, file_checksum_sha256,
           original_filename_safe, stored_object_key, created_by_actor_ref
         ) VALUES (
           'greenmarket-price-v1', '1', 'uploaded', $1,
           '../evil.xlsx', $2, 'system:test'
         )`,
        [sha256Hex('path'), `imports/${randomUUID()}`],
        'catalog_import_jobs_filename_safe',
      )
    } finally {
      client.release()
    }
  })
})
