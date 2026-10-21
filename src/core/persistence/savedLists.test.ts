import { beforeEach, describe, expect, it } from "vitest";
import {
  deleteNamedList,
  listSavedNames,
  loadNamedList,
  saveNamedList,
} from "./savedLists";
import type { ListSnapshot } from "./snapshot";

const ARMY = "bretonnia";
const OTHER_ARMY = "high-elves";
const GAME_SIZE = 2000;
const SMALL_GAME = 1000;
const LARGE_GAME = 3000;

const named = (name: string): ListSnapshot => ({
  name,
  gameSize: GAME_SIZE,
  units: {},
  upgrades: {},
});

describe("named lists", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("round-trips a saved list by name", () => {
    saveNamedList(ARMY, "My List", named("My List"));

    const loaded = loadNamedList(ARMY, "My List");

    expect(loaded).not.toBeNull();
    expect(loaded?.name).toBe("My List");
    expect(loaded?.gameSize).toBe(GAME_SIZE);
  });

  it("lists saved names sorted case-insensitively", () => {
    saveNamedList(ARMY, "zeta", named("zeta"));
    saveNamedList(ARMY, "Alpha", named("Alpha"));

    expect(listSavedNames(ARMY)).toEqual(["Alpha", "zeta"]);
  });

  it("overwrites a list saved under the same name", () => {
    const first = { ...named("dup"), gameSize: SMALL_GAME };
    const second = { ...named("dup"), gameSize: LARGE_GAME };

    saveNamedList(ARMY, "dup", first);
    saveNamedList(ARMY, "dup", second);

    expect(listSavedNames(ARMY)).toEqual(["dup"]);
    expect(loadNamedList(ARMY, "dup")?.gameSize).toBe(LARGE_GAME);
  });

  it("deletes one list and leaves the others", () => {
    saveNamedList(ARMY, "a", named("a"));
    saveNamedList(ARMY, "b", named("b"));
    deleteNamedList(ARMY, "a");

    expect(listSavedNames(ARMY)).toEqual(["b"]);
    expect(loadNamedList(ARMY, "a")).toBeNull();
  });

  it("isolates saved lists per army", () => {
    saveNamedList(ARMY, "shared-name", named("shared-name"));

    expect(listSavedNames(OTHER_ARMY)).toEqual([]);
    expect(loadNamedList(OTHER_ARMY, "shared-name")).toBeNull();
  });

  it("returns [] for an army with no saved lists", () => {
    expect(listSavedNames(ARMY)).toEqual([]);
  });

  it("saves and loads a list named like an inherited object key", () => {
    saveNamedList(ARMY, "__proto__", named("__proto__"));
    saveNamedList(ARMY, "constructor", named("constructor"));

    expect(listSavedNames(ARMY)).toEqual(["__proto__", "constructor"]);
    expect(loadNamedList(ARMY, "__proto__")?.name).toBe("__proto__");
    expect(loadNamedList(ARMY, "constructor")?.name).toBe("constructor");
  });

  it("finds no list under an inherited object key that was never saved", () => {
    saveNamedList(ARMY, "My List", named("My List"));

    expect(loadNamedList(ARMY, "constructor")).toBeNull();
    expect(listSavedNames(ARMY)).toEqual(["My List"]);
  });
});
