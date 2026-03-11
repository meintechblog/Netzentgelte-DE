import { getOperatorRegistry, type OperatorRegistryEntry } from "./registry";

export type StructureAuditReasonKey = "summary_fallback_only" | "bands_without_time_windows";
export type StructureAuditSeverity = "pending-review" | "legacy-shape";

export type StructureAuditOperator = Pick<
  OperatorRegistryEntry,
  "slug" | "name" | "regionLabel"
> & {
  reviewStatus: OperatorRegistryEntry["currentTariff"]["reviewStatus"];
  sourcePageUrl: OperatorRegistryEntry["currentTariff"]["sourcePageUrl"];
  documentUrl: OperatorRegistryEntry["currentTariff"]["documentUrl"];
  summaryFallback?: OperatorRegistryEntry["currentTariff"]["summaryFallback"];
  bands: OperatorRegistryEntry["currentTariff"]["bands"];
  timeWindows: OperatorRegistryEntry["currentTariff"]["timeWindows"];
};

export type StructureAuditItem = {
  operatorSlug: string;
  operatorName: string;
  regionLabel: string;
  reviewStatus: "pending" | "verified";
  sourcePageUrl: string;
  documentUrl: string;
  reasonKey: StructureAuditReasonKey;
  severity: StructureAuditSeverity;
  message: string;
};

export function buildOperatorStructureAudit(operators: StructureAuditOperator[]): StructureAuditItem[] {
  return operators
    .flatMap<StructureAuditItem>((operator) => {
      if (operator.bands.length === 0 && operator.timeWindows.length === 0 && operator.summaryFallback) {
        return [
          {
            operatorSlug: operator.slug,
            operatorName: operator.name,
            regionLabel: operator.regionLabel,
            reviewStatus: operator.reviewStatus,
            sourcePageUrl: operator.sourcePageUrl,
            documentUrl: operator.documentUrl,
            reasonKey: "summary_fallback_only" as const,
            severity: "pending-review" as const,
            message: "Quelle ist erfasst, aber die strukturierte Modul-3-Matrix ist noch nicht publizierbar."
          }
        ];
      }

      if (operator.bands.length > 0 && operator.timeWindows.length === 0) {
        return [
          {
            operatorSlug: operator.slug,
            operatorName: operator.name,
            regionLabel: operator.regionLabel,
            reviewStatus: operator.reviewStatus,
            sourcePageUrl: operator.sourcePageUrl,
            documentUrl: operator.documentUrl,
            reasonKey: "bands_without_time_windows" as const,
            severity: "legacy-shape" as const,
            message: "Tarifwerte liegen vor, aber die strukturierte Zeitfensterlogik fehlt noch."
          }
        ];
      }

      return [];
    })
    .sort((left, right) => left.operatorSlug.localeCompare(right.operatorSlug, "de"));
}

export function getSeedOperatorStructureAudit() {
  return buildOperatorStructureAudit(
    getOperatorRegistry().map((entry) => ({
      slug: entry.slug,
      name: entry.name,
      regionLabel: entry.regionLabel,
      reviewStatus: entry.currentTariff.reviewStatus,
      sourcePageUrl: entry.currentTariff.sourcePageUrl,
      documentUrl: entry.currentTariff.documentUrl,
      summaryFallback: entry.currentTariff.summaryFallback,
      bands: entry.currentTariff.bands,
      timeWindows: entry.currentTariff.timeWindows
    }))
  );
}

export function getOperatorStructureAuditSummary(items: StructureAuditItem[]) {
  return {
    itemCount: items.length,
    summaryFallbackOnlyCount: items.filter((item) => item.reasonKey === "summary_fallback_only").length,
    bandsWithoutTimeWindowsCount: items.filter((item) => item.reasonKey === "bands_without_time_windows")
      .length,
    pendingReviewCount: items.filter((item) => item.severity === "pending-review").length,
    legacyShapeCount: items.filter((item) => item.severity === "legacy-shape").length
  };
}
