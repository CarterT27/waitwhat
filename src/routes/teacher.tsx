import {
  createFileRoute,
  useNavigate,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { Play, Loader2 } from "lucide-react";

export const Route = createFileRoute("/teacher")({ component: TeacherPage });

function TeacherPage() {
  const navigate = useNavigate();
  const createSession = useMutation(api.sessions.createSession);
  const [isCreating, setIsCreating] = useState(false);

  // Check if we're exactly at /teacher (no child route active)
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isIndex = pathname === "/teacher" || pathname === "/teacher/";

  const handleStartSession = async () => {
    setIsCreating(true);
    try {
      const result = await createSession();
      await navigate({
        to: "/teacher/session/$sessionId",
        params: { sessionId: String(result.sessionId) },
      });
    } catch (error) {
      console.error("Failed to create session:", error);
    } finally {
      setIsCreating(false);
    }
  };

  // If a child route is active, render it
  if (!isIndex) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-20 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-white mb-6">Teacher Console</h1>
        <p className="text-gray-400 mb-12">
          Start a new lecture session to engage with your students in real-time.
        </p>

        <button
          onClick={handleStartSession}
          disabled={isCreating}
          className="inline-flex items-center gap-3 px-8 py-4 bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/50 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-cyan-500/30 text-lg"
        >
          {isCreating ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Starting...
            </>
          ) : (
            <>
              <Play className="w-6 h-6" />
              Start Session
            </>
          )}
        </button>
      </div>
    </div>
  );
}
