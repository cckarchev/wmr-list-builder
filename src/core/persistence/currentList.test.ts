import { beforeEach, describe, expect, it } from "vitest";
import { loadList, saveList } from "./currentList";
import type { ListSnapshot } from "./snapshot";

const GAME_SIZE = 2000;

const snap: ListSnapshot = {
  name: "",
  gameSize: GAME_SIZE,
  units: { halberdiers: 4, crossbowmen: 2 },
  upgrades: { halberdiers: { griffon: 1 } },
};

describe("localStorage persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saves and loads per army", () => {
    saveList("empire", snap);

    expect(loadList("empire")).toEqual(snap);
    expect(loadList("goblin")).toBeNull();
  });
});
