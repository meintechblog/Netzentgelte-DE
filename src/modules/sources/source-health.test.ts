import { describe, expect, test } from "vitest";

import { buildSourceHealthReport } from "./source-health";

describe("buildSourceHealthReport", () => {
  test("marks a stable verified PDF source as ok", () => {
    expect(
      buildSourceHealthReport({
        reviewStatus: "verified",
        pageUrl: "https://www.netze-bw.de/neuregelung-14a-enwg",
        documentUrl:
          "https://assets.ctfassets.net/xytfb1vrn7of/7eQvxehZzn3ECbR9rALmyD/ecc795b9dcd666ce1f53d9d04362a321/netzentgelte-strom-netze-bw-gmbh-2026.pdf",
        checkedAt: "2026-03-09",
        latestPageSnapshotStoragePath: "artifacts/netze-bw/2026-03-09/source-page.html",
        latestDocumentSnapshotStoragePath:
          "artifacts/netze-bw/2026-03-09/netzentgelte-strom-netze-bw-gmbh-2026.pdf"
      })
    ).toEqual({
      status: "ok",
      issues: []
    });
  });

  test("marks anti-bot or manual-evidence sources as blocked", () => {
    expect(
      buildSourceHealthReport({
        reviewStatus: "pending",
        pageUrl: "https://www.syna.de/corp/ueber-syna/netz/netzentgelte",
        documentUrl:
          "https://www.syna.de/content/dam/revu-global/syna/documents/netze/netzentgelte-strom-netzentgelte-und-abgaben/2026/finales-preisblatt-netzentgelte-strom-2026.pdf",
        checkedAt: "2026-03-09",
        summaryFallback: "Offizielle 2026-Quelle technisch blockiert; manuelle Evidenz fuer Modul 3 erforderlich",
        sourceNotes: [
          "Der offizielle Seiten- und PDF-Pfad fuer 2026 ist bekannt, im aktuellen Audit aber durch Cloudflare-Challenges technisch blockiert."
        ]
      })
    ).toMatchObject({
      status: "blocked",
      issues: expect.arrayContaining([
        expect.objectContaining({
          key: "access_blocked"
        })
      ])
    });
  });

  test("marks source-only pending sources as warning", () => {
    expect(
      buildSourceHealthReport({
        reviewStatus: "pending",
        pageUrl: "https://www.swe-netz.de/pb/netz/netzentgelte_Strom",
        documentUrl:
          "https://www.swe-netz.de/pb/site/netz/get/documents_E-1362349375/netz/documents/stromnetz/netzentgelte_strom/ab_2026/Strom_Preisblatt_2026_endgueltig.pdf",
        checkedAt: "2026-03-09",
        summaryFallback: "Finale 2026-Quelle erfasst, aber keine publizierbare Modul-3-Jahresmatrix"
      })
    ).toMatchObject({
      status: "warning",
      issues: expect.arrayContaining([
        expect.objectContaining({
          key: "pending_source_only"
        })
      ])
    });
  });

  test("warns when a checked source still has no snapshot artifacts", () => {
    expect(
      buildSourceHealthReport({
        reviewStatus: "verified",
        pageUrl: "https://www.avacon-netz.de/de/avacon-netz/netzinformation/netzentgelte/netzentgelte-strom.html",
        documentUrl:
          "https://www.avacon-netz.de/content/dam/revu-global/avacon-netz/documents/netzentgelte-strom/2026/Preisbl%C3%A4tter_AVANG_Strom_01.01.2026%20%281%29.pdf",
        checkedAt: "2026-03-09"
      })
    ).toMatchObject({
      status: "warning",
      issues: expect.arrayContaining([
        expect.objectContaining({
          key: "snapshot_missing"
        })
      ])
    });
  });
});
