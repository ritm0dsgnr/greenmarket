import type { NextConfig } from 'next'
import { PHASE_PRODUCTION_SERVER } from 'next/constants'
import { validateProductionEnvironment } from './src/config/production-environment'

const securityHeaders = [
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), geolocation=(), microphone=(), payment=(), usb=()',
  },
]

const nextConfig = (phase: string): NextConfig => {
  if (phase === PHASE_PRODUCTION_SERVER) {
    validateProductionEnvironment(process.env)
  }

  return {
    poweredByHeader: false,
    reactStrictMode: true,
    async headers() {
      return [
        {
          source: '/:path*',
          headers: securityHeaders,
        },
      ]
    },
  }
}

export default nextConfig
