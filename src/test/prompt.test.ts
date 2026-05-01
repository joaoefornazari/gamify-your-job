import { describe, it, expect } from "vitest";
import { bragLogPrompt } from "../utils/prompt";
import type { GameState } from "../types/game";

function createTestState(): GameState {
  return {
    character: {
      name: "JWolf",
      level: 5,
      total_xp: 2500,
      title: "System Stabilizer",
      next_level_xp_threshold: 500,
      cosmetics: [],
    },
    stats: {
      knowledge: { xp: 100 },
      focus: { xp: 200 },
      delivery: { xp: 150 },
      product_sense: { xp: 80 },
      ownership: { xp: 120 },
      alignment: { xp: 90 },
    },
    missions: [
      {
        id: "mission-1",
        priority: 1,
        title: "Implement auth system",
        description: "Add JWT authentication",
        notes: ["Started implementation"],
        date: "2026-04-28T10:00:00Z",
        status: "finished",
        xp_awarded: 50,
        stat_distribution: { knowledge: 30, delivery: 20 },
        tags: ["backend"],
      },
    ],
    rewards: [],
    week_log: [
      {
        id: "log-1",
        action: "mission_completed",
        missionId: "mission-1",
        details: { title: "Implement auth system", xp: 50 },
        timestamp: "2026-04-29T14:30:00Z",
      },
    ],
  };
}

describe("bragLogPrompt", () => {
  it("includes character information", () => {
    const state = createTestState();
    const prompt = bragLogPrompt(state);

    expect(prompt).toContain("JWolf");
    expect(prompt).toContain("Level 5");
    expect(prompt).toContain("2500 XP");
  });

  it("includes week log entries with mission titles", () => {
    const state = createTestState();
    const prompt = bragLogPrompt(state);

    expect(prompt).toContain("completed a mission");
    expect(prompt).toContain("Implement auth system");
    expect(prompt).toContain("2026-04-29T14:30:00Z");
  });

  it("instructs to focus on impact rather than task listing", () => {
    const state = createTestState();
    const prompt = bragLogPrompt(state);

    expect(prompt).toContain("impact");
    expect(prompt).toContain("not just task listing");
    expect(prompt).toContain("senior-level");
    expect(prompt).toContain("business or user impact");
  });

  it("handles empty week_log gracefully", () => {
    const state = createTestState();
    state.week_log = [];
    const prompt = bragLogPrompt(state);

    expect(prompt).toContain("No week logs recorded yet");
  });
});
