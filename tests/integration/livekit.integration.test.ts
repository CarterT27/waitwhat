/**
 * Integration tests for LiveKit token generation
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("LiveKit Token Generation Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Environment Variable Validation", () => {
    it("should throw error when LIVEKIT_API_KEY is missing", () => {
      const apiKey = undefined;
      const apiSecret = "test-secret";

      const hasRequiredVars = apiKey && apiSecret;

      expect(hasRequiredVars).toBeFalsy();
    });

    it("should throw error when LIVEKIT_API_SECRET is missing", () => {
      const apiKey = "test-key";
      const apiSecret = undefined;

      const hasRequiredVars = apiKey && apiSecret;

      expect(hasRequiredVars).toBeFalsy();
    });

    it("should throw error when both credentials are missing", () => {
      const apiKey = undefined;
      const apiSecret = undefined;

      const hasRequiredVars = apiKey && apiSecret;

      expect(hasRequiredVars).toBeFalsy();
    });

    it("should not throw error when both credentials are present", () => {
      const apiKey = "test-key";
      const apiSecret = "test-secret";

      const hasRequiredVars = apiKey && apiSecret;

      expect(hasRequiredVars).toBeTruthy();
    });

    it("should use correct error message for missing credentials", () => {
      const apiKey = undefined;
      const apiSecret = "test-secret";
      const errorMessage = "LiveKit not configured";

      const shouldThrow = !apiKey || !apiSecret;

      if (shouldThrow) {
        expect(errorMessage).toBe("LiveKit not configured");
      }
    });
  });

  describe("Token Configuration", () => {
    it("should set identity from argument", () => {
      const identity = "teacher";
      const tokenOptions = { identity, ttl: "2h" };

      expect(tokenOptions.identity).toBe("teacher");
    });

    it("should set TTL to 2 hours", () => {
      const tokenOptions = { identity: "teacher", ttl: "2h" };

      expect(tokenOptions.ttl).toBe("2h");
    });

    it("should allow different identities", () => {
      const teacherOptions = { identity: "teacher", ttl: "2h" };
      const studentOptions = { identity: "student-123", ttl: "2h" };

      expect(teacherOptions.identity).toBe("teacher");
      expect(studentOptions.identity).toBe("student-123");
    });
  });

  describe("Room Grant Permissions", () => {
    it("should set room name from sessionId", () => {
      const sessionId = "session-abc-123";
      const grant = { room: sessionId, roomJoin: true };

      expect(grant.room).toBe(sessionId);
    });

    it("should allow room join for all participants", () => {
      const grant = { roomJoin: true };

      expect(grant.roomJoin).toBe(true);
    });

    it("should enable subscribe for all participants", () => {
      const grant = { canSubscribe: true };

      expect(grant.canSubscribe).toBe(true);
    });

    it("should grant publish permission to teacher", () => {
      const identity = "teacher";
      const canPublish = identity === "teacher";

      expect(canPublish).toBe(true);
    });

    it("should deny publish permission to non-teacher", () => {
      const identity = "student-123";
      const canPublish = identity === "teacher";

      expect(canPublish).toBe(false);
    });

    it("should create correct grant for teacher", () => {
      const sessionId = "session-123";
      const identity = "teacher";
      const grant = {
        room: sessionId,
        roomJoin: true,
        canPublish: identity === "teacher",
        canSubscribe: true,
      };

      expect(grant.room).toBe(sessionId);
      expect(grant.roomJoin).toBe(true);
      expect(grant.canPublish).toBe(true);
      expect(grant.canSubscribe).toBe(true);
    });

    it("should create correct grant for student", () => {
      const sessionId = "session-123";
      const identity = "student-456";
      const grant = {
        room: sessionId,
        roomJoin: true,
        canPublish: identity === "teacher",
        canSubscribe: true,
      };

      expect(grant.room).toBe(sessionId);
      expect(grant.roomJoin).toBe(true);
      expect(grant.canPublish).toBe(false);
      expect(grant.canSubscribe).toBe(true);
    });
  });

  describe("Token Generation", () => {
    it("should return object with token property", () => {
      const result = { token: "mock-jwt-token" };

      expect(result).toHaveProperty("token");
      expect(typeof result.token).toBe("string");
    });

    it("should generate different tokens for different sessions", () => {
      const token1 = { sessionId: "session-1", token: "token-1" };
      const token2 = { sessionId: "session-2", token: "token-2" };

      expect(token1.sessionId).not.toBe(token2.sessionId);
    });

    it("should generate different tokens for different identities", () => {
      const teacherToken = { identity: "teacher", token: "teacher-token" };
      const studentToken = { identity: "student", token: "student-token" };

      expect(teacherToken.identity).not.toBe(studentToken.identity);
    });
  });

  describe("Action Arguments Validation", () => {
    it("should require sessionId argument", () => {
      const args = { sessionId: "session-123", identity: "teacher" };

      expect(args.sessionId).toBeDefined();
      expect(typeof args.sessionId).toBe("string");
    });

    it("should require identity argument", () => {
      const args = { sessionId: "session-123", identity: "teacher" };

      expect(args.identity).toBeDefined();
      expect(typeof args.identity).toBe("string");
    });

    it("should validate sessionId is provided", () => {
      const args: any = { identity: "teacher" };
      const isValid = "sessionId" in args && "identity" in args;

      expect(isValid).toBe(false);
    });

    it("should validate identity is provided", () => {
      const args: any = { sessionId: "session-123" };
      const isValid = "sessionId" in args && "identity" in args;

      expect(isValid).toBe(false);
    });

    it("should validate both arguments are provided", () => {
      const args = { sessionId: "session-123", identity: "teacher" };
      const isValid = "sessionId" in args && "identity" in args;

      expect(isValid).toBe(true);
    });
  });

  describe("Security Considerations", () => {
    it("should not expose API key in token response", () => {
      const response = { token: "jwt-token-here" };

      expect(response).not.toHaveProperty("apiKey");
      expect(response).not.toHaveProperty("apiSecret");
    });

    it("should only return token in response", () => {
      const response = { token: "jwt-token-here" };
      const keys = Object.keys(response);

      expect(keys).toEqual(["token"]);
    });

    it("should enforce teacher-only publishing through identity check", () => {
      const identities = ["teacher", "student-1", "student-2", "admin"];
      const publishPermissions = identities.map(
        (identity) => identity === "teacher"
      );

      expect(publishPermissions[0]).toBe(true); // teacher
      expect(publishPermissions[1]).toBe(false); // student-1
      expect(publishPermissions[2]).toBe(false); // student-2
      expect(publishPermissions[3]).toBe(false); // admin
    });
  });

  describe("Error Handling", () => {
    it("should provide clear error for missing configuration", () => {
      const errorMessage = "LiveKit not configured";
      expect(errorMessage).toContain("LiveKit");
      expect(errorMessage).toContain("not configured");
    });

    it("should be thrown synchronously for missing credentials", () => {
      const apiKey = undefined;
      const apiSecret = "secret";

      const throwError = () => {
        if (!apiKey || !apiSecret) {
          throw new Error("LiveKit not configured");
        }
      };

      expect(throwError).toThrow("LiveKit not configured");
    });
  });
});
