export type StatKey =
  | "knowledge"
  | "focus"
  | "delivery"
  | "product_sense"
  | "ownership"
  | "alignment";

export interface Stat {
  xp: number;
  level: number;
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
}
