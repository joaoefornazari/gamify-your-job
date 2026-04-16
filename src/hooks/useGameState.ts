import { useEffect, useState } from "react";
import type { GameState, Mission, Reward, StatKey } from "../types/game";
import { recalculateGameState } from "../utils/recalculate";

const STORAGE_KEY = "rpg_state";
const STAT_KEYS: StatKey[] = [
  "knowledge",
  "focus",
  "delivery",
  "product_sense",
  "ownership",
  "alignment",
];

function createDefaultState(): GameState {
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
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeMission(value: unknown): Mission | null {
  if (!isRecord(value)) {
    return null;
  }

  return {
    id: typeof value.id === "string" ? value.id : crypto.randomUUID(),
    priority: typeof value.priority === "number" ? value.priority : 1,
    title: typeof value.title === "string" ? value.title : "Untitled mission",
    description:
      typeof value.description === "string" ? value.description : "",
    notes: Array.isArray(value.notes)
      ? value.notes.filter((note): note is string => typeof note === "string")
      : [],
    date: typeof value.date === "string" ? value.date : new Date().toISOString(),
    status:
      value.status === "in progress" ||
      value.status === "finished" ||
      value.status === "ready" ||
      value.status === "split"
        ? value.status
        : "ready",
    xp_awarded:
      typeof value.xp_awarded === "number" ? value.xp_awarded : undefined,
    stat_distribution: isRecord(value.stat_distribution)
      ? Object.fromEntries(
          Object.entries(value.stat_distribution).filter(
            ([key, amount]) =>
              STAT_KEYS.includes(key as StatKey) && typeof amount === "number"
          )
        )
      : undefined,
    tags: Array.isArray(value.tags)
      ? value.tags.filter((tag): tag is string => typeof tag === "string")
      : [],
  };
}

function ensureUniqueMissionIds(missions: Mission[]): Mission[] {
  const seenIds = new Set<string>();

  return missions.map((mission) => {
    if (!mission.id || seenIds.has(mission.id)) {
      const uniqueId = crypto.randomUUID();
      seenIds.add(uniqueId);
      return {
        ...mission,
        id: uniqueId,
      };
    }

    seenIds.add(mission.id);
    return mission;
  });
}

function normalizeReward(value: unknown): Reward | null {
  if (!isRecord(value)) {
    return null;
  }

  return {
    description:
      typeof value.description === "string" ? value.description : "",
    time: typeof value.time === "number" ? value.time : 0,
    used: typeof value.used === "boolean" ? value.used : false,
  };
}

function normalizeGameState(value: unknown): GameState {
  const fallback = createDefaultState();

  if (!isRecord(value)) {
    return fallback;
  }

  const character = isRecord(value.character) ? value.character : {};
  const stats = isRecord(value.stats) ? value.stats : {};

  return {
    character: {
      name:
        typeof character.name === "string"
          ? character.name
          : fallback.character.name,
      level:
        typeof character.level === "number"
          ? character.level
          : fallback.character.level,
      total_xp:
        typeof character.total_xp === "number"
          ? character.total_xp
          : fallback.character.total_xp,
      title:
        typeof character.title === "string"
          ? character.title
          : fallback.character.title,
      next_level_xp_threshold:
        typeof character.next_level_xp_threshold === "number"
          ? character.next_level_xp_threshold
          : fallback.character.next_level_xp_threshold,
      cosmetics: Array.isArray(character.cosmetics)
        ? character.cosmetics.filter(isRecord).map((cosmetic) => ({
            name:
              typeof cosmetic.name === "string" ? cosmetic.name : "Unknown",
            value: typeof cosmetic.value === "string" ? cosmetic.value : "",
            emoji: typeof cosmetic.emoji === "string" ? cosmetic.emoji : "",
          }))
        : fallback.character.cosmetics,
    },
    stats: STAT_KEYS.reduce((acc, key) => {
      const stat = isRecord(stats[key]) ? stats[key] : {};

      acc[key] = {
        xp: typeof stat.xp === "number" ? stat.xp : 0,
      };

      return acc;
    }, {} as GameState["stats"]),
    missions: Array.isArray(value.missions)
      ? ensureUniqueMissionIds(
          value.missions
            .map(normalizeMission)
            .filter((mission): mission is Mission => mission !== null)
        )
      : fallback.missions,
    rewards: Array.isArray(value.rewards)
      ? value.rewards
          .map(normalizeReward)
          .filter((reward): reward is Reward => reward !== null)
      : fallback.rewards,
  };
}

function loadState(): GameState {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return createDefaultState();
  }

  try {
    return normalizeGameState(JSON.parse(saved));
  } catch (error) {
    console.warn("Failed to parse saved RPG state, resetting it.", error);
    localStorage.removeItem(STORAGE_KEY);
    return createDefaultState();
  }
}

export function useGameState() {
  const [state, rawSetState] = useState<GameState>(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  function addMission(mission: Mission) {
    rawSetState((prev) => ({
      ...prev,
      missions: [...prev.missions, mission],
    }));
  }

  function toggleMissionInProgress(missionId: string) {
    rawSetState((prev) => ({
      ...prev,
      missions: prev.missions.map((mission) =>
        mission.id === missionId && mission.status !== "finished"
          ? {
              ...mission,
              status:
                mission.status === "in progress" ? "ready" : "in progress",
            }
          : mission
      ),
    }));
  }

  function completeMission(
    missionId: string,
    xp: number,
    stats: Partial<Record<StatKey, number>>
  ) {
    rawSetState((prev) => {
      const updatedMissions = prev.missions.map((m) =>
        m.id === missionId
          ? {
              ...m,
              status: "finished" as const,
              xp_awarded: xp,
              stat_distribution: stats,
            }
          : m
      );

      const updatedStats = { ...prev.stats };

      Object.entries(stats).forEach(([key, value]) => {
        if (!value) return;
        updatedStats[key as StatKey].xp += value;
      });

      return recalculateGameState({
        ...prev,
        character: {
          ...prev.character,
          total_xp: prev.character.total_xp + xp,
        },
        stats: updatedStats,
        missions: updatedMissions,
      });
    });
  }

  function clearFinishedAndSplitMissions() {
    rawSetState((prev) => ({
      ...prev,
      missions: prev.missions.filter(
        (mission) =>
          mission.status !== "finished" && mission.status !== "split"
      ),
    }));
  }

  function setState(nextState: GameState) {
    rawSetState(normalizeGameState(nextState));
  }

  function importState(newState: GameState) {
    const recalculated = recalculateGameState(newState);
    setState(recalculated);
  }

  return {
    state,
    addMission,
    toggleMissionInProgress,
    completeMission,
    clearFinishedAndSplitMissions,
    importState,
    setState,
  };
}
