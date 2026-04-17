import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  localStorage.clear();

  vi.stubGlobal("alert", vi.fn());
  vi.stubGlobal("navigator", {
    ...navigator,
    clipboard: {
      writeText: vi.fn(),
    },
  });

  vi.stubGlobal("URL", {
    ...URL,
    createObjectURL: vi.fn(() => "blob:mock"),
    revokeObjectURL: vi.fn(),
  });
});
