import { describe, expect, it } from "vitest";
import { isCharacter } from "./unitTypes";

describe("isCharacter", () => {
  it("is true for General, Hero, and Wizard", () => {
    expect(isCharacter("General")).toBe(true);
    expect(isCharacter("Hero")).toBe(true);
    expect(isCharacter("Wizard")).toBe(true);
  });

  it("is false for troop types", () => {
    expect(isCharacter("Infantry")).toBe(false);
    expect(isCharacter("Cavalry")).toBe(false);
    expect(isCharacter("Monster")).toBe(false);
  });
});
