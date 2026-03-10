import type { OperatorShell } from "./shell-catalog";

export type RegistryFeedAuditStatus = "latest-feed-newcomer" | "disappearance-review" | "deprecated";

export type RegistryFeedAuditItem = {
  operatorSlug: string;
  operatorName: string;
  status: RegistryFeedAuditStatus;
  registryFeedSource: string | null;
  registryFeedLabel: string | null;
  lastSeenInRegistryFeed: string | null;
  deprecatedReason: string | null;
};

export type RegistryFeedAuditResult = {
  summary: {
    latestFeedLabel: string;
    latestFeedNewcomerCount: number;
    disappearanceReviewCount: number;
    deprecatedCount: number;
  };
  items: RegistryFeedAuditItem[];
};

export function buildRegistryFeedAudit(
  shells: OperatorShell[],
  options: {
    latestFeedSource: string;
    latestFeedLabel: string;
  }
): RegistryFeedAuditResult {
  const items = shells
    .flatMap((shell) => {
      const status = getRegistryFeedAuditStatus(shell, options);

      if (!status) {
        return [];
      }

      return [
        {
          operatorSlug: shell.slug,
          operatorName: shell.operatorName,
          status,
          registryFeedSource: shell.registryFeedSource ?? null,
          registryFeedLabel: shell.registryFeedLabel ?? null,
          lastSeenInRegistryFeed: shell.lastSeenInRegistryFeed ?? null,
          deprecatedReason: shell.deprecatedReason ?? null
        } satisfies RegistryFeedAuditItem
      ];
    })
    .sort(compareRegistryFeedAuditItems);

  return {
    summary: {
      latestFeedLabel: options.latestFeedLabel,
      latestFeedNewcomerCount: items.filter((item) => item.status === "latest-feed-newcomer").length,
      disappearanceReviewCount: items.filter((item) => item.status === "disappearance-review").length,
      deprecatedCount: items.filter((item) => item.status === "deprecated").length
    },
    items
  };
}

function getRegistryFeedAuditStatus(
  shell: OperatorShell,
  options: {
    latestFeedSource: string;
    latestFeedLabel: string;
  }
): RegistryFeedAuditStatus | null {
  if (shell.deprecatedStatus === "deprecated") {
    return "deprecated";
  }

  if (shell.deprecatedStatus === "disappearance-review") {
    return "disappearance-review";
  }

  if (
    shell.registryFeedSource === options.latestFeedSource &&
    shell.registryFeedLabel === options.latestFeedLabel &&
    shell.sourceStatus === "missing"
  ) {
    return "latest-feed-newcomer";
  }

  return null;
}

function compareRegistryFeedAuditItems(left: RegistryFeedAuditItem, right: RegistryFeedAuditItem) {
  const statusComparison = getRegistryFeedAuditStatusRank(left.status) - getRegistryFeedAuditStatusRank(right.status);
  if (statusComparison !== 0) {
    return statusComparison;
  }

  return left.operatorSlug.localeCompare(right.operatorSlug, "de");
}

function getRegistryFeedAuditStatusRank(status: RegistryFeedAuditStatus) {
  switch (status) {
    case "latest-feed-newcomer":
      return 0;
    case "disappearance-review":
      return 1;
    case "deprecated":
      return 2;
  }
}
