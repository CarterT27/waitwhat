import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useState, useEffect, useRef } from "react";
import {
  AlertCircle,
  Send,
  Loader2,
  MessageSquare,
  ScrollText,
} from "lucide-react";

export const Route = createFileRoute("/session/$sessionId")({
  component: StudentSessionPage,
});

function StudentSessionPage() {
  const { sessionId } = Route.useParams();
  const [studentId, setStudentId] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(`studentId-${sessionId}`);
    if (stored) {
      setStudentId(stored);
    }
  }, [sessionId]);

  const session = useQuery(api.sessions.getSession, {
    sessionId: sessionId as Id<"sessions">,
  });
  const transcript = useQuery(api.transcripts.listTranscript, {
    sessionId: sessionId as Id<"sessions">,
  });
  const activeQuiz = useQuery(api.quizzes.getActiveQuiz, {
    sessionId: sessionId as Id<"sessions">,
  });
  const recentQuestions = useQuery(api.questions.listRecentQuestions, {
    sessionId: sessionId as Id<"sessions">,
  });

  const markLost = useMutation(api.lostEvents.markLost);

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (session.status === "ended") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Session Ended</h1>
          <p className="text-gray-400">
            This lecture session has been closed by the teacher.
          </p>
        </div>
      </div>
    );
  }

  const handleLostClick = async () => {
    if (studentId) {
      await markLost({
        sessionId: sessionId as Id<"sessions">,
        studentId,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Quiz Modal */}
      {activeQuiz && studentId && (
        <QuizModal
          quiz={activeQuiz}
          studentId={studentId}
        />
      )}

      <div className="max-w-4xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">Live Session</h1>
            <p className="text-sm text-gray-400">
              Code: <span className="font-mono text-blue-400">{session.code}</span>
            </p>
          </div>
          <button
            onClick={handleLostClick}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-lg hover:bg-yellow-500/20 transition-colors"
          >
            <AlertCircle className="w-5 h-5" />
            I'm Lost
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transcript */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700">
              <ScrollText className="w-5 h-5 text-cyan-400" />
              <h2 className="font-semibold text-white">Live Transcript</h2>
            </div>
            <TranscriptView transcript={transcript ?? []} />
          </div>

          {/* Q&A */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              <h2 className="font-semibold text-white">Ask AI</h2>
            </div>
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
    <div ref={scrollRef} className="h-96 overflow-y-auto p-4 space-y-2">
      {transcript.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          Waiting for transcript...
        </p>
      ) : (
        transcript.map((line) => (
          <p key={line._id} className="text-gray-300 text-sm leading-relaxed">
            {line.text}
          </p>
        ))
      )}
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
  const [isAsking, setIsAsking] = useState(false);
  const askQuestion = useMutation(api.questions.askQuestion);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [questions]);

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
    } catch (error) {
      console.error("Failed to ask question:", error);
    }
    setIsAsking(false);
  };

  return (
    <div className="flex flex-col h-96">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {questions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Ask a question about the lecture
          </p>
        ) : (
          questions.map((q) => (
            <div key={q._id} className="space-y-2">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <p className="text-blue-300 text-sm">{q.question}</p>
              </div>
              {q.answer ? (
                <div className="bg-slate-700/50 rounded-lg p-3 ml-4">
                  <p className="text-gray-300 text-sm">{q.answer}</p>
                </div>
              ) : (
                <div className="ml-4 flex items-center gap-2 text-gray-500 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Thinking...
                </div>
              )}
            </div>
          ))
        )}
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the lecture..."
            className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
          />
          <button
            type="submit"
            disabled={isAsking || !input.trim()}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white rounded-lg transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}

function QuizModal({
  quiz,
  studentId,
}: {
  quiz: {
    _id: Id<"quizzes">;
    questions: {
      prompt: string;
      choices: string[];
      correctIndex: number;
      explanation: string;
      conceptTag: string;
    }[];
  };
  studentId: string;
}) {
  const [answers, setAnswers] = useState<number[]>(
    new Array(quiz.questions.length).fill(-1)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const submitQuiz = useMutation(api.quizzes.submitQuiz);

  const handleSelectAnswer = (questionIndex: number, choiceIndex: number) => {
    if (submitted) return;
    const newAnswers = [...answers];
    newAnswers[questionIndex] = choiceIndex;
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
        answers,
      });
      setSubmitted(true);
    } catch (error) {
      if (error instanceof Error && error.message === "Already submitted") {
        setSubmitted(true);
      } else {
        console.error("Failed to submit quiz:", error);
      }
    }
    setIsSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 max-w-lg w-full text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Quiz Submitted!
          </h2>
          <p className="text-gray-400">
            Your responses have been recorded. Wait for your teacher to close the quiz.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-2xl w-full my-8">
        <h2 className="text-2xl font-bold text-white mb-6">
          Comprehension Check
        </h2>

        <div className="space-y-6">
          {quiz.questions.map((question, qi) => (
            <div key={qi} className="border-b border-slate-700 pb-6 last:border-0">
              <p className="text-white font-medium mb-4">
                {qi + 1}. {question.prompt}
              </p>
              <div className="space-y-2">
                {question.choices.map((choice, ci) => (
                  <button
                    key={ci}
                    onClick={() => handleSelectAnswer(qi, ci)}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                      answers[qi] === ci
                        ? "bg-blue-500/20 border-blue-500 text-white"
                        : "bg-slate-700/50 border-slate-600 text-gray-300 hover:border-slate-500"
                    }`}
                  >
                    <span className="font-mono text-sm mr-3">
                      {String.fromCharCode(65 + ci)}
                    </span>
                    {choice}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || answers.some((a) => a === -1)}
          className="w-full mt-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white font-semibold rounded-lg transition-colors"
        >
          {isSubmitting ? "Submitting..." : "Submit Answers"}
        </button>
      </div>
    </div>
  );
}
