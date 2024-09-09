import { vi } from "vitest";

// Workaround for TypeError: window.matchMedia is not a function
// ref: https://github.com/vitest-dev/vitest/issues/821#issuecomment-1046954558
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
