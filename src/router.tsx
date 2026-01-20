import { createRouter } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'

import { routeTree } from './routeTree.gen'

const isServer = typeof window === 'undefined'

// Store for client-side Convex setup (initialized lazily)
let convexClientPromise: Promise<{
  convexQueryClient: any
  ConvexProvider: any
}> | null = null

async function getConvexClient(url: string) {
  if (convexClientPromise) return convexClientPromise

  convexClientPromise = (async () => {
    const [{ ConvexQueryClient }, { ConvexProvider }] = await Promise.all([
      import('@convex-dev/react-query'),
      import('convex/react'),
    ])
    const convexQueryClient = new ConvexQueryClient(url)
    return { convexQueryClient, ConvexProvider }
  })()

  return convexClientPromise
}

export function getRouter() {
  const CONVEX_URL = import.meta.env.VITE_CONVEX_URL

  if (!CONVEX_URL) {
    throw new Error(
      'Missing VITE_CONVEX_URL environment variable. ' +
        'Please run "npx convex dev" in a separate terminal to set up Convex, ' +
        'or add VITE_CONVEX_URL to your .env.local file.'
    )
  }

  const queryClient = new QueryClient()

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // On server, just render children without ConvexProvider
    // On client, we'll set up Convex after hydration
    Wrap: ({ children }) => <>{children}</>,
  })

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  })

  // Set up Convex on client side only, after router is created
  if (!isServer) {
    getConvexClient(CONVEX_URL).then(({ convexQueryClient, ConvexProvider }) => {
      // Configure QueryClient with Convex
      queryClient.setDefaultOptions({
        queries: {
          queryKeyHashFn: convexQueryClient.hashFn(),
          queryFn: convexQueryClient.queryFn(),
        },
      })
      convexQueryClient.connect(queryClient)

      // Update router's Wrap to include ConvexProvider
      router.options.Wrap = ({ children }) => (
        <ConvexProvider client={convexQueryClient.convexClient}>
          {children}
        </ConvexProvider>
      )

      // Force re-render to apply the provider
      router.invalidate()
    })
  }

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
