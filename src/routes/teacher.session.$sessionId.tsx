import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";
import {
  Copy,
  Check,
  Zap,
  HelpCircle,
  X,
  Play,
  Loader2,
  StopCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-ink border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (session.status === "ended") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-milk border-2 border-ink rounded-3xl p-12 shadow-comic text-center max-w-lg w-full">
          <div className="w-20 h-20 bg-soft-purple rounded-full border-2 border-ink flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black mb-4">Class Dismissed!</h1>
          <p className="text-lg font-medium text-slate-500 mb-8">Great session today.</p>
          <button
            onClick={() => navigate({ to: "/teacher" })}
            className="btn-primary w-full"
          >
            Back to Dashboard
          </button>
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
      const sampleQuestions = [
        {
          prompt: "What is the powerhouse of the cell?",
          choices: ["Nucleus", "Mitochondria", "Ribosome", "Golgi Body"],
          correctIndex: 1,
          explanation: "Mitochondria generate most of the chemical energy needed to power the cell.",
          conceptTag: "biology",
        },
        {
          prompt: "Which organelle is unique to plant cells?",
          choices: ["Mitochondria", "Chloroplast", "Nucleus", "Cell Membrane"],
          correctIndex: 1,
          explanation: "Chloroplasts conduct photosynthesis and are found in plant cells.",
          conceptTag: "bioscience"
        }
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

  const handleEndSession = async () => {
    if (confirm("End this session?")) {
      await endSession({ sessionId: sessionId as Id<"sessions"> });
      await navigate({ to: "/teacher" });
    }
  };

  return (
    <div className="min-h-screen p-6 pb-20">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Helper Header */}
        <div className="flex justify-start pb-2">
          <button onClick={handleEndSession} className="flex items-center gap-2">
            <div className="bg-ink text-white px-3 py-1 rounded-lg border-2 border-transparent hover:border-coral hover:text-coral hover:bg-white transition-all transform -rotate-2">
              <span className="text-xl font-black tracking-tight">Wait</span>
            </div>
            <span className="text-xl font-black text-ink tracking-tight transform rotate-1">What</span>
          </button>
        </div>

        {/* Top Navbar Card */}
        <div className="bg-milk border-2 border-ink rounded-2xl p-4 md:p-6 shadow-comic flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-coral text-white px-4 py-1 rounded-full border-2 border-ink font-bold transform -rotate-1 shadow-comic-sm">
              LIVE
            </div>
            <h1 className="text-2xl font-black">Biology 101</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block font-bold text-slate-500 mr-2">Join Code:</div>
            <div className="bg-mustard/20 px-4 py-2 rounded-xl border-2 border-ink border-dashed font-mono font-bold text-xl tracking-widest">
              {session.code}
            </div>
            <button
              onClick={handleCopyCode}
              className="w-12 h-12 flex items-center justify-center bg-white border-2 border-ink rounded-xl shadow-comic-sm btn-press"
            >
              {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* Left: Confusion Meter */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-milk border-2 border-ink rounded-[2rem] p-6 shadow-comic flex flex-col items-center text-center relative overflow-hidden h-full">
              <div className="absolute top-0 inset-x-0 h-4 bg-soft-purple border-b-2 border-ink" />

              <h2 className="text-xl font-black mt-2 mb-1">Room Vibe</h2>
              <p className="text-slate-500 font-bold text-sm uppercase tracking-wide opacity-70">Confusion Level</p>

              <div className="flex-1 flex flex-col items-center justify-center relative w-full py-2">
                {/* Background Circles */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-48 h-48 bg-mustard rounded-full blur-3xl"
                  />
                </div>

                <motion.div
                  animate={{
                    scale: 1 + (lostStats?.last60sCount || 0) * 0.1,
                    rotate: (lostStats?.last60sCount || 0) * 5
                  }}
                  className={clsx(
                    "w-32 h-32 border-4 border-ink rounded-full flex items-center justify-center relative z-10 transition-colors duration-500 shadow-comic",
                    (lostStats?.last60sCount || 0) > 3 ? "bg-coral" : (lostStats?.last60sCount || 0) > 0 ? "bg-mustard" : "bg-white"
                  )}
                >
                  {/* Face Expression */}
                  {(lostStats?.last60sCount || 0) > 3 ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-4"><div className="w-3 h-3 rounded-full bg-ink" /><div className="w-3 h-3 rounded-full bg-ink" /></div>
                      <div className="w-8 h-3 bg-ink rounded-full" />
                    </div>
                  ) : (lostStats?.last60sCount || 0) > 0 ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-3"><div className="w-3 h-3 rounded-full bg-ink" /><div className="w-3 h-3 rounded-full bg-ink" /></div>
                      <div className="w-6 h-1 bg-ink" />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex gap-4"><div className="w-3 h-6 bg-ink rounded-full" /><div className="w-3 h-6 bg-ink rounded-full" /></div>
                      <div className="w-8 h-4 border-b-4 border-ink rounded-b-full" />
                    </div>
                  )}
                </motion.div>

                <div className="mt-4 flex gap-2 items-end">
                  <span className="text-4xl font-black tabular-nums leading-none">
                    {lostStats?.last60sCount ?? 0}
                  </span>
                  <span className="font-bold text-slate-500 mb-1">confused</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right: Actions */}
          <div className="lg:col-span-8 flex flex-col gap-4">

            {/* Quiz Control Card */}
            <div className="bg-mustard border-2 border-ink rounded-[2rem] p-8 shadow-comic relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 opacity-20 transform rotate-12">
                <HelpCircle className="w-64 h-64" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-black">Pop Quiz</h2>
                  <div className="bg-white px-3 py-1 rounded-lg border-2 border-ink font-bold text-sm shadow-comic-sm">
                    {activeQuiz ? "ACTIVE NOW" : "READY"}
                  </div>
                </div>

                {activeQuiz ? (
                  <div className="bg-white border-2 border-ink rounded-2xl p-6 shadow-comic-sm">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-lg">Live Results</h3>
                      <button
                        onClick={() => closeQuiz({ sessionId: sessionId as Id<"sessions"> })}
                        className="px-4 py-2 bg-ink text-white rounded-lg font-bold hover:bg-slate-800"
                      >
                        Close Quiz
                      </button>
                    </div>
                    <QuizStatsPanel quizId={activeQuiz._id} />
                  </div>
                ) : (
                  <div className="flex flex-col items-start gap-6">
                    <p className="font-medium text-ink/80 text-lg max-w-md">
                      Generate a quick 2-question quiz based on the last 5 minutes of transcript.
                    </p>
                    <button
                      onClick={handleLaunchQuiz}
                      disabled={isLaunchingQuiz}
                      className="bg-white text-ink w-full md:w-auto px-8 py-4 rounded-xl border-2 border-ink font-black text-xl shadow-comic flex items-center gap-3 disabled:opacity-50 disabled:shadow-none disabled:translate-y-0 btn-press"
                    >
                      {isLaunchingQuiz ? <Loader2 className="animate-spin" /> : <Play className="fill-current" />}
                      Launch Quiz
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Tools Grid (Future) */}
            {/* Tools Grid (Future) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border-2 border-ink rounded-2xl p-4 shadow-comic hover:shadow-none hover:translate-y-1 hover:translate-x-1 transition-all cursor-pointer group flex items-center gap-4">
                <div className="w-12 h-12 bg-soft-purple border-2 border-ink rounded-xl flex items-center justify-center group-hover:-rotate-6 transition-transform shrink-0">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-lg leading-tight">Polls</h3>
                  <p className="text-slate-500 text-sm">Coming Soon</p>
                </div>
              </div>
              <button
                onClick={handleEndSession}
                className="bg-white border-2 border-ink rounded-2xl p-4 shadow-comic hover:shadow-none hover:translate-y-1 hover:translate-x-1 transition-all cursor-pointer group flex items-center gap-4 w-full"
              >
                <div className="w-12 h-12 bg-white border-2 border-ink rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform shadow-sm shrink-0">
                  <StopCircle className="w-6 h-6 text-red-500" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-lg text-red-600 leading-tight">End Class</h3>
                  <p className="text-red-400/80 text-sm font-medium">Close session</p>
                </div>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div >
  );
}

function QuizStatsPanel({ quizId }: { quizId: Id<"quizzes"> }) {
  const stats = useQuery(api.quizzes.getQuizStats, { quizId });

  if (!stats) return <div className="text-center py-8 font-bold text-slate-400 animate-pulse">Waiting for responses...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="text-5xl font-black">{stats.totalResponses}</div>
        <div className="text-sm font-bold text-slate-500 leading-tight">Student<br />Responses</div>
      </div>

      <div className="space-y-8 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
        {stats.questions.map((q: any, i: number) => (
          <div key={i} className="pb-2">
            <p className="font-bold mb-4 text-lg">{i + 1}. {q.prompt}</p>
            <div className="flex gap-3 w-full">
              {stats.choiceDistributions[i].map((count: number, j: number) => {
                const isCorrect = j === q.correctIndex;
                const percent = stats.totalResponses > 0 ? Math.round((count / stats.totalResponses) * 100) : 0;

                return (
                  <div
                    key={j}
                    className={clsx(
                      "flex-1 min-w-0 relative h-16 rounded-xl border-2 overflow-hidden group transition-all",
                      isCorrect ? "border-green-500 bg-green-50/50" : "border-slate-200 bg-slate-50"
                    )}
                  >
                    {/* Vertical Bar Background */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${percent}%` }}
                      transition={{ type: "spring", bounce: 0, duration: 0.8 }}
                      className={clsx(
                        "absolute bottom-0 inset-x-0 opacity-20 transition-all",
                        isCorrect ? "bg-green-500" : "bg-slate-400"
                      )}
                    />

                    {/* Content */}
                    <div className="relative z-10 w-full h-full flex items-center justify-center gap-3">
                      <span className={clsx(
                        "font-black text-lg px-2.5 py-0.5 rounded-lg border-2",
                        isCorrect ? "bg-green-100 border-green-200 text-green-800" : "bg-white border-slate-200 text-slate-600"
                      )}>
                        {String.fromCharCode(65 + j)}
                        {isCorrect && <Check className="w-3.5 h-3.5 inline ml-1" />}
                      </span>
                      <span className={clsx("text-2xl font-black", isCorrect ? "text-green-900" : "text-slate-700")}>
                        {count}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
