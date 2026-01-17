import { ConvexProvider } from 'convex/react'
import { ConvexQueryClient } from '@convex-dev/react-query'
import { useMemo } from 'react'

const CONVEX_URL = (import.meta as any).env.VITE_CONVEX_URL;

function ConvexSetupError() {
  return (
    <div style={{
      fontFamily: 'system-ui, sans-serif',
      padding: '2rem',
      maxWidth: '600px',
      margin: '4rem auto',
      background: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '8px',
    }}>
      <h1 style={{ color: '#dc2626', marginTop: 0 }}>Convex Not Configured</h1>
      <p style={{ color: '#7f1d1d' }}>
        Missing <code style={{ background: '#fee2e2', padding: '2px 6px', borderRadius: '4px' }}>VITE_CONVEX_URL</code> environment variable.
      </p>
      <h2 style={{ color: '#991b1b', fontSize: '1.1rem' }}>To fix this:</h2>
      <ol style={{ color: '#7f1d1d', lineHeight: '1.8' }}>
        <li>Open a new terminal</li>
        <li>Run <code style={{ background: '#fee2e2', padding: '2px 6px', borderRadius: '4px' }}>bun run dev:convex</code></li>
        <li>Follow the prompts to log in and create a project</li>
        <li>Refresh this page</li>
      </ol>
    </div>
  )
}

export default function AppConvexProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const convexQueryClient = useMemo(() => {
    if (!CONVEX_URL) return null;
    return new ConvexQueryClient(CONVEX_URL);
  }, []);

  if (!convexQueryClient) {
    return <ConvexSetupError />;
  }

  return (
    <ConvexProvider client={convexQueryClient.convexClient}>
      {children}
    </ConvexProvider>
  )
}
