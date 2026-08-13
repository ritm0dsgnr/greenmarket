import { z } from 'zod'

const databaseUrlSchema = z
  .url()
  .refine((value) => value.startsWith('postgresql://') || value.startsWith('postgres://'), {
    message: 'DATABASE_URL must use the PostgreSQL protocol.',
  })

const appBaseUrlSchema = z.url().refine((value) => {
  const url = new URL(value)

  return (
    url.protocol === 'https:' &&
    url.username === '' &&
    url.password === '' &&
    url.pathname === '/' &&
    url.search === '' &&
    url.hash === ''
  )
}, {
  message: 'APP_BASE_URL must be an HTTPS origin without a path, query, fragment, or credentials.',
})

const productionEnvironmentSchema = z.object({
  APP_BASE_URL: appBaseUrlSchema,
  DATABASE_URL: databaseUrlSchema,
})

export type ProductionEnvironment = z.infer<typeof productionEnvironmentSchema>

type EnvironmentVariables = Readonly<Record<string, string | undefined>>

export function validateProductionEnvironment(
  environment: EnvironmentVariables,
): ProductionEnvironment {
  const parsed = productionEnvironmentSchema.safeParse({
    APP_BASE_URL: environment.APP_BASE_URL,
    DATABASE_URL: environment.DATABASE_URL,
  })

  if (!parsed.success) {
    const fields = parsed.error.issues.map((issue) => issue.path.join('.')).join(', ')
    throw new Error(`Production configuration is invalid: ${fields}.`)
  }

  return parsed.data
}
