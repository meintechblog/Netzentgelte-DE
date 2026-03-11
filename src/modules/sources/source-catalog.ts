const UPDATE_STRATEGY_REFRESH_DAYS: Record<string, number> = {
  "daily-review": 1,
  "weekly-review": 7,
  "monthly-review": 30,
  "quarterly-review": 90
};

export type BuildSourceRecordInput = {
  operatorSlug: string;
  sourceUrl: string;
  updateStrategy: keyof typeof UPDATE_STRATEGY_REFRESH_DAYS | string;
  documentType?: "pdf" | "html" | "csv" | "json" | "xlsx";
  providerHint?: string;
};

export function buildSourceRecord(input: BuildSourceRecordInput) {
  const refreshWindowDays = UPDATE_STRATEGY_REFRESH_DAYS[input.updateStrategy] ?? 90;

  return {
    operatorSlug: input.operatorSlug,
    sourceSlug: `${input.operatorSlug}-${slugifyUrl(input.sourceUrl)}`,
    sourceUrl: input.sourceUrl,
    updateStrategy: input.updateStrategy,
    documentType: input.documentType ?? detectDocumentType(input.sourceUrl),
    providerHint: input.providerHint ?? extractProviderHint(input.sourceUrl),
    refreshWindowDays,
    parserMode: "pending",
    reviewStatus: "unverified"
  };
}

function detectDocumentType(sourceUrl: string) {
  const normalizedUrl = sourceUrl.toLowerCase();

  if (normalizedUrl.endsWith(".pdf")) {
    return "pdf";
  }

  if (normalizedUrl.endsWith(".csv")) {
    return "csv";
  }

  if (normalizedUrl.endsWith(".json")) {
    return "json";
  }

  if (normalizedUrl.endsWith(".xlsx")) {
    return "xlsx";
  }

  return "html";
}

function extractProviderHint(sourceUrl: string) {
  const { hostname } = new URL(sourceUrl);

  return hostname.replace(/^www\./, "");
}

function slugifyUrl(sourceUrl: string) {
  return sourceUrl
    .replace(/^https?:\/\//, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}
