import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock sessionStorage
if (typeof window !== "undefined") {
  const sessionStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
      get length() {
        return Object.keys(store).length;
      },
      key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
    };
  })();

  Object.defineProperty(window, "sessionStorage", {
    value: sessionStorageMock,
    writable: true,
  });

  // Mock navigator.clipboard
  Object.assign(navigator, {
    clipboard: {
      writeText: vi.fn(() => Promise.resolve()),
      readText: vi.fn(() => Promise.resolve("")),
    },
  });

  // Mock window.confirm
  window.confirm = vi.fn(() => true);

  // Mock window.alert
  window.alert = vi.fn();
}

// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
  if (typeof window !== "undefined") {
    window.sessionStorage.clear();
  }
});
