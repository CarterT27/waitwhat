import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockUseQuery = vi.fn();
const mockUseMutation = vi.fn();
const mockUseAction = vi.fn();
const mockNavigate = vi.fn();

vi.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
  useMutation: (...args: unknown[]) => mockUseMutation(...args),
  useAction: (...args: unknown[]) => mockUseAction(...args),
}));

vi.mock("@tanstack/react-router", async () => {
  const actual = await vi.importActual<typeof import("@tanstack/react-router")>(
    "@tanstack/react-router"
  );

  return {
    ...actual,
    createFileRoute: () => (options: Record<string, unknown>) => ({
      options,
      useParams: () => ({ sessionId: "session-1" }),
    }),
    useNavigate: () => mockNavigate,
  };
});

describe("Teacher Quiz Launch Error UI", () => {
  beforeEach(() => {
    mockUseQuery.mockReturnValue({
      session: {
        _id: "session-1",
        code: "blue-tiger-42",
        status: "live",
        roomName: "Classroom",
      },
      activeQuiz: null,
      studentCount: 3,
      lostStudentCount: 0,
    });

    const generateAndLaunchQuiz = vi
      .fn()
      .mockRejectedValue(new Error("Quiz generation failed"));
    const closeQuiz = vi.fn();
    const endSession = vi.fn();

    mockUseMutation.mockReturnValueOnce(closeQuiz).mockReturnValueOnce(endSession);

    mockUseAction
      .mockReturnValueOnce(generateAndLaunchQuiz)
      .mockReturnValueOnce(vi.fn());
  });

  it("shows a teacher-facing error when quiz launch fails", async () => {
    const { Route } = await import("../../routes/teacher.session.$sessionId");
    const Component = (Route as any).options.component;

    render(<Component />);

    fireEvent.click(screen.getByRole("button", { name: /launch quiz/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed to launch quiz/i)).toBeInTheDocument();
    });
  });
});
