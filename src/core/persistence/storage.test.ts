import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  readItem,
  readJson,
  removeItem,
  writeItem,
  writeJson,
} from "./storage";

const KEY = "wmr:test";

const blockStorage = () => {
  const blocked = () => {
    throw new Error("storage blocked");
  };

  vi.spyOn(Storage.prototype, "getItem").mockImplementation(blocked);
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(blocked);
  vi.spyOn(Storage.prototype, "removeItem").mockImplementation(blocked);
};

describe("storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reads back what was written", () => {
    writeItem(KEY, "value");

    expect(readItem(KEY)).toBe("value");
  });

  it("reads null for a missing key", () => {
    expect(readItem(KEY)).toBeNull();
  });

  it("removes a key", () => {
    writeItem(KEY, "value");
    removeItem(KEY);

    expect(readItem(KEY)).toBeNull();
  });

  it("round-trips JSON", () => {
    writeJson(KEY, { twoColumn: true });

    expect(readJson(KEY)).toEqual({ twoColumn: true });
  });

  it("reads undefined JSON for a missing key or a corrupt value", () => {
    expect(readJson(KEY)).toBeUndefined();

    writeItem(KEY, "{not json");

    expect(readJson(KEY)).toBeUndefined();
  });

  it("degrades to nothing stored when storage is blocked", () => {
    blockStorage();

    expect(() => writeItem(KEY, "value")).not.toThrow();
    expect(() => writeJson(KEY, ["stats"])).not.toThrow();
    expect(() => removeItem(KEY)).not.toThrow();
    expect(readItem(KEY)).toBeNull();
    expect(readJson(KEY)).toBeUndefined();
  });
});
