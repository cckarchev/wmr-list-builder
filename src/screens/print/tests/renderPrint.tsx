import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { useArmyStore } from "@/store/useArmyStore";
import { Print } from "../Print";

export const GAME_SIZE = 2000;

export const renderPrint = (path = "/print/goblin") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/print/:armyId" element={<Print />} />
      </Routes>
    </MemoryRouter>,
  );

/** Waits for the Goblin sheet, which the screen renders once the army loads. */
export const findTitle = () =>
  screen.findByRole("heading", { level: 1, name: "Goblin" });

export const printSheet = () =>
  screen.getByRole("article", { name: "Print sheet" });

/**
 * A fresh store and nothing saved, so no test sees another's list, options or
 * order.
 */
export const resetPrintState = () => {
  useArmyStore.getState().reset();
  localStorage.clear();
};
