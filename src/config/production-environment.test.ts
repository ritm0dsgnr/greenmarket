import { describe, expect, it } from 'vitest'
import { validateProductionEnvironment } from './production-environment'

describe('validateProductionEnvironment', () => {
  it('accepts an HTTPS application URL and PostgreSQL database URL', () => {
    expect(
      validateProductionEnvironment({
        APP_BASE_URL: 'https://greenmarket.example',
        DATABASE_URL: 'postgresql://app:password@database.example:5432/greenmarket',
      }),
    ).toEqual({
      APP_BASE_URL: 'https://greenmarket.example',
      DATABASE_URL: 'postgresql://app:password@database.example:5432/greenmarket',
    })
  })

  it('rejects an insecure public application URL', () => {
    expect(() =>
      validateProductionEnvironment({
        APP_BASE_URL: 'http://greenmarket.example',
        DATABASE_URL: 'postgresql://app:password@database.example:5432/greenmarket',
      }),
    ).toThrow('Production configuration is invalid: APP_BASE_URL.')
  })

  it('rejects a public application URL with a path', () => {
    expect(() =>
      validateProductionEnvironment({
        APP_BASE_URL: 'https://greenmarket.example/catalog',
        DATABASE_URL: 'postgresql://app:password@database.example:5432/greenmarket',
      }),
    ).toThrow('Production configuration is invalid: APP_BASE_URL.')
  })

  it('rejects a non-PostgreSQL database URL', () => {
    expect(() =>
      validateProductionEnvironment({
        APP_BASE_URL: 'https://greenmarket.example',
        DATABASE_URL: 'mysql://app:password@database.example:3306/greenmarket',
      }),
    ).toThrow('Production configuration is invalid: DATABASE_URL.')
  })
})
