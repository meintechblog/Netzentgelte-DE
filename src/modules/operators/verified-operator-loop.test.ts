import { describe, expect, test } from "vitest";

import type { OperatorRegistryEntry } from "./registry";
import type { OperatorShell } from "./shell-catalog";
import {
  applyVerifiedOperatorLoopOutcome,
  createEmptyVerifiedOperatorLoopState,
  planVerifiedOperatorLoop
} from "./verified-operator-loop";

function createShell(overrides: Partial<OperatorShell> = {}): OperatorShell {
  return {
    slug: "demo-netz",
    operatorName: "Demo Netz GmbH",
    countryCode: "DE",
    websiteUrl: "https://demo.example/",
    regionLabel: "Demo",
    shellStatus: "published",
    coverageStatus: "hinted",
    sourceStatus: "source-found",
    tariffStatus: "missing",
    reviewStatus: "pending",
    deprecatedStatus: "active",
    sourcePageUrl: "https://demo.example/netzentgelte",
    documentUrl: "https://demo.example/preisblatt-2026.pdf",
    notes: "Demo shell",
    lastCheckedAt: null,
    ...overrides
  };
}

function createRegistryEntry(overrides: Partial<OperatorRegistryEntry> = {}): OperatorRegistryEntry {
  return {
    slug: "demo-netz",
    name: "Demo Netz GmbH",
    regionLabel: "Demo",
    websiteUrl: "https://demo.example/",
    registrySourceIds: ["vnbdigital-portal"],
    sourceDocuments: [
      {
        id: "demo-netz-14a-2026",
        title: "Demo source",
        documentType: "pdf",
        sourcePageUrl: "https://demo.example/netzentgelte",
        documentUrl: "https://demo.example/preisblatt-2026.pdf",
        checkedAt: "2026-03-12",
        validFrom: "2026-01-01",
        reviewStatus: "pending",
        notes: []
      }
    ],
    currentTariff: {
      modelKey: "14a-model-3",
      validFrom: "2026-01-01",
      reviewStatus: "pending",
      sourceDocumentId: "demo-netz-14a-2026",
      sourcePageUrl: "https://demo.example/netzentgelte",
      documentUrl: "https://demo.example/preisblatt-2026.pdf",
      summaryFallback: "Quelle erfasst, Matrix offen",
      bands: [],
      timeWindows: []
    },
    ...overrides
  };
}

describe("applyVerifiedOperatorLoopOutcome", () => {
  test("replaces an existing slug outcome and keeps the state sorted", () => {
    const initial = applyVerifiedOperatorLoopOutcome(createEmptyVerifiedOperatorLoopState("2026-03-12T07:00:00.000Z"), {
      slug: "stadtwerke-achim",
      status: "blocked",
      updatedAt: "2026-03-12T07:00:00.000Z",
      note: "Pending dead end"
    });

    const next = applyVerifiedOperatorLoopOutcome(initial, {
      slug: "stadtwerke-achim",
      status: "completed",
      updatedAt: "2026-03-12T08:00:00.000Z",
      note: "Promoted to verified"
    });

    expect(next.meta.updatedAt).toBe("2026-03-12T08:00:00.000Z");
    expect(next.outcomes).toEqual([
      expect.objectContaining({
        slug: "stadtwerke-achim",
        status: "completed",
        note: "Promoted to verified"
      })
    ]);
  });
});

describe("planVerifiedOperatorLoop", () => {
  test("skips blocked and completed outcomes and returns the next eligible operator", () => {
    const state = applyVerifiedOperatorLoopOutcome(
      applyVerifiedOperatorLoopOutcome(createEmptyVerifiedOperatorLoopState("2026-03-12T07:00:00.000Z"), {
        slug: "blocked-netz",
        status: "blocked",
        updatedAt: "2026-03-12T07:00:00.000Z",
        note: "No publishable matrix"
      }),
      {
        slug: "done-netz",
        status: "completed",
        updatedAt: "2026-03-12T07:30:00.000Z",
        note: "Live on homepage"
      }
    );

    const plan = planVerifiedOperatorLoop({
      shells: [
        createShell({
          slug: "blocked-netz",
          operatorName: "Blocked Netz GmbH"
        }),
        createShell({
          slug: "done-netz",
          operatorName: "Done Netz GmbH"
        }),
        createShell({
          slug: "next-netz",
          operatorName: "Next Netz GmbH"
        })
      ],
      registryEntries: [
        createRegistryEntry({
          slug: "blocked-netz",
          name: "Blocked Netz GmbH"
        }),
        createRegistryEntry({
          slug: "done-netz",
          name: "Done Netz GmbH"
        }),
        createRegistryEntry({
          slug: "next-netz",
          name: "Next Netz GmbH"
        })
      ],
      state
    });

    expect(plan.selected).toEqual(
      expect.objectContaining({
        slug: "next-netz",
        stateStatus: null
      })
    );
    expect(plan.skippedBlocked).toEqual([
      expect.objectContaining({
        slug: "blocked-netz",
        stateStatus: "blocked"
      })
    ]);
    expect(plan.skippedCompleted).toEqual([
      expect.objectContaining({
        slug: "done-netz",
        stateStatus: "completed"
      })
    ]);
  });

  test("surfaces selector-blocked candidates separately from persistent loop blocks", () => {
    const plan = planVerifiedOperatorLoop({
      shells: [
        createShell({
          slug: "fiktiv-netz",
          notes: "Offizielle Quelle ist fiktiv"
        })
      ],
      registryEntries: [createRegistryEntry({ slug: "fiktiv-netz", name: "Fiktiv Netz GmbH" })],
      state: createEmptyVerifiedOperatorLoopState("2026-03-12T07:00:00.000Z")
    });

    expect(plan.selected).toBeNull();
    expect(plan.selectorBlocked).toEqual([
      expect.objectContaining({
        slug: "fiktiv-netz",
        stage: "blocked"
      })
    ]);
  });
});
