import type { ShellBackfillBatch } from "./shell-batches";
import type { StructureAuditItem, StructureAuditReasonKey, StructureAuditSeverity } from "./structure-audit";

export type BackfillBriefingAuditTarget = StructureAuditItem & {
  action: string;
};

export type BackfillBriefing = {
  summary: {
    auditTargetCount: number;
    nextBatchOperatorCount: number;
    nextBatchId: string | null;
    nextBatchLane: ShellBackfillBatch["lane"] | null;
  };
  auditTargets: BackfillBriefingAuditTarget[];
  nextBatch: ShellBackfillBatch | null;
};

export function buildBackfillBriefing(input: {
  auditItems: StructureAuditItem[];
  batches: ShellBackfillBatch[];
}): BackfillBriefing {
  const auditTargets = [...input.auditItems]
    .sort(compareAuditItems)
    .map((item) => ({
      ...item,
      action: getAuditAction(item.reasonKey)
    }));
  const nextBatch =
    input.batches.find((batch) => batch.lane === "backfill-ready") ??
    input.batches.find((batch) => batch.lane === "registry-review") ??
    null;

  return {
    summary: {
      auditTargetCount: auditTargets.length,
      nextBatchOperatorCount: nextBatch?.operatorCount ?? 0,
      nextBatchId: nextBatch?.id ?? null,
      nextBatchLane: nextBatch?.lane ?? null
    },
    auditTargets,
    nextBatch
  };
}

function compareAuditItems(left: StructureAuditItem, right: StructureAuditItem) {
  const severityComparison = getSeverityRank(left.severity) - getSeverityRank(right.severity);
  if (severityComparison !== 0) {
    return severityComparison;
  }

  const reasonComparison = getReasonRank(left.reasonKey) - getReasonRank(right.reasonKey);
  if (reasonComparison !== 0) {
    return reasonComparison;
  }

  return left.operatorSlug.localeCompare(right.operatorSlug, "de");
}

function getSeverityRank(severity: StructureAuditSeverity) {
  switch (severity) {
    case "legacy-shape":
      return 0;
    case "pending-review":
      return 1;
  }
}

function getReasonRank(reasonKey: StructureAuditReasonKey) {
  switch (reasonKey) {
    case "bands_without_time_windows":
      return 0;
    case "summary_fallback_only":
      return 1;
  }
}

function getAuditAction(reasonKey: StructureAuditReasonKey) {
  switch (reasonKey) {
    case "bands_without_time_windows":
      return "Backfill structured time windows for existing published tariff values.";
    case "summary_fallback_only":
      return "Extract a publishable Modul-3 matrix from the official source or keep the fallback pending.";
  }
}
