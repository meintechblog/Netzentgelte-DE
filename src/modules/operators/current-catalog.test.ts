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
        priceBasis: "assumed-netto",
        timeWindows: [],
        bands: [
          {
            key: "NT",
            label: "Niedertarifstufe",
            valueCtPerKwh: "3.03",
            sourceQuote: "Niedertarifstufe 3,03 ct/kWh",
            priceBasis: "assumed-netto"
          },
          {
            key: "ST",
            label: "Standardtarifstufe",
            valueCtPerKwh: "7.57",
            sourceQuote: "Standardtarifstufe 7,57 ct/kWh",
            priceBasis: "assumed-netto"
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
    const netzDuesseldorf = published.find((entry) => entry.slug === "netz-duesseldorf");
    const nrmNetzdienste = published.find((entry) => entry.slug === "nrm-netzdienste");
    const thueringerEnergienetze = published.find(
      (entry) => entry.slug === "thueringer-energienetze"
    );
    const avacon = published.find((entry) => entry.slug === "avacon-netz");
    const nordnetz = published.find((entry) => entry.slug === "nordnetz");
    const twsNetz = published.find((entry) => entry.slug === "tws-netz");
    const heidelbergNetze = published.find((entry) => entry.slug === "heidelberg-netze");
    const achim = published.find((entry) => entry.slug === "stadtwerke-achim");
    const abita = published.find((entry) => entry.slug === "abita-energie-otterberg");
    const andernach = published.find((entry) => entry.slug === "stadtwerke-andernach-energie");
    const altdorf = published.find((entry) => entry.slug === "stadtwerke-altdorf");
    const badAibling = published.find((entry) => entry.slug === "stadtwerke-bad-aibling");

    expect(published).toHaveLength(78);
    expect(abita).toMatchObject({
      reviewStatus: "verified",
      validFrom: "2026-01-01",
      sourcePageUrl: "https://www.abita-energie.de/netze/netznutzung/netznutzung",
      documentUrl:
        "https://www.abita-energie.de/fileadmin/dokumente/Netze/Entgelte/Preisblatt_Strom_NNE_01012026.pdf"
    });
    expect(heidelbergNetze).toBeUndefined();
    expect(ewrNetz).toBeUndefined();
    expect(achim).toMatchObject({
      reviewStatus: "verified",
      validFrom: "2026-01-01",
      sourcePageUrl:
        "https://www.stadtwerke-achim.de/de/Netz-Hausanschluesse/Privatkunden/Service/Veroeffentlichungspflichten-Strom/Stromnetz-2020/Netzzugang-Entgelte1.html",
      documentUrl:
        "https://www.stadtwerke-achim.de/de/Netz-Hausanschluesse/Privatkunden/Service/Veroeffentlichungspflichten-Strom/Stromnetz-2020/Netzzugang-Entgelte1/PB-KK-NNE-Strom-2026-01-01.pdf"
    });
    expect(altdorf).toMatchObject({
      reviewStatus: "verified",
      validFrom: "2026-01-01",
      sourcePageUrl: "https://www.stadtwerke-altdorf.de/stromnetz/veroeffentlichungen",
      documentUrl:
        "https://www.stadtwerke-altdorf.de/fileadmin/user_upload/2025_Netznutzungsentgelte_endgueltig_fuer_2026.pdf"
    });

    expect(published).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slug: "netze-bw",
          sourcePageUrl: expect.stringContaining("https://"),
          bands: expect.arrayContaining([
            expect.objectContaining({
              key: "NT"
            })
          ])
        })
      ])
    );
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
      reviewStatus: "verified",
      priceBasis: "assumed-netto",
      compliance: expect.objectContaining({
        status: "compliant"
      })
    });
    expect(netzeBw).toMatchObject({
      priceBasis: "assumed-netto",
      compliance: expect.objectContaining({
        status: "compliant",
        violations: []
      })
    });
    expect(mainzerNetze?.timeWindows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          seasonLabel: "Q1 und Q4 2026",
          bandKey: "NT",
          timeRangeLabel: "22:00-06:00"
        }),
        expect.objectContaining({
          seasonLabel: "Q2-Q3 2026",
          bandKey: "ST",
          timeRangeLabel: "00:00-24:00"
        })
      ])
    );
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
          seasonLabel: "Q1-Q4 2026",
          bandKey: "ST",
          timeRangeLabel: "06:00-11:00"
        }),
        expect.objectContaining({
          seasonLabel: "Q1-Q4 2026",
          bandKey: "NT",
          timeRangeLabel: "23:00-06:00"
        })
      ])
    );
    expect(ingolstadtNetze).toMatchObject({
      validFrom: "2026-01-01"
    });
    expect(ingolstadtNetze?.timeWindows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          bandKey: "HT",
          timeRangeLabel: "16:30-19:30"
        })
      ])
    );
    expect(netzDuesseldorf).toMatchObject({
      reviewStatus: "verified"
    });
    expect(netzDuesseldorf?.timeWindows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          seasonLabel: "Q2-Q3 2026",
          bandKey: "ST",
          timeRangeLabel: "00:00-24:00"
        })
      ])
    );
    expect(thueringerEnergienetze?.timeWindows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          seasonLabel: "Q1 und Q4 2026",
          bandKey: "HT",
          timeRangeLabel: "17:30-19:00"
        })
      ])
    );
    expect(nrmNetzdienste).toMatchObject({
      reviewStatus: "verified",
      documentUrl:
        "https://www.nrm-netzdienste.de/resource/blob/162202/19a814ee3b72701e0d3e752dd10a83e1/20251212-nrm-pb-1-strom-ab-01-01-2026-el-8-0-s-1--data.xlsx",
      bands: expect.arrayContaining([
        expect.objectContaining({
          key: "ST",
          valueCtPerKwh: "9.23"
        })
      ])
    });
    expect(nrmNetzdienste?.timeWindows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          seasonLabel: "Q1 und Q4 2026",
          bandKey: "HT",
          timeRangeLabel: "16:45-20:00"
        }),
        expect.objectContaining({
          seasonLabel: "Q1 und Q4 2026",
          bandKey: "ST",
          timeRangeLabel: "20:00-00:45"
        }),
        expect.objectContaining({
          seasonLabel: "Q2-Q3 2026",
          bandKey: "ST",
          timeRangeLabel: "00:00-24:00"
        })
      ])
    );
    expect(avacon).toMatchObject({
      reviewStatus: "verified",
      documentUrl:
        "https://www.avacon-netz.de/content/dam/revu-global/avacon-netz/documents/netzentgelte-strom/2026/Preisbl%C3%A4tter_AVANG_Strom_01.01.2026%20%281%29.pdf",
      bands: expect.arrayContaining([
        expect.objectContaining({
          key: "ST",
          valueCtPerKwh: "6.04"
        }),
        expect.objectContaining({
          key: "HT",
          valueCtPerKwh: "8.41"
        }),
        expect.objectContaining({
          key: "NT",
          valueCtPerKwh: "0.60"
        })
      ])
    });
    expect(avacon?.timeWindows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          seasonLabel: "Q2-Q3 2026",
          bandKey: "ST",
          timeRangeLabel: "00:00-24:00"
        }),
        expect.objectContaining({
          seasonLabel: "Q1 und Q4 2026",
          bandKey: "HT",
          timeRangeLabel: "16:30-21:00"
        }),
        expect.objectContaining({
          seasonLabel: "Q1 und Q4 2026",
          bandKey: "NT",
          timeRangeLabel: "23:00-00:15"
        })
      ])
    );
    expect(nordnetz).toMatchObject({
      reviewStatus: "verified",
      sourcePageUrl: "https://www.nordnetz.com/de/NordNetz/netzinformationen/netzentgelte_strom.html",
      bands: expect.arrayContaining([
        expect.objectContaining({
          key: "HT",
          valueCtPerKwh: "5.21"
        })
      ])
    });
    expect(nordnetz?.timeWindows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          seasonLabel: "Q2-Q3 2026",
          bandKey: "ST",
          timeRangeLabel: "00:00-24:00"
        }),
        expect.objectContaining({
          seasonLabel: "Q1 und Q4 2026",
          bandKey: "HT",
          timeRangeLabel: "18:00-20:00"
        })
      ])
    );
    expect(twsNetz).toMatchObject({
      reviewStatus: "verified",
      priceBasis: "assumed-netto",
      sourcePageUrl: "https://www.tws-netz.de/de/Unsere-Netze/Stromnetz/",
      documentUrl:
        "https://www.tws-netz.de/de/Unsere-Netze/Netze-neu/Stromnetz/Netzzugang-Entgelte/5-132-TWS-Netz-Preisblatt-2026-final.pdf",
      bands: expect.arrayContaining([
        expect.objectContaining({
          key: "NT",
          valueCtPerKwh: "3.21"
        }),
        expect.objectContaining({
          key: "ST",
          valueCtPerKwh: "9.74"
        }),
        expect.objectContaining({
          key: "HT",
          valueCtPerKwh: "12.26"
        })
      ])
    });
    expect(twsNetz?.timeWindows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          seasonLabel: "Q1-Q4 2026",
          bandKey: "NT",
          timeRangeLabel: "00:00-06:00"
        }),
        expect.objectContaining({
          seasonLabel: "Q1-Q4 2026",
          bandKey: "HT",
          timeRangeLabel: "17:00-22:00"
        })
      ])
    );
    expect(andernach).toMatchObject({
      reviewStatus: "verified",
      sourcePageUrl:
        "https://www.stadtwerke-andernach-energie.de/strom/netzbetrieb/netzzugang-netzentgelte/",
      documentUrl:
        "https://www.stadtwerke-andernach-energie.de/app/uploads/2026/01/2025-12-19_Preisblatt-NNE-Strom-ab-01.01.2026.pdf",
      bands: expect.arrayContaining([
        expect.objectContaining({
          key: "NT",
          valueCtPerKwh: "1.49"
        }),
        expect.objectContaining({
          key: "ST",
          valueCtPerKwh: "5.97"
        }),
        expect.objectContaining({
          key: "HT",
          valueCtPerKwh: "7.80"
        })
      ])
    });
    expect(andernach?.timeWindows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          seasonLabel: "Q1-Q4 2026",
          bandKey: "NT",
          timeRangeLabel: "01:00-05:30"
        }),
        expect.objectContaining({
          seasonLabel: "Q1-Q4 2026",
          bandKey: "ST",
          timeRangeLabel: "Alle restlichen Zeiten"
        }),
        expect.objectContaining({
          seasonLabel: "Q1-Q4 2026",
          bandKey: "HT",
          timeRangeLabel: "17:30-20:15"
        })
      ])
    );
    expect(badAibling).toMatchObject({
      reviewStatus: "verified",
      sourcePageUrl: "https://www.stadtwerke-bad-aibling.de/de/Strom/Stromnetz1/Netzzugang-Entgelte/",
      documentUrl:
        "https://www.stadtwerke-bad-aibling.de/de/Strom/Preisblatt-Netznutzung-ab01012026-endgueltig.pdf",
      bands: expect.arrayContaining([
        expect.objectContaining({
          key: "NT",
          valueCtPerKwh: "3.02"
        }),
        expect.objectContaining({
          key: "ST",
          valueCtPerKwh: "7.54"
        }),
        expect.objectContaining({
          key: "HT",
          valueCtPerKwh: "10.90"
        })
      ])
    });
    expect(badAibling?.timeWindows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          seasonLabel: "Q1-Q4 2026",
          bandKey: "NT",
          timeRangeLabel: "00:45-05:15"
        }),
        expect.objectContaining({
          seasonLabel: "Q1-Q4 2026",
          bandKey: "ST",
          timeRangeLabel: "Alle restlichen Zeiten"
        }),
        expect.objectContaining({
          seasonLabel: "Q1-Q4 2026",
          bandKey: "HT",
          timeRangeLabel: "17:00-19:00"
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
