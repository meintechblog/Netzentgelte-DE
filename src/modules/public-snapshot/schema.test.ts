import { describe, expect, test } from "vitest";

import { parsePublicSnapshot } from "./schema";

describe("parsePublicSnapshot", () => {
  test("requires the public snapshot top-level contract", () => {
    expect(() =>
      parsePublicSnapshot({
        generatedAt: "2026-03-10T17:00:00.000Z",
        operatorCount: 1
      })
    ).toThrowError();

    expect(
      parsePublicSnapshot({
        generatedAt: "2026-03-10T17:00:00.000Z",
        operatorCount: 1,
        operators: [],
        map: {
          attribution: "GeoBasis-DE",
          mappedOperatorCount: 0,
          hiddenOperatorCount: 0,
          states: [],
          operators: []
        },
        sources: [],
        compliance: {
          ruleSetId: "modul-3",
          title: "§14a Modul 3",
          version: "2026",
          sourceDocumentUrl: "https://example.com/rules.pdf",
          sourceDocumentLabel: "Regelwerk",
          rules: []
        }
      })
    ).toMatchObject({
      generatedAt: "2026-03-10T17:00:00.000Z",
      operatorCount: 1,
      operators: [],
      sources: []
    });
  });
});
