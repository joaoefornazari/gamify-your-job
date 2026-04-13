import { useState } from "react";
import type { Mission } from "../types/game";

interface Props {
  onAdd: (mission: Mission) => void;
}

export default function MissionForm({ onAdd }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newMission: Mission = {
      id: crypto.randomUUID(),
      title,
      description,
      date: new Date().toISOString(),
      status: "ready",
      tags: [],
      priority: Math.floor(Math.random() % 5) + 1,
      notes: "",
    };

    onAdd(newMission);
    setTitle("");
    setDescription("");
  }

  return (
    <form onSubmit={handleSubmit} className="panel grid gap-6 px-6 py-6 sm:px-7">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="field-label">Mission Intake</p>
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            Add a new mission
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-slate-300">
            Capture the next task quickly, then keep the details organized in a
            responsive grid instead of stacking raw fields one after another.
          </p>
        </div>

        <button type="submit" className="action-primary w-full md:w-auto">
          Add mission
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 md:col-span-2">
          <span className="field-label">Mission title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ship a cleaner dashboard layout"
            required
            className="field-input"
          />
        </label>

        <label className="grid gap-2 md:col-span-2">
          <span className="field-label">Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the scope, blockers, and anything worth remembering."
            className="field-input min-h-36 resize-y"
          />
        </label>
      </div>
    </form>
  );
}
