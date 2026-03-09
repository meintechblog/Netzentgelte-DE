import { describe, expect, test } from "vitest";

import { getOperatorRegistry } from "./registry";
import { buildRegistryImportPayload, summarizeRegistryImport } from "./registry-import";

describe("buildRegistryImportPayload", () => {
  test("builds operator, source catalog and tariff rows from the curated registry", () => {
    const payload = buildRegistryImportPayload(getOperatorRegistry());

    expect(payload.operators[0]).toMatchObject({
      slug: "netze-bw",
      name: "Netze BW GmbH",
      regionLabel: "Baden-Württemberg",
      websiteUrl: "https://www.netze-bw.de/"
    });

    expect(payload.sources[0]).toMatchObject({
      operatorSlug: "netze-bw",
      sourceSlug: "netze-bw-netze-bw-14a-2026",
      pageUrl: "https://www.netze-bw.de/neuregelung-14a-enwg",
      sourceUrl: "https://assets.ctfassets.net/xytfb1vrn7of/7eQvxehZzn3ECbR9rALmyD/ecc795b9dcd666ce1f53d9d04362a321/netzentgelte-strom-netze-bw-gmbh-2026.pdf",
      reviewStatus: "verified"
    });

    expect(payload.tariffs[0]).toMatchObject({
      operatorSlug: "netze-bw",
      sourceSlug: "netze-bw-netze-bw-14a-2026",
      modelKey: "14a-model-3",
      bandKey: "NT",
      valueCtPerKwh: "3.03",
      sourceQuote: "Niedertarifstufe 3,03 ct/kWh"
    });
  });

  test("expands modul-3 bands into individual tariff rows", () => {
    const payload = buildRegistryImportPayload(getOperatorRegistry());

    expect(payload.tariffs).toHaveLength(69);
    expect(payload.tariffs.filter((tariff) => tariff.operatorSlug === "westnetz")).toHaveLength(3);
  });
});

describe("summarizeRegistryImport", () => {
  test("counts operators, sources and tariff rows for import logging", () => {
    const summary = summarizeRegistryImport(buildRegistryImportPayload(getOperatorRegistry()));

    expect(summary).toEqual({
      operatorCount: 23,
      sourceCount: 23,
      tariffCount: 69
    });
  });
});
