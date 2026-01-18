import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useNavigate } from "../_libs/@tanstack/react-router.mjs";
import { a as api } from "./api-B4qLQuEf.mjs";
import { c as clsx } from "../_libs/clsx.mjs";
import { a as Route } from "./router-BJGcsLls.mjs";
import { d as useQuery, u as useMutation } from "../_libs/convex.mjs";
import { c as Check, U as Users, d as Copy, e as CircleStop, f as CircleQuestionMark, L as LoaderCircle, P as Play, Z as Zap } from "../_libs/lucide-react.mjs";
import { m as motion } from "../_libs/framer-motion.mjs";
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
function TeacherSessionPage() {
  const {
    sessionId
  } = Route.useParams();
  const navigate = useNavigate();
  const session = useQuery(api.sessions.getSession, {
    sessionId
  });
  const lostStudentCount = useQuery(api.sessions.getLostStudentCount, {
    sessionId
  });
  const studentCount = useQuery(api.sessions.getStudentCount, {
    sessionId
  });
  const activeQuiz = useQuery(api.quizzes.getActiveQuiz, {
    sessionId
  });
  const launchQuiz = useMutation(api.quizzes.launchQuiz);
  const closeQuiz = useMutation(api.quizzes.closeQuiz);
  const endSession = useMutation(api.sessions.endSession);
  const [copied, setCopied] = reactExports.useState(false);
  const [isLaunchingQuiz, setIsLaunchingQuiz] = reactExports.useState(false);
  if (!session) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 border-4 border-ink border-t-transparent rounded-full animate-spin" }) });
  }
  if (session.status === "ended") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-milk border-2 border-ink rounded-3xl p-12 shadow-comic text-center max-w-lg w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 h-20 bg-soft-purple rounded-full border-2 border-ink flex items-center justify-center mx-auto mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-10 h-10 text-white" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-4xl font-black mb-4", children: "Class Dismissed!" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-medium text-slate-500 mb-8", children: "Great session today." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate({
        to: "/teacher"
      }), className: "btn-primary w-full", children: "Back to Dashboard" })
    ] }) });
  }
  const handleCopyCode = () => {
    navigator.clipboard.writeText(session.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2e3);
  };
  const handleLaunchQuiz = async () => {
    setIsLaunchingQuiz(true);
    try {
      const sampleQuestions = [{
        prompt: "What is the powerhouse of the cell?",
        choices: ["Nucleus", "Mitochondria", "Ribosome", "Golgi Body"],
        correctIndex: 1,
        explanation: "Mitochondria generate most of the chemical energy needed to power the cell.",
        conceptTag: "biology"
      }, {
        prompt: "Which organelle is unique to plant cells?",
        choices: ["Mitochondria", "Chloroplast", "Nucleus", "Cell Membrane"],
        correctIndex: 1,
        explanation: "Chloroplasts conduct photosynthesis and are found in plant cells.",
        conceptTag: "bioscience"
      }];
      await launchQuiz({
        sessionId,
        questions: sampleQuestions
      });
    } catch (error) {
      console.error("Failed to launch quiz:", error);
    }
    setIsLaunchingQuiz(false);
  };
  const handleEndSession = async () => {
    if (confirm("End this session?")) {
      await endSession({
        sessionId
      });
      await navigate({
        to: "/teacher"
      });
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen p-6 pb-20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-milk border-2 border-ink rounded-2xl p-4 md:p-6 shadow-comic flex flex-col md:flex-row items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-coral text-white px-4 py-1 rounded-full border-2 border-ink font-bold transform -rotate-1 shadow-comic-sm", children: "LIVE" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-black", children: "Biology 101" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block font-bold text-slate-500 mr-2", children: "Join Code:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-mustard/20 px-4 py-2 rounded-xl border-2 border-ink border-dashed font-mono font-bold text-xl tracking-widest", children: session.code }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border-2 border-ink rounded-xl px-4 py-2 shadow-comic-sm flex items-center gap-2 font-bold min-w-[100px] justify-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-5 h-5 text-ink" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            studentCount ?? "...",
            " Students"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleCopyCode, className: "w-12 h-12 flex items-center justify-center bg-white border-2 border-ink rounded-xl shadow-comic-sm btn-press", children: copied ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-5 h-5 text-green-600" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "w-5 h-5" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-4 flex flex-col gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-milk border-2 border-ink rounded-[2rem] p-8 shadow-comic flex flex-col items-center text-center relative overflow-hidden min-h-[400px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 inset-x-0 h-4 bg-soft-purple border-b-2 border-ink" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-black mt-4 mb-1", children: "Room Vibe" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-500 font-bold text-sm uppercase tracking-wide opacity-70", children: "Confusion Level" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col items-center justify-center relative w-full py-8", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center opacity-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { animate: {
              scale: [1, 1.2, 1]
            }, transition: {
              duration: 2,
              repeat: Infinity
            }, className: "w-64 h-64 bg-mustard rounded-full blur-3xl" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { animate: {
              scale: 1 + (lostStudentCount || 0) * 0.1,
              rotate: (lostStudentCount || 0) * 5
            }, className: clsx("w-48 h-48 border-4 border-ink rounded-full flex items-center justify-center relative z-10 transition-colors duration-500 shadow-comic", (lostStudentCount || 0) > 3 ? "bg-coral" : (lostStudentCount || 0) > 0 ? "bg-mustard" : "bg-white"), children: (lostStudentCount || 0) > 3 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-4 h-4 rounded-full bg-ink" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-4 h-4 rounded-full bg-ink" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-4 bg-ink rounded-full" })
            ] }) : (lostStudentCount || 0) > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-4 h-4 rounded-full bg-ink" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-4 h-4 rounded-full bg-ink" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-1 bg-ink" })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-6", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-4 h-8 bg-ink rounded-full" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-4 h-8 bg-ink rounded-full" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-5 border-b-4 border-ink rounded-b-full" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex gap-2 items-end", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-6xl font-black tabular-nums leading-none", children: lostStudentCount ?? 0 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-slate-500 mb-1", children: "confused" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleEndSession, className: "bg-white border-2 border-ink rounded-xl py-4 font-bold hover:bg-red-50 hover:text-red-500 transition-colors flex items-center justify-center gap-2 shadow-comic-sm btn-press", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleStop, { className: "w-5 h-5" }),
          " End Class"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-8 flex flex-col gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-mustard border-2 border-ink rounded-[2rem] p-8 shadow-comic relative overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -right-10 -bottom-10 opacity-20 transform rotate-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleQuestionMark, { className: "w-64 h-64" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-8", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-black", children: "Pop Quiz" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white px-3 py-1 rounded-lg border-2 border-ink font-bold text-sm shadow-comic-sm", children: activeQuiz ? "ACTIVE NOW" : "READY" })
            ] }),
            activeQuiz ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border-2 border-ink rounded-2xl p-6 shadow-comic-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-6", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-lg", children: "Live Results" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => closeQuiz({
                  sessionId
                }), className: "px-4 py-2 bg-ink text-white rounded-lg font-bold hover:bg-slate-800", children: "Close Quiz" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(QuizStatsPanel, { quizId: activeQuiz._id })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-start gap-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-ink/80 text-lg max-w-md", children: "Generate a quick 2-question quiz based on the last 5 minutes of transcript." }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleLaunchQuiz, disabled: isLaunchingQuiz, className: "bg-white text-ink w-full md:w-auto px-8 py-4 rounded-xl border-2 border-ink font-black text-xl shadow-comic flex items-center gap-3 disabled:opacity-50 disabled:shadow-none disabled:translate-y-0 btn-press", children: [
                isLaunchingQuiz ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "fill-current" }),
                "Launch Quiz"
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border-2 border-ink rounded-2xl p-6 shadow-comic-sm hover:shadow-comic transition-all cursor-pointer group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 bg-soft-purple border-2 border-ink rounded-xl flex items-center justify-center mb-4 group-hover:-rotate-6 transition-transform", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-6 h-6 text-white" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-lg", children: "Polls" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-500 text-sm", children: "Coming Soon" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border-2 border-ink rounded-2xl p-6 shadow-comic-sm opacity-50 border-dashed", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 bg-gray-100 border-2 border-gray-300 rounded-xl flex items-center justify-center mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 border-2 border-gray-300 rounded-full" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-lg text-gray-400", children: "Timer" })
          ] })
        ] })
      ] })
    ] })
  ] }) });
}
function QuizStatsPanel({
  quizId
}) {
  const stats = useQuery(api.quizzes.getQuizStats, {
    quizId
  });
  if (!stats) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 font-bold text-slate-400 animate-pulse", children: "Waiting for responses..." });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-5xl font-black", children: stats.totalResponses }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-bold text-slate-500 leading-tight", children: [
        "Student",
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        "Responses"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4 max-h-[250px] overflow-y-auto custom-scrollbar pr-2", children: stats.questions.map((q, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b-2 border-gray-100 pb-4 last:border-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-bold mb-3", children: [
        i + 1,
        ". ",
        q.prompt
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: stats.choiceDistributions[i].map((count, j) => {
        const isCorrect = j === q.correctIndex;
        const percent = stats.totalResponses > 0 ? Math.round(count / stats.totalResponses * 100) : 0;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-10 bg-gray-50 border border-gray-200 rounded-lg overflow-hidden flex items-center px-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: {
            width: 0
          }, animate: {
            width: `${percent}%`
          }, className: clsx("absolute inset-y-0 left-0 opacity-20 transition-all", isCorrect ? "bg-green-500" : "bg-gray-400") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 flex justify-between w-full text-sm font-bold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: isCorrect ? "text-green-700" : "text-slate-600", children: [
              String.fromCharCode(65 + j),
              isCorrect && " (Correct)"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: count })
          ] })
        ] }, j);
      }) })
    ] }, i)) })
  ] });
}
export {
  TeacherSessionPage as component
};
