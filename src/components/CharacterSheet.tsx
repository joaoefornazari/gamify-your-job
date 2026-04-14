import type { GameState } from "../types/game";

interface Props {
  state: GameState;
}

export default function CharacterSheet({ state }: Props) {
  const { character, stats } = state;

  return (
    <section className="panel overflow-hidden px-6 py-6 sm:px-7">
      <div id="character-sheet-layout" className="flex flex-col gap-6">
        <div
          id="character-sheet-header"
          className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between"
        >
          <div id="character-sheet-identity" className="space-y-3">
            <p className="field-label">Character Sheet</p>
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              {character.name}
            </h2>
            <p className="text-sm leading-6 text-slate-300">
              {character.title}
            </p>
          </div>

          <div
            id="character-sheet-metrics"
            className="grid gap-3 sm:grid-cols-3 md:min-w-[332px]"
          >
            <MetricCard label="Level" value={character.level} />
            <MetricCard label="Total XP" value={character.total_xp} />
            <MetricCard
              label="Next threshold"
              value={character.next_level_xp_threshold}
            />
          </div>
        </div>

        <div
          id="character-sheet-body"
          className="grid gap-4 xl:grid-cols-[minmax(0,1.18fr)_minmax(260px,0.82fr)]"
        >
          <div id="character-sheet-stats-section" className="space-y-3">
            <div
              id="character-sheet-stats-header"
              className="flex items-center justify-between"
            >
              <h3 className="text-lg font-semibold text-white">Stats</h3>
              <span className="text-sm text-slate-400">
                {Object.keys(stats).length} tracked traits
              </span>
            </div>

            <div
              id="character-sheet-stats-grid"
              className="grid gap-3 min-[420px]:grid-cols-2"
            >
              {Object.entries(stats).map(([key, stat]) => (
                <div
                  key={key}
                  id={`character-sheet-stat-card-${toIdSegment(key)}`}
                  className="flex min-h-32 flex-col justify-between rounded-[22px] border border-white/10 bg-slate-950/60 px-4 py-4"
                >
                  <div id={`character-sheet-stat-copy-${toIdSegment(key)}`}>
                    <p className="max-w-[10ch] text-lg font-semibold leading-6 text-white">
                      {formatStatName(key)}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-500">
                      Growth
                    </p>
                  </div>

                  <div id={`character-sheet-stat-values-${toIdSegment(key)}`} className="pt-4">
                    <p className="text-lg font-semibold text-cyan-300">
                      Lv. {stat.level}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">{stat.xp} XP</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            id="character-sheet-cosmetics-panel"
            className="min-h-[20rem] rounded-3xl border border-white/10 bg-white/5 p-5 xl:min-h-[28rem]"
          >
            <div
              id="character-sheet-cosmetics-layout"
              className="flex h-full flex-col justify-between gap-5"
            >
              <div id="character-sheet-cosmetics-copy" className="space-y-2">
                <p className="field-label">Cosmetics</p>
                <p className="max-w-sm text-sm leading-7 text-slate-300">
                  {character.cosmetics.length > 0
                    ? "Unlocked visual rewards for your character."
                    : "No cosmetics unlocked yet. Finish more missions to grow your collection."}
                </p>
              </div>

              <div
                id="character-sheet-cosmetics-list"
                className="flex min-h-16 flex-wrap items-end gap-2 xl:min-h-20"
              >
                {character.cosmetics.length > 0 ? (
                  character.cosmetics.map((cosmetic) => (
                    <span
                      key={`${cosmetic.name}-${cosmetic.value}`}
                      className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-100"
                    >
                      <span>{cosmetic.emoji || "✨"}</span>
                      <span>{cosmetic.name}</span>
                    </span>
                  ))
                ) : (
                  <span className="inline-flex rounded-full border border-dashed border-white/15 px-3 py-2 text-sm text-slate-500">
                    Cosmetic vault is empty
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface MetricCardProps {
  label: string;
  value: number;
}

function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div
      id={`character-sheet-metric-${toIdSegment(label)}`}
      className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-white">
        {value}
      </p>
    </div>
  );
}

function formatStatName(key: string) {
  return key
    .replace("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function toIdSegment(value: string) {
  return value.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
