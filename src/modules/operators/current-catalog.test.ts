import { describe, expect, test } from "vitest";

import {
  buildPublishedOperators,
  getSeedPublishedOperators,
  shouldUseSeedPublishedOperators
} from "./current-catalog";

describe("buildPublishedOperators", () => {
  test("groups DB-shaped rows into operator-centric current tariff records", () => {
    const published = buildPublishedOperators([
      {
        operatorSlug: "netze-bw",
        operatorName: "Netze BW GmbH",
        regionLabel: "Baden-Wuerttemberg",
        websiteUrl: "https://www.netze-bw.de/",
        validFrom: "2026-01-01",
        reviewStatus: "verified",
        sourcePageUrl: "https://www.netze-bw.de/neuregelung-14a-enwg",
        documentUrl:
          "https://assets.ctfassets.net/xytfb1vrn7of/7eQvxehZzn3ECbR9rALmyD/ecc795b9dcd666ce1f53d9d04362a321/netzentgelte-strom-netze-bw-gmbh-2026.pdf",
        sourceSlug: "netze-bw-netze-bw-14a-2026",
        checkedAt: "2026-03-09",
        bandKey: "NT",
        bandLabel: "Niedertarifstufe",
        valueCtPerKwh: "3.03",
        sourceQuote: "Niedertarifstufe 3,03 ct/kWh"
      },
      {
        operatorSlug: "netze-bw",
        operatorName: "Netze BW GmbH",
        regionLabel: "Baden-Wuerttemberg",
        websiteUrl: "https://www.netze-bw.de/",
        validFrom: "2026-01-01",
        reviewStatus: "verified",
        sourcePageUrl: "https://www.netze-bw.de/neuregelung-14a-enwg",
        documentUrl:
          "https://assets.ctfassets.net/xytfb1vrn7of/7eQvxehZzn3ECbR9rALmyD/ecc795b9dcd666ce1f53d9d04362a321/netzentgelte-strom-netze-bw-gmbh-2026.pdf",
        sourceSlug: "netze-bw-netze-bw-14a-2026",
        checkedAt: "2026-03-09",
        bandKey: "ST",
        bandLabel: "Standardtarifstufe",
        valueCtPerKwh: "7.57",
        sourceQuote: "Standardtarifstufe 7,57 ct/kWh"
      }
    ]);

    expect(published).toEqual([
      {
        slug: "netze-bw",
        name: "Netze BW GmbH",
        regionLabel: "Baden-Wuerttemberg",
        websiteUrl: "https://www.netze-bw.de/",
        validFrom: "2026-01-01",
        reviewStatus: "verified",
        sourcePageUrl: "https://www.netze-bw.de/neuregelung-14a-enwg",
        documentUrl:
          "https://assets.ctfassets.net/xytfb1vrn7of/7eQvxehZzn3ECbR9rALmyD/ecc795b9dcd666ce1f53d9d04362a321/netzentgelte-strom-netze-bw-gmbh-2026.pdf",
        sourceSlug: "netze-bw-netze-bw-14a-2026",
        checkedAt: "2026-03-09",
        bands: [
          {
            key: "NT",
            label: "Niedertarifstufe",
            valueCtPerKwh: "3.03",
            sourceQuote: "Niedertarifstufe 3,03 ct/kWh"
          },
          {
            key: "ST",
            label: "Standardtarifstufe",
            valueCtPerKwh: "7.57",
            sourceQuote: "Standardtarifstufe 7,57 ct/kWh"
          }
        ]
      }
    ]);
  });

  test("normalizes numeric tariff strings from the database for UI and API output", () => {
    const published = buildPublishedOperators([
      {
        operatorSlug: "westnetz",
        operatorName: "Westnetz GmbH",
        regionLabel: "Westdeutschland",
        websiteUrl: "https://www.westnetz.de/",
        validFrom: "2026-01-01",
        reviewStatus: "verified",
        sourcePageUrl: "https://www.westnetz.de/de/ueber-westnetz/unser-netz/netzentgelte-strom.html",
        documentUrl:
          "https://www.westnetz.de/content/dam/revu-global/westnetz/documents/ueber-westnetz/unser-netz/netzentgelte-strom/preisblaetter-westnetz-strom-01-01-2026.pdf",
        sourceSlug: "westnetz-westnetz-14a-2026",
        checkedAt: "2026-03-09",
        bandKey: "NT",
        bandLabel: "Niedertarifstufe",
        valueCtPerKwh: "0.9500",
        sourceQuote: "Niedertarifstufe 0,95 ct/kWh"
      },
      {
        operatorSlug: "westnetz",
        operatorName: "Westnetz GmbH",
        regionLabel: "Westdeutschland",
        websiteUrl: "https://www.westnetz.de/",
        validFrom: "2026-01-01",
        reviewStatus: "verified",
        sourcePageUrl: "https://www.westnetz.de/de/ueber-westnetz/unser-netz/netzentgelte-strom.html",
        documentUrl:
          "https://www.westnetz.de/content/dam/revu-global/westnetz/documents/ueber-westnetz/unser-netz/netzentgelte-strom/preisblaetter-westnetz-strom-01-01-2026.pdf",
        sourceSlug: "westnetz-westnetz-14a-2026",
        checkedAt: "2026-03-09",
        bandKey: "ST",
        bandLabel: "Standardtarifstufe",
        valueCtPerKwh: "9.5000",
        sourceQuote: "Standardtarifstufe 9,50 ct/kWh"
      }
    ]);

    expect(published[0]?.bands).toEqual([
      expect.objectContaining({
        key: "NT",
        valueCtPerKwh: "0.95"
      }),
      expect.objectContaining({
        key: "ST",
        valueCtPerKwh: "9.50"
      })
    ]);
  });
});

describe("getSeedPublishedOperators", () => {
  test("keeps the current seed-backed published view available for tests", () => {
    const published = getSeedPublishedOperators();

    expect(published[0]).toMatchObject({
      slug: "netze-bw",
      sourcePageUrl: expect.stringContaining("https://"),
      bands: expect.arrayContaining([
        expect.objectContaining({
          key: "NT"
        })
      ])
    });
  });
});

describe("shouldUseSeedPublishedOperators", () => {
  test("uses the seed fallback in test mode or without a database url", () => {
    expect(
      shouldUseSeedPublishedOperators({
        nodeEnv: "test",
        databaseUrl: "postgresql://user:pass@localhost:5432/netzentgelte"
      })
    ).toBe(true);
    expect(
      shouldUseSeedPublishedOperators({
        nodeEnv: "production",
        databaseUrl: ""
      })
    ).toBe(true);
    expect(
      shouldUseSeedPublishedOperators({
        nodeEnv: "production",
        databaseUrl: "postgresql://user:pass@localhost:5432/netzentgelte"
      })
    ).toBe(false);
  });
});
