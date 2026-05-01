import { useState } from "react";

interface Props {
  state: ReturnType<typeof useGameState>["state"];
  onSpendReward: (xp: number, stats: Partial<Record<StatKey, number>>) => void;
}

export default function CharacterSheet({ state, onSpendReward }: Props) {
  const { character, stats, rewards } = state;
  const [animatingRewards, setAnimatingRewards] = useState<Set<number>>(new Set());
  const [vanishingRewards, setVanishingRewards] = useState<Set<number>>(new Set());

  function handleUseReward(index: number) {
    onSpendReward(index);
    setAnimatingRewards((prev) => new Set(prev).add(index));

    setTimeout(() => {
      setVanishingRewards((prev) => new Set(prev).add(index));
    }, 2000);

    setTimeout(() => {
      setAnimatingRewards((prev) => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
      setVanishingRewards((prev) => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }, 2500);
  }

  return (
    <section className="panel overflow-hidden px-6 py-6 sm:px-7">
      <div id="character-sheet-layout" className="flex flex-col gap-6">
        <div
          id="character-sheet-header"
          className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between"
        >
          <div id="character-sheet-identity" className="space-y-3">
            <p className="field-label">Character Sheet</p>
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              {character.name}
            </h2>
            <p className="text-md leading-6 text-slate-300">
              <b>{character.title}</b>
            </p>
          </div>

          <div
            id="character-sheet-metrics"
            data-testid="character-metrics"
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
          <div className="space-y-4">
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
                        {stat.xp} XP
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div id="character-sheet-rewards-section" className="space-y-3">
              <div
                id="character-sheet-rewards-header"
                className="flex items-center justify-between"
              >
                <h3 className="text-lg font-semibold text-white">Rewards</h3>
                <span className="text-sm text-slate-400">
                  {rewards.filter((r) => !r.used).length} available
                </span>
              </div>

              <div id="character-sheet-rewards-list" className="space-y-2">
                {rewards.map((reward, index) => {
                  if (reward.used && !animatingRewards.has(index)) {
                    return null;
                  }

                  const isAnimating = animatingRewards.has(index);
                  const isVanishing = vanishingRewards.has(index);

                  return (
                    <div
                      key={index}
                      id={`character-sheet-reward-${index}`}
                      className={`flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3 transition-opacity duration-500 ${
                        isVanishing ? "opacity-0" : "opacity-100"
                      }`}
                    >
                      <div className="flex-1">
                        {isAnimating ? (
                          <p className="text-sm font-semibold text-cyan-300">
                            Reward Used! Congratulations! 🎉
                          </p>
                        ) : (
                          <>
                            <p className="text-sm text-white">{reward.description}</p>
                            <p className="text-xs text-slate-400">
                              {reward.time} min
                            </p>
                          </>
                        )}
                      </div>
                      {!isAnimating && !reward.used && (
                        <button
                          onClick={() => handleUseReward(index)}
                          className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200 hover:bg-cyan-400/20"
                        >
                          Use reward?
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div
            id="character-sheet-cosmetics-panel"
            className="min-h-[20rem] rounded-3xl border border-white/10 bg-white/5 p-5 xl:min-h-[28rem]"
          >
            <div
              id="character-sheet-cosmetics-layout"
              className="flex flex-col justify-between gap-5"
            >
              <div id="character-sheet-cosmetics-copy" className="space-y-2">
                <p className="field-label">Cosmetics</p>
                <p className="max-w-sm text-sm leading-7 text-slate-300">
                  {character.cosmetics.length > 0
                    ? ""
                    : "No cosmetics unlocked yet. Finish more missions to grow your collection!"}
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
                      className="flex flex-row items-center gap-2 p-4 rounded border border-cyan-300/20"
                      style={{ width: "100%" }}
                    >
                      <span style={{ width: "25%", textAlign: "center", fontSize: "1.5rem" }}>{cosmetic.emoji}</span>
                      <div className="flex flex-col gap-2 items-start" >
                        <span style={{ fontSize: '0.5rem' }} className="font-semibold border border-white-200 rounded-full px-3 py-1" >{cosmetic.name}</span>
                        <span style={{ fontSize: '0.8rem'}} >{cosmetic.value}</span>
                      </div>
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
