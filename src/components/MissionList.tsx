import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import type { Mission, StatKey } from "../types/game";
import { missionPrompt } from "../utils/prompt";

interface Props {
  missions: Mission[];
  onToggleInProgress: (missionId: string) => void;
  onComplete: (
    missionId: string,
    xp: number,
    stats: Partial<Record<StatKey, number>>
  ) => void;
  onClearFinishedAndSplit: () => void;
  onAddNote: (missionId: string, note: string) => void;
  onDeleteNote: (missionId: string, noteIndex: number) => void;
  onGenerateBragLog?: () => void;
}

export default function MissionList({
  missions,
  onToggleInProgress,
  onComplete,
  onClearFinishedAndSplit,
  onAddNote,
  onDeleteNote,
  onGenerateBragLog,
}: Props) {
  const [activeMissionId, setActiveMissionId] = useState<string | null>(null);
  const [addingNoteMissionId, setAddingNoteMissionId] = useState<string | null>(null);
  const [newNoteText, setNewNoteText] = useState("");
  const [input, setInput] = useState("");
  const [deleteModal, setDeleteModal] = useState<{missionId: string; noteIndex: number} | null>(null);
  const clearableMissionCount = missions.filter(
    (mission) => mission.status === "finished" || mission.status === "split"
  ).length;

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

  function handleAddNote(missionId: string) {
    if (newNoteText.trim()) {
      onAddNote(missionId, newNoteText.trim());
      setNewNoteText("");
      setAddingNoteMissionId(null);
    }
  }

  function handleCancelAddNote() {
    setNewNoteText("");
    setAddingNoteMissionId(null);
  }

  function handleKeyDown(e: React.KeyboardEvent, missionId: string) {
    if (e.key === "Enter" && addingNoteMissionId === missionId) {
      e.preventDefault();
      handleAddNote(missionId);
    }
  }

  return (
    <section className="panel flex h-full flex-col gap-6 px-6 py-6 sm:px-7">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="field-label">Your tasks, your</p>
          <h2 className="text-xl font-semibold tracking-tight text-white">
            Week Missions
          </h2>
          <p className="max-w-2xl text-xs leading-6 text-slate-300">
            Toggle mission status as you work on them, and use prompt button and Complete Mission to finish them and get your rewards!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">
            {missions.length} mission{missions.length === 1 ? "" : "s"}
          </span>
          <button
            type="button"
            onClick={onClearFinishedAndSplit}
            disabled={clearableMissionCount === 0}
            className="action-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            New week!
          </button>
        </div>
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
            const canMarkInProgress =
              mission.status !== "finished";
            const canComplete =
              mission.status === "ready" || mission.status === "in progress";

            return (
              <article
                key={mission.id}
                className="grid gap-4 rounded-[24px] border border-white/10 bg-slate-950/60 p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold tracking-tight text-white">
                        {mission.title}
                      </h3>
                      <div>
                        <span className={getStatusClasses(mission.status)}>
                          {mission.status}
                        </span>
                        <button
                            type="button"
                            onClick={() => onToggleInProgress(mission.id)}
                            disabled={!canMarkInProgress}
                            style={{ marginLeft: "12px", border: "1px solid #ffe", padding: "4px 8px", fontSize: "12px", borderRadius: "10px", cursor: "pointer" }}
                            className="hover:bg-white/20 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-slate-500"
                          >
                            {mission.status === "in progress"
                              ? "STOP"
                              : "START"}
                          </button>
                      </div>
                    </div>

                    <p className="max-w-4xl text-xs leading-6 text-slate-300">
                      {mission.description || "No description added yet."}
                    </p>

                    <ul className="grid gap-2">
                      {mission.notes.length > 0 ? (
                        mission.notes.map((note, index) => (
                          <li
                            key={`${mission.id}-note-${index}`}
                            className="flex items-start gap-2 text-xs leading-6 text-slate-400"
                          >
                            <span className="mt-2 h-2 w-2 p-1 rounded-full bg-cyan-400" />
                            <span className="ml-2 flex-1">{note}</span>
                            <button
                              type="button"
                              onClick={() => setDeleteModal({missionId: mission.id, noteIndex: index})}
                              className="text-slate-500 hover:text-red-400"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </li>
                        ))
                      ) : (
                        <li className="flex items-start gap-2 text-xs leading-6 text-slate-500">
                          <span className="mt-2 h-2 w-2 rounded-full bg-slate-600" />
                          <span>No notes added yet.</span>
                        </li>
                      )}
                    </ul>

                    {mission.status !== "finished" && (
                      addingNoteMissionId === mission.id ? (
                        <div className="mt-2 flex gap-2">
                          <input
                            type="text"
                            value={newNoteText}
                            onChange={(e) => setNewNoteText(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, mission.id)}
                            placeholder="Enter note..."
                            className="field-input flex-1"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={handleCancelAddNote}
                            className="action-secondary"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddNote(mission.id)}
                            className="action-primary"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setAddingNoteMissionId(mission.id)}
                          className="mt-2 flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
                        >
                          <FontAwesomeIcon icon={faPlus} />
                          New note
                        </button>
                      )
                    )}
                  </div>

                  <div className="flex flex-row flex-wrap rounded-2xl border border-white/10 bg-white/5 p-4 sm:grid-cols-2 lg:min-w-64">
                    <MetaItem label="Priority" value={`P${mission.priority}`} />
                    <MetaItem label="Date" value={new Date(mission.date).toLocaleDateString()} />
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

                {canComplete ? (
                  <div className="grid gap-4 rounded-2xl border border-white/10 bg-slate-900/55 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm leading-6 text-slate-300">
                        Finished?
                      </p>

                      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                        <button
                          type="button"
                          className="action-secondary w-full sm:w-auto cursor-pointer"
                          onClick={() => handleCopyPrompt(mission)}>
                          Ask LLM for completion response
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setActiveMissionId(isActive ? null : mission.id)
                          }
                          className="action-secondary w-full sm:w-auto cursor-pointer"
                        >
                          {isActive ? "Cancel" : "Finish mission!"}
                        </button>
                      </div>
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
                            className="action-primary w-full sm:w-auto cursor-pointer"
                          >
                            Confirm and gain XP!
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

      {onGenerateBragLog && (
        <div className="pt-4 space-y-2">
          <p className="text-xs leading-6 text-slate-300">
            Have you already finished your week? Get a prompt and ask your LLM of choice to generate a senior-level brag log about your week's achievements.
          </p>
          <button
            onClick={onGenerateBragLog}
            className="mt-2 rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-200 hover:bg-cyan-400/20"
          >
            Generate Brag Log
          </button>
        </div>
      )}

      {deleteModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/60"
          onClick={() => setDeleteModal(null)}
        >
          <div
            className="rounded-2xl border border-white/20 bg-slate-900 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-4 text-lg text-white">Are you sure?</p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteModal(null)}
                className="action-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteNote(deleteModal.missionId, deleteModal.noteIndex);
                  setDeleteModal(null);
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Yes
              </button>
            </div>
          </div>
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
    <div className="m-2">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-white">{value}</p>
    </div>
  );
}

function handleCopyPrompt(mission: Mission) {
  const prompt = missionPrompt(mission);
  navigator.clipboard.writeText(prompt);
  alert("Prompt copied!");
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
