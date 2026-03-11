import { describe, expect, test } from "vitest";

import { buildShellBackfillBatches, getShellBatchSummary } from "./shell-batches";
import type { OperatorShell } from "./shell-catalog";

const shells: OperatorShell[] = [
  {
    slug: "alpha-netz",
    operatorName: "Alpha Netz GmbH",
    countryCode: "DE",
    websiteUrl: "https://alpha.example/",
    regionLabel: "Alpha",
    shellStatus: "profile-found",
    coverageStatus: "hinted",
    sourceStatus: "missing",
    tariffStatus: "missing",
    reviewStatus: "pending",
    sourcePageUrl: "https://alpha.example/netzentgelte",
    registryFeedSource: "bnetza-rollout-quote",
    registryFeedLabel: "2025-Q3",
    lastSeenInRegistryFeed: "2025-09-30",
    deprecatedStatus: "active",
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
    deprecatedStatus: "active",
    lastCheckedAt: null
  },
  {
    slug: "gamma-netz",
    operatorName: "Gamma Netz GmbH",
    countryCode: "DE",
    websiteUrl: "https://gamma.example/",
    regionLabel: "Gamma",
    shellStatus: "source-found",
    coverageStatus: "unknown",
    sourceStatus: "missing",
    tariffStatus: "missing",
    reviewStatus: "pending",
    deprecatedStatus: "active",
    lastCheckedAt: null
  },
  {
    slug: "delta-netz",
    operatorName: "Delta Netz GmbH",
    countryCode: "DE",
    websiteUrl: "https://delta.example/",
    regionLabel: "Delta",
    shellStatus: "published",
    coverageStatus: "exact",
    sourceStatus: "source-found",
    tariffStatus: "verified",
    reviewStatus: "verified",
    sourcePageUrl: "https://delta.example/netzentgelte",
    documentUrl: "https://delta.example/2026.pdf",
    deprecatedStatus: "active",
    lastCheckedAt: "2026-03-09"
  }
];

describe("buildShellBackfillBatches", () => {
  test("classifies shells into registry-review, backfill, discovery and audit lanes", () => {
    const result = buildShellBackfillBatches(shells, { targetBatchSize: 2 });

    expect(result.summary).toMatchObject({
      totalShellCount: 4,
      registryReviewCount: 1,
      backfillReadyCount: 1,
      discoveryCount: 1,
      auditRefreshCount: 1
    });
    expect(result.batches.map((batch) => batch.id)).toEqual([
      "registry-review-001",
      "backfill-ready-001",
      "discovery-001",
      "audit-refresh-001"
    ]);
  });

  test("keeps same-host pending operators together when building backfill batches", () => {
    const result = buildShellBackfillBatches(shells, { targetBatchSize: 2 });
    const backfillBatch = result.batches.find((batch) => batch.id === "backfill-ready-001");

    expect(backfillBatch).toMatchObject({
      operatorCount: 1,
      hostnames: ["alpha.example"],
      operators: [
        expect.objectContaining({ slug: "beta-netz" })
      ]
    });
  });

  test("prioritizes latest-feed newcomers into registry-review", () => {
    const result = buildShellBackfillBatches(shells, { targetBatchSize: 2 });
    const registryBatch = result.batches.find((batch) => batch.id === "registry-review-001");

    expect(registryBatch).toMatchObject({
      lane: "registry-review",
      operatorCount: 1,
      operators: [expect.objectContaining({ slug: "alpha-netz" })]
    });
  });
});

describe("getShellBatchSummary", () => {
  test("returns lane counts and suggested agent parallelism", () => {
    const result = buildShellBackfillBatches(shells, { targetBatchSize: 2 });

    expect(getShellBatchSummary(result.batches, result.summary)).toEqual({
      totalShellCount: 4,
      registryReviewCount: 1,
      backfillReadyCount: 1,
      discoveryCount: 1,
      auditRefreshCount: 1,
      batchCount: 4,
      suggestedParallelAgents: {
        registryReview: 1,
        backfillReady: 1,
        discovery: 1,
        auditRefresh: 1
      }
    });
  });
});
