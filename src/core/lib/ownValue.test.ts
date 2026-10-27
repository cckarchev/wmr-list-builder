import { describe, expect, it } from "vitest";
import { ownValue } from "./ownValue";

const RECORD: Record<string, string> = { goblin: "Goblin" };

describe("ownValue", () => {
  it("returns the value stored under the key", () => {
    expect(ownValue(RECORD, "goblin")).toBe("Goblin");
  });

  it("returns undefined for a missing key", () => {
    expect(ownValue(RECORD, "orcs")).toBeUndefined();
  });

  it("ignores keys inherited from Object.prototype", () => {
    expect(ownValue(RECORD, "constructor")).toBeUndefined();
    expect(ownValue(RECORD, "toString")).toBeUndefined();
    expect(ownValue(RECORD, "__proto__")).toBeUndefined();
  });
});
