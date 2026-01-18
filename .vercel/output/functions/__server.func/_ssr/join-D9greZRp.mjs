import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useNavigate } from "../_libs/@tanstack/react-router.mjs";
import { a as api } from "./api-B4qLQuEf.mjs";
import { u as useMutation } from "../_libs/convex.mjs";
import { L as LoaderCircle, A as ArrowRight } from "../_libs/lucide-react.mjs";
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
function JoinPage() {
  const navigate = useNavigate();
  const joinSession = useMutation(api.sessions.joinSession);
  const [code, setCode] = reactExports.useState("");
  const [error, setError] = reactExports.useState("");
  const [isJoining, setIsJoining] = reactExports.useState(false);
  const handleJoin = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("Please enter a join code");
      return;
    }
    setIsJoining(true);
    setError("");
    try {
      const result = await joinSession({
        code: code.trim().toLowerCase()
      });
      sessionStorage.setItem(`studentId-${result.sessionId}`, result.studentId);
      navigate({
        to: "/session/$sessionId",
        params: {
          sessionId: result.sessionId
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join session");
      setIsJoining(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-lavender-bg py-20 px-6 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md w-full mx-auto bg-white p-8 rounded-[2.5rem] shadow-comic border-2 border-ink relative overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 right-0 w-32 h-32 bg-coral/20 rounded-bl-[100px] -z-0" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-4xl font-black text-ink text-center mb-4 relative z-10", children: "Join Session" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-500 font-bold text-center mb-10 relative z-10", children: "Enter the code from your teacher to join the lecture." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleJoin, className: "space-y-6 relative z-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: code, onChange: (e) => setCode(e.target.value), placeholder: "e.g. blue-tiger-42", className: "w-full px-4 py-5 bg-white border-2 border-ink rounded-2xl text-ink placeholder-slate-300 outline-none focus:border-coral focus:shadow-comic transition-all text-center text-xl font-black font-mono" }),
        error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-coral font-bold text-sm text-center border-2 border-coral bg-coral/10 py-2 rounded-lg", children: error })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: isJoining, className: "w-full inline-flex items-center justify-center gap-3 px-8 py-5 bg-mustard hover:bg-mustard/90 disabled:opacity-50 text-ink font-black rounded-2xl border-2 border-ink transition-all shadow-comic hover:translate-y-[-2px] hover:shadow-comic-hover active:translate-y-0 active:shadow-comic text-xl", children: isJoining ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin" }),
        "Joining..."
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        "Join Class",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-6 h-6" })
      ] }) })
    ] })
  ] }) });
}
export {
  JoinPage as component
};
