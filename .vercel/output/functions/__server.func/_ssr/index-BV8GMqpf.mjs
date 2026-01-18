import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/@tanstack/react-router.mjs";
import { m as motion } from "../_libs/framer-motion.mjs";
import { G as GraduationCap, A as ArrowRight, U as Users } from "../_libs/lucide-react.mjs";
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
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
function HomePage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-6 relative overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { animate: {
      rotate: 360
    }, transition: {
      duration: 50,
      repeat: Infinity,
      ease: "linear"
    }, className: "absolute top-20 left-10 w-32 h-32 border-4 border-soft-purple rounded-full opacity-50 -z-10 border-dashed" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { animate: {
      y: [0, -20, 0]
    }, transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }, className: "absolute bottom-20 right-10 w-24 h-24 bg-mustard rounded-xl opacity-20 -z-10 rotate-12" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-5xl w-full text-center mb-16 relative", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-6xl md:text-7xl font-black text-ink mb-6 tracking-tight leading-tight", children: [
      "Make every lecture ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative inline-block", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative z-10 text-coral transform -rotate-2 inline-block", children: "unforgettable" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "absolute w-[110%] h-[20px] -bottom-2 -left-[5%] text-mustard z-0", viewBox: "0 0 100 10", preserveAspectRatio: "none", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M0 5 Q 50 10 100 5", stroke: "currentColor", strokeWidth: "8", fill: "none" }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 relative z-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/teacher", className: "group", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { className: "h-full bg-white border-2 border-ink rounded-3xl p-8 shadow-comic transition-all duration-200 group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-none relative overflow-hidden flex flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 right-0 w-32 h-32 bg-soft-purple/30 rounded-bl-[100px] -z-0 transition-transform group-hover:scale-110" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 bg-soft-purple border-2 border-ink rounded-2xl flex items-center justify-center mb-6 shadow-comic-sm z-10 group-hover:rotate-6 transition-transform", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GraduationCap, { className: "w-8 h-8 text-ink" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-black text-ink mb-3 relative z-10", children: "For Teachers" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-500 font-medium text-lg leading-relaxed mb-10 flex-grow relative z-10", children: "Start a class, visualize confusion levels, and give real time comprehension checks." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "self-start px-6 py-3 bg-ink text-white font-bold rounded-xl flex items-center gap-2 group-hover:bg-coral transition-colors", children: [
          "Start Class ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-4 h-4" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/join", className: "group", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { className: "h-full bg-white border-2 border-ink rounded-3xl p-8 shadow-comic transition-all duration-200 group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-none relative overflow-hidden flex flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 right-0 w-32 h-32 bg-mustard/30 rounded-bl-[100px] -z-0 transition-transform group-hover:scale-110" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 bg-mustard border-2 border-ink rounded-2xl flex items-center justify-center mb-6 shadow-comic-sm z-10 group-hover:-rotate-6 transition-transform", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-8 h-8 text-ink" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-black text-ink mb-3 relative z-10", children: "For Students" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-500 font-medium text-lg leading-relaxed mb-10 flex-grow relative z-10", children: "Join a class, ask questions anonymously, and signal when you're lost." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "self-start px-6 py-3 bg-ink text-white font-bold rounded-xl flex items-center gap-2 group-hover:bg-mustard transition-colors", children: [
          "Join Session ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-4 h-4" })
        ] })
      ] }) })
    ] })
  ] });
}
export {
  HomePage as component
};
