import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useState, useEffect, useRef } from "react";
import {
  AlertCircle,
  Send,
  Loader2,
  Sparkles,
  CheckCircle2,
  ThumbsUp,
  MessageCircle,
  Users,
  BookOpen,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

export const Route = createFileRoute("/session/$sessionId")({
  component: StudentSessionPage,
});

function StudentSessionPage() {
  const { sessionId } = Route.useParams();
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState<string | null>(null);
  const [checkedStorage, setCheckedStorage] = useState(false);
  const keepAlive = useMutation(api.sessions.keepAlive);

  useEffect(() => {
    // Try local storage first, fallback to session storage
    const stored = localStorage.getItem(`studentId-${sessionId}`) || sessionStorage.getItem(`studentId-${sessionId}`);
    if (stored) {
      setStudentId(stored);
    }
    setCheckedStorage(true);
  }, [sessionId]);

  useEffect(() => {
    if (checkedStorage && !studentId) {
      navigate({ to: "/join" });
    }
  }, [checkedStorage, studentId, navigate]);

  // Heartbeat: Keep student active
  useEffect(() => {
    if (!studentId || !sessionId) return;
    
    // Initial call
    keepAlive({ sessionId: sessionId as Id<"sessions">, studentId });

    // Periodic call every 5 seconds
    const interval = setInterval(() => {
      keepAlive({ sessionId: sessionId as Id<"sessions">, studentId });
    }, 5000);

    return () => clearInterval(interval);
  }, [studentId, sessionId, keepAlive]);

  const session = useQuery(api.sessions.getSession, {
    sessionId: sessionId as Id<"sessions">,
  });
  const transcript = useQuery(api.transcripts.listTranscript, {
    sessionId: sessionId as Id<"sessions">,
  });
  const activeQuiz = useQuery(api.quizzes.getActiveQuiz, {
    sessionId: sessionId as Id<"sessions">,
  });
  const studentState = useQuery(api.sessions.getStudentState, 
    studentId ? { sessionId: sessionId as Id<"sessions">, studentId } : "skip"
  );
  
  const studentCount = useQuery(api.sessions.getStudentCount, {
    sessionId: sessionId as Id<"sessions">,
  });

  const recentQuestions = useQuery(api.questions.listRecentQuestions, {
    sessionId: sessionId as Id<"sessions">,
    studentId: studentId ?? undefined,
  });

  const setLostStatus = useMutation(api.sessions.setLostStatus);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-ink border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (session.status === "ended") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-[2rem] shadow-comic border-2 border-ink text-center max-w-md w-full">
          <div className="w-20 h-20 bg-mustard/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-ink">
            <CheckCircle2 className="w-10 h-10 text-ink" />
          </div>
          <h1 className="text-2xl font-black mb-2">That's a wrap!</h1>
          <p className="text-slate-500 font-bold">
            The lecture has ended. Great work today.
          </p>
        </div>
      </div>
    );
  }

  const handleLostClick = async () => {
    if (studentId) {
      const newStatus = !studentState?.isLost;
      await setLostStatus({
        sessionId: sessionId as Id<"sessions">,
        studentId,
        isLost: newStatus,
      });
    }
  };

  return (
    <div className="min-h-screen bg-lavender-bg flex flex-col relative overflow-hidden">

      {/* Quiz Overlay */}
      <AnimatePresence>
        {activeQuiz && studentId && (
          <QuizModal quiz={activeQuiz} studentId={studentId} />
        )}
      </AnimatePresence>

      <div className="flex-1 max-w-2xl mx-auto w-full p-4 pb-32 flex flex-col gap-6">

        {/* Header */}
        <header className="flex items-center justify-between py-2">
          <div className="bg-white border-2 border-ink rounded-full px-4 py-2 shadow-comic-sm flex items-center gap-3">
            <div className="w-3 h-3 bg-coral rounded-full animate-pulse border border-ink" />
            <span className="font-bold text-sm tracking-wide">LIVE</span>
          </div>

           <div className="flex items-center gap-3">
            <div className="bg-white border-2 border-ink rounded-xl px-4 py-2 shadow-comic-sm flex items-center gap-2 font-bold min-w-[100px] justify-center">
              <Users className="w-5 h-5 text-ink" />
              <span>{studentCount ?? "..."}</span>
            </div>
            <div className="font-mono font-bold text-ink/50 text-sm">
              #{session.code}
            </div>
          </div>
        </header>

        {/* Live Transcript Stream */}
        <div className="flex-1 min-h-0 flex flex-col gap-4">
          <TranscriptView transcript={transcript ?? []} />
        </div>
      </div>

      {/* Floating Panic Button */}
      <div className="fixed bottom-24 right-6 z-20">
        <motion.button
          animate={studentState?.isLost ? {
            scale: [1, 1.1, 1],
            rotate: [0, -5, 5, -5, 5, 0],
            transition: { repeat: Infinity, duration: 0.5 }
          } : {}}
          onClick={handleLostClick}
          className={clsx(
            "w-20 h-20 rounded-full shadow-comic flex items-center justify-center text-white border-2 border-ink active:shadow-comic-sm transition-all relative overflow-hidden group hover:translate-x-1 hover:translate-y-1 hover:shadow-none",
            studentState?.isLost ? "bg-mustard" : "bg-coral"
          )}
        >
          <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-150 transition-transform rounded-full origin-center" />
          <div className="flex flex-col items-center relative z-10">
            <AlertCircle className={clsx("w-8 h-8 fill-current", studentState?.isLost && "text-ink")} />
            <span className={clsx("text-[0.6rem] font-black uppercase tracking-wide mt-1", studentState?.isLost && "text-ink")}>
              {studentState?.isLost ? "I'm Lost!" : "Lost?"}
            </span>
          </div>
        </motion.button>
      </div>

      {/* Lost Summary Panel */}
      <AnimatePresence>
        {studentState?.isLost && (
          <LostSummaryPanel
            summary={studentState.lostSummary}
            onDismiss={handleLostClick}
          />
        )}
      </AnimatePresence>

      {/* Bottom AI Chat Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-6 z-10 pointer-events-none">
        <div className="max-w-2xl mx-auto pointer-events-auto">
          {studentId && (
            <QAPanel
              sessionId={sessionId as Id<"sessions">}
              studentId={studentId}
              questions={recentQuestions ?? []}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function TranscriptView({
  transcript,
}: {
  transcript: { _id: string; text: string; createdAt: number }[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  return (
    <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2" style={{ maxHeight: 'calc(100vh - 250px)' }}>
      {transcript.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-50">
          <div className="w-16 h-16 bg-white border-2 border-ink rounded-2xl mb-4 border-dashed" />
          <p className="font-bold text-slate-500">Waiting for teacher...</p>
        </div>
      ) : (
        transcript.map((line, i) => (
          <motion.div
            key={line._id}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`p-5 rounded-2xl text-lg font-medium shadow-comic-sm border-2 border-ink max-w-[90%] relative ${i % 2 === 0
              ? "bg-white text-ink rounded-tl-none self-start ml-2"
              : "bg-mustard/20 text-ink rounded-tr-none self-end mr-2"
              }`}
          >
            {/* Speech bubble tail decoration */}
            <div className={`absolute top-0 w-4 h-4 border-t-2 border-ink bg-inherit ${i % 2 === 0 ? "-left-[18px] border-r-2 rounded-tr-xl skew-x-[20deg]" : "-right-[18px] border-l-2 rounded-tl-xl -skew-x-[20deg]"}`} />
            {line.text}
          </motion.div>
        ))
      )}
      <div ref={scrollRef} />
    </div>
  );
}

