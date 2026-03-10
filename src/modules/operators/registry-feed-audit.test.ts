import { describe, expect, test } from "vitest";

import { buildRegistryFeedAudit } from "./registry-feed-audit";
import type { OperatorShell } from "./shell-catalog";

const shells: OperatorShell[] = [
  {
    slug: "new-from-feed",
    operatorName: "New From Feed GmbH",
    countryCode: "DE",
    regionLabel: "Deutschland",
    shellStatus: "shell",
    coverageStatus: "unknown",
    sourceStatus: "missing",
    tariffStatus: "missing",
    reviewStatus: "pending",
    registryFeedSource: "bnetza-rollout-quote",
    registryFeedLabel: "2025-Q3",
    lastSeenInRegistryFeed: "2025-09-30",
    deprecatedStatus: "active",
    lastCheckedAt: null
  },
  {
    slug: "missing-from-latest-feed",
    operatorName: "Missing From Latest Feed GmbH",
    countryCode: "DE",
    regionLabel: "Deutschland",
    shellStatus: "profile-found",
    coverageStatus: "hinted",
    sourceStatus: "candidate",
    tariffStatus: "missing",
    reviewStatus: "pending",
    registryFeedSource: "bnetza-rollout-quote",
    registryFeedLabel: "2025-Q2",
    lastSeenInRegistryFeed: "2025-06-30",
    deprecatedStatus: "disappearance-review",
    deprecatedCheckedAt: "2026-03-10",
    deprecatedReason: "Missing from latest BNetzA rollout quota feed.",
    lastCheckedAt: null
  },
  {
    slug: "deprecated-shell",
    operatorName: "Deprecated Shell GmbH",
    countryCode: "DE",
    regionLabel: "Deutschland",
    shellStatus: "profile-found",
    coverageStatus: "hinted",
    sourceStatus: "candidate",
    tariffStatus: "missing",
    reviewStatus: "pending",
    registryFeedSource: "bnetza-rollout-quote",
    registryFeedLabel: "2024-Q4",
    lastSeenInRegistryFeed: "2024-12-31",
    deprecatedStatus: "deprecated",
    deprecatedCheckedAt: "2026-03-10",
    deprecatedReason: "Operator no longer active after manual web verification.",
    lastCheckedAt: null
  }
];

describe("buildRegistryFeedAudit", () => {
  test("summarizes new latest-feed operators and deprecated-state reviews", () => {
    const audit = buildRegistryFeedAudit(shells, {
      latestFeedSource: "bnetza-rollout-quote",
      latestFeedLabel: "2025-Q3"
    });

    expect(audit.summary).toEqual({
      latestFeedLabel: "2025-Q3",
      latestFeedNewcomerCount: 1,
      disappearanceReviewCount: 1,
      deprecatedCount: 1
    });
    expect(audit.items).toEqual([
      expect.objectContaining({
        operatorSlug: "new-from-feed",
        status: "latest-feed-newcomer"
      }),
      expect.objectContaining({
        operatorSlug: "missing-from-latest-feed",
        status: "disappearance-review"
      }),
      expect.objectContaining({
        operatorSlug: "deprecated-shell",
        status: "deprecated"
      })
    ]);
  });
});
