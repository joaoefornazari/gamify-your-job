import { act, renderHook } from "@testing-library/react";
import { useGameState } from "../hooks/useGameState";
import type { GameState } from "../types/game";

function buildState(overrides?: Partial<GameState>): GameState {
  return {
    character: {
      name: "JWolf",
      level: 0,
      total_xp: 0,
      title: "System Stabilizer",
      next_level_xp_threshold: 0,
      cosmetics: [],
    },
    stats: {
      knowledge: { xp: 0 },
      focus: { xp: 0 },
      delivery: { xp: 0 },
      product_sense: { xp: 0 },
      ownership: { xp: 0 },
      alignment: { xp: 0 },
    },
    missions: [],
    rewards: [],
    week_log: [],
    ...overrides,
  };
}

describe("useGameState edge cases", () => {
  it("resets to defaults when localStorage contains invalid JSON", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    localStorage.setItem("rpg_state", "{bad json");

    const { result } = renderHook(() => useGameState());

    expect(result.current.state.character.name).toBe("JWolf");
    expect(result.current.state.missions).toEqual([]);
    expect(() => JSON.parse(localStorage.getItem("rpg_state") ?? "")).not.toThrow();
    expect(warnSpy).toHaveBeenCalled();
  });

  it("recalculates imported progress and normalizes malformed mission data", () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.importState({
        ...buildState(),
        character: {
          name: 99 as never,
          level: 0,
          total_xp: 240,
          title: null as never,
          next_level_xp_threshold: 0,
          cosmetics: [{ name: 4, value: true, emoji: "🛡️" }] as never,
        },
        missions: [
          {
            id: "m-1",
            title: 7,
            description: null,
            priority: "high",
            notes: ["kept", 3],
            date: 1,
            status: "unknown",
            tags: ["ui", 2],
          },
        ] as never,
      });
    });

    expect(result.current.state.character.name).toBe("JWolf");
    expect(result.current.state.character.title).toBe("System Stabilizer");
    expect(result.current.state.character.level).toBe(2);
    expect(result.current.state.character.next_level_xp_threshold).toBe(144);
    expect(result.current.state.character.cosmetics).toEqual([
      { name: "Unknown", value: "", emoji: "🛡️" },
    ]);
    expect(result.current.state.missions[0]).toMatchObject({
      id: "m-1",
      title: "Untitled mission",
      description: "",
      priority: 1,
      notes: ["kept"],
      status: "ready",
      tags: ["ui"],
    });
    expect(typeof result.current.state.missions[0]?.date).toBe("string");
  });

  it("assigns unique mission IDs when imported missions collide", () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.setState(
        buildState({
          missions: [
            {
              id: "dup",
              title: "First",
              description: "",
              date: "2026-04-16T00:00:00.000Z",
              status: "ready",
              tags: [],
              priority: 1,
              notes: [],
            },
            {
              id: "dup",
              title: "Second",
              description: "",
              date: "2026-04-16T00:00:00.000Z",
              status: "ready",
              tags: [],
              priority: 2,
              notes: [],
            },
          ],
        })
      );
    });

    const ids = result.current.state.missions.map((mission) => mission.id);

    expect(new Set(ids).size).toBe(2);
    expect(result.current.state.missions.map((mission) => mission.title)).toEqual(
      ["First", "Second"]
    );
  });

  it("logs mission_added when adding a mission", () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.addMission({
        id: "m-new",
        title: "New Mission",
        description: "Test",
        notes: [],
        date: "2026-04-20",
        status: "ready",
        priority: 1,
        tags: [],
      });
    });

    expect(result.current.state.week_log).toHaveLength(1);
    expect(result.current.state.week_log[0].action).toBe("mission_added");
    expect(result.current.state.week_log[0].missionId).toBe("m-new");
  });

  it("logs mission_toggled when toggling mission status", () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.setState(
        buildState({
          missions: [
            {
              id: "m-1",
              title: "Test",
              description: "",
              notes: [],
              date: "2026-04-20",
              status: "ready",
              priority: 1,
              tags: [],
            },
          ],
        })
      );
    });

    act(() => {
      result.current.toggleMissionInProgress("m-1");
    });

    expect(result.current.state.week_log).toHaveLength(1);
    expect(result.current.state.week_log[0].action).toBe("mission_toggled");
    expect(result.current.state.week_log[0].details).toMatchObject({
      oldStatus: "ready",
      newStatus: "in progress",
    });
  });

  it("logs note_added when adding a note", () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.setState(
        buildState({
          missions: [
            {
              id: "m-1",
              title: "Test",
              description: "",
              notes: [],
              date: "2026-04-20",
              status: "ready",
              priority: 1,
              tags: [],
            },
          ],
        })
      );
    });

    act(() => {
      result.current.addNoteToMission("m-1", "Test note");
    });

    expect(result.current.state.week_log).toHaveLength(1);
    expect(result.current.state.week_log[0].action).toBe("note_added");
    expect(result.current.state.week_log[0].details).toMatchObject({
      note: "Test note",
    });
  });

  it("logs note_deleted when deleting a note", () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.setState(
        buildState({
          missions: [
            {
              id: "m-1",
              title: "Test",
              description: "",
              notes: ["Note 1", "Note 2"],
              date: "2026-04-20",
              status: "ready",
              priority: 1,
              tags: [],
            },
          ],
        })
      );
    });

    act(() => {
      result.current.deleteNoteFromMission("m-1", 0);
    });

    expect(result.current.state.week_log).toHaveLength(1);
    expect(result.current.state.week_log[0].action).toBe("note_deleted");
    expect(result.current.state.week_log[0].details).toMatchObject({
      noteIndex: 0,
      deletedNote: "Note 1",
    });
  });

  it("logs reward_spent when spending a reward", () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.setState(
        buildState({
          rewards: [
            {
              description: "Free coffee",
              time: 3600,
              used: false,
            },
          ],
        })
      );
    });

    act(() => {
      result.current.spendReward(0);
    });

    expect(result.current.state.week_log).toHaveLength(1);
    expect(result.current.state.week_log[0].action).toBe("reward_spent");
    expect(result.current.state.week_log[0].details).toMatchObject({
      rewardDescription: "Free coffee",
    });
    expect(result.current.state.rewards[0].used).toBe(true);
  });
});
