import { useState } from "react";
import type { Mission, StatKey } from "../types/game";

interface Props {
  missions: Mission[];
  onComplete: (
    missionId: string,
    xp: number,
    stats: Partial<Record<StatKey, number>>
  ) => void;
}

export default function MissionList({ missions, onComplete }: Props) {
  const [activeMissionId, setActiveMissionId] = useState<string | null>(null);
  const [input, setInput] = useState("");

  function handleSubmit(missionId: string) {
    try {
      const parsed = JSON.parse(input);

      if (typeof parsed.xp !== "number") {
        throw new Error("Invalid XP");
      }

      onComplete(missionId, parsed.xp, parsed.stats || {});
      setActiveMissionId(null);
      setInput("");
    } catch {
      alert("Invalid JSON format");
    }
  }

  return (
    <section className="panel flex h-full flex-col gap-6 px-6 py-6 sm:px-7">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="field-label">Mission Log</p>
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            Current quests
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-slate-300">
            Review the backlog, paste reward payloads, and keep completion flow
            contained inside each mission card.
          </p>
        </div>

        <span className="text-sm text-slate-400">
          {missions.length} mission{missions.length === 1 ? "" : "s"}
        </span>
      </div>

      {missions.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-slate-950/40 px-6 py-16 text-center">
          <div className="max-w-md space-y-3">
            <p className="text-lg font-semibold text-white">
              Your mission board is empty
            </p>
            <p className="text-sm leading-6 text-slate-400">
              Add the first mission and it will appear here in a responsive grid
              card with completion controls.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {missions.map((mission) => {
            const isActive = activeMissionId === mission.id;

            return (
              <article
                key={mission.id}
                className="grid gap-4 rounded-[24px] border border-white/10 bg-slate-950/60 p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-semibold tracking-tight text-white">
                        {mission.title}
                      </h3>
                      <span className={getStatusClasses(mission.status)}>
                        {mission.status}
                      </span>
                    </div>

                    <p className="max-w-2xl text-sm leading-6 text-slate-300">
                      {mission.description || "No description added yet."}
                    </p>
                  </div>

                  <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:grid-cols-2 lg:min-w-64">
                    <MetaItem label="Priority" value={`P${mission.priority}`} />
                    <MetaItem label="Date" value={formatDate(mission.date)} />
                  </div>
                </div>

                {mission.status === "finished" ? (
                  <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                    <span className="font-semibold uppercase tracking-[0.18em] text-emerald-300">
                      Rewards granted
                    </span>
                    <span>{mission.xp_awarded ?? 0} XP</span>
                  </div>
                ) : null}

                {mission.status === "ready" ? (
                  <div className="grid gap-4 rounded-2xl border border-white/10 bg-slate-900/55 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm leading-6 text-slate-300">
                        Paste the completion JSON payload when this mission is
                        ready to be resolved.
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          setActiveMissionId(isActive ? null : mission.id)
                        }
                        className="action-secondary w-full sm:w-auto"
                      >
                        {isActive ? "Hide reward input" : "Complete mission"}
                      </button>
                    </div>

                    {isActive ? (
                      <div className="grid gap-3">
                        <textarea
                          placeholder='{"xp": 120, "stats": {"delivery": 50}}'
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          rows={6}
                          className="field-input min-h-36 resize-y"
                        />

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleSubmit(mission.id)}
                            className="action-primary w-full sm:w-auto"
                          >
                            Confirm rewards
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

interface MetaItemProps {
  label: string;
  value: string;
}

function MetaItem({ label, value }: MetaItemProps) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-white">{value}</p>
    </div>
  );
}

function formatDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate);
}

function getStatusClasses(status: Mission["status"]) {
  switch (status) {
    case "finished":
      return "inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300";
    case "in progress":
      return "inline-flex rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300";
    case "split":
      return "inline-flex rounded-full border border-fuchsia-400/30 bg-fuchsia-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-300";
    case "ready":
    default:
      return "inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300";
  }
}
