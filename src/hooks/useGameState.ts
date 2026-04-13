import { useState, useEffect } from "react";
import { GameState, Mission, StatKey } from "../types/game";

const STORAGE_KEY = "rpg_state";

const defaultState: GameState = {
  character: {
    name: "JWolf",
    level: 7,
    total_xp: 0,
    title: "System Stabilizer",
    next_level_xp_threshold: 0,
    cosmetics: [],
  },
  stats: {
    knowledge: { xp: 0, level: 0 },
    focus: { xp: 0, level: 0 },
    delivery: { xp: 0, level: 0 },
    product_sense: { xp: 0, level: 0 },
    ownership: { xp: 0, level: 0 },
	  alignment: { xp: 0, level: 0 },
  },
  missions: [],
  rewards: [],
};

export function useGameState() {
  const [state, setState] = useState<GameState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultState;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  function addMission(mission: Mission) {
    setState((prev) => ({
      ...prev,
      missions: [...prev.missions, mission],
    }));
  }

  function completeMission(
    missionId: string,
    xp: number,
    stats: Partial<Record<StatKey, number>>
  ) {
    setState((prev) => {
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

      return {
        ...prev,
        character: {
          ...prev.character,
          total_xp: prev.character.total_xp + xp,
        },
        stats: updatedStats,
        missions: updatedMissions,
      };
    });
  }

  return {
    state,
    addMission,
    completeMission,
    setState,
  };
}
