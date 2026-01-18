"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { api } from "./_generated/api";


export const generateSessionNotes = action({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    // 1. Fetch context (using internal query)
    const data = await ctx.runQuery(api.sessions.getSessionContext, {
      sessionId: args.sessionId,
    });

    if (!data) {
      throw new Error("Session not found");
    }

    const { uploadedContext, transcript } = data;

    if (!uploadedContext && !transcript) {
        throw new Error("No context available to generate notes. Please upload slides or ensure transcription is active.");
    }

    // 2. Call Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not configured in Convex dashboard.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Use flash for speed and long context
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an expert educational assistant.
      Here is the context for a class session:

      --- TEACHER SLIDES / CONTEXT ---
      ${uploadedContext || "(No uploaded context)"}

      --- TRANSCRIPT ---
      ${transcript || "(No transcript available)"}

      Please generate a comprehensive, high-level summary of this session in Markdown format.
      Include:
      - Key Topics Covered
      - Important Definitions
      - Summary of Discussions
      - Action Items / Homework (if mentioned)
      
      Format with clear headers and bullet points.
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error("Failed to generate notes with AI. Please try again later.");
    }
  },
});


