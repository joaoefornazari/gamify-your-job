export type StatKey =
  | "knowledge"
  | "focus"
  | "delivery"
  | "product_sense"
  | "ownership"
  | "alignment";

export interface Stat {
  xp: number;
}

export type Stats = Record<StatKey, Stat>;

export interface Mission {
  id: string;
  priority: number;
  title: string;
  description: string;
  notes: string[];
  date: string;
  status: "in progress" | "finished" | "ready" | "split";
  xp_awarded?: number;
  stat_distribution?: Partial<Record<StatKey, number>>;
  tags: string[];
}

export interface Cosmetic {
	name: string;
	value: string;
	emoji: string;
}

export interface Reward {
  description: string;
  time: number;
  used: boolean;
}

export type LogAction =
  | "note_added"
  | "note_deleted"
  | "mission_toggled"
  | "mission_completed"
  | "mission_added"
  | "reward_spent";

export interface LogEntry {
  id: string;
  action: LogAction;
  missionId?: string;
  details: Record<string, unknown>;
  timestamp: string;
}

export interface GameState {
  character: {
    name: string;
    level: number;
    total_xp: number;
	  title: string;
	  next_level_xp_threshold: number;
	  cosmetics: Cosmetic[];
  };
  stats: Stats;
  missions: Mission[];
  rewards: Reward[];
  week_log: LogEntry[];
}
