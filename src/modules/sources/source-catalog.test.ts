import { describe, expect, test } from "vitest";

import { buildSourceRecord } from "./source-catalog";

describe("buildSourceRecord", () => {
  test("creates a source record with refresh metadata", () => {
    expect(
      buildSourceRecord({
        operatorSlug: "demo-netz",
        sourceUrl: "https://example.com/preise.pdf",
        updateStrategy: "quarterly-review"
      })
    ).toMatchObject({
      operatorSlug: "demo-netz",
      sourceSlug: "demo-netz-example-com-preise-pdf",
      sourceUrl: "https://example.com/preise.pdf",
      updateStrategy: "quarterly-review",
      documentType: "pdf",
      providerHint: "example.com",
      refreshWindowDays: 90,
      parserMode: "pending",
      reviewStatus: "unverified"
    });
  });
});
