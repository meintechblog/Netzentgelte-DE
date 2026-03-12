import { describe, expect, test } from "vitest";

import {
  getSeedOperatorShells,
  getShellCatalogStats,
  shouldUseSeedOperatorShells
} from "./shell-catalog";
import { getOperatorShellRegistryStats } from "./shell-registry";

describe("getSeedOperatorShells", () => {
  test("keeps the shell registry available for internal discovery views", () => {
    const shells = getSeedOperatorShells();
    const stats = getShellCatalogStats(shells);
    const registryStats = getOperatorShellRegistryStats();

    expect(shells[0]).toMatchObject({
      slug: expect.any(String),
      operatorName: expect.any(String),
      shellStatus: expect.any(String),
      sourceStatus: expect.any(String),
      tariffStatus: expect.any(String)
    });
    expect(shells.length).toBe(registryStats.operatorCount);
    expect(stats.verifiedCount).toBe(registryStats.verifiedCount);
    expect(stats.exactCoverageCount).toBe(registryStats.exactCoverageCount);
  });

  test("includes source-found shell metadata for the promoted backfill-ready-013 operators", () => {
    const shells = getSeedOperatorShells();

    expect(shells).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slug: "stadtnetze-munster",
          shellStatus: "published",
          sourceStatus: "source-found",
          tariffStatus: "verified",
          reviewStatus: "verified",
          sourcePageUrl: "https://www.stadtnetze-muenster.de/unsere-netze/marktkommunikation-strom",
          documentUrl:
            "https://www.stadtnetze-muenster.de/Stadtnetze/Dokumente/Strom/Marktpartner%20Strom/Netzentgelte/Netznutzungsentgelte%20Strom%202026.pdf"
        }),
        expect.objectContaining({
          slug: "stadtwerke-achim",
          shellStatus: "published",
          sourceStatus: "source-found",
          tariffStatus: "verified",
          reviewStatus: "verified",
          sourcePageUrl:
            "https://www.stadtwerke-achim.de/de/Netz-Hausanschluesse/Privatkunden/Service/Veroeffentlichungspflichten-Strom/Stromnetz-2020/Netzzugang-Entgelte1.html",
          documentUrl:
            "https://www.stadtwerke-achim.de/de/Netz-Hausanschluesse/Privatkunden/Service/Veroeffentlichungspflichten-Strom/Stromnetz-2020/Netzzugang-Entgelte1/PB-KK-NNE-Strom-2026-01-01.pdf"
        }),
        expect.objectContaining({
          slug: "alliander-netz-heinsberg",
          shellStatus: "published",
          sourceStatus: "source-found",
          tariffStatus: "verified",
          reviewStatus: "verified",
          sourcePageUrl: "https://www.alliander-netz.de/partner/lieferanten/entgelte-strom/",
          documentUrl:
            "https://www.alliander-netz.de/wp-content/uploads/2025/12/Anlage1a_LRV_Preisblatt_Heinsberg_2026_endg.pdf"
        }),
        expect.objectContaining({
          slug: "ahrtal-werke",
          shellStatus: "published",
          sourceStatus: "source-found",
          tariffStatus: "verified",
          reviewStatus: "verified",
          sourcePageUrl: "https://ahrtal-werke.de/netze/",
          documentUrl:
            "https://storage.googleapis.com/ahrtalwebseitendb/website/c4a32d62-preisblatt-netzentgelte-strom_ahrtal-werke_2026_final.pdf"
        }),
        expect.objectContaining({
          slug: "abita-energie-otterberg",
          shellStatus: "published",
          sourceStatus: "source-found",
          tariffStatus: "verified",
          reviewStatus: "verified",
          sourcePageUrl: "https://www.abita-energie.de/netze/netznutzung/netznutzung",
          documentUrl:
            "https://www.abita-energie.de/fileadmin/dokumente/Netze/Entgelte/Preisblatt_Strom_NNE_01012026.pdf"
        }),
        expect.objectContaining({
          slug: "evu-langenpreising",
          shellStatus: "published",
          sourceStatus: "source-found",
          tariffStatus: "verified",
          reviewStatus: "verified",
          sourcePageUrl: "https://www.gemeindewerke-langenpreising.de/stromnetz/netznutzung/",
          documentUrl:
            "https://www.gemeindewerke-langenpreising.de/wp-content/uploads/2025_12_18_NNE_Preisblatt_Gemeindewerke_Langenpreising_2026_GWL.pdf"
        }),
        expect.objectContaining({
          slug: "kraftwerk-farchant-a-poettinger-und",
          shellStatus: "published",
          sourceStatus: "source-found",
          tariffStatus: "verified",
          reviewStatus: "verified",
          sourcePageUrl:
            "https://www.kw-farchant.com/kontakt-und-hilfe/downloads/downloads-netz-veroeffentlichungspflichten",
          documentUrl:
            "https://www.kw-farchant.com/images/pdf/Preisblatt%20Netznutzungsentgelte%20ab%2001.01.2026.pdf"
        }),
        expect.objectContaining({
          slug: "leinenetz",
          shellStatus: "published",
          sourceStatus: "source-found",
          tariffStatus: "verified",
          reviewStatus: "verified",
          sourcePageUrl: "https://www.leinenetz.de/netzbetrieb/strom/netzentgelte-strom-1",
          documentUrl:
            "https://www.leinenetz.de/_Resources/Persistent/f/b/5/0/fb5018a483982b655aa147d40749ac5d4df4c5b0/2025-12-10%2C%20endg%C3%BCltiges%20PB_STROM_LNG_2026.pdf"
        }),
        expect.objectContaining({
          slug: "leitungspartner",
          shellStatus: "published",
          sourceStatus: "source-found",
          tariffStatus: "verified",
          reviewStatus: "verified",
          sourcePageUrl: "https://www.leitungspartner.de/fuer-partner/lieferantenrahmenvertraege/",
          documentUrl: "https://www.leitungspartner.de/download/preisblatt-netzentgelte/"
        }),
        expect.objectContaining({
          slug: "licht-und-kraftwerke-helmbrechts",
          shellStatus: "published",
          sourceStatus: "source-found",
          tariffStatus: "verified",
          reviewStatus: "verified",
          sourcePageUrl: "https://www.luk-helmbrechts.de/netze/stromnetz/netzentgelte/",
          documentUrl: "https://www.luk-helmbrechts.de/wp-content/uploads/2025/12/s-preisblatt-nn-slp-2026.pdf"
        }),
        expect.objectContaining({
          slug: "licht-und-kraftwerke-sonneberg",
          shellStatus: "published",
          sourceStatus: "source-found",
          tariffStatus: "verified",
          reviewStatus: "verified",
          sourcePageUrl: "https://likra.de/netz/strom/netzentgelte/",
          documentUrl:
            "https://likra.de/fileadmin/user_upload/netz/Veroeffentlichungen/2025/Preisblatt_Netznutzung_Strom_ab_01.01.2026.pdf"
        }),
        expect.objectContaining({
          slug: "lokalwerke",
          shellStatus: "published",
          sourceStatus: "source-found",
          tariffStatus: "verified",
          reviewStatus: "verified",
          sourcePageUrl: "https://lokalwerke.de/netz/stromnetz/netzzugang-netzentgelte/",
          documentUrl: "https://lokalwerke.de/wp-content/uploads/2025/12/Preisblatt-Netznutzung-Strom-2026.pdf"
        }),
        expect.objectContaining({
          slug: "lsw-netz-und",
          shellStatus: "published",
          sourceStatus: "source-found",
          tariffStatus: "verified",
          reviewStatus: "verified",
          sourcePageUrl: "https://www.lsw-netz.de/bauen-wohnen/netznutzung/strom/",
          documentUrl:
            "https://www.lsw-netz.de/fileadmin/user_upload/lsw-netz/strom/netznutzung/Preisblatt_f%C3%BCr_Netznutzung_Strom_01.01.-31.12.2026_endg_20251219.pdf"
        }),
        expect.objectContaining({
          slug: "mega-monheimer-elektrizitats-und-gasversorgung",
          shellStatus: "published",
          sourceStatus: "source-found",
          tariffStatus: "verified",
          reviewStatus: "verified",
          sourcePageUrl: "https://netze.mega-monheim.de/fuer-lieferanten/messstellenbetreiber/vertraege",
          documentUrl: "https://netze.mega-monheim.de/fileadmin/SW-MEGA/user_upload/Downloads/NNE_S_2026.pdf"
        }),
        expect.objectContaining({
          slug: "markt-zellingen",
          shellStatus: "published",
          sourceStatus: "source-found",
          tariffStatus: "verified",
          reviewStatus: "verified",
          sourcePageUrl:
            "https://www.markt-zellingen.de/seite/ze/cms1203202615184421180055/248/-/Netznutzung.html",
          documentUrl:
            "https://www.markt-zellingen.de/eigene_dateien/aktuell/2023/dezember/markt_zellingen_strom_preisblatt_2026_endgueltig_20251217.pdf"
        }),
        expect.objectContaining({
          slug: "maintal-werke",
          shellStatus: "published",
          sourceStatus: "source-found",
          tariffStatus: "verified",
          reviewStatus: "verified",
          sourcePageUrl: "https://www.maintal-werke.de/netze/veroeffentlichungen/strom/",
          documentUrl: "https://www.maintal-werke.de/site/assets/files/11448/preises_mwg26_endgueltig.pdf"
        }),
        expect.objectContaining({
          slug: "mainnetz",
          shellStatus: "published",
          sourceStatus: "source-found",
          tariffStatus: "verified",
          reviewStatus: "verified",
          sourcePageUrl: "https://www.mainnetz.com/Veroeffentlichungspflichten/Netzzugang-Entgelte/",
          documentUrl:
            "https://www.mainnetz.com/Veroeffentlichungspflichten/Netzzugang-Entgelte/20251222-Mainnetz-PreisblaetterStrom-2026-final.pdf"
        }),
        expect.objectContaining({
          slug: "mainsite-und",
          shellStatus: "published",
          sourceStatus: "source-found",
          tariffStatus: "verified",
          reviewStatus: "verified",
          sourcePageUrl: "https://www.mainsite.de/de/energieversorgung.html",
          documentUrl:
            "https://www.mainsite.de/files/mainsite-files/Netz%20der%20allgemeinen%20Versorgung/Zusammenfassung%20Preisblatt%202026%20Mainsite.pdf"
        }),
        expect.objectContaining({
          slug: "licht-kraft-und-wasserwerke-kitzingen",
          shellStatus: "published",
          sourceStatus: "source-found",
          tariffStatus: "verified",
          reviewStatus: "verified",
          sourcePageUrl: "https://netz.lkw-kitzingen.de/lieferanten",
          documentUrl:
            "https://netz.lkw-kitzingen.de/files/content/netz/lieferanten/202601-LKWNetz-Strom-Preisblatt-NE-Strom-2026-endgueltig_v1.pdf"
        }),
        expect.objectContaining({
          slug: "stadtische-betriebswerke-luckenwalde",
          shellStatus: "published",
          sourceStatus: "source-found",
          tariffStatus: "verified",
          reviewStatus: "verified",
          sourcePageUrl: "https://www.sbl-gmbh.net/netze/luckenwalde-netze-netznutzung/netznutzung-strom/",
          documentUrl: "https://www.sbl-gmbh.net/wp-content/uploads/2025/12/PB_NE_Strom_2026.pdf"
        }),
        expect.objectContaining({
          slug: "stadtwerke-altdorf",
          shellStatus: "published",
          sourceStatus: "source-found",
          tariffStatus: "verified",
          reviewStatus: "verified",
          sourcePageUrl: "https://www.stadtwerke-altdorf.de/stromnetz/veroeffentlichungen",
          documentUrl:
            "https://www.stadtwerke-altdorf.de/fileadmin/user_upload/2025_Netznutzungsentgelte_endgueltig_fuer_2026.pdf"
        }),
        expect.objectContaining({
          slug: "stadtwerke-andernach-energie",
          shellStatus: "published",
          sourceStatus: "source-found",
          sourcePageUrl: "https://www.stadtwerke-andernach-energie.de/strom/netzbetrieb/netzzugang-netzentgelte/",
          documentUrl:
            "https://www.stadtwerke-andernach-energie.de/app/uploads/2026/01/2025-12-19_Preisblatt-NNE-Strom-ab-01.01.2026.pdf"
        }),
        expect.objectContaining({
          slug: "stadtwerke-bad-aibling",
          shellStatus: "published",
          sourceStatus: "source-found",
          sourcePageUrl: "https://www.stadtwerke-bad-aibling.de/de/Strom/Stromnetz1/Netzzugang-Entgelte/",
          documentUrl: "https://www.stadtwerke-bad-aibling.de/de/Strom/Preisblatt-Netznutzung-ab01012026-endgueltig.pdf"
        }),
        expect.objectContaining({
          slug: "stadtwerke-bad-pyrmont",
          shellStatus: "published",
          sourceStatus: "source-found",
          tariffStatus: "verified",
          reviewStatus: "verified",
          sourcePageUrl: "https://www.stadtwerke-bad-pyrmont.de/netze/marktpartner/netzentgelte/index.htm",
          documentUrl: "https://www.stadtwerke-bad-pyrmont.de/_mediafiles/1328-nne_strom_-2026_entgueltig.pdf"
        }),
        expect.objectContaining({
          slug: "stadtwerk-tauberfranken",
          shellStatus: "published",
          sourceStatus: "source-found",
          tariffStatus: "verified",
          reviewStatus: "verified",
          sourcePageUrl: "https://stadtwerk-tauberfranken.de/netz/marktpartner/strom/",
          documentUrl:
            "https://stadtwerk-tauberfranken.de/fileadmin/user_upload/Netz/Marktpartner/Strom/Netzentgelte/endgueltig_Preisblatt_SWTF_Strom_NNE_2026.pdf"
        }),
        expect.objectContaining({
          slug: "ssw-netz",
          shellStatus: "published",
          sourceStatus: "source-found",
          sourcePageUrl: "https://ssw-netz.de/stromnetz/netzzugang-und-entgelte-strom/netznutzungsentgelte-strom/",
          documentUrl:
            "https://ssw-netz.de/wp-content/uploads/sites/4/2025/12/P1-021_Preisblaetter_Netznutzung_Strom_SSW_Netz_20260101_endgueltig.pdf"
        }),
        expect.objectContaining({
          slug: "strom-und-gasnetz-wismar",
          shellStatus: "published",
          sourceStatus: "source-found",
          tariffStatus: "verified",
          reviewStatus: "verified",
          sourcePageUrl: "https://www.sg-wismar.de/stromnetz/netzzugang/netznutzung",
          documentUrl:
            "https://www.sg-wismar.de/fileadmin/user_upload/ID064_Netznutzung_Strom/ID354_Netznutzungsentgelte/251216_Preisblatt_Zusammenfassung_2026.pdf"
        })
      ])
    );
  });
});

describe("shouldUseSeedOperatorShells", () => {
  test("falls back to seed data in tests or without a database url", () => {
    expect(
      shouldUseSeedOperatorShells({
        nodeEnv: "test",
        databaseUrl: "postgres://demo"
      })
    ).toBe(true);
    expect(
      shouldUseSeedOperatorShells({
        nodeEnv: "development",
        databaseUrl: undefined
      })
    ).toBe(true);
    expect(
      shouldUseSeedOperatorShells({
        nodeEnv: "development",
        databaseUrl: "postgres://demo"
      })
    ).toBe(false);
  });
});
