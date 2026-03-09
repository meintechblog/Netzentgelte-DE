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

  test("detects xlsx source documents from the official file url", () => {
    expect(
      buildSourceRecord({
        operatorSlug: "nrm-netzdienste",
        sourceUrl:
          "https://www.nrm-netzdienste.de/resource/blob/162202/19a814ee3b72701e0d3e752dd10a83e1/20251212-nrm-pb-1-strom-ab-01-01-2026-el-8-0-s-1--data.xlsx",
        updateStrategy: "quarterly-review"
      })
    ).toMatchObject({
      documentType: "xlsx",
      providerHint: "nrm-netzdienste.de"
    });
  });
});
