import { isExcludedTransmissionOperator } from "./operator-exclusions";
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

export function classifyVerifiedCandidate(shell: OperatorShell): VerifiedCandidate {
  const blockedReasons = getBlockedReasons(shell);
  const stage = getStage(shell, blockedReasons);

  return {
    slug: shell.slug,
    operatorName: shell.operatorName,
    stage,
    score: getStageScore(stage, shell),
    blockedReasons
  };
}

export function selectVerifiedCandidate(shells: OperatorShell[]): VerifiedCandidateSelection {
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

  const candidates = relevant.map(classifyVerifiedCandidate);
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

function getStage(shell: OperatorShell, blockedReasons: string[]): VerifiedCandidateStage {
  if (blockedReasons.length > 0) {
    return "blocked";
  }

  if (hasOfficialEvidence(shell) && shell.shellStatus === "published") {
    return "verification-ready";
  }

  if (hasOfficialEvidence(shell)) {
    return "evidence-ready";
  }

  return "queued";
}

function hasOfficialEvidence(shell: OperatorShell) {
  return isUrl(shell.sourcePageUrl) && isUrl(shell.documentUrl) && shell.sourceStatus !== "missing";
}

function getBlockedReasons(shell: OperatorShell) {
  const reasons: string[] = [];
  const haystack = [shell.notes, shell.documentUrl, shell.sourcePageUrl].filter(Boolean).join(" ").toLowerCase();

  if (haystack.includes("fiktiv")) {
    reasons.push("Official evidence is explicitly marked as fiktiv.");
  }

  return reasons;
}

function isUrl(value: string | undefined) {
  return typeof value === "string" && /^https?:\/\//.test(value);
}

function getStageScore(stage: VerifiedCandidateStage, shell: OperatorShell) {
  if (stage === "blocked") {
    return -1;
  }

  if (stage === "verification-ready") {
    return 100 + (shell.tariffStatus === "partial" || shell.tariffStatus === "parsed" ? 10 : 0);
  }

  if (stage === "evidence-ready") {
    return 50;
  }

  return 0;
}
