import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <section className="relative py-20 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10"></div>
        <div className="relative max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-7xl font-black text-white mb-6">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              WaitWhat
            </span>
          </h1>
          <p className="text-2xl md:text-3xl text-gray-300 mb-4 font-light">
            Real-time lecture engagement platform
          </p>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-12">
            Live transcription, AI-powered Q&A, comprehension quizzes, and "I'm
            lost" signals - all in real-time.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <Link
              to="/teacher"
              className="w-64 flex flex-col items-center gap-4 p-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
            >
              <GraduationCap className="w-16 h-16 text-cyan-400" />
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  I'm a Teacher
                </h2>
                <p className="text-gray-400 text-sm">
                  Start a lecture session
                </p>
              </div>
            </Link>

            <Link
              to="/join"
              className="w-64 flex flex-col items-center gap-4 p-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
            >
              <Users className="w-16 h-16 text-blue-400" />
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  I'm a Student
                </h2>
                <p className="text-gray-400 text-sm">Join with a code</p>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
