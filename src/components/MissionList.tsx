import type { Mission, StatKey } from "../types/game";
import { useState } from "react";

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
    } catch (err) {
      alert("Invalid JSON format");
    }
  }

  return (
    <div>
      {missions.map((m) => (
        <div key={m.id} style={card}>
          <h3>{m.title}</h3>
          <p>{m.description}</p>
          <p>Status: {m.status}</p>

          {m.status === "finished" && (
            <p><strong>XP:</strong> {m.xp_awarded}</p>
          )}

          {m.status === "ready" && (
            <>
              <button onClick={() => setActiveMissionId(m.id)}>
                Complete
              </button>

              {activeMissionId === m.id && (
                <div style={box}>
                  <textarea
                    placeholder='Paste XP JSON here...'
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    rows={6}
                    style={{ width: "100%" }}
                  />

                  <button onClick={() => handleSubmit(m.id)}>
                    Confirm
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}

const card: React.CSSProperties = {
  border: "1px solid #444",
  padding: "12px",
  marginBottom: "10px",
  borderRadius: "6px",
};

const box: React.CSSProperties = {
  marginTop: "10px",
};