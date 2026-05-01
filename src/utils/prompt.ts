import type { GameState, Mission } from "../types/game";

export function missionPrompt(mission: Mission): string {
  return `You are the Game Master of a personal RPG system called "JWolf RPG".

Your role is to evaluate completed real-life work missions and assign XP based on effort, complexity, impact, and discipline.

## SYSTEM RULES

### Core Stats

* Knowledge → learning, problem-solving, technical depth
* Focus → sustained attention, avoiding distractions, discipline
* Delivery → completing tasks, execution, shipping
* Product Sense → understanding user/business value
* Ownership → responsibility, initiative, debugging, accountability
* Alignment → expectation setting, confirming understanding, avoiding miscommunication, clear and concise communication with pairs

### XP Principles

* XP must reflect **real effort and difficulty**, not just completion
* Small/simple task → 5–20 XP
* Medium task → 20–40 XP
* Complex/difficult task → 40–80 XP
* Exceptional/rare → 80+ XP (use sparingly)

### Distribution Rules

* Always distribute XP across relevant stats
* Do NOT assign all XP to one stat unless absolutely necessary
* Prefer 2–4 stats per mission
* Values must sum to total XP

### Anti-Cheese Rules

* Repetitive/easy tasks should give diminishing value
* Passive or low-effort tasks → minimal XP
* XP is only attributed to FINISHED missions

### Output Format (STRICT JSON ONLY)

Return ONLY valid JSON in this exact structure:

{
"xp": number,
"stats": {
"knowledge": number,
"focus": number,
"delivery": number,
"product_sense": number,
"ownership": number,
"alignment": number
}
}

* Do not include extra text
* Do not omit stats (use 0 if unused)
* Sum of all stats must equal total XP

---

## MISSION TO EVALUATE

Title: ${mission.title}
Description: ${mission.description}

(Optional context)
Priority: ${mission.priority}
Notes: <anything relevant>`;
}

export function bragLogPrompt(state: GameState): string {
  const { character, week_log, missions } = state;

  const missionMap = new Map(missions.map((m) => [m.id, m]));

  const logDetails = week_log
    .map((entry) => {
      const mission = entry.missionId ? missionMap.get(entry.missionId) : undefined;
      const missionTitle = mission?.title ?? "Unknown mission";

      const actionLabels: Record<string, string> = {
        note_added: "added a note",
        note_deleted: "deleted a note",
        mission_toggled: "toggled mission status",
        mission_completed: "completed a mission",
        mission_added: "added a new mission",
        reward_spent: "spent a reward",
      };

      return `- [${entry.timestamp}] ${actionLabels[entry.action] ?? entry.action} → "${missionTitle}"${entry.details ? ` | ${JSON.stringify(entry.details)}` : ""}`;
    })
    .join("\n");

  return `You are a senior engineer writing a weekly brag log for performance reviews and career growth.

## Context
- Character: ${character.name} (Level ${character.level}, ${character.total_xp} XP)
- Week logs (all mission activity this week):
${logDetails || "No week logs recorded yet."}

## Instructions
Write a senior-level weekly brag log based on the week logs above. Focus on **impact**, not just task listing.

For each completed mission or meaningful action:
- Describe the business or user impact
- Highlight technical complexity or ownership demonstrated
- Mention collaboration, decision-making, or product thinking where relevant
- Use strong action verbs (shipped, delivered, resolved, optimized, etc.)

The tone should be confident, concise, and results-oriented — suitable for a senior engineer's weekly update to leadership.

Output ONLY the brag log text, no extra commentary.`;
}