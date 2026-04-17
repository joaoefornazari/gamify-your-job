import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

function installFileReaderMock(result: string) {
  class MockFileReader {
    result: string | ArrayBuffer | null = null;
    onload: null | (() => void) = null;

    readAsText() {
      this.result = result;
      this.onload?.();
    }
  }

  vi.stubGlobal("FileReader", MockFileReader);
}

describe("App UI flow", () => {
  it("covers the good path of adding, progressing, completing, and clearing a mission", async () => {
    const user = userEvent.setup();

    render(<App />);

    expect(screen.getByText(/your mission board is empty/i)).toBeInTheDocument();

    await user.type(
      screen.getByLabelText(/mission title/i),
      "Ship responsive mission cards"
    );
    await user.type(
      screen.getByLabelText(/description/i),
      "Keep the board clean across desktop and mobile."
    );
    await user.click(screen.getByRole("button", { name: /add mission/i }));

    expect(
      screen.getByRole("heading", { name: "Ship responsive mission cards" })
    ).toBeInTheDocument();
    expect(screen.getByText("ready")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "START" }));
    expect(screen.getByText("in progress")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /complete mission/i })
    );
    fireEvent.change(
      screen.getByPlaceholderText('{"xp": 120, "stats": {"delivery": 50}}'),
      {
        target: { value: '{"xp":120,"stats":{"delivery":70,"focus":50}}' },
      }
    );
    await user.click(screen.getByRole("button", { name: /confirm rewards/i }));

    expect(screen.getByText(/rewards granted/i)).toBeInTheDocument();
    expect(screen.getByText("120 XP")).toBeInTheDocument();

    const metrics = screen.getByTestId("character-metrics");
    expect(within(metrics).getByText("1")).toBeInTheDocument();
    expect(
      within(document.getElementById("character-sheet-metric-total-xp")!).getByText(
        "120"
      )
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /clear finished \/ split/i })
    );

    expect(screen.getByText(/your mission board is empty/i)).toBeInTheDocument();
  });

  it("rejects malformed reward JSON and keeps the mission actionable", async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.type(screen.getByLabelText(/mission title/i), "Broken payload");
    await user.click(screen.getByRole("button", { name: /add mission/i }));
    await user.click(
      screen.getByRole("button", { name: /complete mission/i })
    );
    fireEvent.change(
      screen.getByPlaceholderText('{"xp": 120, "stats": {"delivery": 50}}'),
      {
        target: { value: '{"xp":"a lot"}' },
      }
    );
    await user.click(screen.getByRole("button", { name: /confirm rewards/i }));

    expect(alert).toHaveBeenCalledWith("Invalid JSON format");
    expect(screen.queryByText(/rewards granted/i)).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /confirm rewards/i })
    ).toBeInTheDocument();
  });

  it("rejects a broken imported save file", async () => {
    const user = userEvent.setup();
    installFileReaderMock("{bad json");

    const { container } = render(<App />);

    await user.type(screen.getByLabelText(/mission title/i), "Existing mission");
    await user.click(screen.getByRole("button", { name: /add mission/i }));

    const importInput = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    await user.upload(
      importInput,
      new File(["ignored"], "save.json", { type: "application/json" })
    );

    await waitFor(() => {
      expect(alert).toHaveBeenCalledWith(
        "Invalid save file. Please import a valid JSON export."
      );
    });

    expect(
      screen.getByRole("heading", { name: "Existing mission" })
    ).toBeInTheDocument();
  });
});
