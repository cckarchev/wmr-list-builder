import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { saveList } from "@/core/persistence/currentList";
import { Print } from "../Print";
import {
  findTitle,
  GAME_SIZE,
  printSheet,
  renderPrint,
  resetPrintState,
} from "./renderPrint";

/** Enough Goblins to go over the 2,000 points cap. */
const OVER_CAP_GOBLINS = 100;

/** The section headings on the sheet, top to bottom. */
const sheetHeadings = () =>
  Array.from(
    printSheet().querySelectorAll("section h3"),
    (heading) => heading.textContent,
  );

/** The section toggles, in the order the sheet prints them. */
const sectionChips = () =>
  within(screen.getByRole("group", { name: "Sections" }))
    .getAllByRole("checkbox")
    .map((chip) => chip.closest("label")?.textContent);

beforeEach(resetPrintState);

describe("print sections", () => {
  it("does not offer Magic Items when the list takes none", async () => {
    renderPrint("/print/goblin");
    await findTitle();

    expect(
      screen.queryByRole("checkbox", { name: /magic items/i }),
    ).not.toBeInTheDocument();
  });

  it("leaves out a section when its checkbox is cleared", async () => {
    const user = userEvent.setup();
    renderPrint("/print/goblin");
    await findTitle();
    const stats = screen.getByRole("checkbox", { name: /stats/i });

    await user.click(stats);

    expect(stats).not.toBeChecked();
    expect(
      screen.queryByText("Character", { selector: "th" }),
    ).not.toBeInTheDocument();

    await user.click(stats);

    expect(
      screen.getByText("Character", { selector: "th" }),
    ).toBeInTheDocument();
  });

  it("selects every section again when the army changes", async () => {
    const user = userEvent.setup();
    const router = createMemoryRouter(
      [{ path: "/print/:armyId", element: <Print /> }],
      {
        initialEntries: ["/print/goblin"],
      },
    );
    render(<RouterProvider router={router} />);
    await findTitle();
    await user.click(screen.getByRole("checkbox", { name: /stats/i }));

    await act(() => router.navigate("/print/empire"));
    await screen.findByRole("heading", { level: 1, name: "Empire" });

    expect(screen.getByRole("checkbox", { name: /stats/i })).toBeChecked();
  });
});

describe("print validation section", () => {
  it("leaves the Validation section off until it is ticked", async () => {
    const user = userEvent.setup();
    renderPrint("/print/goblin");
    await findTitle();
    const validation = screen.getByRole("checkbox", { name: /validation/i });

    expect(validation).not.toBeChecked();
    expect(
      within(printSheet()).queryByRole("heading", { name: "Validation" }),
    ).toBeNull();

    await user.click(validation);

    expect(
      within(printSheet()).getByRole("heading", { name: "Validation" }),
    ).toBeInTheDocument();
  });

  it("prints that an empty list is valid", async () => {
    const user = userEvent.setup();
    renderPrint("/print/goblin");
    await findTitle();

    await user.click(screen.getByRole("checkbox", { name: /validation/i }));

    expect(
      within(printSheet()).getByText("The list is valid at 2,000 points."),
    ).toBeInTheDocument();
  });

  it("prints the list issues in the Validation section", async () => {
    const user = userEvent.setup();
    saveList("goblin", {
      name: "",
      gameSize: GAME_SIZE,
      units: { goblins: OVER_CAP_GOBLINS },
      upgrades: {},
    });
    renderPrint("/print/goblin");
    await findTitle();

    await user.click(screen.getByRole("checkbox", { name: /validation/i }));

    expect(
      within(printSheet()).getByText("1 issue at 2,000 points:"),
    ).toBeInTheDocument();
    expect(
      within(printSheet()).getByText(/points over the 2,000 cap\./),
    ).toBeInTheDocument();
  });
});

describe("print section order", () => {
  it("moves a section up the sheet from the Reorder panel", async () => {
    const user = userEvent.setup();
    renderPrint("/print/goblin");
    await findTitle();
    const before = sheetHeadings();
    const last = before.at(-1);

    await user.click(screen.getByRole("button", { name: "Reorder sections" }));
    await user.click(screen.getByRole("button", { name: `Move ${last} up` }));

    const after = sheetHeadings();

    expect(after.at(-1)).not.toBe(last);
    expect(after.at(-2)).toBe(last);
  });

  it("cannot move the first section up", async () => {
    const user = userEvent.setup();
    renderPrint("/print/goblin");
    await findTitle();

    await user.click(screen.getByRole("button", { name: "Reorder sections" }));

    expect(
      screen.getByRole("button", { name: "Move Stats up" }),
    ).toBeDisabled();
  });

  it("remembers the order for the next visit", async () => {
    const user = userEvent.setup();
    const { unmount } = renderPrint("/print/goblin");
    await findTitle();

    await user.click(screen.getByRole("button", { name: "Reorder sections" }));
    await user.click(screen.getByRole("button", { name: "Move Stats down" }));
    const moved = sectionChips();
    unmount();
    renderPrint("/print/goblin");
    await findTitle();

    expect(moved[0]).not.toBe("Stats");
    expect(sectionChips()).toEqual(moved);
  });
});
