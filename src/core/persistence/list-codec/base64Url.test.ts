import { describe, expect, it } from "vitest";
import { fromBase64Url, toBase64Url } from "./base64Url";

// "??>" encodes to "Pz8+" and "???" to "Pz8/", which hit both url-unsafe
// characters.
const PLUS_SOURCE = "??>";
const SLASH_SOURCE = "???";

describe("toBase64Url", () => {
  it("swaps the url-unsafe characters for - and _", () => {
    expect(toBase64Url(PLUS_SOURCE)).toBe("Pz8-");
    expect(toBase64Url(SLASH_SOURCE)).toBe("Pz8_");
  });

  it("drops the padding", () => {
    expect(toBase64Url("a")).toBe("YQ");
  });
});

describe("fromBase64Url", () => {
  it("round-trips every padding length", () => {
    const samples = ["a", "ab", "abc", "abcd", PLUS_SOURCE, SLASH_SOURCE];

    for (const sample of samples) {
      expect(fromBase64Url(toBase64Url(sample))).toBe(sample);
    }
  });
});
