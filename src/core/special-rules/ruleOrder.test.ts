import { describe, expect, it } from "vitest";
import { byRuleOrder } from "./ruleOrder";

const FIRST = { order: 1 };
const SECOND = { order: 2 };
const UNNUMBERED = {};

describe("byRuleOrder", () => {
  it("sorts rules by their footnote number", () => {
    expect([SECOND, FIRST].sort(byRuleOrder)).toEqual([FIRST, SECOND]);
  });

  it("puts unnumbered rules first, as number zero", () => {
    expect([FIRST, UNNUMBERED].sort(byRuleOrder)).toEqual([UNNUMBERED, FIRST]);
  });
});
