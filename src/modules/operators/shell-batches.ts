import type { OperatorShell } from "./shell-catalog";

export type ShellBatchLane = "backfill-ready" | "discovery" | "audit-refresh";

export type ShellBackfillBatch = {
  id: string;
  lane: ShellBatchLane;
  operatorCount: number;
  hostnames: string[];
  operators: OperatorShell[];
};

export type ShellBatchBuildResult = {
  summary: {
    totalShellCount: number;
    backfillReadyCount: number;
    discoveryCount: number;
    auditRefreshCount: number;
  };
  batches: ShellBackfillBatch[];
};

export function buildShellBackfillBatches(
  shells: OperatorShell[],
  options?: {
    targetBatchSize?: number;
  }
): ShellBatchBuildResult {
  const targetBatchSize = options?.targetBatchSize ?? 25;
  const backfillReady = sortShells(shells.filter((shell) => classifyShellLane(shell) === "backfill-ready"));
  const discovery = sortShells(shells.filter((shell) => classifyShellLane(shell) === "discovery"));
  const auditRefresh = sortShells(shells.filter((shell) => classifyShellLane(shell) === "audit-refresh"));

  const batches = [
    ...buildLaneBatches("backfill-ready", backfillReady, targetBatchSize),
    ...buildLaneBatches("discovery", discovery, targetBatchSize),
    ...buildLaneBatches("audit-refresh", auditRefresh, targetBatchSize)
  ];

  return {
    summary: {
      totalShellCount: shells.length,
      backfillReadyCount: backfillReady.length,
      discoveryCount: discovery.length,
      auditRefreshCount: auditRefresh.length
    },
    batches
  };
}

export function getShellBatchSummary(
  batches: ShellBackfillBatch[],
  summary: ShellBatchBuildResult["summary"]
) {
  return {
    ...summary,
    batchCount: batches.length,
    suggestedParallelAgents: {
      backfillReady: batches.filter((batch) => batch.lane === "backfill-ready").length,
      discovery: batches.filter((batch) => batch.lane === "discovery").length,
      auditRefresh: batches.filter((batch) => batch.lane === "audit-refresh").length
    }
  };
}

function classifyShellLane(shell: OperatorShell): ShellBatchLane {
  if (shell.reviewStatus === "verified" || shell.tariffStatus === "verified") {
    return "audit-refresh";
  }

  if (shell.sourceStatus === "missing") {
    return "discovery";
  }

  return "backfill-ready";
}

function sortShells(shells: OperatorShell[]) {
  return [...shells].sort((left, right) => {
    const hostComparison = (getShellHostname(left) ?? "").localeCompare(getShellHostname(right) ?? "", "de");
    if (hostComparison !== 0) {
      return hostComparison;
    }

    return left.slug.localeCompare(right.slug, "de");
  });
}

function buildLaneBatches(
  lane: ShellBatchLane,
  shells: OperatorShell[],
  targetBatchSize: number
): ShellBackfillBatch[] {
  const groupedByHost = new Map<string, OperatorShell[]>();

  for (const shell of shells) {
    const hostname = getShellHostname(shell) ?? "no-host";
    const current = groupedByHost.get(hostname) ?? [];
    current.push(shell);
    groupedByHost.set(hostname, current);
  }

  const hostGroups = [...groupedByHost.entries()]
    .sort(([leftHost], [rightHost]) => leftHost.localeCompare(rightHost, "de"))
    .map(([, entries]) => entries);

  const batches: ShellBackfillBatch[] = [];
  let currentBatch: OperatorShell[] = [];

  for (const group of hostGroups) {
    if (currentBatch.length > 0 && currentBatch.length + group.length > targetBatchSize) {
      batches.push(createBatch(lane, batches.length + 1, currentBatch));
      currentBatch = [];
    }

    currentBatch.push(...group);
  }

  if (currentBatch.length > 0) {
    batches.push(createBatch(lane, batches.length + 1, currentBatch));
  }

  return batches;
}

function createBatch(lane: ShellBatchLane, index: number, operators: OperatorShell[]): ShellBackfillBatch {
  const hostnames = Array.from(
    new Set(
      operators
        .map((operator) => getShellHostname(operator))
        .filter((hostname): hostname is string => Boolean(hostname))
    )
  );

  return {
    id: `${lane}-${String(index).padStart(3, "0")}`,
    lane,
    operatorCount: operators.length,
    hostnames,
    operators
  };
}

function getShellHostname(shell: OperatorShell) {
  const sourceUrl = shell.sourcePageUrl ?? shell.websiteUrl;

  if (!sourceUrl) {
    return undefined;
  }

  try {
    return new URL(sourceUrl).hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}
