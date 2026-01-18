import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";
import {
  Copy,
  Check,
  FileText,
  ClipboardList,
  AlertTriangle,
  StopCircle,
  Loader2,
} from "lucide-react";

export const Route = createFileRoute("/teacher/session/$sessionId")({
  component: TeacherSessionPage,
});

function TeacherSessionPage() {
  const { sessionId } = Route.useParams();
  const navigate = useNavigate();
  const session = useQuery(api.sessions.getSession, {
    sessionId: sessionId as Id<"sessions">,
  });
  const lostStats = useQuery(api.lostEvents.getLostSpikeStats, {
    sessionId: sessionId as Id<"sessions">,
  });
  const activeQuiz = useQuery(api.quizzes.getActiveQuiz, {
    sessionId: sessionId as Id<"sessions">,
  });

  const launchQuiz = useMutation(api.quizzes.launchQuiz);
  const closeQuiz = useMutation(api.quizzes.closeQuiz);
  const endSession = useMutation(api.sessions.endSession);

  const [copied, setCopied] = useState(false);
  const [isLaunchingQuiz, setIsLaunchingQuiz] = useState(false);

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (session.status === "ended") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Session Ended</h1>
          <p className="text-gray-400">This session has been closed.</p>
        </div>
      </div>
    );
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(session.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLaunchQuiz = async () => {
    setIsLaunchingQuiz(true);
    try {
      // TODO: Replace with LLM-generated questions based on transcript/slides context
      // This will be implemented via Convex HTTP actions calling OpenAPI-compatible LLM endpoints
      // See CLAUDE.md for planned AI integration approach
      const sampleQuestions = [
        {
          prompt: "What is the main topic being discussed?",
          choices: [
            "Introduction to the subject",
            "Advanced concepts",
            "Review of previous material",
            "Practical applications",
          ],
          correctIndex: 0,
          explanation: "The lecture started with an introduction to the subject matter.",
          conceptTag: "introduction",
        },
        {
          prompt: "Which concept was emphasized the most?",
          choices: [
            "Theoretical foundations",
            "Real-world examples",
            "Historical context",
            "Future implications",
          ],
          correctIndex: 1,
          explanation: "The instructor focused on real-world examples to illustrate key points.",
          conceptTag: "emphasis",
        },
      ];

      await launchQuiz({
        sessionId: sessionId as Id<"sessions">,
        questions: sampleQuestions,
      });
    } catch (error) {
      console.error("Failed to launch quiz:", error);
    }
    setIsLaunchingQuiz(false);
  };

  const handleCloseQuiz = async () => {
    await closeQuiz({ sessionId: sessionId as Id<"sessions"> });
  };

  const handleEndSession = async () => {
    if (confirm("Are you sure you want to end this session?")) {
      await endSession({ sessionId: sessionId as Id<"sessions"> });
      await navigate({ to: "/teacher" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-10 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header with Join Code */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Live Session
              </h1>
              <p className="text-gray-400">
                Share this code with your students
              </p>
            </div>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-3 px-6 py-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl hover:bg-cyan-500/20 transition-colors"
            >
              <span className="text-3xl font-mono font-bold text-cyan-400">
                {session.code}
              </span>
              {copied ? (
                <Check className="w-6 h-6 text-green-400" />
              ) : (
                <Copy className="w-6 h-6 text-cyan-400" />
              )}
            </button>
          </div>
        </div>

        {/* Control Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Upload Slides */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-blue-400" />
              <h2 className="text-lg font-semibold text-white">Slides</h2>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Upload slide content for AI context
            </p>
            <button className="w-full py-2 px-4 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors">
              Upload Slides
            </button>
          </div>

          {/* Quiz Control */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <ClipboardList className="w-6 h-6 text-green-400" />
              <h2 className="text-lg font-semibold text-white">Quiz</h2>
            </div>
            {activeQuiz ? (
              <>
                <p className="text-gray-400 text-sm mb-4">Quiz is active</p>
                <button
                  onClick={handleCloseQuiz}
                  className="w-full py-2 px-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                >
                  Close Quiz
                </button>
              </>
            ) : (
              <>
                <p className="text-gray-400 text-sm mb-4">
                  Launch a comprehension check
                </p>
                <button
                  onClick={handleLaunchQuiz}
                  disabled={isLaunchingQuiz}
                  className="w-full py-2 px-4 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors disabled:opacity-50"
                >
                  {isLaunchingQuiz ? "Launching..." : "Launch Quiz"}
                </button>
              </>
            )}
          </div>

          {/* Lost Signals */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
              <h2 className="text-lg font-semibold text-white">Lost Signals</h2>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Last 60s:</span>
                <span
                  className={`font-mono ${(lostStats?.last60sCount ?? 0) > 3 ? "text-red-400" : "text-white"}`}
                >
                  {lostStats?.last60sCount ?? 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Last 5m:</span>
                <span className="font-mono text-white">
                  {lostStats?.last5mCount ?? 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quiz Stats (when active) */}
        {activeQuiz && <QuizStatsPanel quizId={activeQuiz._id} />}

        {/* End Session */}
        <div className="flex justify-center mt-8">
          <button
            onClick={handleEndSession}
            className="flex items-center gap-2 px-6 py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors"
          >
            <StopCircle className="w-5 h-5" />
            End Session
          </button>
        </div>
      </div>
    </div>
  );
}

function QuizStatsPanel({ quizId }: { quizId: Id<"quizzes"> }) {
  const stats = useQuery(api.quizzes.getQuizStats, { quizId });

  if (!stats) return null;

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-white mb-4">
        Live Quiz Results ({stats.totalResponses} responses)
      </h2>
      <div className="space-y-4">
        {stats.questions.map((q: { prompt: string; choices: string[]; correctIndex: number; explanation: string; conceptTag: string }, i: number) => (
          <div key={i} className="border-b border-slate-700 pb-4 last:border-0">
            <p className="text-white mb-2">{q.prompt}</p>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">
                Accuracy:{" "}
                <span
                  className={`font-mono ${stats.perQuestionAccuracy[i] >= 0.7 ? "text-green-400" : stats.perQuestionAccuracy[i] >= 0.5 ? "text-yellow-400" : "text-red-400"}`}
                >
                  {Math.round(stats.perQuestionAccuracy[i] * 100)}%
                </span>
              </span>
              <div className="flex gap-2">
                {stats.choiceDistributions[i].map((count: number, j: number) => (
                  <span
                    key={j}
                    className={`text-xs px-2 py-1 rounded ${j === q.correctIndex ? "bg-green-500/20 text-green-400" : "bg-slate-700 text-gray-400"}`}
                  >
                    {String.fromCharCode(65 + j)}: {count}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
