import { Link } from "@tanstack/react-router";

export default function Header() {
  return (
    <header className="px-6 py-4 flex items-center justify-between bg-slate-900/80 backdrop-blur-sm border-b border-slate-800">
      <Link to="/" className="flex items-center gap-2">
        <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          WaitWhat
        </span>
      </Link>
      <nav className="flex items-center gap-4">
        <Link
          to="/teacher"
          className="text-sm text-gray-400 hover:text-white transition-colors"
          activeProps={{ className: "text-sm text-cyan-400 hover:text-cyan-300 transition-colors" }}
        >
          Teacher
        </Link>
        <Link
          to="/join"
          className="text-sm text-gray-400 hover:text-white transition-colors"
          activeProps={{ className: "text-sm text-blue-400 hover:text-blue-300 transition-colors" }}
        >
          Join Session
        </Link>
      </nav>
    </header>
  );
}
