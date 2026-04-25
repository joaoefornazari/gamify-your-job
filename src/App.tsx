import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faScroll } from "@fortawesome/free-solid-svg-icons";
import CharacterSheet from "./components/CharacterSheet";
import ImportExport from "./components/ImportExport";
import MissionForm from "./components/MissionForm";
import MissionList from "./components/MissionList";
import { useGameState } from "./hooks/useGameState";

export default function App() {
  const {
    state,
    addMission,
    toggleMissionInProgress,
    completeMission,
    clearFinishedAndSplitMissions,
    addNoteToMission,
    deleteNoteFromMission,
    importState,
  } = useGameState();

  const readyCount = state.missions.filter(
    (mission) => mission.status === "ready"
  ).length;
  const finishedCount = state.missions.filter(
    (mission) => mission.status === "finished"
  ).length;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="panel overflow-hidden px-6 py-6 sm:px-8 sm:py-8">
        <div className="flex flex-col gap-6">
          <div className="space-y-4">
            <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
              <FontAwesomeIcon
                icon={faScroll}
                className="mr-2"
                data-testid="quest-board-icon"
              />
              Quest Board
            </span>

            <div className="space-y-4 m-2">
              <h1 className="text-4xl font-bold tracking-tight text-white">
                RPG Job Tracker
              </h1>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
            <SummaryCard label="Total missions" value={state.missions.length} />
            <SummaryCard label="Ready to clear" value={readyCount} />
            <SummaryCard label="Finished" value={finishedCount} />
          </div>
        </div>
      </header>

      <main className="flex flex-col gap-6">
        <div className="flex flex-col gap-6">
          <CharacterSheet state={state} />
          <ImportExport state={state} onImport={importState} />
        </div>

        <div className="flex flex-col gap-6">
          <MissionForm onAdd={addMission} />
          <MissionList
            missions={state.missions}
            onToggleInProgress={toggleMissionInProgress}
            onComplete={completeMission}
            onClearFinishedAndSplit={clearFinishedAndSplitMissions}
            onAddNote={addNoteToMission}
            onDeleteNote={deleteNoteFromMission}
          />
        </div>
      </main>
    </div>
  );
}

interface SummaryCardProps {
  label: string;
  value: number;
}

function SummaryCard({ label, value }: SummaryCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
        {value}
      </p>
    </div>
  );
}
