import { Link } from "@tanstack/react-router";

export default function Header() {
  return (
    <header className="px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <div className="absolute inset-0 bg-lavender-bg/80 backdrop-blur-sm -z-10" />

      <Link to="/" className="flex items-center gap-2 group">
        <div className="bg-ink text-white px-3 py-1 rounded-lg border-2 border-transparent group-hover:border-coral group-hover:text-coral group-hover:bg-white transition-all transform -rotate-2">
          <span className="text-xl font-black tracking-tight">Wait</span>
        </div>
        <span className="text-xl font-black text-ink tracking-tight transform rotate-1">What</span>
      </Link>

      <nav className="flex items-center gap-4">
        <Link
          to="/teacher"
          className="px-4 py-2 font-bold text-ink hover:text-coral transition-colors"
          activeProps={{ className: "!text-coral underline decoration-wavy decoration-2" }}
        >
          Teacher
        </Link>
        <Link
          to="/join"
          className="px-5 py-2 bg-white border-2 border-ink rounded-full font-bold text-ink shadow-comic-sm hover:shadow-comic hover:-translate-y-0.5 transition-all"
          activeProps={{ className: "!bg-coral !text-white !border-ink" }}
        >
          Join Session
        </Link>
      </nav>
    </header>
  );
}
