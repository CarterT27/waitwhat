import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useAction } from "convex/react";
import { jsPDF } from "jspdf";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useState, useEffect } from "react";
import {
  Copy,
  Check,
  MessageSquare,
  HelpCircle,
  X,
  Play,
  Loader2,
  StopCircle,
  Mic,
  Users,
  QrCode,
  Sparkles,
  RefreshCw,
  Download,
  Paperclip
} from "lucide-react";
import { TranscriptionControls } from "../components/TranscriptionControls";
import QRCode from "qrcode";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

export const Route = createFileRoute("/teacher/session/$sessionId")({
  component: TeacherSessionPage,
});

function TeacherSessionPage() {
  const { sessionId } = Route.useParams();
  const navigate = useNavigate();
  const session = useQuery(api.sessions.getSession, {
    sessionId: sessionId as Id<"sessions">,
  });
  // Lost spike stats - available for future analytics visualization
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const lostStats = useQuery(api.lostEvents.getLostSpikeStats, {
    sessionId: sessionId as Id<"sessions">,
  });
  const activeQuiz = useQuery(api.quizzes.getActiveQuiz, {
    sessionId: sessionId as Id<"sessions">,
  });
  const studentCount = useQuery(api.sessions.getStudentCount, {
    sessionId: sessionId as Id<"sessions">,
  });
  const lostStudentCount = useQuery(api.sessions.getLostStudentCount, {
    sessionId: sessionId as Id<"sessions">,
  });

  const generateAndLaunchQuiz = useMutation(api.quizzes.generateAndLaunchQuiz);
  const closeQuiz = useMutation(api.quizzes.closeQuiz);
  const endSession = useMutation(api.sessions.endSession);

  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showEndSessionModal, setShowEndSessionModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [isLaunchingQuiz, setIsLaunchingQuiz] = useState(false);
  const [showQuestionSummary, setShowQuestionSummary] = useState(false);
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const generateSessionNotesAction = useAction(api.ai.service.generateSessionNotes);

  const handleDownloadNotes = async () => {
    setIsGeneratingNotes(true);
    try {
      const markdownNotes = await generateSessionNotesAction({
        sessionId: sessionId as Id<"sessions">
      });

      const doc = new jsPDF();

      // Simple splitting of text for PDF (basic implementation)
      // For proper markdown rendering in PDF, we'd need html2canvas or more complex logic.
      // For v1, we'll strip basic markdown or just dump the text.

      doc.setFontSize(16);
      doc.text("Session Summary Notes", 20, 20);

      doc.setFontSize(12);
      const splitText = doc.splitTextToSize(markdownNotes, 170);
      doc.text(splitText, 20, 40);

      doc.save(`session-notes-${session?.code ?? "classroom"}.pdf`);

      alert("Notes downloaded successfully!");
    } catch (error: any) {
      console.error("Failed to generate notes:", error);
      alert(error.message || "Failed to generate notes. Ensure you have an API key set.");
    } finally {
      setIsGeneratingNotes(false);
    }
  };

  // Generate QR code on client side only when modal is opened or session code changes
  useEffect(() => {
    if (showQrModal && !qrDataUrl && session?.code) {
      const url = `${window.location.origin}/join?code=${session.code}`;
      QRCode.toDataURL(url, { width: 256, margin: 1 }, (err, url) => {
        if (!err) setQrDataUrl(url);
      });
    }
  }, [showQrModal, qrDataUrl, session?.code]);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-ink border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (session.status === "ended") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-milk border-2 border-ink rounded-3xl p-12 shadow-comic text-center max-w-lg w-full">
          <div className="w-20 h-20 bg-soft-purple rounded-full border-2 border-ink flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black mb-4">Class Dismissed!</h1>
          <p className="text-lg font-medium text-slate-500 mb-8">Great session today.</p>
          
          <button
            onClick={handleDownloadNotes}
            disabled={isGeneratingNotes}
            className="w-full bg-white border-2 border-ink text-ink font-bold py-3 px-6 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 mb-4 shadow-comic-sm hover:translate-y-0.5 hover:shadow-none btn-press"
          >
            {isGeneratingNotes ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating Notes...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Download Summary Notes</span>
              </>
            )}
          </button>

          <button
            onClick={() => navigate({ to: "/teacher" })}
            className="btn-primary w-full"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(session.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLaunchQuiz = async () => {
    setIsLaunchingQuiz(true);
    try {
      // Use AI to generate quiz from recent transcript
      await generateAndLaunchQuiz({
        sessionId: sessionId as Id<"sessions">,
        questionCount: 3,
        difficulty: "medium",
      });
    } catch (error) {
      console.error("Failed to launch quiz:", error);
    }
    // Keep loading state for a bit since AI generation is async
    setTimeout(() => setIsLaunchingQuiz(false), 2000);
  };

  const handleEndSession = () => {
    setShowEndSessionModal(true);
  };

  const confirmEndSession = async () => {
    // Add a small delay for the button animation
    await new Promise(resolve => setTimeout(resolve, 150));
    await endSession({ sessionId: sessionId as Id<"sessions"> });
    await navigate({ to: "/teacher" });
  };

  return (
    <div className="min-h-screen p-6 pb-20">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Helper Header */}
        <div className="flex justify-start pb-2">
          <button onClick={handleEndSession} className="flex items-center gap-2">
            <div className="bg-ink text-white px-3 py-1 rounded-lg border-2 border-transparent hover:border-coral hover:text-coral hover:bg-white transition-all transform -rotate-2">
              <span className="text-xl font-black tracking-tight">Wait</span>
            </div>
            <span className="text-xl font-black text-ink tracking-tight transform rotate-1">What</span>
          </button>
        </div>

        {/* Top Navbar Card */}
        <div className="bg-milk border-2 border-ink rounded-2xl p-4 md:p-6 shadow-comic flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-coral text-white px-4 py-1 rounded-full border-2 border-ink font-bold transform -rotate-1 shadow-comic-sm">
              LIVE
            </div>
            <h1 className="text-2xl font-black">{session.roomName || "Classroom"}</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block font-bold text-slate-500 mr-2">Join Code:</div>
            <div className="bg-mustard/20 px-4 py-2 rounded-xl border-2 border-ink border-dashed font-mono font-bold text-xl tracking-widest">
              {session.code}
            </div>
            <div className="bg-white border-2 border-ink rounded-xl px-4 py-2 shadow-comic-sm flex items-center gap-2 font-bold min-w-[100px] justify-center">
              <Users className="w-5 h-5 text-ink" />
              <span>{studentCount ?? "..."} Students</span>
            </div>
            <button
              onClick={() => setShowQrModal(true)}
              className="w-12 h-12 flex items-center justify-center bg-white border-2 border-ink rounded-xl shadow-comic-sm btn-press"
            >
              <QrCode className="text-ink w-6 h-6" />
            </button>
            <button
               onClick={() => setShowUploadModal(true)}
               className="w-12 h-12 flex items-center justify-center bg-white border-2 border-ink rounded-xl shadow-comic-sm btn-press"
               title="Upload Class Context"
            >
               <Paperclip className="text-ink w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* Left: Confusion Meter */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-milk border-2 border-ink rounded-[2rem] p-6 shadow-comic flex flex-col items-center text-center relative overflow-hidden h-full">
              <div className="absolute top-0 inset-x-0 h-4 bg-soft-purple border-b-2 border-ink" />

              <h2 className="text-xl font-black mt-2 mb-1">Room Vibe</h2>
              <p className="text-slate-500 font-bold text-sm uppercase tracking-wide opacity-70">Confusion Level</p>

              <div className="flex-1 flex flex-col items-center justify-center relative w-full py-2">
                {/* Background Circles */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-48 h-48 bg-mustard rounded-full blur-3xl"
                  />
                </div>

                <motion.div
                  animate={{
                    scale: 1 + (lostStudentCount || 0) * 0.1,
                    rotate: (lostStudentCount || 0) * 5
                  }}
                  className={clsx(
                    "w-32 h-32 border-4 border-ink rounded-full flex items-center justify-center relative z-10 transition-colors duration-500 shadow-comic",
                    (lostStudentCount || 0) > 3 ? "bg-coral" : (lostStudentCount || 0) > 0 ? "bg-mustard" : "bg-white"
                  )}
                >
                  {/* Face Expression */}
                  {(lostStudentCount || 0) > 3 ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-4"><div className="w-3 h-3 rounded-full bg-ink" /><div className="w-3 h-3 rounded-full bg-ink" /></div>
                      <div className="w-8 h-3 bg-ink rounded-full" />
                    </div>
                  ) : (lostStudentCount || 0) > 0 ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-3"><div className="w-3 h-3 rounded-full bg-ink" /><div className="w-3 h-3 rounded-full bg-ink" /></div>
                      <div className="w-6 h-1 bg-ink" />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex gap-4"><div className="w-3 h-6 bg-ink rounded-full" /><div className="w-3 h-6 bg-ink rounded-full" /></div>
                      <div className="w-8 h-4 border-b-4 border-ink rounded-b-full" />
                    </div>
                  )}
                </motion.div>

                <div className="mt-4 flex gap-2 items-end">
                  <span className="text-4xl font-black tabular-nums leading-none">
                    {lostStudentCount ?? 0}
                  </span>
                  <span className="font-bold text-slate-500 mb-1">confused</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right: Actions */}
          <div className="lg:col-span-8 flex flex-col gap-4">

            {/* Quiz Control Card */}
            <div className="bg-mustard border-2 border-ink rounded-[2rem] p-8 shadow-comic relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 opacity-20 transform rotate-12">
                <HelpCircle className="w-64 h-64" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-black">Pop Quiz</h2>
                  <div className="bg-white px-3 py-1 rounded-lg border-2 border-ink font-bold text-sm shadow-comic-sm">
                    {activeQuiz ? "ACTIVE NOW" : "READY"}
                  </div>
                </div>

                {activeQuiz ? (
                  <div className="bg-white border-2 border-ink rounded-2xl p-6 shadow-comic-sm">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-lg">Live Results</h3>
                      <button
                        onClick={() => closeQuiz({ sessionId: sessionId as Id<"sessions"> })}
                        className="px-4 py-2 bg-ink text-white rounded-lg font-bold hover:bg-slate-800"
                      >
                        Close Quiz
                      </button>
                    </div>
                    <QuizStatsPanel quizId={activeQuiz._id} />
                  </div>
                ) : (
                  <div className="flex flex-col items-start gap-6">
                    <p className="font-medium text-ink/80 text-lg max-w-md">
                      Generate a quick 2-question quiz based on the last 5 minutes of transcript.
                    </p>
                    <button
                      onClick={handleLaunchQuiz}
                      disabled={isLaunchingQuiz}
                      className="bg-white text-ink w-full md:w-auto px-8 py-4 rounded-xl border-2 border-ink font-black text-xl shadow-comic flex items-center gap-3 disabled:opacity-50 disabled:shadow-none disabled:translate-y-0 btn-press"
                    >
                      {isLaunchingQuiz ? <Loader2 className="animate-spin" /> : <Play className="fill-current" />}
                      Launch Quiz
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Live Transcription Card */}
            <div className="bg-soft-purple/20 border-2 border-ink rounded-[2rem] p-6 shadow-comic">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-soft-purple border-2 border-ink rounded-xl flex items-center justify-center">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-black">Live Transcription</h2>
              </div>
              <TranscriptionControls sessionId={sessionId as Id<"sessions">} />
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowQuestionSummary(true)}
                className="bg-white border-2 border-ink rounded-2xl p-4 shadow-comic hover:shadow-none hover:translate-y-1 hover:translate-x-1 transition-all cursor-pointer group flex items-center gap-4 w-full text-left"
              >
                <div className="w-12 h-12 bg-soft-purple border-2 border-ink rounded-xl flex items-center justify-center group-hover:-rotate-6 transition-transform shrink-0">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">Question Summary</h3>
                  <p className="text-slate-500 text-sm">AI analysis of student questions</p>
                </div>
              </button>
              <button
                onClick={handleEndSession}
                className="bg-white border-2 border-ink rounded-2xl p-4 shadow-comic hover:shadow-none hover:translate-y-1 hover:translate-x-1 transition-all cursor-pointer group flex items-center gap-4 w-full"
              >
                <div className="w-12 h-12 bg-white border-2 border-ink rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform shadow-sm shrink-0">
                  <StopCircle className="w-6 h-6 text-red-500" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-lg text-red-600 leading-tight">End Class</h3>
                  <p className="text-red-400/80 text-sm font-medium">Close session</p>
                </div>
              </button>
            </div>

          </div>
        </div>
      </div>

      <AnimatePresence>
        {showQrModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setShowQrModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border-4 border-ink p-8 rounded-[2.5rem] shadow-comic max-w-sm w-full text-center relative"
            >
              <button
                onClick={() => setShowQrModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors border-2 border-transparent hover:border-ink"
              >
                <X className="w-6 h-6" />
              </button>

              <h3 className="text-2xl font-black mb-2">Join Class</h3>
              <p className="text-slate-500 font-bold mb-6">Scan to join immediately</p>

              <div className="bg-white p-4 rounded-xl border-2 border-ink inline-block mb-6 shadow-sm">
                <div style={{ height: "auto", margin: "0 auto", maxWidth: 200, width: "100%" }}>
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Join Code QR"
                      className="w-full h-auto"
                    />
                  ) : (
                    <div className="w-full h-48 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 justify-center bg-milk p-3 rounded-xl border-2 border-ink border-dashed">
                <span className="font-mono font-bold text-xl tracking-widest">{session.code}</span>
                <button
                  onClick={handleCopyCode}
                  className="p-2 hover:bg-white rounded-lg transition-colors border-2 border-transparent hover:border-ink"
                  title="Copy Code"
                >
                  {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showEndSessionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setShowEndSessionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20, rotate: -2 }}
              animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border-4 border-ink p-8 rounded-[2.5rem] shadow-comic max-w-md w-full text-center relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-4 bg-coral border-b-4 border-ink" />
              
              <div className="w-20 h-20 bg-red-100 rounded-full border-4 border-ink flex items-center justify-center mx-auto mb-6 relative">
                 <StopCircle className="w-10 h-10 text-red-500" />
                 <div className="absolute -right-2 -top-2 bg-ink text-white text-xs font-black px-2 py-1 rounded-lg transform rotate-12">
                   WAIT!
                 </div>
              </div>

              <h3 className="text-3xl font-black mb-4 text-ink">Wrap it up?</h3>
              <p className="text-slate-500 font-bold mb-8 text-lg leading-relaxed">
                Are you sure you want to end this session? <br/>
                <span className="text-coral">All students will be disconnected.</span>
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowEndSessionModal(false)}
                  className="flex-1 py-4 px-6 rounded-xl border-2 border-slate-200 font-bold text-slate-500 hover:border-ink hover:text-ink hover:bg-slate-50 transition-all text-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmEndSession}
                  className="flex-1 py-4 px-6 rounded-xl border-2 border-ink bg-coral text-white font-black shadow-comic-sm hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-2 text-lg group"
                >
                  <span>End It</span>
                  <div className="bg-white/20 p-1 rounded-full group-hover:rotate-90 transition-transform">
                    <X className="w-4 h-4" />
                  </div>
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
        {showUploadModal && (
          <UploadContextModal 
            onClose={() => setShowUploadModal(false)} 
            sessionId={sessionId as Id<"sessions">}
            initialContext={session.contextText || ""}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showQuestionSummary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setShowQuestionSummary(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border-4 border-ink p-8 rounded-[2.5rem] shadow-comic max-w-lg w-full relative"
            >
              <button
                onClick={() => setShowQuestionSummary(false)}
                className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors border-2 border-transparent hover:border-ink"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-soft-purple border-2 border-ink rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black">Question Summary</h3>
                  <p className="text-slate-500 font-medium">AI analysis of student confusion</p>
                </div>
              </div>

              <QuestionSummaryPanel sessionId={sessionId as Id<"sessions">} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function UploadContextModal({ onClose, sessionId, initialContext }: { onClose: () => void, sessionId: Id<"sessions">, initialContext: string }) {
  const [text, setText] = useState(initialContext);
  const uploadSlides = useMutation(api.sessions.uploadSlides);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await uploadSlides({ sessionId, slidesText: text });
    setIsSaving(false);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white border-4 border-ink p-6 rounded-[2.5rem] shadow-comic max-w-2xl w-full relative flex flex-col max-h-[80vh]"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors border-2 border-transparent hover:border-ink"
        >
          <X className="w-6 h-6" />
        </button>

        <h3 className="text-2xl font-black mb-1">Class Context</h3>
        <p className="text-slate-500 font-bold mb-4">Paste lecture notes, slide text, or summaries here.</p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste text here..."
          className="flex-1 w-full border-2 border-ink rounded-xl p-4 font-medium resize-none focus:ring-2 focus:ring-soft-purple focus:outline-none mb-4 min-h-[200px]"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl border-2 border-slate-200 font-bold text-slate-500 hover:border-ink hover:text-ink hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 rounded-xl border-2 border-ink bg-soft-purple text-white font-bold shadow-comic-sm hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Context"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function QuizStatsPanel({ quizId }: { quizId: Id<"quizzes"> }) {
  const stats = useQuery(api.quizzes.getQuizStats, { quizId });

  if (!stats) return <div className="text-center py-8 font-bold text-slate-400 animate-pulse">Waiting for responses...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="text-5xl font-black">{stats.totalResponses}</div>
        <div className="text-sm font-bold text-slate-500 leading-tight">Student<br />Responses</div>
      </div>

      <div className="space-y-8 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
        {stats.questions.map((q: any, i: number) => (
          <div key={i} className="pb-2">
            <p className="font-bold mb-4 text-lg">{i + 1}. {q.prompt}</p>
            <div className="flex gap-3 w-full">
              {stats.choiceDistributions[i].map((count: number, j: number) => {
                const isCorrect = j === q.correctIndex;
                const percent = stats.totalResponses > 0 ? Math.round((count / stats.totalResponses) * 100) : 0;

                return (
                  <div
                    key={j}
                    className={clsx(
                      "flex-1 min-w-0 relative h-16 rounded-xl border-2 overflow-hidden group transition-all",
                      isCorrect ? "border-green-500 bg-green-50/50" : "border-slate-200 bg-slate-50"
                    )}
                  >
                    {/* Vertical Bar Background */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${percent}%` }}
                      transition={{ type: "spring", bounce: 0, duration: 0.8 }}
                      className={clsx(
                        "absolute bottom-0 inset-x-0 opacity-20 transition-all",
                        isCorrect ? "bg-green-500" : "bg-slate-400"
                      )}
                    />

                    {/* Content */}
                    <div className="relative z-10 w-full h-full flex items-center justify-center gap-3">
                      <span className={clsx(
                        "font-black text-lg px-2.5 py-0.5 rounded-lg border-2",
                        isCorrect ? "bg-green-100 border-green-200 text-green-800" : "bg-white border-slate-200 text-slate-600"
                      )}>
                        {String.fromCharCode(65 + j)}
                        {isCorrect && <Check className="w-3.5 h-3.5 inline ml-1" />}
                      </span>
                      <span className={clsx("text-2xl font-black", isCorrect ? "text-green-900" : "text-slate-700")}>
                        {count}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuestionSummaryPanel({ sessionId }: { sessionId: Id<"sessions"> }) {
  const [summary, setSummary] = useState<{
    summary: string;
    themes: Array<{ theme: string; questionCount: number; suggestedAction: string }>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSummary = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/questionSummary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate summary");
      }

      const data = await response.json();
      setSummary(data);
    } catch (err) {
      // For now, show a placeholder since we need to call the action differently
      // The actual implementation would use Convex's action system
      setError("Question summary generation is being set up. Please check back soon!");
    }
    setIsLoading(false);
  };

  // Auto-generate on mount
  useEffect(() => {
    // For MVP, show a helpful message about how to use this feature
    setSummary({
      summary: "This feature analyzes student questions to identify common points of confusion. Generate a summary to see AI-powered insights about what your students are struggling with.",
      themes: [],
    });
  }, []);

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-soft-purple" />
          <span className="ml-3 font-bold text-slate-500">Analyzing questions...</span>
        </div>
      ) : error ? (
        <div className="bg-coral/10 border-2 border-coral rounded-xl p-4 text-center">
          <p className="text-coral font-bold">{error}</p>
          <button
            onClick={generateSummary}
            className="mt-3 px-4 py-2 bg-coral text-white rounded-lg font-bold hover:bg-coral/90"
          >
            Try Again
          </button>
        </div>
      ) : summary ? (
        <>
          <div className="bg-soft-purple/10 border-2 border-soft-purple/30 rounded-xl p-4">
            <p className="text-ink font-medium">{summary.summary}</p>
          </div>

          {summary.themes.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-600">Common Confusion Points:</h4>
              {summary.themes.map((theme, i) => (
                <div key={i} className="bg-milk border-2 border-ink rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-lg">{theme.theme}</span>
                    <span className="bg-mustard/20 px-2 py-1 rounded-lg text-sm font-bold">
                      {theme.questionCount} questions
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm">{theme.suggestedAction}</p>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={generateSummary}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-ink text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh Analysis
          </button>
        </>
      ) : null}
    </div>
  );
}
