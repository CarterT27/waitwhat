import { c as createRouter, a as createRootRoute, b as createFileRoute, l as lazyRouteComponent, H as HeadContent, S as Scripts, L as Link } from "../_libs/@tanstack/react-router.mjs";
import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { C as ConvexQueryClient } from "../_libs/@convex-dev/react-query.mjs";
import { b as ConvexProvider } from "../_libs/convex.mjs";
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
import "../_libs/@tanstack/query-core.mjs";
function Header() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "px-6 py-4 flex items-center justify-between sticky top-0 z-50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-lavender-bg/80 backdrop-blur-sm -z-10" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "flex items-center gap-2 group", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-ink text-white px-3 py-1 rounded-lg border-2 border-transparent group-hover:border-coral group-hover:text-coral group-hover:bg-white transition-all transform -rotate-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl font-black tracking-tight", children: "Wait" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl font-black text-ink tracking-tight transform rotate-1", children: "What" })
    ] })
  ] });
}
const CONVEX_URL = "http://127.0.0.1:3210";
const convexQueryClient = new ConvexQueryClient(CONVEX_URL);
function AppConvexProvider({
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ConvexProvider, { client: convexQueryClient.convexClient, children });
}
const appCss = "/assets/styles-Bvt9J5ek.css";
const Route$5 = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8"
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      },
      {
        title: "WaitWhat - Real-time Lecture Engagement"
      }
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss
      }
    ]
  }),
  shellComponent: RootDocument
});
function RootDocument({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("head", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AppConvexProvider, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Header, {}),
        children
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
const $$splitComponentImporter$4 = () => import("./teacher-Ci_NZFa_.mjs");
const Route$4 = createFileRoute("/teacher")({
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./join-DeV8Yywq.mjs");
const Route$3 = createFileRoute("/join")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./index-BV8GMqpf.mjs");
const Route$2 = createFileRoute("/")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./session._sessionId-DL3sEyQJ.mjs");
const Route$1 = createFileRoute("/session/$sessionId")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./teacher.session._sessionId-BunY6Dvi.mjs");
const Route = createFileRoute("/teacher/session/$sessionId")({
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const TeacherRoute = Route$4.update({
  id: "/teacher",
  path: "/teacher",
  getParentRoute: () => Route$5
});
const JoinRoute = Route$3.update({
  id: "/join",
  path: "/join",
  getParentRoute: () => Route$5
});
const IndexRoute = Route$2.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$5
});
const SessionSessionIdRoute = Route$1.update({
  id: "/session/$sessionId",
  path: "/session/$sessionId",
  getParentRoute: () => Route$5
});
const TeacherSessionSessionIdRoute = Route.update({
  id: "/session/$sessionId",
  path: "/session/$sessionId",
  getParentRoute: () => TeacherRoute
});
const TeacherRouteChildren = {
  TeacherSessionSessionIdRoute
};
const TeacherRouteWithChildren = TeacherRoute._addFileChildren(TeacherRouteChildren);
const rootRouteChildren = {
  IndexRoute,
  JoinRoute,
  TeacherRoute: TeacherRouteWithChildren,
  SessionSessionIdRoute
};
const routeTree = Route$5._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const router2 = createRouter({
    routeTree,
    context: {},
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  Route$1 as R,
  Route as a,
  router as r
};
