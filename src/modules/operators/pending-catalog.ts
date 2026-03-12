import { getSeedPublishedOperators, loadPublishedOperatorSnapshot } from "./current-catalog";
import { isExcludedTransmissionOperator } from "./operator-exclusions";
import { getSeedOperatorShells, loadOperatorShells, type OperatorShell } from "./shell-catalog";
import { getSeedVerifiedOperatorLoopState } from "./verified-operator-loop";

export type PendingOperatorPublicationStatus = "pending" | "blocked" | "missing-data";

export type PendingOperatorPublic = {
  slug: string;
  name: string;
  regionLabel: string;
  sourceSlug: string;
  reviewStatus: OperatorShell["reviewStatus"];
  sourceStatus: OperatorShell["sourceStatus"];
  tariffStatus: OperatorShell["tariffStatus"];
  websiteUrl?: string;
  sourcePageUrl?: string;
  documentUrl?: string;
  notes?: string;
  checkedAt: string | null;
  publicationStatus: PendingOperatorPublicationStatus;
  statusSummary: string;
  missingInformation: string[];
  hasVerifiedLowVoltageProduct: boolean;
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
  const loopOutcomeBySlug = new Map(
    getSeedVerifiedOperatorLoopState().outcomes.map((outcome) => [outcome.slug, outcome] as const)
  );
  const items = input.shells
    .filter((shell) => isPublicPendingShell(shell, input.publishableOperatorSlugs))
    .map((shell) => buildPendingOperatorPublic(shell, loopOutcomeBySlug.get(shell.slug)))
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

function buildPendingOperatorPublic(
  shell: OperatorShell,
  outcome:
    | {
        note: string;
        status: "completed" | "blocked";
        sourcePageUrl?: string | null;
        documentUrl?: string | null;
      }
    | undefined
): PendingOperatorPublic {
  const sourcePageUrl = outcome?.sourcePageUrl ?? shell.sourcePageUrl ?? shell.websiteUrl;
  const documentUrl = outcome?.documentUrl ?? normalizeDocumentUrl(shell.documentUrl);
  const publicationStatus = getPublicationStatus(shell, outcome);
  const missingInformation = getMissingInformation(shell, sourcePageUrl, documentUrl);

  return {
    slug: shell.slug,
    name: shell.operatorName,
    regionLabel: shell.regionLabel,
    sourceSlug: `${shell.slug}-pending`,
    reviewStatus: shell.reviewStatus,
    sourceStatus: shell.sourceStatus,
    tariffStatus: shell.tariffStatus,
    websiteUrl: shell.websiteUrl,
    sourcePageUrl,
    documentUrl,
    notes: shell.notes,
    checkedAt: shell.lastCheckedAt,
    publicationStatus,
    statusSummary: getStatusSummary(shell, publicationStatus, outcome, missingInformation),
    missingInformation,
    hasVerifiedLowVoltageProduct: false
  };
}

function getPublicationStatus(
  shell: OperatorShell,
  outcome:
    | {
        status: "completed" | "blocked";
      }
    | undefined
): PendingOperatorPublicationStatus {
  if (outcome?.status === "blocked") {
    return "blocked";
  }

  if (shell.sourceStatus === "missing" || shell.tariffStatus === "missing") {
    return "missing-data";
  }

  return "pending";
}

function getMissingInformation(
  shell: OperatorShell,
  sourcePageUrl: string | undefined,
  documentUrl: string | undefined
) {
  const missing = ["Verifiziertes Niederspannungsprodukt fehlt"];

  if (!sourcePageUrl) {
    missing.push("Offizielle 2026-Quellseite fehlt");
  }

  if (!documentUrl) {
    missing.push("Offizielles 2026-Dokument fehlt");
  }

  if (shell.tariffStatus === "missing" || shell.tariffStatus === "partial") {
    missing.push("Modul-3-Tarifdaten unvollständig");
  }

  if (!shell.lastCheckedAt) {
    missing.push("Dokumentierter Prüfzeitpunkt fehlt");
  }

  return missing;
}

function getStatusSummary(
  shell: OperatorShell,
  publicationStatus: PendingOperatorPublicationStatus,
  outcome:
    | {
        note: string;
      }
    | undefined,
  missingInformation: string[]
) {
  if (outcome?.note) {
    return publicationStatus === "blocked" ? `Blockiert: ${outcome.note}` : outcome.note;
  }

  if (publicationStatus === "missing-data") {
    return `Offizielle 2026-Quelle vorhanden, aber noch nicht vollständig veröffentlichbar: ${missingInformation.join(
      ", "
    )}.`;
  }

  if (shell.notes) {
    return shell.notes;
  }

  return "Offizielle 2026-Veröffentlichung geprüft, aber die Niederspannungsdaten sind noch nicht vollständig verifiziert.";
}

function normalizeDocumentUrl(documentUrl: string | undefined) {
  if (!documentUrl || !/^https?:\/\//.test(documentUrl) || !/\.(pdf|html?)($|[?#])/i.test(documentUrl)) {
    return undefined;
  }

  return documentUrl;
}