function QAPanel({
  sessionId,
  studentId,
  questions,
}: {
  sessionId: Id<"sessions">;
  studentId: string;
  questions: {
    _id: string;
    question: string;
    answer?: string;
    createdAt: number;
  }[];
}) {
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const askQuestion = useMutation(api.questions.askQuestion);
  const listRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isAsking) return;

    setIsAsking(true);
    try {
      await askQuestion({
        sessionId,
        studentId,
        question: input.trim(),
      });
      setInput("");
      setIsOpen(true);
    } catch (error) {
      console.error("Failed to ask question:", error);
    }
    setIsAsking(false);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="absolute bottom-20 left-4 right-4 bg-white border-2 border-ink rounded-[2rem] shadow-comic max-h-[60vh] flex flex-col overflow-hidden z-20"
          >
            <div className="flex items-center justify-between p-4 border-b-2 border-ink bg-soft-purple/20">
              <h3 className="font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI Assistant
              </h3>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-black/10 rounded-full transition-colors">
                <div className="w-6 h-1 bg-ink rotate-45 absolute mt-2.5" />
                <div className="w-6 h-1 bg-ink -rotate-45 relative" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-milk" ref={listRef}>
              {questions.map((q) => (
                <div key={q._id} className="space-y-3">
                  <div className="flex justify-end">
                    <div className="bg-coral text-white px-4 py-2 rounded-2xl rounded-tr-sm text-sm font-bold border-2 border-ink shadow-comic-sm">
                      {q.question}
                    </div>
                  </div>

                  <div className="flex justify-start">
                    {q.answer ? (
                      <div className="bg-white border-2 border-ink text-ink px-4 py-3 rounded-2xl rounded-tl-sm text-sm font-medium shadow-comic-sm max-w-[90%]">
                        <Sparkles className="w-3 h-3 text-soft-purple mb-1 fill-current" />
                        {q.answer}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-bold pl-2">
                        <Loader2 className="w-3 h-3 animate-spin" /> Thinking...
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {questions.length === 0 && (
                <div className="text-center py-10 text-slate-400 font-bold">
                  Ask anything!
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/50 group-focus-within:text-coral transition-colors">
          <MessageCircle className="w-6 h-6" />
        </div>
        <input
          type="text"
          value={input}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="w-full pl-12 pr-14 py-4 bg-white border-2 border-ink rounded-2xl outline-none font-bold text-ink placeholder-ink/30 shadow-comic transition-all focus:translate-x-1 focus:translate-y-1 focus:shadow-none"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="absolute right-3 top-3 bottom-3 aspect-square bg-ink text-white rounded-xl flex items-center justify-center disabled:opacity-20 transition-all hover:bg-coral active:scale-95"
        >
          {isAsking ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </form>
    </>
  );
}

function getSubmittedQuizKey(quizId: string) { return `quiz-submitted-${quizId}`; }

function LostSummaryPanel({
  summary,
  onDismiss,
}: {
  summary?: string;
  onDismiss: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="fixed bottom-24 right-28 z-20 max-w-sm"
    >
      <div className="bg-white border-2 border-ink rounded-2xl shadow-comic p-4 relative">
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 p-1 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-mustard border-2 border-ink rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-ink" />
          </div>
          <h3 className="font-bold text-sm">Quick Catch-Up</h3>
        </div>

        {summary ? (
          <p className="text-sm text-slate-600 leading-relaxed">{summary}</p>
        ) : (
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Generating summary...</span>
          </div>
        )}

        <p className="text-xs text-slate-400 mt-3">
          Tap the button again when you're caught up!
        </p>
      </div>
    </motion.div>
  );
}

function QuizModal({ quiz, studentId }: { quiz: any; studentId: string }) {
  const [answers, setAnswers] = useState<number[]>(new Array(quiz.questions.length).fill(-1));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitQuiz = useMutation(api.quizzes.submitQuiz);

  const hasSubmitted = useQuery(api.quizzes.hasStudentSubmitted, { quizId: quiz._id, studentId });
  const [localSubmitted, setLocalSubmitted] = useState(() => {
    if (typeof window !== "undefined") return sessionStorage.getItem(getSubmittedQuizKey(quiz._id)) === "true";
    return false;
  });

  const submitted = hasSubmitted === true || localSubmitted;

  const handleSelectAnswer = (qi: number, ci: number) => {
    if (submitted) return;
    const newAnswers = [...answers];
    newAnswers[qi] = ci;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (answers.some(a => a === -1)) {
      alert("Please answer all questions");
      return;
    }
    setIsSubmitting(true);
    try {
      await submitQuiz({ quizId: quiz._id, studentId, answers });
      sessionStorage.setItem(getSubmittedQuizKey(quiz._id), "true");
      setLocalSubmitted(true);
    } catch (e) { console.error(e); }
    setIsSubmitting(false);
  };

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
        <motion.div initial={{ scale: 0.9, rotate: -2 }} animate={{ scale: 1, rotate: 0 }} className="bg-white border-2 border-ink rounded-[2.5rem] p-10 max-w-sm w-full text-center shadow-comic">
          <div className="w-20 h-20 bg-green-100 border-2 border-ink rounded-full flex items-center justify-center mx-auto mb-6">
            <ThumbsUp className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-black text-ink mb-2">You're Awesome!</h2>
          <p className="text-slate-500 font-bold">Responses sent.</p>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-ink/20 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="bg-white border-2 border-ink rounded-[2rem] p-6 max-w-xl w-full shadow-comic my-8">
        <div className="text-center mb-8">
          <span className="inline-block px-4 py-1 bg-mustard border-2 border-ink font-black rounded-lg text-xs uppercase tracking-wider mb-3 shadow-comic-sm">Pop Quiz</span>
          <h2 className="text-3xl font-black text-ink">Quick Check!</h2>
        </div>

        <div className="space-y-8">
          {quiz.questions.map((q: any, qi: number) => (
            <div key={qi} className="space-y-4">
              <p className="text-lg font-bold text-ink">{qi + 1}. {q.prompt}</p>
              <div className="space-y-3">
                {q.choices.map((choice: string, ci: number) => (
                  <button
                    key={ci}
                    onClick={() => handleSelectAnswer(qi, ci)}
                    className={`w-full text-left px-5 py-4 rounded-xl font-bold transition-all border-2 shadow-comic-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none ${answers[qi] === ci
                      ? "border-ink bg-coral text-white"
                      : "border-ink bg-white text-slate-600 hover:bg-gray-50"
                      }`}
                  >
                    <span className={`inline-block w-8 ${answers[qi] === ci ? "opacity-100" : "opacity-40"}`}>{String.fromCharCode(65 + ci)}.</span>
                    {choice}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || answers.some(a => a === -1)}
          className="w-full mt-8 py-4 bg-ink hover:bg-slate-800 text-white font-black text-lg rounded-2xl shadow-comic transition-all disabled:opacity-50 disabled:shadow-comic-sm btn-press"
        >
          {isSubmitting ? "Sending..." : "Submit Answers"}
        </button>
      </motion.div>
    </motion.div>
  );
}
