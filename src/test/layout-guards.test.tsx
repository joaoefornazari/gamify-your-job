import { render, screen } from "@testing-library/react";
import App from "../App";
import CharacterSheet from "../components/CharacterSheet";
import MissionList from "../components/MissionList";
import type { GameState, Mission } from "../types/game";

const sampleMission: Mission = {
  id: "mission-1",
  title: "Layout guard",
  description: "Protect spacing and alignment.",
  date: "2026-04-16T00:00:00.000Z",
  status: "ready",
  tags: ["layout"],
  priority: 2,
  notes: ["Check paddings"],
};

const sampleState: GameState = {
  character: {
    name: "JWolf",
    level: 3,
    total_xp: 360,
    title: "System Stabilizer",
    next_level_xp_threshold: 172,
    cosmetics: [{ name: "Cape", value: "Azure", emoji: "🧥" }],
  },
  stats: {
    knowledge: { xp: 20 },
    focus: { xp: 30 },
    delivery: { xp: 40 },
    product_sense: { xp: 50 },
    ownership: { xp: 60 },
    alignment: { xp: 70 },
  },
  missions: [sampleMission],
  rewards: [],
};

describe("layout guard rails", () => {
  it("keeps the main app shell layout classes intact", () => {
    const { container } = render(<App />);
    const appShell = container.firstElementChild;

    expect(appShell).toHaveClass(
      "mx-auto",
      "flex",
      "min-h-screen",
      "w-full",
      "max-w-7xl",
      "flex-col",
      "gap-6",
      "px-4",
      "py-6"
    );
    expect(screen.getByTestId("quest-board-icon")).toBeInTheDocument();
  });

  it("preserves character sheet grid structure and cosmetic item sizing", () => {
    render(<CharacterSheet state={sampleState} />);

    expect(screen.getByRole("heading", { name: "JWolf" })).toBeInTheDocument();
    expect(document.getElementById("character-sheet-body")).toHaveClass(
      "grid",
      "gap-4",
      "xl:grid-cols-[minmax(0,1.18fr)_minmax(260px,0.82fr)]"
    );
    expect(document.getElementById("character-sheet-stats-grid")).toHaveClass(
      "grid",
      "gap-3",
      "min-[420px]:grid-cols-2"
    );

    const cosmeticChip = screen.getByText("Cape").closest("div")?.parentElement;
    expect(cosmeticChip?.style.width).toBe("100%");

    const emojiCell = screen.getByText("🧥");
    expect(emojiCell).toHaveStyle("width: 25%; text-align: center; font-size: 1.5rem;");
  });

  it("preserves mission card spacing, alignment, and inline control styles", () => {
    render(
      <MissionList
        missions={[sampleMission]}
        onToggleInProgress={vi.fn()}
        onComplete={vi.fn()}
        onClearFinishedAndSplit={vi.fn()}
      />
    );

    const startButton = screen.getByRole("button", { name: "START" });
    expect(startButton.style.marginLeft).toBe("12px");
    expect(startButton.style.padding).toBe("4px 8px");
    expect(startButton.style.fontSize).toBe("12px");
    expect(startButton.style.borderRadius).toBe("10px");
    expect(startButton.style.cursor).toBe("pointer");
    expect(startButton.getAttribute("style")).toContain("border: 1px solid");

    expect(screen.getByText("Priority").closest("div")).toHaveClass("m-2");
    expect(screen.getByText("P2").closest("div")).toHaveClass("m-2");
    expect(screen.getByText("P2").closest("div")?.parentElement).toHaveClass(
      "flex",
      "flex-row",
      "flex-wrap",
      "rounded-2xl",
      "border",
      "p-4"
    );
  });
});
