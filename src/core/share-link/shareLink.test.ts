import { describe, expect, it } from "vitest";
import { buildShareUrl } from "./shareLink";

const ORIGIN = "https://wmr.example";

describe("buildShareUrl", () => {
  it("links to the build route on this origin", () => {
    const url = buildShareUrl({
      armyId: "empire",
      encoded: "abc",
      origin: ORIGIN,
    });

    expect(url).toBe("https://wmr.example/build/empire?list=abc");
  });
});
