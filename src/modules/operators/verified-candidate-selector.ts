import { isExcludedTransmissionOperator } from "./operator-exclusions";
import type { OperatorRegistryEntry } from "./registry";
import type { OperatorShell } from "./shell-catalog";

export type VerifiedCandidateStage = "queued" | "evidence-ready" | "verification-ready" | "blocked";

export type VerifiedCandidate = {
  slug: string;
  operatorName: string;
  stage: VerifiedCandidateStage;
  score: number;
  blockedReasons: string[];
};

export type VerifiedCandidateSelection = {
  selected: VerifiedCandidate | null;
  blocked: VerifiedCandidate[];
  candidates: VerifiedCandidate[];
  summary: {
    queuedCount: number;
    evidenceReadyCount: number;
    verificationReadyCount: number;
    blockedCount: number;
  };
};

export function classifyVerifiedCandidate(
  shell: OperatorShell,
  registryEntries: OperatorRegistryEntry[]
): VerifiedCandidate {
  const blockedReasons = getBlockedReasons(shell);
  const registryEntry = registryEntries.find((entry) => entry.slug === shell.slug);
  const stage = getStage(shell, blockedReasons, registryEntry);

  return {
    slug: shell.slug,
    operatorName: shell.operatorName,
    stage,
    score: getStageScore(stage, shell, registryEntry),
    blockedReasons
  };
}

export function selectVerifiedCandidate(
  shells: OperatorShell[],
  registryEntries: OperatorRegistryEntry[] = []
): VerifiedCandidateSelection {
  const relevant = shells
    .filter((shell) => shell.deprecatedStatus === "active")
    .filter(
      (shell) =>
        !isExcludedTransmissionOperator({
          slug: shell.slug,
          name: shell.operatorName,
          websiteUrl: shell.websiteUrl,
          sourcePageUrl: shell.sourcePageUrl
        })
    )
    .filter((shell) => shell.reviewStatus !== "verified");

  const candidates = relevant.map((shell) => classifyVerifiedCandidate(shell, registryEntries));
  const blocked = candidates.filter((candidate) => candidate.stage === "blocked");
  const eligible = candidates
    .filter((candidate) => candidate.stage === "verification-ready" || candidate.stage === "evidence-ready")
    .sort((left, right) => right.score - left.score || left.slug.localeCompare(right.slug, "de"));

  return {
    selected: eligible[0] ?? null,
    blocked,
    candidates,
    summary: {
      queuedCount: candidates.filter((candidate) => candidate.stage === "queued").length,
      evidenceReadyCount: candidates.filter((candidate) => candidate.stage === "evidence-ready").length,
      verificationReadyCount: candidates.filter((candidate) => candidate.stage === "verification-ready").length,
      blockedCount: blocked.length
    }
  };
}

function getStage(
  shell: OperatorShell,
  blockedReasons: string[],
  registryEntry: OperatorRegistryEntry | undefined
): VerifiedCandidateStage {
  if (blockedReasons.length > 0) {
    return "blocked";
  }

  if (registryEntry && !isRegistryVerificationReady(registryEntry)) {
    return hasOfficialSource(shell) ? "evidence-ready" : "queued";
  }

  if (
    hasConcreteArtifactEvidence(shell) &&
    shell.shellStatus === "published" &&
    shell.tariffStatus !== "missing"
  ) {
    return "verification-ready";
  }

  if (hasOfficialSource(shell)) {
    return "evidence-ready";
  }

  return "queued";
}

function hasOfficialSource(shell: OperatorShell) {
  return isUrl(shell.sourcePageUrl) && shell.sourceStatus !== "missing";
}

function hasConcreteArtifactEvidence(shell: OperatorShell) {
  if (!hasOfficialSource(shell) || !isUrl(shell.documentUrl)) {
    return false;
  }

  return normalizeComparableUrl(shell.sourcePageUrl) !== normalizeComparableUrl(shell.documentUrl);
}

function isRegistryVerificationReady(entry: OperatorRegistryEntry) {
  if (entry.currentTariff.reviewStatus === "verified") {
    return false;
  }

  return entry.currentTariff.bands.length === 3 && entry.currentTariff.timeWindows.length > 0;
}

function getBlockedReasons(shell: OperatorShell) {
  const reasons: string[] = [];
  const haystack = [shell.notes, shell.documentUrl, shell.sourcePageUrl].filter(Boolean).join(" ").toLowerCase();

  if (haystack.includes("fiktiv")) {
    reasons.push("Official evidence is explicitly marked as fiktiv.");
  }

  if (haystack.includes("vorlaeufig") || haystack.includes("vorläufig")) {
    reasons.push("Official evidence is explicitly marked as vorlaeufig.");
  }

  if (
    haystack.includes("keine publizierbare modul-3-jahresmatrix") ||
    haystack.includes("nicht publizierbare modul-3-jahresmatrix") ||
    haystack.includes("nur fuer q1/q4") ||
    haystack.includes("nur für q1/q4") ||
    haystack.includes("nur in den quartalen 1 und 4") ||
    haystack.includes("winterquartale") ||
    haystack.includes("widerspr")
  ) {
    reasons.push("Official evidence already documents a non-publishable annual tariff matrix.");
  }

  return reasons;
}

function isUrl(value: string | undefined) {
  return typeof value === "string" && /^https?:\/\//.test(value);
}

function normalizeComparableUrl(value: string | undefined) {
  if (!value) {
    return "";
  }

  return value.replace(/\/+$/, "");
}

function getStageScore(
  stage: VerifiedCandidateStage,
  shell: OperatorShell,
  registryEntry: OperatorRegistryEntry | undefined
) {
  if (stage === "blocked") {
    return -1;
  }

  if (stage === "verification-ready") {
    return (
      100 +
      (shell.tariffStatus === "partial" || shell.tariffStatus === "parsed" ? 10 : 0) +
      (registryEntry ? 5 : 0)
    );
  }

  if (stage === "evidence-ready") {
    return (
      50 +
      (shell.shellStatus === "published" ? 20 : 0) +
      (hasConcreteArtifactEvidence(shell) ? 15 : 0) +
      (shell.sourceStatus === "source-found" || shell.sourceStatus === "snapshotted"
        ? 10
        : shell.sourceStatus === "reachable"
          ? 5
          : 0) +
      (registryEntry ? 5 : 0)
    );
  }

  return 0;
}
