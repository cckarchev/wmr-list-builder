import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { saveList } from "@/core/persistence/currentList";
import { useArmyStore } from "@/store/useArmyStore";
import {
  findTitle,
  GAME_SIZE,
  renderPrint,
  resetPrintState,
} from "./renderPrint";

const SAVED_GOBLINS = 2;

beforeEach(resetPrintState);

describe("print sheet", () => {
  it("shows the faction as the document title when the list is unnamed", async () => {
    renderPrint("/print/goblin");

    expect(await findTitle()).toBeInTheDocument();
  });

  it("shows faction and list name in the title when the list is named", async () => {
    useArmyStore.getState().setArmy("goblin");
    useArmyStore.getState().setLabel("My List");
    renderPrint("/print/goblin");

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Goblin · My List",
      }),
    ).toBeInTheDocument();
  });

  it("renders a Stats section toggle", async () => {
    renderPrint("/print/goblin");
    await findTitle();

    expect(
      screen.getByRole("checkbox", { name: /stats/i }),
    ).toBeInTheDocument();
  });

  it("splits characters and units via column headers (no ruleset noise)", async () => {
    renderPrint("/print/goblin");
    await findTitle();

    expect(
      screen.getByText("Character", { selector: "th" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Troop", { selector: "th" })).toBeInTheDocument();
    expect(screen.queryByText(/warmaster revolution/i)).not.toBeInTheDocument();
  });

  it("renders the spells heading for a magic army", async () => {
    renderPrint("/print/goblin");
    await findTitle();
    const spellsHeadings = screen.getAllByText("Spells");

    expect(spellsHeadings.some((el) => el.tagName === "H3")).toBe(true);
  });

  it("does not render a Text List section", async () => {
    renderPrint("/print/goblin");
    await findTitle();

    expect(
      screen.queryByRole("checkbox", { name: /text list/i }),
    ).not.toBeInTheDocument();
  });
});

describe("opening the print sheet", () => {
  it("restores the saved list when the print sheet is opened directly", async () => {
    saveList("goblin", {
      name: "Saved List",
      gameSize: GAME_SIZE,
      units: { goblins: SAVED_GOBLINS },
      upgrades: {},
    });
    renderPrint("/print/goblin");

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Goblin · Saved List",
      }),
    ).toBeInTheDocument();
  });

  it("names the browser document after the sheet, and restores it on leaving", async () => {
    const previousTitle = document.title;
    const { unmount } = renderPrint("/print/goblin");
    await findTitle();

    expect(document.title).toBe("Goblin");

    unmount();

    expect(document.title).toBe(previousTitle);
  });
});
