import { describe, expect, test } from "vitest";

import { buildBackfillBriefing } from "./backfill-briefing";
import type { StructureAuditItem } from "./structure-audit";
import type { ShellBackfillBatch } from "./shell-batches";

const auditItems: StructureAuditItem[] = [
  {
    operatorSlug: "syna",
    operatorName: "Syna GmbH",
    regionLabel: "Hessen / Rheinland-Pfalz",
    reviewStatus: "pending",
    sourcePageUrl: "https://www.syna.de/netzentgelte",
    documentUrl: "https://www.syna.de/preisblatt-2026.pdf",
    reasonKey: "summary_fallback_only",
    severity: "pending-review",
    message: "Quelle ist erfasst, aber die strukturierte Modul-3-Matrix ist noch nicht publizierbar."
  },
  {
    operatorSlug: "legacy-netz",
    operatorName: "Legacy Netz GmbH",
    regionLabel: "Legacy",
    reviewStatus: "verified",
    sourcePageUrl: "https://legacy.example/source",
    documentUrl: "https://legacy.example/document.pdf",
    reasonKey: "bands_without_time_windows",
    severity: "legacy-shape",
    message: "Tarifwerte liegen vor, aber die strukturierte Zeitfensterlogik fehlt noch."
  }
];

const batches: ShellBackfillBatch[] = [
  {
    id: "backfill-ready-001",
    lane: "backfill-ready",
    operatorCount: 2,
    hostnames: ["alpha.example"],
    operators: [
      {
        slug: "alpha-netz",
        operatorName: "Alpha Netz GmbH",
        countryCode: "DE",
        websiteUrl: "https://alpha.example/",
        regionLabel: "Alpha",
        shellStatus: "profile-found",
        coverageStatus: "hinted",
        sourceStatus: "candidate",
        tariffStatus: "missing",
        reviewStatus: "pending",
        sourcePageUrl: "https://alpha.example/netzentgelte",
        documentUrl: undefined,
        lastCheckedAt: null
      },
      {
        slug: "beta-netz",
        operatorName: "Beta Netz GmbH",
        countryCode: "DE",
        websiteUrl: "https://alpha.example/",
        regionLabel: "Beta",
        shellStatus: "profile-found",
        coverageStatus: "hinted",
        sourceStatus: "candidate",
        tariffStatus: "partial",
        reviewStatus: "pending",
        sourcePageUrl: "https://alpha.example/netzentgelte",
        documentUrl: undefined,
        lastCheckedAt: null
      }
    ]
  },
  {
    id: "discovery-001",
    lane: "discovery",
    operatorCount: 1,
    hostnames: ["gamma.example"],
    operators: [
      {
        slug: "gamma-netz",
        operatorName: "Gamma Netz GmbH",
        countryCode: "DE",
        websiteUrl: "https://gamma.example/",
        regionLabel: "Gamma",
        shellStatus: "shell",
        coverageStatus: "unknown",
        sourceStatus: "missing",
        tariffStatus: "missing",
        reviewStatus: "pending",
        sourcePageUrl: undefined,
        documentUrl: undefined,
        lastCheckedAt: null
      }
    ]
  }
];

describe("buildBackfillBriefing", () => {
  test("prioritizes audit targets and recommends the next backfill-ready batch", () => {
    const briefing = buildBackfillBriefing({
      auditItems,
      batches
    });

    expect(briefing.summary).toEqual({
      auditTargetCount: 2,
      nextBatchOperatorCount: 2,
      nextBatchId: "backfill-ready-001",
      nextBatchLane: "backfill-ready"
    });
    expect(briefing.auditTargets).toEqual([
      expect.objectContaining({
        operatorSlug: "legacy-netz",
        action: "Backfill structured time windows for existing published tariff values."
      }),
      expect.objectContaining({
        operatorSlug: "syna",
        action: "Extract a publishable Modul-3 matrix from the official source or keep the fallback pending."
      })
    ]);
    expect(briefing.nextBatch).toMatchObject({
      id: "backfill-ready-001",
      lane: "backfill-ready",
      operatorCount: 2,
      hostnames: ["alpha.example"]
    });
  });

  test("falls back gracefully when no backfill-ready batch exists", () => {
    const briefing = buildBackfillBriefing({
      auditItems: [],
      batches: batches.filter((batch) => batch.lane !== "backfill-ready")
    });

    expect(briefing.summary.nextBatchId).toBeNull();
    expect(briefing.nextBatch).toBeNull();
  });
});
