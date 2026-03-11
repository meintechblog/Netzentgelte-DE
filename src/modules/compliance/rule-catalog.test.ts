import { describe, expect, test } from "vitest";

import { getActiveModul3RuleSet } from "./rule-catalog";

describe("getActiveModul3RuleSet", () => {
  test("loads the structured BDEW Modul-3 rule set with stable machine-checkable rule ids", () => {
    const ruleSet = getActiveModul3RuleSet();

    expect(ruleSet.ruleSetId).toBe("bdew-modul-3-v1-1");
    expect(ruleSet.sourceDocumentUrl).toBe(
      "https://www.bdew.de/media/documents/BDEW-AWH_Modul_3_V1.1_Korrektur070225.pdf"
    );
    expect(ruleSet.rules.map((rule) => rule.ruleId)).toEqual([
      "ht_min_2h_per_day",
      "ht_max_100_percent_above_st",
      "nt_between_10_and_40_percent_of_st",
      "at_least_two_quarters_active",
      "same_time_windows_across_quarters"
    ]);
  });
});
