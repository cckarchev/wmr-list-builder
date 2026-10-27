import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_GAME_SIZE } from "@/store/armyData";
import { useArmyStore } from "@/store/useArmyStore";
import { GameSizeStepper } from "./GameSizeStepper";

const STEP = 500;
const BELOW_ONE_STEP = 300;
const TYPED_GAME_SIZE = 1250;

const gameSize = () => useArmyStore.getState().gameSize;
const input = () => screen.getByLabelText("Game Size");
const decreaseButton = () =>
  screen.getByRole("button", { name: "decrease game size" });
const increaseButton = () =>
  screen.getByRole("button", { name: "increase game size" });

describe("GameSizeStepper", () => {
  beforeEach(() => {
    useArmyStore.getState().reset();
    useArmyStore.getState().setArmy("goblin");
  });

  it("shows the current game size in the labelled input", () => {
    render(<GameSizeStepper />);

    expect(input()).toHaveValue(DEFAULT_GAME_SIZE);
  });

  it("steps the game size up and down by 500 points", async () => {
    const user = userEvent.setup();
    render(<GameSizeStepper />);

    await user.click(increaseButton());

    expect(gameSize()).toBe(DEFAULT_GAME_SIZE + STEP);
    expect(input()).toHaveValue(DEFAULT_GAME_SIZE + STEP);

    await user.click(decreaseButton());
    await user.click(decreaseButton());

    expect(gameSize()).toBe(DEFAULT_GAME_SIZE - STEP);
  });

  it("stops at zero when a step would go below it", async () => {
    const user = userEvent.setup();
    useArmyStore.getState().setGameSize(BELOW_ONE_STEP);
    render(<GameSizeStepper />);

    await user.click(decreaseButton());

    expect(gameSize()).toBe(0);
    expect(decreaseButton()).toBeDisabled();
  });

  it("sets a typed game size", () => {
    render(<GameSizeStepper />);

    fireEvent.change(input(), { target: { value: String(TYPED_GAME_SIZE) } });

    expect(gameSize()).toBe(TYPED_GAME_SIZE);
  });
});
