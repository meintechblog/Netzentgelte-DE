import { describe, expect, test } from "vitest";

import { withBasePath } from "../../lib/base-path";
import { buildHistoricalTariffs, getSeedHistoricalTariffs } from "./history-catalog";

describe("buildHistoricalTariffs", () => {
  test("groups DB-shaped history rows into tariff revisions with snapshot provenance", () => {
    const history = buildHistoricalTariffs([
      {
        operatorSlug: "netze-bw",
        operatorName: "Netze BW GmbH",
        regionLabel: "Baden-Wuerttemberg",
        websiteUrl: "https://www.netze-bw.de/",
        validFrom: "2026-01-01",
        validUntil: null,
        reviewStatus: "verified",
        sourcePageUrl: "https://www.netze-bw.de/neuregelung-14a-enwg",
        documentUrl:
          "https://assets.ctfassets.net/xytfb1vrn7of/7eQvxehZzn3ECbR9rALmyD/ecc795b9dcd666ce1f53d9d04362a321/netzentgelte-strom-netze-bw-gmbh-2026.pdf",
        sourceSlug: "netze-bw-netze-bw-14a-2026",
        checkedAt: "2026-03-09",
        latestSnapshotFetchedAt: "2026-03-09T01:23:00.000Z",
        latestSnapshotHash: "abc123",
        latestSnapshotStoragePath:
          "artifacts/netze-bw-netze-bw-14a-2026/2026-03-09/netzentgelte-strom-netze-bw-gmbh-2026.pdf",
        bandKey: "NT",
        bandLabel: "Niedertarifstufe",
        valueCtPerKwh: "3.0300",
        sourceQuote: "Niedertarifstufe 3,03 ct/kWh"
      },
      {
        operatorSlug: "netze-bw",
        operatorName: "Netze BW GmbH",
        regionLabel: "Baden-Wuerttemberg",
        websiteUrl: "https://www.netze-bw.de/",
        validFrom: "2026-01-01",
        validUntil: null,
        reviewStatus: "verified",
        sourcePageUrl: "https://www.netze-bw.de/neuregelung-14a-enwg",
        documentUrl:
          "https://assets.ctfassets.net/xytfb1vrn7of/7eQvxehZzn3ECbR9rALmyD/ecc795b9dcd666ce1f53d9d04362a321/netzentgelte-strom-netze-bw-gmbh-2026.pdf",
        sourceSlug: "netze-bw-netze-bw-14a-2026",
        checkedAt: "2026-03-09",
        latestSnapshotFetchedAt: "2026-03-09T01:23:00.000Z",
        latestSnapshotHash: "abc123",
        latestSnapshotStoragePath:
          "artifacts/netze-bw-netze-bw-14a-2026/2026-03-09/netzentgelte-strom-netze-bw-gmbh-2026.pdf",
        bandKey: "HT",
        bandLabel: "Hochtarifstufe",
        valueCtPerKwh: "11.0600",
        sourceQuote: "Hochtarifstufe 11,06 ct/kWh"
      }
    ]);

    expect(history).toEqual([
      expect.objectContaining({
        slug: "netze-bw",
        validFrom: "2026-01-01",
        reviewStatus: "verified",
        latestSnapshotHash: "abc123",
        artifactApiUrl: withBasePath(
          "/api/artifacts/netze-bw-netze-bw-14a-2026/2026-03-09/netzentgelte-strom-netze-bw-gmbh-2026.pdf"
        ),
        bands: [
          expect.objectContaining({
            key: "NT",
            valueCtPerKwh: "3.03"
          }),
          expect.objectContaining({
            key: "HT",
            valueCtPerKwh: "11.06"
          })
        ]
      })
    ]);
  });

  test("prefixes history artifact URLs with the public base path when configured", () => {
    const previousBasePath = process.env.NEXT_PUBLIC_BASE_PATH;
    process.env.NEXT_PUBLIC_BASE_PATH = "/netzentgelte-deutschland";

    try {
      const history = buildHistoricalTariffs([
        {
          operatorSlug: "netze-bw",
          operatorName: "Netze BW GmbH",
          regionLabel: "Baden-Wuerttemberg",
          websiteUrl: "https://www.netze-bw.de/",
          validFrom: "2026-01-01",
          validUntil: null,
          reviewStatus: "verified",
          sourcePageUrl: "https://www.netze-bw.de/neuregelung-14a-enwg",
          documentUrl:
            "https://assets.ctfassets.net/xytfb1vrn7of/7eQvxehZzn3ECbR9rALmyD/ecc795b9dcd666ce1f53d9d04362a321/netzentgelte-strom-netze-bw-gmbh-2026.pdf",
          sourceSlug: "netze-bw-netze-bw-14a-2026",
          checkedAt: "2026-03-09",
          latestSnapshotFetchedAt: "2026-03-09T01:23:00.000Z",
          latestSnapshotHash: "abc123",
          latestSnapshotStoragePath:
            "artifacts/netze-bw-netze-bw-14a-2026/2026-03-09/netzentgelte-strom-netze-bw-gmbh-2026.pdf",
          bandKey: "NT",
          bandLabel: "Niedertarifstufe",
          valueCtPerKwh: "3.0300",
          sourceQuote: "Niedertarifstufe 3,03 ct/kWh"
        }
      ]);

      expect(history[0]?.artifactApiUrl).toBe(
        "/netzentgelte-deutschland/api/artifacts/netze-bw-netze-bw-14a-2026/2026-03-09/netzentgelte-strom-netze-bw-gmbh-2026.pdf"
      );
    } finally {
      if (previousBasePath === undefined) {
        delete process.env.NEXT_PUBLIC_BASE_PATH;
      } else {
        process.env.NEXT_PUBLIC_BASE_PATH = previousBasePath;
      }
    }
  });
});

describe("getSeedHistoricalTariffs", () => {
  test("keeps a seed-backed tariff history feed available when no database is configured", () => {
    const history = getSeedHistoricalTariffs();
    const netzeBw = history.find((entry) => entry.slug === "netze-bw");

    expect(netzeBw).toMatchObject({
      sourceSlug: "netze-bw-netze-bw-14a-2026",
      timeWindows: expect.arrayContaining([
        expect.objectContaining({
          bandKey: "HT",
          timeRangeLabel: "17:00-22:00"
        })
      ])
    });
  });
});
