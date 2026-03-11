export type SourceHealthStatus = "ok" | "warning" | "blocked";

export type SourceHealthIssueKey =
  | "access_blocked"
  | "pending_source_only"
  | "snapshot_missing"
  | "document_type_mismatch"
  | "document_url_suspicious";

export type SourceHealthIssue = {
  key: SourceHealthIssueKey;
  message: string;
  detail?: string;
};

export type SourceHealthReport = {
  status: SourceHealthStatus;
  issues: SourceHealthIssue[];
};

export type BuildSourceHealthReportInput = {
  reviewStatus: string;
  pageUrl: string;
  documentUrl: string;
  checkedAt: string | null;
  latestPageSnapshotStoragePath?: string | null;
  latestDocumentSnapshotStoragePath?: string | null;
  summaryFallback?: string | null;
  sourceNotes?: string[];
};

export function buildSourceHealthReport(input: BuildSourceHealthReportInput): SourceHealthReport {
  const issues: SourceHealthIssue[] = [];
  const evidenceText = [input.summaryFallback ?? "", ...(input.sourceNotes ?? [])].join("\n").toLowerCase();

  if (
    evidenceText.includes("cloudflare") ||
    evidenceText.includes("technisch blockiert") ||
    evidenceText.includes("manual-evidence-needed") ||
    evidenceText.includes("manuelle evidenz")
  ) {
    issues.push({
      key: "access_blocked",
      message: "Die offizielle Quelle ist aktuell technisch blockiert oder braucht manuelle Evidenz."
    });
  }

  if (input.reviewStatus === "pending" && typeof input.summaryFallback === "string" && input.summaryFallback.length > 0) {
    issues.push({
      key: "pending_source_only",
      message: "Die Quelle ist dokumentiert, aber noch nicht als voll publizierbare Tarifmatrix strukturiert."
    });
  }

  if (input.checkedAt && !input.latestPageSnapshotStoragePath && !input.latestDocumentSnapshotStoragePath) {
    issues.push({
      key: "snapshot_missing",
      message: "Die Quelle wurde geprüft, aber es liegt noch kein Snapshot-Artefakt vor."
    });
  }

  if (!hasRecognizedArtifactExtension(input.documentUrl)) {
    issues.push({
      key: "document_type_mismatch",
      message: "Die Dokument-URL endet nicht auf einen erkennbaren Artefakttyp."
    });
  }

  if (looksSuspiciousDocumentUrl(input.documentUrl)) {
    issues.push({
      key: "document_url_suspicious",
      message: "Die Dokument-URL wirkt nicht kanonisch oder traegt nur einen generischen Dateinamen."
    });
  }

  if (issues.some((issue) => issue.key === "access_blocked")) {
    return { status: "blocked", issues };
  }

  if (issues.length > 0) {
    return { status: "warning", issues };
  }

  return { status: "ok", issues: [] };
}

function hasRecognizedArtifactExtension(documentUrl: string) {
  const pathname = new URL(documentUrl).pathname.toLowerCase();

  return [".pdf", ".xlsx", ".csv", ".json", ".html"].some((extension) => pathname.endsWith(extension));
}

function looksSuspiciousDocumentUrl(documentUrl: string) {
  const pathname = new URL(documentUrl).pathname.toLowerCase();

  return pathname.endsWith("/download") || pathname.endsWith("/document") || pathname.endsWith("preisblatt_strom.pdf");
}
