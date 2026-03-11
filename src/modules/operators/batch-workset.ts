import type { OperatorShell } from "./shell-catalog";
import type { ShellBackfillBatch } from "./shell-batches";

export type BatchWorksetStage = "source-validation" | "tariff-completion" | "verified";

export type BatchWorksetOperator = {
  slug: string;
  operatorName: string;
  hostname: string | null;
  websiteUrl: string | undefined;
  sourcePageUrl: string | undefined;
  documentUrl: string | undefined;
  sourceStatus: OperatorShell["sourceStatus"];
  tariffStatus: OperatorShell["tariffStatus"];
  reviewStatus: OperatorShell["reviewStatus"];
  backfillStage: BatchWorksetStage;
};

export type BatchWorkset = {
  batchId: string;
  lane: ShellBackfillBatch["lane"];
  operatorCount: number;
  hostnameCount: number;
  hostnames: string[];
  items: BatchWorksetOperator[];
  summary: {
    sourceCandidateCount: number;
    sourceMissingCount: number;
    documentedCount: number;
    tariffMissingCount: number;
    reviewPendingCount: number;
  };
};

export function buildBackfillBatchWorkset(batch: ShellBackfillBatch): BatchWorkset {
  const items = batch.operators.map((operator) => {
    const backfillStage = classifyBackfillStage(operator);

    return {
      slug: operator.slug,
      operatorName: operator.operatorName,
      hostname: getShellHostname(operator) ?? null,
      websiteUrl: operator.websiteUrl,
      sourcePageUrl: operator.sourcePageUrl,
      documentUrl: operator.documentUrl,
      sourceStatus: operator.sourceStatus,
      tariffStatus: operator.tariffStatus,
      reviewStatus: operator.reviewStatus,
      backfillStage
    };
  });

  return {
    batchId: batch.id,
    lane: batch.lane,
    operatorCount: batch.operatorCount,
    hostnameCount: batch.hostnames.length,
    hostnames: [...batch.hostnames],
    items,
    summary: {
      sourceCandidateCount: items.filter((operator) => operator.sourceStatus === "candidate").length,
      sourceMissingCount: items.filter((operator) => operator.sourceStatus === "missing").length,
      documentedCount: items.filter((operator) => Boolean(operator.documentUrl)).length,
      tariffMissingCount: items.filter((operator) => operator.tariffStatus === "missing").length,
      reviewPendingCount: items.filter((operator) => operator.reviewStatus === "pending").length
    }
  };
}

export const buildBatchWorkset = buildBackfillBatchWorkset;

function classifyBackfillStage(shell: OperatorShell): BatchWorksetStage {
  if (shell.reviewStatus === "verified" || shell.tariffStatus === "verified") {
    return "verified";
  }

  if (shell.tariffStatus === "partial" || shell.sourceStatus === "source-found" || shell.sourceStatus === "reachable" || shell.sourceStatus === "snapshotted") {
    return "tariff-completion";
  }

  return "source-validation";
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
