import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import { fileURLToPath, URL } from 'url'

import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

export default defineConfig(async ({ mode }) => {
  const isTest = mode === 'test'
  const isDev = mode === 'development'
  const isProduction = mode === 'production'

  // Fail build early if required env vars are missing in production
  if (isProduction && !process.env.VITE_CONVEX_URL) {
    throw new Error(
      'VITE_CONVEX_URL environment variable is required for production builds. ' +
      'Set it in your Cloudflare Pages environment variables.'
    )
  }

  // Use cloudflare_pages for deployment to Cloudflare Pages
  const nitroPreset = process.env.NITRO_PRESET || 'cloudflare_pages'

  // Only load devtools in development (it's a devDependency)
  const devtoolsPlugin = isDev
    ? [(await import('@tanstack/devtools-vite')).devtools()]
    : []

  return {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['**/*.test.{ts,tsx}'],
      pool: 'forks',
      teardownTimeout: 1000,
    },
    plugins: isTest
      ? [
          viteTsConfigPaths({
            projects: ['./tsconfig.json'],
          }),
          viteReact(),
        ]
      : [
          ...devtoolsPlugin,
          nitro({
            preset: nitroPreset,
            cloudflare: {
              deployConfig: false,
              nodeCompat: true,
            },
          }),
          viteTsConfigPaths({
            projects: ['./tsconfig.json'],
          }),
          tailwindcss(),
          tanstackStart(),
          viteReact(),
        ],
  }
})
