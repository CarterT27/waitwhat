import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

export const Route = createFileRoute("/join")({ component: JoinPage });

function JoinPage() {
  const navigate = useNavigate();
  const joinSession = useMutation(api.sessions.joinSession);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("Please enter a join code");
      return;
    }

    setIsJoining(true);
    setError("");

    try {
      const result = await joinSession({ code: code.trim().toLowerCase() });
      // Store studentId in sessionStorage
      sessionStorage.setItem(`studentId-${result.sessionId}`, result.studentId);
      navigate({
        to: "/session/$sessionId",
        params: { sessionId: result.sessionId },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join session");
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-20 px-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-6">
          Join Session
        </h1>
        <p className="text-gray-400 text-center mb-12">
          Enter the code from your teacher to join the lecture.
        </p>

        <form onSubmit={handleJoin} className="space-y-6">
          <div>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter join code (e.g., blue-tiger-42)"
              className="w-full px-4 py-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-center text-xl font-mono"
            />
            {error && (
              <p className="mt-2 text-red-400 text-sm text-center">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isJoining}
            className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-500/30 text-lg"
          >
            {isJoining ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Joining...
              </>
            ) : (
              <>
                Join
                <ArrowRight className="w-6 h-6" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
