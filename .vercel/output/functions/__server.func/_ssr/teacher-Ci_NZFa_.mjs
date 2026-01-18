import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useNavigate, d as useRouterState, O as Outlet } from "../_libs/@tanstack/react-router.mjs";
import { a as api } from "./api-B4qLQuEf.mjs";
import { u as useMutation } from "../_libs/convex.mjs";
import { P as Play, L as LoaderCircle } from "../_libs/lucide-react.mjs";
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
function TeacherPage() {
  const navigate = useNavigate();
  const createSession = useMutation(api.sessions.createSession);
  const [isCreating, setIsCreating] = reactExports.useState(false);
  const pathname = useRouterState({
    select: (s) => s.location.pathname
  });
  const isIndex = pathname === "/teacher" || pathname === "/teacher/";
  const handleStartSession = async () => {
    setIsCreating(true);
    try {
      const result = await createSession();
      await navigate({
        to: "/teacher/session/$sessionId",
        params: {
          sessionId: String(result.sessionId)
        }
      });
    } catch (error) {
      console.error("Failed to create session:", error);
    } finally {
      setIsCreating(false);
    }
  };
  if (!isIndex) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {});
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-lavender-bg py-20 px-6 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-xl w-full mx-auto bg-white p-12 rounded-[2.5rem] shadow-comic border-2 border-ink text-center relative overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 left-0 w-full h-4 bg-coral border-b-2 border-ink" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-flex items-center justify-center w-20 h-20 bg-soft-purple rounded-2xl border-2 border-ink shadow-comic-sm mb-6 rotate-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "w-10 h-10 text-white fill-current" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-4xl font-black text-ink mb-6", children: "Teacher Console" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-500 font-bold text-lg mb-12 leading-relaxed", children: "Start a new lecture session to engage with your students in real-time." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleStartSession, disabled: isCreating, className: "w-full inline-flex items-center justify-center gap-3 px-8 py-5 bg-coral hover:bg-coral-dark disabled:opacity-50 text-white font-black rounded-2xl shadow-comic text-xl border-2 border-ink btn-press", children: isCreating ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin" }),
      "Starting Class..."
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "w-6 h-6 fill-current" }),
      "Start Session"
    ] }) })
  ] }) });
}
export {
  TeacherPage as component
};
