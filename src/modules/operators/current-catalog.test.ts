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
        timeWindows: [],
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
    const netzeBw = published.find((entry) => entry.slug === "netze-bw");
    const bayernwerk = published.find((entry) => entry.slug === "bayernwerk-netz");
    const westnetz = published.find((entry) => entry.slug === "westnetz");
    const wesernetzBremen = published.find((entry) => entry.slug === "wesernetz-bremen");
    const wesernetzBremerhaven = published.find((entry) => entry.slug === "wesernetz-bremerhaven");
    const eDisNetz = published.find((entry) => entry.slug === "e-dis-netz");
    const lewVerteilnetz = published.find((entry) => entry.slug === "lew-verteilnetz");
    const mainzerNetze = published.find((entry) => entry.slug === "mainzer-netze");
    const nErgie = published.find((entry) => entry.slug === "n-ergie-netz");
    const schwaebischHall = published.find((entry) => entry.slug === "stadtwerke-schwaebisch-hall");
    const mittelhessenNetz = published.find((entry) => entry.slug === "mittelhessen-netz");
    const ingolstadtNetze = published.find((entry) => entry.slug === "stadtwerke-ingolstadt-netze");
    const ewrNetz = published.find((entry) => entry.slug === "ewr-netz");
    const avacon = published.find((entry) => entry.slug === "avacon-netz");
    const nordnetz = published.find((entry) => entry.slug === "nordnetz");
    const heidelbergNetze = published.find((entry) => entry.slug === "heidelberg-netze");

    expect(published).toHaveLength(25);
    expect(avacon).toBeUndefined();
    expect(nordnetz).toBeUndefined();
    expect(heidelbergNetze).toBeUndefined();

    expect(published[0]).toMatchObject({
      slug: "netze-bw",
      sourcePageUrl: expect.stringContaining("https://"),
      bands: expect.arrayContaining([
        expect.objectContaining({
          key: "NT"
        })
      ])
    });
    expect(nErgie?.timeWindows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          bandKey: "HT",
          seasonLabel: "Q1-Q4 2026",
          timeRangeLabel: "18:00-21:00"
        })
      ])
    );
    expect(netzeBw?.timeWindows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          seasonLabel: "Q1-Q4 2026",
          bandKey: "HT",
          timeRangeLabel: "17:00-22:00"
        })
      ])
    );
    expect(bayernwerk?.timeWindows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          seasonLabel: "Q1 2026 (01.01.-31.03.)",
          bandKey: "ST",
          timeRangeLabel: "00:00-24:00"
        }),
        expect.objectContaining({
          seasonLabel: "Q2 2026 (01.04.-30.06.)",
          bandKey: "HT",
          timeRangeLabel: "17:00-22:00"
        })
      ])
    );
    expect(westnetz?.timeWindows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          seasonLabel: "Ganzjährig 2026",
          bandKey: "NT",
          dayLabel: "Täglich",
          timeRangeLabel: "00:00-07:00"
        })
      ])
    );
    expect(wesernetzBremen?.timeWindows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          seasonLabel: "Ganzjährig 2026",
          bandKey: "HT",
          timeRangeLabel: "17:00-19:30"
        })
      ])
    );
    expect(wesernetzBremerhaven?.timeWindows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          seasonLabel: "Ganzjährig 2026",
          bandKey: "HT",
          timeRangeLabel: "16:30-19:30"
        })
      ])
    );
    expect(eDisNetz?.timeWindows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          bandKey: "HT",
          timeRangeLabel: "16:45-20:15"
        })
      ])
    );
    expect(lewVerteilnetz?.timeWindows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          bandKey: "HT",
          timeRangeLabel: "17:00-21:00"
        })
      ])
    );
    expect(mainzerNetze).toMatchObject({
      reviewStatus: "verified"
    });
    expect(schwaebischHall).toMatchObject({
      sourcePageUrl: "https://stadtwerke-hall.de/tarife-angebote/service/downloadcenter/netze",
      documentUrl:
        "https://stadtwerke-hall.de/fileadmin/files/Downloads/Netzdaten_Strom/4_Netzentgelte/4NNE_STW-SHA_ab_01.01.2026.pdf",
      bands: expect.arrayContaining([
        expect.objectContaining({
          key: "NT",
          valueCtPerKwh: "1.11"
        }),
        expect.objectContaining({
          key: "ST",
          valueCtPerKwh: "5.53"
        }),
        expect.objectContaining({
          key: "HT",
          valueCtPerKwh: "8.14"
        })
      ])
    });
    expect(schwaebischHall?.timeWindows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          bandKey: "ST",
          seasonLabel: "Q1/Q2/Q4 2026",
          timeRangeLabel: "07:00-10:00"
        }),
        expect.objectContaining({
          bandKey: "HT",
          seasonLabel: "Q1/Q2/Q4 2026",
          timeRangeLabel: "10:00-14:00"
        }),
        expect.objectContaining({
          bandKey: "ST",
          seasonLabel: "Q3 2026",
          timeRangeLabel: "00:00-24:00"
        })
      ])
    );
    expect(mittelhessenNetz?.timeWindows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          seasonLabel: "Q1 2026",
          bandKey: "ST",
          timeRangeLabel: "00:00-24:00"
        }),
        expect.objectContaining({
          seasonLabel: "Q2-Q3 2026",
          bandKey: "NT",
          timeRangeLabel: "10:00-15:00"
        })
      ])
    );
    expect(ingolstadtNetze).toMatchObject({
      validFrom: "2026-02-01"
    });
    expect(ewrNetz?.timeWindows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          bandKey: "HT",
          timeRangeLabel: "17:00-20:30"
        })
      ])
    );
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
