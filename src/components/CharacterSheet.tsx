import type { GameState } from "../types/game";

interface Props {
  state: GameState;
}

export default function CharacterSheet({ state }: Props) {
  const { character, stats } = state;

  return (
    <section className="panel px-6 py-6 sm:px-7">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="field-label">Character Sheet</p>
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              {character.name}
            </h2>
            <p className="text-sm leading-6 text-slate-300">
              {character.title}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <MetricCard label="Level" value={character.level} />
            <MetricCard label="Total XP" value={character.total_xp} />
            <MetricCard
              label="Next threshold"
              value={character.next_level_xp_threshold}
            />
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(240px,0.9fr)]">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Stats</h3>
              <span className="text-sm text-slate-400">
                {Object.keys(stats).length} tracked traits
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(stats).map(([key, stat]) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {formatStatName(key)}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                      Growth
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-semibold text-cyan-300">
                      Lv. {stat.level}
                    </p>
                    <p className="text-sm text-slate-400">{stat.xp} XP</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex h-full flex-col justify-between gap-5">
              <div className="space-y-2">
                <p className="field-label">Cosmetics</p>
                <p className="text-sm leading-6 text-slate-300">
                  {character.cosmetics.length > 0
                    ? "Unlocked visual rewards for your character."
                    : "No cosmetics unlocked yet. Finish more missions to grow your collection."}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
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
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
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
