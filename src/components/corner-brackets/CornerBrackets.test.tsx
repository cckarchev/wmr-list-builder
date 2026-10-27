import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CornerBrackets } from "./CornerBrackets";

const CORNER_COUNT = 4;
const ACCENT = "#ff0000";

describe("CornerBrackets", () => {
  it("renders four corner spans", () => {
    render(<CornerBrackets accent={ACCENT} />);

    expect(screen.getAllByTestId("corner-bracket")).toHaveLength(CORNER_COUNT);
  });

  it("positions each corner absolutely", () => {
    render(<CornerBrackets accent={ACCENT} />);

    expect(screen.getAllByTestId("corner-bracket")[0]).toHaveStyle({
      position: "absolute",
    });
  });

  it("applies the given accent color", () => {
    render(<CornerBrackets accent={ACCENT} />);
    const first = screen.getAllByTestId("corner-bracket")[0];

    expect(first.getAttribute("style")).toContain("rgb(255, 0, 0)");
  });
});
