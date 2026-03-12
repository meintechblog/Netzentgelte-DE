import { describe, expect, test } from "vitest";

import { getOperatorRegistry, parseOperatorRegistry } from "./registry";

describe("getOperatorRegistry", () => {
  test("loads curated operators with provenance rich source records", () => {
    const registry = getOperatorRegistry();

    expect(registry.length).toBeGreaterThanOrEqual(70);
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

  test("retains the recovered larger modul-3 slice with structured time windows", () => {
    const registry = getOperatorRegistry();

    expect(
      registry.filter((entry) => (entry.currentTariff.timeWindows?.length ?? 0) > 0).length
    ).toBeGreaterThanOrEqual(70);
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

  test("audits the extended operator batch against the current official 2026 sources", () => {
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
                seasonLabel: "Q1/Q2/Q4 2026",
                timeRangeLabel: "10:00-14:00"
              }),
              expect.objectContaining({
                bandKey: "ST",
                seasonLabel: "Q3 2026",
                timeRangeLabel: "00:00-24:00"
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
                seasonLabel: "Q1-Q4 2026",
                bandKey: "HT",
                timeRangeLabel: "17:00-20:00"
              })
            ])
          })
        }),
        expect.objectContaining({
          slug: "netze-odr",
          currentTariff: expect.objectContaining({
            reviewStatus: "verified",
            bands: expect.arrayContaining([
              expect.objectContaining({
                key: "NT",
                valueCtPerKwh: "2.35"
              })
            ]),
            timeWindows: expect.arrayContaining([
              expect.objectContaining({
                seasonLabel: "Q2-Q3 2026",
                bandKey: "NT",
                timeRangeLabel: "11:00-17:00"
              })
            ])
          })
        }),
        expect.objectContaining({
          slug: "stadtwerke-ingolstadt-netze",
          currentTariff: expect.objectContaining({
            validFrom: "2026-01-01",
            timeWindows: expect.arrayContaining([
              expect.objectContaining({
                bandKey: "HT",
                timeRangeLabel: "16:30-19:30"
              })
            ])
          })
        }),
        expect.objectContaining({
          slug: "nordnetz",
          websiteUrl: "https://www.nordnetz.com/",
          currentTariff: expect.objectContaining({
            reviewStatus: "verified",
            bands: expect.arrayContaining([
              expect.objectContaining({
                key: "HT",
                valueCtPerKwh: "5.21"
              })
            ]),
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
            reviewStatus: "pending",
            summaryFallback: "Finale 2026-Quelle erfasst, aber Modul 3 ist nur für Q3/Q4 explizit publiziert",
            bands: [],
            timeWindows: []
          })
        }),
        expect.objectContaining({
          slug: "alzchem-netz",
          currentTariff: expect.objectContaining({
            reviewStatus: "pending",
            summaryFallback: "Aktuelle 2026-Quelle erfasst, aber keine publizierbare Modul-3-Jahresmatrix",
            bands: [],
            timeWindows: []
          }),
          sourceDocuments: expect.arrayContaining([
            expect.objectContaining({
              sourcePageUrl: "https://www.alzchem.com/de/strom-netz/",
              documentUrl: "https://www.alzchem.com/fileadmin/Quicklinks/Strom_Netz/2026-ACNz-Preisblatt.pdf",
              reviewStatus: "pending"
            })
          ])
        }),
        expect.objectContaining({
          slug: "ewr-netz",
          currentTariff: expect.objectContaining({
            reviewStatus: "pending",
            summaryFallback: "Finale 2026-Quelle erfasst, aber Modul 3 ist nur für Q1/Q4 explizit publiziert",
            bands: [],
            timeWindows: []
          })
        }),
        expect.objectContaining({
          slug: "geranetz",
          currentTariff: expect.objectContaining({
            reviewStatus: "pending",
            summaryFallback: "Finale 2026-Quelle erfasst, aber Modul 3 ist nur für Winterquartale explizit publiziert",
            bands: [],
            timeWindows: []
          })
        }),
        expect.objectContaining({
          slug: "allgaeunetz",
          currentTariff: expect.objectContaining({
            timeWindows: expect.arrayContaining([
              expect.objectContaining({
                seasonLabel: "Q2-Q3 2026",
                bandKey: "ST",
                timeRangeLabel: "00:00-24:00"
              })
            ])
          })
        }),
        expect.objectContaining({
          slug: "e-netz-suedhessen",
          currentTariff: expect.objectContaining({
            reviewStatus: "pending",
            summaryFallback: "Aktuelle 2026-Quelle erfasst, aber Modul 3 ist nur für Q1/Q4 explizit publiziert",
            bands: [],
            timeWindows: []
          })
        })
      ])
    );
  });

  test("keeps source-only operators pending unless the official 2026 evidence is fully publishable and promotes NRM once the PB1 XLSX is structured", () => {
    const registry = getOperatorRegistry();

    expect(registry).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slug: "tws-netz",
          currentTariff: expect.objectContaining({
            reviewStatus: "verified",
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
            ]),
            timeWindows: expect.arrayContaining([
              expect.objectContaining({
                seasonLabel: "Q1-Q4 2026",
                bandKey: "HT",
                timeRangeLabel: "17:00-22:00"
              }),
              expect.objectContaining({
                seasonLabel: "Q1-Q4 2026",
                bandKey: "ST",
                timeRangeLabel: "22:00-24:00"
              })
            ])
          }),
          sourceDocuments: expect.arrayContaining([
            expect.objectContaining({
              sourcePageUrl: "https://www.tws-netz.de/de/Unsere-Netze/Stromnetz/",
              documentUrl:
                "https://www.tws-netz.de/de/Unsere-Netze/Netze-neu/Stromnetz/Netzzugang-Entgelte/5-132-TWS-Netz-Preisblatt-2026-final.pdf"
            })
          ])
        }),
        expect.objectContaining({
          slug: "syna",
          currentTariff: expect.objectContaining({
            reviewStatus: "pending",
            bands: [],
            timeWindows: []
          }),
          sourceDocuments: expect.arrayContaining([
            expect.objectContaining({
              sourcePageUrl: "https://www.syna.de/corp/ueber-syna/netz/netzentgelte",
              documentUrl:
                "https://www.syna.de/content/dam/revu-global/syna/documents/netze/netzentgelte-strom-netzentgelte-und-abgaben/2026/finales-preisblatt-netzentgelte-strom-2026.pdf"
            })
          ])
        }),
        expect.objectContaining({
          slug: "netz-duesseldorf",
          currentTariff: expect.objectContaining({
            reviewStatus: "verified",
            bands: expect.arrayContaining([
              expect.objectContaining({
                key: "HT",
                valueCtPerKwh: "8.19"
              })
            ]),
            timeWindows: expect.arrayContaining([
              expect.objectContaining({
                seasonLabel: "Q2-Q3 2026",
                bandKey: "ST",
                timeRangeLabel: "00:00-24:00"
              })
            ])
          }),
          sourceDocuments: expect.arrayContaining([
            expect.objectContaining({
              sourcePageUrl: "https://www.netz-duesseldorf.de/unsere-infrastruktur/strom/preisblaetter",
              documentUrl:
                "https://a.storyblok.com/f/274773/x/dc3a61c884/2025-12-12_finales-preisblatt-nne-strom-2026.pdf"
            })
          ])
        }),
        expect.objectContaining({
          slug: "nrm-netzdienste",
          currentTariff: expect.objectContaining({
            reviewStatus: "verified",
            bands: expect.arrayContaining([
              expect.objectContaining({
                key: "NT",
                valueCtPerKwh: "3.69"
              }),
              expect.objectContaining({
                key: "ST",
                valueCtPerKwh: "9.23"
              }),
              expect.objectContaining({
                key: "HT",
                valueCtPerKwh: "13.45"
              })
            ]),
            timeWindows: expect.arrayContaining([
              expect.objectContaining({
                seasonLabel: "Q1 und Q4 2026",
                bandKey: "HT",
                timeRangeLabel: "16:45-20:00"
              }),
              expect.objectContaining({
                seasonLabel: "Q2-Q3 2026",
                bandKey: "ST",
                timeRangeLabel: "00:00-24:00"
              })
            ])
          }),
          sourceDocuments: expect.arrayContaining([
            expect.objectContaining({
              sourcePageUrl: "https://www.nrm-netzdienste.de/de/netzzugang/netzzugang-strom",
              documentUrl:
                "https://www.nrm-netzdienste.de/resource/blob/162202/19a814ee3b72701e0d3e752dd10a83e1/20251212-nrm-pb-1-strom-ab-01-01-2026-el-8-0-s-1--data.xlsx"
            })
          ])
        }),
        expect.objectContaining({
          slug: "thueringer-energienetze",
          currentTariff: expect.objectContaining({
            reviewStatus: "verified",
            bands: expect.arrayContaining([
              expect.objectContaining({
                key: "ST",
                valueCtPerKwh: "5.56"
              })
            ]),
            timeWindows: expect.arrayContaining([
              expect.objectContaining({
                seasonLabel: "Q2-Q3 2026",
                bandKey: "ST",
                timeRangeLabel: "00:00-24:00"
              })
            ])
          }),
          sourceDocuments: expect.arrayContaining([
            expect.objectContaining({
              sourcePageUrl:
                "https://www.thueringer-energienetze.com/Energiepartner/Netzkunden_und_Lieferanten_Stromnetz/Netzentgelte_und_Umlagen",
              documentUrl:
                "https://www.thueringer-energienetze.com/Content/Documents/Energiepartner/TEN_NNE_Strom_2026.pdf"
            })
          ])
        }),
        expect.objectContaining({
          slug: "swe-netz",
          currentTariff: expect.objectContaining({
            reviewStatus: "pending",
            summaryFallback: "Finale 2026-Quelle erfasst, aber keine publizierbare Modul-3-Jahresmatrix",
            bands: [],
            timeWindows: []
          }),
          sourceDocuments: expect.arrayContaining([
            expect.objectContaining({
              sourcePageUrl: "https://www.swe-netz.de/pb/netz/netzentgelte_Strom",
              documentUrl:
                "https://www.swe-netz.de/pb/site/netz/get/documents_E-1362349375/netz/documents/stromnetz/netzentgelte_strom/ab_2026/Strom_Preisblatt_2026_endgueltig.pdf"
            })
          ])
        })
      ])
    );
  });

  test("promotes MITNETZ Strom when the official 2026 Preisblatt spells out all Modul-3 prices and quarter windows", () => {
    const registry = getOperatorRegistry();

    expect(registry).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slug: "mitnetz-strom",
          currentTariff: expect.objectContaining({
            reviewStatus: "verified",
            bands: expect.arrayContaining([
              expect.objectContaining({
                key: "NT",
                valueCtPerKwh: "0.69"
              }),
              expect.objectContaining({
                key: "ST",
                valueCtPerKwh: "6.31"
              }),
              expect.objectContaining({
                key: "HT",
                valueCtPerKwh: "12.62"
              })
            ]),
            timeWindows: expect.arrayContaining([
              expect.objectContaining({
                seasonLabel: "Q1 und Q4 2026",
                bandKey: "HT",
                timeRangeLabel: "17:00-19:00"
              }),
              expect.objectContaining({
                seasonLabel: "Q2-Q3 2026",
                bandKey: "ST",
                timeRangeLabel: "00:00-24:00"
              })
            ])
          })
        })
      ])
    );
  });

  test("promotes Schleswig-Holstein Netz when the official 2026 publication exposes all three tariff bands and quarter windows", () => {
    const registry = getOperatorRegistry();
    const operator = registry.find((entry) => entry.slug === "schleswig-holstein-netz");

    expect(operator).toMatchObject({
      slug: "schleswig-holstein-netz",
      currentTariff: expect.objectContaining({
        reviewStatus: "verified",
        bands: expect.arrayContaining([
          expect.objectContaining({
            key: "NT",
            valueCtPerKwh: "0.64"
          }),
          expect.objectContaining({
            key: "ST",
            valueCtPerKwh: "6.40"
          }),
          expect.objectContaining({
            key: "HT",
            valueCtPerKwh: "8.32"
          })
        ]),
        timeWindows: expect.arrayContaining([
          expect.objectContaining({
            seasonLabel: "Q1 und Q4 2026",
            bandKey: "HT",
            timeRangeLabel: "17:00-21:00"
          }),
          expect.objectContaining({
            seasonLabel: "Q2-Q3 2026",
            bandKey: "ST",
            timeRangeLabel: "00:00-24:00"
          })
        ])
      })
    });
  });

  test("promotes enercity Netz to a fully structured verified Modell-3 source when the official PDF exposes all tariff bands", () => {
    const registry = getOperatorRegistry();

    expect(registry).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slug: "enercity-netz",
          currentTariff: expect.objectContaining({
            reviewStatus: "verified",
            bands: expect.arrayContaining([
              expect.objectContaining({
                key: "NT",
                valueCtPerKwh: "0.86"
              }),
              expect.objectContaining({
                key: "ST",
                valueCtPerKwh: "8.54"
              }),
              expect.objectContaining({
                key: "HT",
                valueCtPerKwh: "13.35"
              })
            ]),
            timeWindows: expect.arrayContaining([
              expect.objectContaining({
                seasonLabel: "Q1-Q4 2026",
                bandKey: "NT",
                timeRangeLabel: "00:00-06:00"
              }),
              expect.objectContaining({
                seasonLabel: "Q1-Q4 2026",
                bandKey: "HT",
                timeRangeLabel: "16:30-20:15"
              })
            ])
          })
        })
      ])
    );
  });

  test("promotes FairNetz and Stadtwerke Bamberg when the source tables expose complete Modell-3 values and seasonal windows", () => {
    const registry = getOperatorRegistry();

    expect(registry).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slug: "fairnetz",
          currentTariff: expect.objectContaining({
            reviewStatus: "verified",
            bands: expect.arrayContaining([
              expect.objectContaining({
                key: "NT",
                valueCtPerKwh: "2.04"
              }),
              expect.objectContaining({
                key: "ST",
                valueCtPerKwh: "8.16"
              }),
              expect.objectContaining({
                key: "HT",
                valueCtPerKwh: "11.87"
              })
            ]),
            timeWindows: expect.arrayContaining([
              expect.objectContaining({
                seasonLabel: "Q1-Q4 2026",
                bandKey: "HT",
                timeRangeLabel: "17:00-22:00"
              }),
              expect.objectContaining({
                seasonLabel: "Q1-Q4 2026",
                bandKey: "NT",
                timeRangeLabel: "00:00-04:00"
              })
            ])
          })
        }),
        expect.objectContaining({
          slug: "stadtwerke-bamberg",
          currentTariff: expect.objectContaining({
            reviewStatus: "verified",
            bands: expect.arrayContaining([
              expect.objectContaining({
                key: "NT",
                valueCtPerKwh: "2.28"
              }),
              expect.objectContaining({
                key: "ST",
                valueCtPerKwh: "5.71"
              }),
              expect.objectContaining({
                key: "HT",
                valueCtPerKwh: "6.63"
              })
            ]),
            timeWindows: expect.arrayContaining([
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
          currentTariff: expect.objectContaining({
            reviewStatus: "pending",
            summaryFallback: "Finale 2026-Quelle erfasst, aber keine publizierbare Modul-3-Jahresmatrix",
            bands: [],
            timeWindows: []
          }),
          sourceDocuments: expect.arrayContaining([
            expect.objectContaining({
              sourcePageUrl: "https://www.swm-infrastruktur.de/netzzugang/strom/netzentgelte",
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
              sourcePageUrl: "https://swi-netze.de/entgelte/",
              documentUrl:
                "https://swi-netze.de/fileadmin/media/04_Netze/C_Netze_Downloads/PDFs/01_Strom/Entgelte/2026_01_01_Preisblatt_SWI_Strom_2026.pdf"
            })
          ])
        }),
        expect.objectContaining({
          slug: "nordnetz",
          websiteUrl: "https://www.nordnetz.com/",
          sourceDocuments: expect.arrayContaining([
            expect.objectContaining({
              sourcePageUrl:
                "https://www.nordnetz.com/de/NordNetz/netzinformationen/netzentgelte_strom.html",
              documentUrl:
                "https://www.nordnetz.com/content/dam/revu-global/nordnetz/Dokumente/NordNetz/Netzinformationen/netzentgelte_strom/2026/nordnetz_finale_netzentgelte_strom_ab_20260101.pdf"
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
          currentTariff: expect.objectContaining({
            reviewStatus: "pending",
            summaryFallback: "Aktuelle 2026-Quelle erfasst, aber Modul 3 ist nur für Q1/Q4 explizit publiziert",
            bands: [],
            timeWindows: []
          }),
          sourceDocuments: expect.arrayContaining([
            expect.objectContaining({
              sourcePageUrl:
                "https://www.e-netz-suedhessen.de/bauen-anschliessen/regelungen-und-wissenswertes/neuregelung-14a-enwg",
              documentUrl: "https://www.e-netz-suedhessen.de/fileadmin/download/preisblatt_strom.pdf"
            })
          ])
        }),
        expect.objectContaining({
          slug: "mittelhessen-netz",
          sourceDocuments: expect.arrayContaining([
            expect.objectContaining({
              sourcePageUrl: "https://www.mit-n.de/marktpartner/strom",
              documentUrl:
                "https://www.mit-n.de/fileadmin/user_upload/Dateien/Marktpartner/Strom/Netzentgelte/MIT.N_Preisblatt_Strom_2026_01_01.pdf"
            })
          ])
        }),
        expect.objectContaining({
          slug: "syna",
          currentTariff: expect.objectContaining({
            reviewStatus: "pending",
            summaryFallback:
              "Offizielle 2026-Quelle technisch blockiert; manuelle Evidenz für Modul 3 erforderlich",
            bands: [],
            timeWindows: []
          }),
          sourceDocuments: expect.arrayContaining([
            expect.objectContaining({
              sourcePageUrl: "https://www.syna.de/corp/ueber-syna/netz/netzentgelte",
              documentUrl:
                "https://www.syna.de/content/dam/revu-global/syna/documents/netze/netzentgelte-strom-netzentgelte-und-abgaben/2026/finales-preisblatt-netzentgelte-strom-2026.pdf"
            })
          ])
        }),
        expect.objectContaining({
          slug: "nrm-netzdienste",
          sourceDocuments: expect.arrayContaining([
            expect.objectContaining({
              sourcePageUrl: "https://www.nrm-netzdienste.de/de/netzzugang/netzzugang-strom",
              documentUrl:
                "https://www.nrm-netzdienste.de/resource/blob/162202/19a814ee3b72701e0d3e752dd10a83e1/20251212-nrm-pb-1-strom-ab-01-01-2026-el-8-0-s-1--data.xlsx"
            })
          ])
        }),
        expect.objectContaining({
          slug: "swe-netz",
          currentTariff: expect.objectContaining({
            reviewStatus: "pending",
            summaryFallback: "Finale 2026-Quelle erfasst, aber keine publizierbare Modul-3-Jahresmatrix",
            bands: [],
            timeWindows: []
          }),
          sourceDocuments: expect.arrayContaining([
            expect.objectContaining({
              sourcePageUrl: "https://www.swe-netz.de/pb/netz/netzentgelte_Strom",
              documentUrl:
                "https://www.swe-netz.de/pb/site/netz/get/documents_E-1362349375/netz/documents/stromnetz/netzentgelte_strom/ab_2026/Strom_Preisblatt_2026_endgueltig.pdf"
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
    expect(serializedRegistry).not.toContain("https://www.mitn.de/");
    expect(serializedRegistry).not.toContain(
      "https://www.syna.de/corp/ueber-syna/unser-netz/netzentgelte-strom"
    );
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

  test("promotes Avacon once the official page states final 2026 publication status while MVV stays final", () => {
    const registry = getOperatorRegistry();
    const avacon = registry.find((entry) => entry.slug === "avacon-netz");
    const mvv = registry.find((entry) => entry.slug === "mvv-netze");
    const avaconSourceDocument = avacon?.sourceDocuments.find(
      (document) => document.id === "avacon-netz-14a-2026"
    );

    expect(avacon?.currentTariff).toMatchObject({
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
      ]),
      timeWindows: expect.arrayContaining([
        expect.objectContaining({
          seasonLabel: "Q2-Q3 2026",
          bandKey: "ST",
          timeRangeLabel: "00:00-24:00"
        }),
        expect.objectContaining({
          seasonLabel: "Q1 und Q4 2026",
          bandKey: "HT",
          timeRangeLabel: "16:30-21:00"
        })
      ])
    });
    expect(avaconSourceDocument).toMatchObject({
      id: "avacon-netz-14a-2026",
      reviewStatus: "verified"
    });
    const avaconNotes = avaconSourceDocument?.notes.join("\n") ?? "";

    expect(avaconNotes).toContain("endgültige Netzentgelte Strom");
    expect(avaconNotes).toContain("Bestandteil des Netznutzungsverhältnisses");

    expect(mvv).toMatchObject({
      currentTariff: expect.objectContaining({
        reviewStatus: "verified",
        documentUrl:
          "https://www.mvv-netze.de/fileadmin/user_upload_mvv-netze/Dokumente/energie_beziehen/netzentgelte/strom/251218_MVV_Netze_finale_Preisblaetter_Strom_2026_Ma_ohneUmlagen.pdf"
      }),
      sourceDocuments: expect.arrayContaining([
        expect.objectContaining({
          id: "mvv-netze-14a-2026",
          title: "Finale Preisblätter Strom 2026 Mannheim",
          reviewStatus: "verified",
          notes: expect.arrayContaining([
            expect.stringContaining("endgültigen Preisblätter"),
            expect.stringContaining("18.12.2025")
          ])
        })
      ])
    });
  });

  test("publishes Ascanetz as verified when the official 2026 sheet provides a Q1/Q4 matrix plus explicit rest-time ST", () => {
    const registry = getOperatorRegistry();
    const ascanetz = registry.find((entry) => entry.slug === "ascanetz");
    const sourceDocument = ascanetz?.sourceDocuments.find((document) => document.id === "ascanetz-14a-2026");

    expect(ascanetz).toMatchObject({
      websiteUrl: "https://www.ascanetz.de/index.php",
      currentTariff: expect.objectContaining({
        reviewStatus: "verified",
        validFrom: "2026-01-01",
        sourcePageUrl: "https://www.ascanetz.de/strom/preise-tarife/",
        documentUrl: "https://www.ascanetz.de/wp-content/uploads/NNE_Strom-2026.pdf",
        bands: expect.arrayContaining([
          expect.objectContaining({
            key: "NT",
            valueCtPerKwh: "2.40"
          }),
          expect.objectContaining({
            key: "ST",
            valueCtPerKwh: "7.18"
          }),
          expect.objectContaining({
            key: "HT",
            valueCtPerKwh: "10.77"
          })
        ]),
        timeWindows: expect.arrayContaining([
          expect.objectContaining({
            seasonLabel: "Q1 und Q4 2026",
            bandKey: "NT",
            timeRangeLabel: "23:00-24:00"
          }),
          expect.objectContaining({
            seasonLabel: "Q1 und Q4 2026",
            bandKey: "HT",
            timeRangeLabel: "11:00-13:00"
          }),
          expect.objectContaining({
            seasonLabel: "Q2-Q3 2026",
            bandKey: "ST",
            timeRangeLabel: "00:00-24:00"
          })
        ])
      })
    });
    expect(sourceDocument).toMatchObject({
      id: "ascanetz-14a-2026",
      reviewStatus: "verified",
      checkedAt: "2026-03-12"
    });
    expect(sourceDocument?.notes.join("\n") ?? "").toContain("Q1 + Q4");
  });

  test("publishes AVU Netz as verified when the official 2026 sheet provides a full-year daily Modul-3 split", () => {
    const registry = getOperatorRegistry();
    const avuNetz = registry.find((entry) => entry.slug === "avu-netz");
    const sourceDocument = avuNetz?.sourceDocuments.find((document) => document.id === "avu-netz-14a-2026");

    expect(avuNetz).toMatchObject({
      websiteUrl: "https://www.avu-netz.de",
      currentTariff: expect.objectContaining({
        reviewStatus: "verified",
        validFrom: "2026-01-01",
        sourcePageUrl: "https://avu-netz.de/netznutzungsentgelte/",
        documentUrl: "https://avu-netz.de/wp-content/uploads/2026/03/2026-02-25-Netzentgelte-Strom-2026-1.pdf",
        bands: expect.arrayContaining([
          expect.objectContaining({
            key: "NT",
            valueCtPerKwh: "2.19"
          }),
          expect.objectContaining({
            key: "ST",
            valueCtPerKwh: "6.71"
          }),
          expect.objectContaining({
            key: "HT",
            valueCtPerKwh: "12.08"
          })
        ]),
        timeWindows: expect.arrayContaining([
          expect.objectContaining({
            seasonLabel: "Q1-Q4 2026",
            bandKey: "ST",
            timeRangeLabel: "06:00-17:00"
          }),
          expect.objectContaining({
            seasonLabel: "Q1-Q4 2026",
            bandKey: "HT",
            timeRangeLabel: "17:00-20:00"
          }),
          expect.objectContaining({
            seasonLabel: "Q1-Q4 2026",
            bandKey: "NT",
            timeRangeLabel: "22:00-24:00"
          })
        ])
      })
    });
    expect(sourceDocument).toMatchObject({
      id: "avu-netz-14a-2026",
      reviewStatus: "verified",
      checkedAt: "2026-03-12"
    });
    expect(sourceDocument?.notes.join("\n") ?? "").toContain("ganzjaehrig");
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
