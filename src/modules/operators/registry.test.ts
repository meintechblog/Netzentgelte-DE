import { describe, expect, test } from "vitest";

import { getOperatorRegistry, parseOperatorRegistry } from "./registry";

describe("getOperatorRegistry", () => {
  test("loads curated operators with provenance rich source records", () => {
    const registry = getOperatorRegistry();

    expect(registry.length).toBeGreaterThanOrEqual(23);
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

  test("includes the next official operator slice for LEW, E.DIS and Mainzer Netze", () => {
    const registry = getOperatorRegistry();

    expect(registry).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slug: "lew-verteilnetz",
          currentTariff: expect.objectContaining({
            reviewStatus: "verified",
            timeWindows: expect.arrayContaining([
              expect.objectContaining({
                bandKey: "HT",
                timeRangeLabel: "17:00-21:00"
              })
            ])
          })
        }),
        expect.objectContaining({
          slug: "e-dis-netz",
          currentTariff: expect.objectContaining({
            reviewStatus: "verified",
            timeWindows: expect.arrayContaining([
              expect.objectContaining({
                bandKey: "HT",
                timeRangeLabel: "16:45-20:15"
              })
            ])
          })
        }),
        expect.objectContaining({
          slug: "mainzer-netze",
          currentTariff: expect.objectContaining({
            reviewStatus: "verified",
            timeWindows: expect.arrayContaining([
              expect.objectContaining({
                bandKey: "HT",
                seasonLabel: "Q1 und Q4 2026",
                timeRangeLabel: "16:45-20:00"
              })
            ])
          })
        })
      ])
    );
  });

  test("adds the next verified operator batch including Stadtwerke Schwaebisch Hall and nine additional official sources", () => {
    const registry = getOperatorRegistry();

    expect(registry).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slug: "stadtwerke-schwaebisch-hall",
          currentTariff: expect.objectContaining({
            reviewStatus: "verified",
            timeWindows: expect.arrayContaining([
              expect.objectContaining({
                bandKey: "HT",
                seasonLabel: "Ganzjährig 2026",
                timeRangeLabel: "06:00-10:00"
              }),
              expect.objectContaining({
                bandKey: "HT",
                seasonLabel: "Ganzjährig 2026",
                timeRangeLabel: "17:00-21:00"
              })
            ])
          })
        }),
        expect.objectContaining({
          slug: "mittelhessen-netz",
          currentTariff: expect.objectContaining({
            reviewStatus: "verified",
            timeWindows: expect.arrayContaining([
              expect.objectContaining({
                seasonLabel: "Q2-Q3 2026",
                bandKey: "HT",
                timeRangeLabel: "17:00-22:00"
              })
            ])
          })
        }),
        expect.objectContaining({
          slug: "netze-odr",
          currentTariff: expect.objectContaining({
            reviewStatus: "verified",
            timeWindows: expect.arrayContaining([
              expect.objectContaining({
                seasonLabel: "Q2-Q3 2026",
                bandKey: "NT",
                timeRangeLabel: "10:00-15:00"
              })
            ])
          })
        }),
        expect.objectContaining({
          slug: "stadtwerke-ingolstadt-netze",
          currentTariff: expect.objectContaining({
            validFrom: "2026-02-01",
            timeWindows: expect.arrayContaining([
              expect.objectContaining({
                bandKey: "HT",
                timeRangeLabel: "17:00-22:00"
              })
            ])
          })
        }),
        expect.objectContaining({
          slug: "nordnetz",
          currentTariff: expect.objectContaining({
            timeWindows: expect.arrayContaining([
              expect.objectContaining({
                seasonLabel: "Q1 und Q4 2026",
                bandKey: "HT",
                timeRangeLabel: "18:00-20:00"
              }),
              expect.objectContaining({
                seasonLabel: "Q2-Q3 2026",
                bandKey: "ST",
                timeRangeLabel: "00:00-24:00"
              })
            ])
          })
        }),
        expect.objectContaining({
          slug: "heidelberg-netze",
          currentTariff: expect.objectContaining({
            timeWindows: expect.arrayContaining([
              expect.objectContaining({
                seasonLabel: "Q3 2026",
                bandKey: "HT",
                timeRangeLabel: "17:00-21:00"
              })
            ])
          })
        }),
        expect.objectContaining({
          slug: "ewr-netz",
          currentTariff: expect.objectContaining({
            timeWindows: expect.arrayContaining([
              expect.objectContaining({
                bandKey: "HT",
                timeRangeLabel: "17:00-20:30"
              })
            ])
          })
        }),
        expect.objectContaining({
          slug: "geranetz",
          currentTariff: expect.objectContaining({
            timeWindows: expect.arrayContaining([
              expect.objectContaining({
                seasonLabel: "Q2-Q3 2026",
                bandKey: "HT",
                timeRangeLabel: "17:00-22:00"
              })
            ])
          })
        }),
        expect.objectContaining({
          slug: "allgaeunetz",
          currentTariff: expect.objectContaining({
            timeWindows: expect.arrayContaining([
              expect.objectContaining({
                seasonLabel: "Q1 und Q4 2026",
                bandKey: "ST",
                timeRangeLabel: "00:00-24:00"
              })
            ])
          })
        }),
        expect.objectContaining({
          slug: "e-netz-suedhessen",
          currentTariff: expect.objectContaining({
            timeWindows: expect.arrayContaining([
              expect.objectContaining({
                seasonLabel: "Q2-Q3 2026",
                bandKey: "HT",
                timeRangeLabel: "17:00-22:00"
              })
            ])
          })
        })
      ])
    );
  });

  test("replaces the broken legacy source links with current official publication URLs", () => {
    const registry = getOperatorRegistry();

    expect(registry).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slug: "swm-infrastruktur",
          sourceDocuments: expect.arrayContaining([
            expect.objectContaining({
              sourcePageUrl: "https://www.swm-infrastruktur.de/strom/netzzugang/netznutzungsentgelte",
              documentUrl:
                "https://www.swm-infrastruktur.de/dam/swm-infrastruktur/dokumente/strom/netzzugang-netznutzungsentgelte/preisblaetter-2026/strom-preisblatt-2026.pdf"
            })
          ])
        }),
        expect.objectContaining({
          slug: "stadtwerke-schwaebisch-hall",
          websiteUrl: "https://stadtwerke-hall.de/",
          sourceDocuments: expect.arrayContaining([
            expect.objectContaining({
              sourcePageUrl: "https://stadtwerke-hall.de/tarife-angebote/service/downloadcenter/netze",
              documentUrl:
                "https://stadtwerke-hall.de/fileadmin/files/Downloads/Netzdaten_Strom/4_Netzentgelte/4NNE_STW-SHA_ab_01.01.2026.pdf"
            })
          ])
        }),
        expect.objectContaining({
          slug: "netze-odr",
          sourceDocuments: expect.arrayContaining([
            expect.objectContaining({
              sourcePageUrl: "https://www.netze-odr.de/veroeffentlichungen/strom",
              documentUrl:
                "https://www.netze-odr.de/fileadmin/Netze-ODR/Dokumente/Unternehmen/Veroeffentlichungen/Netzentgelte/Netzentgelte_Strom_2026.pdf"
            })
          ])
        }),
        expect.objectContaining({
          slug: "stadtwerke-ingolstadt-netze",
          websiteUrl: "https://www.swi-netze.de/",
          sourceDocuments: expect.arrayContaining([
            expect.objectContaining({
              sourcePageUrl: "https://www.swi-netze.de/entgelte/",
              documentUrl:
                "https://www.swi-netze.de/fileadmin/media/04_Netze/C_Netze_Downloads/PDFs/01_Strom/Entgelte/2026_01_01_Preisblatt_SWI_Strom_2026.pdf"
            })
          ])
        }),
        expect.objectContaining({
          slug: "nordnetz",
          websiteUrl: "https://nordnetz.com/",
          sourceDocuments: expect.arrayContaining([
            expect.objectContaining({
              sourcePageUrl: "https://nordnetz.com/de/strom/netzzugang-strom/netzentgelte",
              documentUrl:
                "https://nordnetz.com/resource/blob/149336/fcd578ca870cff42b8da562f789ee3e9/preisblatt6a-14a-enwg-modul3-2026-data.pdf"
            })
          ])
        }),
        expect.objectContaining({
          slug: "heidelberg-netze",
          websiteUrl: "https://www.netze-heidelberg.de/",
          sourceDocuments: expect.arrayContaining([
            expect.objectContaining({
              sourcePageUrl: "https://www.netze-heidelberg.de/veroeffentlichung-strom-gas",
              documentUrl:
                "https://www.netze-heidelberg.de/de/Veroeffentlichungspflichten/Stromnetz/Preisblatt-Netznutzung-Strom-2026.pdf"
            })
          ])
        }),
        expect.objectContaining({
          slug: "ewr-netz",
          sourceDocuments: expect.arrayContaining([
            expect.objectContaining({
              sourcePageUrl: "https://www.ewr-netz.de/kunden/lieferanten/netzkosten/",
              documentUrl:
                "https://www.ewr-netz.de/fileadmin/data/downloads/Unternehmen/Veroeffentlichungspflichten/Netzkosten/Preisblaetter/Strom/2026/EWR_Netz_GmbH_Preisblatt_NE-Strom_26_end%C3%BCltig_20251219.pdf"
            })
          ])
        }),
        expect.objectContaining({
          slug: "geranetz",
          sourceDocuments: expect.arrayContaining([
            expect.objectContaining({
              sourcePageUrl:
                "https://www.geranetz.de/strom/netznutzungsvertrag-lieferantletztverbraucher/preisblaetter.html",
              documentUrl:
                "https://www.geranetz.de/fileadmin/user_upload/strom/Netznutzung-Lieferant-Letztverbraucher/Preisblaetter/2026/Preisblatt_2a_Entnahme_fuer_steuerbare_Verbrauchseinrichtungen_Stand_01.01.26.pdf"
            })
          ])
        }),
        expect.objectContaining({
          slug: "allgaeunetz",
          websiteUrl: "https://www.allgaeunetz.com/",
          sourceDocuments: expect.arrayContaining([
            expect.objectContaining({
              sourcePageUrl: "https://www.allgaeunetz.com/netznutzungsentgelte.html",
              documentUrl: "https://www.allgaeunetz.com/download/2025_12_22_preisblatt_nne_2026_endg.pdf"
            })
          ])
        }),
        expect.objectContaining({
          slug: "e-netz-suedhessen",
          sourceDocuments: expect.arrayContaining([
            expect.objectContaining({
              sourcePageUrl: "https://www.e-netz-suedhessen.de/kontakt-service/pflichtveroeffentlichungen",
              documentUrl: "https://www.e-netz-suedhessen.de/fileadmin/download/preisblatt_strom.pdf"
            })
          ])
        })
      ])
    );

    const serializedRegistry = JSON.stringify(registry);

    expect(serializedRegistry).not.toContain("https://www.stadtwerke-hall.de/netzdaten-und-bedingungen/netznutzungsentgelte");
    expect(serializedRegistry).not.toContain(
      "https://www.stadtwerke-hall.de/fileadmin/user_upload/netzdaten/Entgelte_Strom/Preisblatt_6a_-_Steuerbare_Verbrauchseinrichtungen_nach___14a_EnWG_2026.pdf"
    );
    expect(serializedRegistry).not.toContain("https://www.netze-odr.de/sixcms/detail.php?id=117813");
    expect(serializedRegistry).not.toContain("https://www.stadtwerke-ingolstadt-netze.de/");
    expect(serializedRegistry).not.toContain("https://www.nordnetz.de/");
    expect(serializedRegistry).not.toContain("https://www.swhd.de/netze/netznutzung/netzentgelte");
    expect(serializedRegistry).not.toContain("https://www.ewr-netz.de/netz/netzentgelte");
    expect(serializedRegistry).not.toContain("https://www.gera-netz.de/");
    expect(serializedRegistry).not.toContain("https://www.allgaeunetz.de/");
    expect(serializedRegistry).not.toContain(
      "https://www.swm-infrastruktur.de/dam/jcr:bb1201d1-d178-4314-a017-cdd9410f04b5/2026_Netznutzungsentgelte%20Strom.pdf"
    );
    expect(serializedRegistry).not.toContain("https://www.e-netz-suedhessen.de/netzzugang-strom/netzentgelte-strom");
  });

  test("backfills official time windows for the previously unstructured operator slice", () => {
    const registry = getOperatorRegistry();

    expect(registry).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slug: "netze-bw",
          currentTariff: expect.objectContaining({
            timeWindows: expect.arrayContaining([
              expect.objectContaining({
                seasonLabel: "Q1-Q4 2026",
                bandKey: "HT",
                timeRangeLabel: "17:00-22:00"
              })
            ])
          })
        }),
        expect.objectContaining({
          slug: "bayernwerk-netz",
          currentTariff: expect.objectContaining({
            timeWindows: expect.arrayContaining([
              expect.objectContaining({
                seasonLabel: "Q2 2026 (01.04.-30.06.)",
                bandKey: "HT",
                timeRangeLabel: "17:00-22:00"
              }),
              expect.objectContaining({
                seasonLabel: "Q1 2026 (01.01.-31.03.)",
                bandKey: "ST",
                timeRangeLabel: "00:00-24:00"
              })
            ])
          })
        }),
        expect.objectContaining({
          slug: "westnetz",
          currentTariff: expect.objectContaining({
            timeWindows: expect.arrayContaining([
              expect.objectContaining({
                seasonLabel: "Ganzjährig 2026",
                bandKey: "HT",
                timeRangeLabel: "15:00-20:00"
              })
            ])
          })
        }),
        expect.objectContaining({
          slug: "wesernetz-bremen",
          currentTariff: expect.objectContaining({
            timeWindows: expect.arrayContaining([
              expect.objectContaining({
                seasonLabel: "Ganzjährig 2026",
                bandKey: "HT",
                timeRangeLabel: "17:00-19:30"
              })
            ])
          })
        }),
        expect.objectContaining({
          slug: "wesernetz-bremerhaven",
          currentTariff: expect.objectContaining({
            timeWindows: expect.arrayContaining([
              expect.objectContaining({
                seasonLabel: "Ganzjährig 2026",
                bandKey: "HT",
                timeRangeLabel: "16:30-19:30"
              })
            ])
          })
        })
      ])
    );
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

  test("keeps Avacon pending until page-level finality evidence is stored alongside the PDF while MVV is final", () => {
    const registry = getOperatorRegistry();
    const avacon = registry.find((entry) => entry.slug === "avacon-netz");
    const mvv = registry.find((entry) => entry.slug === "mvv-netze");

    expect(avacon).toMatchObject({
      currentTariff: expect.objectContaining({
        reviewStatus: "pending",
        documentUrl: "https://www.avacon-netz.de/content/dam/revu-global/avacon-netz/documents/netzentgelte-strom/2026/Preisbl%C3%A4tter_AVANG_Strom_01.01.2026.pdf"
      }),
      sourceDocuments: expect.arrayContaining([
        expect.objectContaining({
          id: "avacon-netz-14a-2026",
          reviewStatus: "pending",
          notes: expect.arrayContaining([
            expect.stringContaining("Finalitaetsbeleg"),
            expect.stringContaining("Vorbehalt")
          ])
        })
      ])
    });

    expect(mvv).toMatchObject({
      currentTariff: expect.objectContaining({
        reviewStatus: "verified",
        documentUrl:
          "https://www.mvv-netze.de/fileadmin/user_upload_mvv-netze/Dokumente/energie_beziehen/netzentgelte/strom/251218_MVV_Netze_finale_Preisblaetter_Strom_2026_Ma_ohneUmlagen.pdf"
      }),
      sourceDocuments: expect.arrayContaining([
        expect.objectContaining({
          id: "mvv-netze-14a-2026",
          title: "Finale Preisblaetter Strom 2026 Mannheim",
          reviewStatus: "verified",
          notes: expect.arrayContaining([
            expect.stringContaining("endgueltigen Preisblaetter"),
            expect.stringContaining("18.12.2025")
          ])
        })
      ])
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
