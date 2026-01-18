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
    <div className="min-h-screen bg-lavender-bg py-20 px-6 flex items-center justify-center">
      <div className="max-w-xl w-full mx-auto bg-white p-12 rounded-[2.5rem] shadow-comic border-2 border-ink text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-4 bg-coral border-b-2 border-ink" />

        <div className="inline-flex items-center justify-center w-20 h-20 bg-soft-purple rounded-2xl border-2 border-ink shadow-comic-sm mb-6 rotate-3">
          <Play className="w-10 h-10 text-white fill-current" />
        </div>

        <h1 className="text-4xl font-black text-ink mb-6">Teacher Console</h1>
        <p className="text-slate-500 font-bold text-lg mb-12 leading-relaxed">
          Start a new lecture session to engage with your students in real-time.
        </p>

        <button
          onClick={handleStartSession}
          disabled={isCreating}
          className="w-full inline-flex items-center justify-center gap-3 px-8 py-5 bg-coral hover:bg-coral-dark disabled:opacity-50 text-white font-black rounded-2xl transition-all shadow-comic hover:translate-y-[-2px] hover:shadow-comic-hover active:translate-y-0 active:shadow-comic text-xl border-2 border-ink"
        >
          {isCreating ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Starting Class...
            </>
          ) : (
            <>
              <Play className="w-6 h-6 fill-current" />
              Start Session
            </>
          )}
        </button>
      </div>
    </div>
  );
}
