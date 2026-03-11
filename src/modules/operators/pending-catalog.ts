import { getSeedPublishedOperators, loadPublishedOperatorSnapshot } from "./current-catalog";
import { isExcludedTransmissionOperator } from "./operator-exclusions";
import { getSeedOperatorShells, loadOperatorShells, type OperatorShell } from "./shell-catalog";

export type PendingOperatorPublic = {
  slug: string;
  name: string;
  regionLabel: string;
  reviewStatus: OperatorShell["reviewStatus"];
  sourceStatus: OperatorShell["sourceStatus"];
  tariffStatus: OperatorShell["tariffStatus"];
  websiteUrl?: string;
  checkedAt: string | null;
};

export type PendingOperatorCatalog = {
  summary: {
    operatorCount: number;
    sourceFoundCount: number;
    tariffReadyCount: number;
  };
  items: PendingOperatorPublic[];
};

export function buildPendingOperatorCatalog(input: {
  shells: OperatorShell[];
  publishableOperatorSlugs: Set<string>;
}): PendingOperatorCatalog {
  const items = input.shells
    .filter((shell) => isPublicPendingShell(shell, input.publishableOperatorSlugs))
    .map((shell) => ({
      slug: shell.slug,
      name: shell.operatorName,
      regionLabel: shell.regionLabel,
      reviewStatus: shell.reviewStatus,
      sourceStatus: shell.sourceStatus,
      tariffStatus: shell.tariffStatus,
      websiteUrl: shell.websiteUrl,
      checkedAt: shell.lastCheckedAt
    }))
    .sort((left, right) => left.slug.localeCompare(right.slug, "de"));

  return {
    summary: {
      operatorCount: items.length,
      sourceFoundCount: items.filter((item) => isSourceFoundStatus(item.sourceStatus)).length,
      tariffReadyCount: items.filter((item) => item.tariffStatus !== "missing").length
    },
    items
  };
}

export function getSeedPendingOperatorCatalog(): PendingOperatorCatalog {
  return buildPendingOperatorCatalog({
    shells: getSeedOperatorShells(),
    publishableOperatorSlugs: new Set(getSeedPublishedOperators().map((operator) => operator.slug))
  });
}

export async function loadPendingOperatorCatalog(): Promise<PendingOperatorCatalog> {
  const [shells, publishedOperatorSnapshot] = await Promise.all([
    loadOperatorShells(),
    loadPublishedOperatorSnapshot()
  ]);

  return buildPendingOperatorCatalog({
    shells,
    publishableOperatorSlugs: new Set(publishedOperatorSnapshot.operators.map((operator) => operator.slug))
  });
}

function isPublicPendingShell(shell: OperatorShell, publishableOperatorSlugs: Set<string>) {
  if (shell.shellStatus !== "published") {
    return false;
  }

  if (shell.deprecatedStatus !== "active") {
    return false;
  }

  if (publishableOperatorSlugs.has(shell.slug)) {
    return false;
  }

  if (
    isExcludedTransmissionOperator({
      slug: shell.slug,
      name: shell.operatorName,
      websiteUrl: shell.websiteUrl,
      sourcePageUrl: shell.sourcePageUrl
    })
  ) {
    return false;
  }

  return Boolean(shell.operatorName.trim());
}

function isSourceFoundStatus(status: OperatorShell["sourceStatus"]) {
  return status === "source-found" || status === "reachable" || status === "snapshotted";
}
