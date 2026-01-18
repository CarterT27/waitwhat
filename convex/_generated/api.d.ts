/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai_context from "../ai/context.js";
import type * as ai_prompts from "../ai/prompts.js";
import type * as ai_service from "../ai/service.js";
import type * as ai_types from "../ai/types.js";
import type * as http from "../http.js";
import type * as livekit from "../livekit.js";
import type * as lostEvents from "../lostEvents.js";
import type * as questions from "../questions.js";
import type * as quizzes from "../quizzes.js";
import type * as sessions from "../sessions.js";
import type * as transcripts from "../transcripts.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "ai/context": typeof ai_context;
  "ai/prompts": typeof ai_prompts;
  "ai/service": typeof ai_service;
  "ai/types": typeof ai_types;
  http: typeof http;
  livekit: typeof livekit;
  lostEvents: typeof lostEvents;
  questions: typeof questions;
  quizzes: typeof quizzes;
  sessions: typeof sessions;
  transcripts: typeof transcripts;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
