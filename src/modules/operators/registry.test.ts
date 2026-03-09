import { describe, expect, test } from "vitest";

import { getOperatorRegistry, parseOperatorRegistry } from "./registry";

describe("getOperatorRegistry", () => {
  test("loads curated operators with provenance rich source records", () => {
    const registry = getOperatorRegistry();

    expect(registry.length).toBeGreaterThanOrEqual(3);
    expect(registry[0]).toMatchObject({
      slug: expect.any(String),
      sourceDocuments: expect.arrayContaining([
        expect.objectContaining({
          sourcePageUrl: expect.stringContaining("https://"),
          documentUrl: expect.stringContaining("https://")
        })
      ])
    });
  });

  test("keeps modul-3 band values attached to the source quote when manually curated", () => {
    const registry = getOperatorRegistry();
    const netzeBw = registry.find((entry) => entry.slug === "netze-bw");

    expect(netzeBw).toMatchObject({
      currentTariff: expect.objectContaining({
        sourceDocumentId: expect.any(String),
        reviewStatus: expect.any(String),
        bands: expect.arrayContaining([
          expect.objectContaining({
            key: "NT",
            valueCtPerKwh: expect.any(String),
            sourceQuote: expect.any(String)
          })
        ])
      })
    });
  });

  test("supports explicit seasonal and hourly tariff windows when the source provides them", () => {
    const registry = getOperatorRegistry();
    const nErgie = registry.find((entry) => entry.slug === "n-ergie-netz");

    expect(nErgie).toMatchObject({
      currentTariff: expect.objectContaining({
        timeWindows: expect.arrayContaining([
          expect.objectContaining({
            bandKey: "HT",
            seasonLabel: "Q1-Q4 2026",
            dayLabel: "Alle Tage",
            timeRangeLabel: "18:00-21:00"
          }),
          expect.objectContaining({
            bandKey: "NT",
            timeRangeLabel: "23:00-06:00"
          })
        ])
      })
    });
  });

  test("rejects tariffs that reference an unknown source document", () => {
    expect(() =>
      parseOperatorRegistry([
        {
          slug: "broken-operator",
          name: "Broken Operator",
          regionLabel: "Nord",
          websiteUrl: "https://example.com",
          registrySourceIds: [],
          sourceDocuments: [],
          currentTariff: {
            modelKey: "14a-model-3",
            validFrom: "2026-01-01",
            reviewStatus: "verified",
            sourceDocumentId: "missing-document",
            sourcePageUrl: "https://example.com/source",
            documentUrl: "https://example.com/file.pdf",
            bands: []
          }
        }
      ])
    ).toThrow(/source document/i);
  });
});
