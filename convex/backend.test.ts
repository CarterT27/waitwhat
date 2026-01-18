// @vitest-environment node
import { convexTest } from "convex-test";
import { describe, test, expect } from "vitest";
import schema from "./schema";
import { api } from "./_generated/api";

const modules = import.meta.glob("./**/*.ts");

describe("Backend Logic", () => {
  test("Session Presence Flow", async () => {
    const t = convexTest(schema, modules);

    // 1. Create Session
    const { sessionId, code } = await t.mutation(api.sessions.createSession, {});
    expect(sessionId).toBeDefined();
    expect(code).toBeDefined();

    // 2. Student Joins
    const { studentId, sessionId: joinedSessionId } = await t.mutation(api.sessions.joinSession, { code });
    expect(joinedSessionId).toEqual(sessionId);
    expect(studentId).toContain("student-");

    // 3. Check Initial Count
    const count = await t.query(api.sessions.getStudentCount, { sessionId });
    expect(count).toBe(1);

    // 4. Check Initial State
    const state = await t.query(api.sessions.getStudentState, { sessionId, studentId });
    expect(state?.isLost).toBe(false);

    // 5. Mark Lost
    await t.mutation(api.sessions.setLostStatus, { sessionId, studentId, isLost: true });
    
    // 6. Check Lost Count
    const lostCount = await t.query(api.sessions.getLostStudentCount, { sessionId });
    expect(lostCount).toBe(1);

    // 7. Verify "Room Vibe" sees it
    const updatedState = await t.query(api.sessions.getStudentState, { sessionId, studentId });
    expect(updatedState?.isLost).toBe(true);
    
    // 8. Un-mark Lost
    await t.mutation(api.sessions.setLostStatus, { sessionId, studentId, isLost: false });
    const lostCount2 = await t.query(api.sessions.getLostStudentCount, { sessionId });
    expect(lostCount2).toBe(0);
  });

  test("Private Chat Privacy", async () => {
    const t = convexTest(schema, modules as any);
    const { sessionId, code } = await t.mutation(api.sessions.createSession, {});
    
    // Two students join
    const student1 = await t.mutation(api.sessions.joinSession, { code });
    const student2 = await t.mutation(api.sessions.joinSession, { code });

    // Both ask questions
    await t.mutation(api.questions.askQuestion, { 
      sessionId, 
      studentId: student1.studentId, 
      question: "Q1 from Student 1" 
    });
    
    await t.mutation(api.questions.askQuestion, { 
      sessionId, 
      studentId: student2.studentId, 
      question: "Q2 from Student 2" 
    });

    // Student 1 should only see their own
    const q1 = await t.query(api.questions.listRecentQuestions, { 
      sessionId, 
      studentId: student1.studentId 
    });
    expect(q1.length).toBe(1);
    expect(q1[0].question).toBe("Q1 from Student 1");

    // Student 2 should only see their own
    const q2 = await t.query(api.questions.listRecentQuestions, { 
      sessionId, 
      studentId: student2.studentId 
    });
    expect(q2.length).toBe(1);
    expect(q2[0].question).toBe("Q2 from Student 2");

    // Teacher (no studentId) should see all
    const allQ = await t.query(api.questions.listRecentQuestions, { 
      sessionId 
    });
    expect(allQ.length).toBe(2);
  });
});
