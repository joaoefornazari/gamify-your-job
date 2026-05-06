import type { GameState } from "../types/game";

interface Props {
  state: GameState;
  onImport: (data: GameState) => void;
}

export default function ImportExport({ state, onImport }: Props) {
  function handleExport() {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const datetime = new Date().toLocaleString().replaceAll(/\D/g, '-');

    a.download = `rpg-save-${datetime}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        onImport(data);
      } catch (error) {
        console.error("Failed to import save file.", error);
        alert("Invalid save file. Please import a valid JSON export.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <section className="panel px-6 py-5 sm:px-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <p className="field-label">Save Data</p>
          <h2 className="text-xl font-semibold tracking-tight text-white">
            Import or export progress
          </h2>
          <p className="text-sm text-gray-400">
            Move your save file between devices without breaking the layout or
            losing track of your current mission state.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={handleExport}
            className="action-secondary w-full sm:w-auto text-align-left"
          >
            Export save
          </button>

          <label className="action-primary w-full sm:w-auto text-align-left cursor-pointer">
            <span style={{ textAlign: "center" }}>Import save</span>
            <input
              type="file"
              accept="application/json,.json"
              onChange={handleImport}
              className="sr-only"
            />
          </label>
        </div>
      </div>
    </section>
  );
}
