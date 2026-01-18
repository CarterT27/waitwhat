import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useNavigate } from "../_libs/@tanstack/react-router.mjs";
import { a as api } from "./api-B4qLQuEf.mjs";
import { c as clsx } from "../_libs/clsx.mjs";
import { R as Route$1 } from "./router-BJGcsLls.mjs";
import { u as useMutation, d as useQuery } from "../_libs/convex.mjs";
import { C as CircleCheck, U as Users, a as CircleAlert, T as ThumbsUp, S as Sparkles, L as LoaderCircle, M as MessageCircle, b as Send } from "../_libs/lucide-react.mjs";
import { A as AnimatePresence, m as motion } from "../_libs/framer-motion.mjs";
import "../_libs/tiny-warning.mjs";
import "../_libs/@tanstack/router-core.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/@tanstack/store.mjs";
import "../_libs/@tanstack/history.mjs";
import "../_libs/tiny-invariant.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/@tanstack/react-store.mjs";
import "../_libs/use-sync-external-store.mjs";
import "../_libs/@convex-dev/react-query.mjs";
import "../_libs/@tanstack/query-core.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
function StudentSessionPage() {
  const {
    sessionId
  } = Route$1.useParams();
  const navigate = useNavigate();
  const [studentId, setStudentId] = reactExports.useState(null);
  const [checkedStorage, setCheckedStorage] = reactExports.useState(false);
  const keepAlive = useMutation(api.sessions.keepAlive);
  reactExports.useEffect(() => {
    const stored = localStorage.getItem(`studentId-${sessionId}`) || sessionStorage.getItem(`studentId-${sessionId}`);
    if (stored) {
      setStudentId(stored);
    }
    setCheckedStorage(true);
  }, [sessionId]);
  reactExports.useEffect(() => {
    if (checkedStorage && !studentId) {
      navigate({
        to: "/join"
      });
    }
  }, [checkedStorage, studentId, navigate]);
  reactExports.useEffect(() => {
    if (!studentId || !sessionId) return;
    keepAlive({
      sessionId,
      studentId
    });
    const interval = setInterval(() => {
      keepAlive({
        sessionId,
        studentId
      });
    }, 2e4);
    return () => clearInterval(interval);
  }, [studentId, sessionId, keepAlive]);
  const session = useQuery(api.sessions.getSession, {
    sessionId
  });
  const transcript = useQuery(api.transcripts.listTranscript, {
    sessionId
  });
  const activeQuiz = useQuery(api.quizzes.getActiveQuiz, {
    sessionId
  });
  const studentState = useQuery(api.sessions.getStudentState, studentId ? {
    sessionId,
    studentId
  } : "skip");
  const studentCount = useQuery(api.sessions.getStudentCount, {
    sessionId
  });
  const recentQuestions = useQuery(api.questions.listRecentQuestions, {
    sessionId,
    studentId: studentId ?? void 0
  });
  const setLostStatus = useMutation(api.sessions.setLostStatus);
  if (!session) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 border-4 border-ink border-t-transparent rounded-full animate-spin" }) });
  }
  if (session.status === "ended") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-8 rounded-[2rem] shadow-comic border-2 border-ink text-center max-w-md w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 h-20 bg-mustard/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-ink", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-10 h-10 text-ink" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-black mb-2", children: "That's a wrap!" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-500 font-bold", children: "The lecture has ended. Great work today." })
    ] }) });
  }
  const handleLostClick = async () => {
    if (studentId) {
      const newStatus = !studentState?.isLost;
      await setLostStatus({
        sessionId,
        studentId,
        isLost: newStatus
      });
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-lavender-bg flex flex-col relative overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: activeQuiz && studentId && /* @__PURE__ */ jsxRuntimeExports.jsx(QuizModal, { quiz: activeQuiz, studentId }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 max-w-2xl mx-auto w-full p-4 pb-32 flex flex-col gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center justify-between py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border-2 border-ink rounded-full px-4 py-2 shadow-comic-sm flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-3 h-3 bg-coral rounded-full animate-pulse border border-ink" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-sm tracking-wide", children: "LIVE" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border-2 border-ink rounded-xl px-4 py-2 shadow-comic-sm flex items-center gap-2 font-bold min-w-[100px] justify-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-5 h-5 text-ink" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: studentCount ?? "..." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-mono font-bold text-ink/50 text-sm", children: [
            "#",
            session.code
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 min-h-0 flex flex-col gap-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TranscriptView, { transcript: transcript ?? [] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed bottom-24 right-6 z-20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.button, { animate: studentState?.isLost ? {
      scale: [1, 1.1, 1],
      rotate: [0, -5, 5, -5, 5, 0],
      transition: {
        repeat: Infinity,
        duration: 0.5
      }
    } : {}, onClick: handleLostClick, className: clsx("w-20 h-20 rounded-full shadow-comic flex items-center justify-center text-white border-2 border-ink active:shadow-comic-sm transition-all relative overflow-hidden group hover:translate-x-1 hover:translate-y-1 hover:shadow-none", studentState?.isLost ? "bg-mustard" : "bg-coral"), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-white/20 scale-0 group-hover:scale-150 transition-transform rounded-full origin-center" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center relative z-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: clsx("w-8 h-8 fill-current", studentState?.isLost && "text-ink") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: clsx("text-[0.6rem] font-black uppercase tracking-wide mt-1", studentState?.isLost && "text-ink"), children: studentState?.isLost ? "I'm Lost!" : "Lost?" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed bottom-0 left-0 right-0 p-4 pb-6 z-10 pointer-events-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-2xl mx-auto pointer-events-auto", children: studentId && /* @__PURE__ */ jsxRuntimeExports.jsx(QAPanel, { sessionId, studentId, questions: recentQuestions ?? [] }) }) })
  ] });
}
function TranscriptView({
  transcript
}) {
  const scrollRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2", style: {
    maxHeight: "calc(100vh - 250px)"
  }, children: [
    transcript.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-20 opacity-50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 bg-white border-2 border-ink rounded-2xl mb-4 border-dashed" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-slate-500", children: "Waiting for teacher..." })
    ] }) : transcript.map((line, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
      opacity: 0,
      y: 10,
      scale: 0.98
    }, animate: {
      opacity: 1,
      y: 0,
      scale: 1
    }, className: `p-5 rounded-2xl text-lg font-medium shadow-comic-sm border-2 border-ink max-w-[90%] relative ${i % 2 === 0 ? "bg-white text-ink rounded-tl-none self-start ml-2" : "bg-mustard/20 text-ink rounded-tr-none self-end mr-2"}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `absolute top-0 w-4 h-4 border-t-2 border-ink bg-inherit ${i % 2 === 0 ? "-left-[18px] border-r-2 rounded-tr-xl skew-x-[20deg]" : "-right-[18px] border-l-2 rounded-tl-xl -skew-x-[20deg]"}` }),
      line.text
    ] }, line._id)),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: scrollRef })
  ] });
}
function QAPanel({
  sessionId,
  studentId,
  questions
}) {
  const [input, setInput] = reactExports.useState("");
  const [isOpen, setIsOpen] = reactExports.useState(false);
  const [isAsking, setIsAsking] = reactExports.useState(false);
  const askQuestion = useMutation(api.questions.askQuestion);
  const listRef = reactExports.useRef(null);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isAsking) return;
    setIsAsking(true);
    try {
      await askQuestion({
        sessionId,
        studentId,
        question: input.trim()
      });
      setInput("");
      setIsOpen(true);
    } catch (error) {
      console.error("Failed to ask question:", error);
    }
    setIsAsking(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: isOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
      opacity: 0,
      y: 100
    }, animate: {
      opacity: 1,
      y: 0
    }, exit: {
      opacity: 0,
      y: 100
    }, className: "absolute bottom-20 left-4 right-4 bg-white border-2 border-ink rounded-[2rem] shadow-comic max-h-[60vh] flex flex-col overflow-hidden z-20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4 border-b-2 border-ink bg-soft-purple/20", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-4 h-4" }),
          "AI Assistant"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setIsOpen(false), className: "p-1 hover:bg-black/10 rounded-full transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-1 bg-ink rotate-45 absolute mt-2.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-1 bg-ink -rotate-45 relative" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto p-4 space-y-6 bg-milk", ref: listRef, children: [
        questions.map((q) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-coral text-white px-4 py-2 rounded-2xl rounded-tr-sm text-sm font-bold border-2 border-ink shadow-comic-sm", children: q.question }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-start", children: q.answer ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border-2 border-ink text-ink px-4 py-3 rounded-2xl rounded-tl-sm text-sm font-medium shadow-comic-sm max-w-[90%]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-3 h-3 text-soft-purple mb-1 fill-current" }),
            q.answer
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-slate-400 text-xs font-bold pl-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-3 h-3 animate-spin" }),
            " Thinking..."
          ] }) })
        ] }, q._id)),
        questions.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-10 text-slate-400 font-bold", children: "Ask anything!" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "relative group", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-4 top-1/2 -translate-y-1/2 text-ink/50 group-focus-within:text-coral transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "w-6 h-6" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: input, onFocus: () => setIsOpen(true), onChange: (e) => setInput(e.target.value), placeholder: "Ask a question...", className: "w-full pl-12 pr-14 py-4 bg-white border-2 border-ink rounded-2xl outline-none font-bold text-ink placeholder-ink/30 shadow-comic transition-all focus:translate-x-1 focus:translate-y-1 focus:shadow-none" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: !input.trim(), className: "absolute right-3 top-3 bottom-3 aspect-square bg-ink text-white rounded-xl flex items-center justify-center disabled:opacity-20 transition-all hover:bg-coral active:scale-95", children: isAsking ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-5 h-5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "w-5 h-5" }) })
    ] })
  ] });
}
function getSubmittedQuizKey(quizId) {
  return `quiz-submitted-${quizId}`;
}
function QuizModal({
  quiz,
  studentId
}) {
  const [answers, setAnswers] = reactExports.useState(new Array(quiz.questions.length).fill(-1));
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  const submitQuiz = useMutation(api.quizzes.submitQuiz);
  const hasSubmitted = useQuery(api.quizzes.hasStudentSubmitted, {
    quizId: quiz._id,
    studentId
  });
  const [localSubmitted, setLocalSubmitted] = reactExports.useState(() => {
    if (typeof window !== "undefined") return sessionStorage.getItem(getSubmittedQuizKey(quiz._id)) === "true";
    return false;
  });
  const submitted = hasSubmitted === true || localSubmitted;
  const handleSelectAnswer = (qi, ci) => {
    if (submitted) return;
    const newAnswers = [...answers];
    newAnswers[qi] = ci;
    setAnswers(newAnswers);
  };
  const handleSubmit = async () => {
    if (answers.some((a) => a === -1)) {
      alert("Please answer all questions");
      return;
    }
    setIsSubmitting(true);
    try {
      await submitQuiz({
        quizId: quiz._id,
        studentId,
        answers
      });
      sessionStorage.setItem(getSubmittedQuizKey(quiz._id), "true");
      setLocalSubmitted(true);
    } catch (e) {
      console.error(e);
    }
    setIsSubmitting(false);
  };
  if (submitted) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: {
      opacity: 0
    }, animate: {
      opacity: 1
    }, className: "fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-center justify-center p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
      scale: 0.9,
      rotate: -2
    }, animate: {
      scale: 1,
      rotate: 0
    }, className: "bg-white border-2 border-ink rounded-[2.5rem] p-10 max-w-sm w-full text-center shadow-comic", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 h-20 bg-green-100 border-2 border-ink rounded-full flex items-center justify-center mx-auto mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ThumbsUp, { className: "w-10 h-10 text-green-600" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-black text-ink mb-2", children: "You're Awesome!" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-500 font-bold", children: "Responses sent." })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: {
    opacity: 0
  }, animate: {
    opacity: 1
  }, className: "fixed inset-0 bg-ink/20 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
    y: 100
  }, animate: {
    y: 0
  }, className: "bg-white border-2 border-ink rounded-[2rem] p-6 max-w-xl w-full shadow-comic my-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block px-4 py-1 bg-mustard border-2 border-ink font-black rounded-lg text-xs uppercase tracking-wider mb-3 shadow-comic-sm", children: "Pop Quiz" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-black text-ink", children: "Quick Check!" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-8", children: quiz.questions.map((q, qi) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-lg font-bold text-ink", children: [
        qi + 1,
        ". ",
        q.prompt
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: q.choices.map((choice, ci) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleSelectAnswer(qi, ci), className: `w-full text-left px-5 py-4 rounded-xl font-bold transition-all border-2 shadow-comic-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none ${answers[qi] === ci ? "border-ink bg-coral text-white" : "border-ink bg-white text-slate-600 hover:bg-gray-50"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-block w-8 ${answers[qi] === ci ? "opacity-100" : "opacity-40"}`, children: [
          String.fromCharCode(65 + ci),
          "."
        ] }),
        choice
      ] }, ci)) })
    ] }, qi)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleSubmit, disabled: isSubmitting || answers.some((a) => a === -1), className: "w-full mt-8 py-4 bg-ink hover:bg-slate-800 text-white font-black text-lg rounded-2xl shadow-comic transition-all disabled:opacity-50 disabled:shadow-comic-sm btn-press", children: isSubmitting ? "Sending..." : "Submit Answers" })
  ] }) });
}
export {
  StudentSessionPage as component
};
