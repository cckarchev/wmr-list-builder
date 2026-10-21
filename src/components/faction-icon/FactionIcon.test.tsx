import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FactionIcon } from "./FactionIcon";
import { MIRRORED_FACTION_ICONS } from "./factionIcons";

const MIRRORED_ARMY = "araby";
const UNMIRRORED_ARMY = "goblin";

describe("FactionIcon", () => {
  it("renders nothing for an army without an icon", () => {
    const { container } = render(<FactionIcon armyId="not-an-army" />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing for an inherited object key", () => {
    const { container } = render(<FactionIcon armyId="constructor" />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders a decorative svg for a known army", () => {
    const { container } = render(<FactionIcon armyId={UNMIRRORED_ARMY} />);

    expect(container.querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("flips only the mirrored armies", () => {
    expect(MIRRORED_FACTION_ICONS.has(MIRRORED_ARMY)).toBe(true);
    expect(MIRRORED_FACTION_ICONS.has(UNMIRRORED_ARMY)).toBe(false);

    const mirrored = render(<FactionIcon armyId={MIRRORED_ARMY} />);
    const plain = render(<FactionIcon armyId={UNMIRRORED_ARMY} />);

    expect(mirrored.container.querySelector("path")).toHaveAttribute(
      "transform",
    );
    expect(plain.container.querySelector("path")).not.toHaveAttribute(
      "transform",
    );
  });
});
