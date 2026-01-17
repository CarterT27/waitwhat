import { ConvexProvider } from 'convex/react'
import { ConvexQueryClient } from '@convex-dev/react-query'

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;

if (!CONVEX_URL) {
  throw new Error(
    'Missing VITE_CONVEX_URL environment variable. ' +
    'Please run "npx convex dev" in a separate terminal to set up Convex, ' +
    'or add VITE_CONVEX_URL to your .env.local file.'
  );
}

const convexQueryClient = new ConvexQueryClient(CONVEX_URL);

export default function AppConvexProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ConvexProvider client={convexQueryClient.convexClient}>
      {children}
    </ConvexProvider>
  )
}
