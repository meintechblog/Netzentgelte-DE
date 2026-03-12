import verifiedOperatorLoopStateJson from "../../../docs/coordination/verified-operator-loop.json";
import { isExcludedTransmissionOperator } from "./operator-exclusions";
import type { OperatorRegistryEntry } from "./registry";
import type { OperatorShell } from "./shell-catalog";
import { classifyVerifiedCandidate, type VerifiedCandidate } from "./verified-candidate-selector";

export type VerifiedOperatorLoopOutcomeStatus = "completed" | "blocked";

export type VerifiedOperatorLoopOutcome = {
  slug: string;
  status: VerifiedOperatorLoopOutcomeStatus;
  updatedAt: string;
  note: string;
  commitSha?: string | null;
  sourcePageUrl?: string | null;
  documentUrl?: string | null;
};

export type VerifiedOperatorLoopState = {
  meta: {
    updatedAt: string;
    lastRunAt: string | null;
  };
  outcomes: VerifiedOperatorLoopOutcome[];
};

export type VerifiedOperatorLoopCandidate = VerifiedCandidate & {
  shellStatus: OperatorShell["shellStatus"];
  sourceStatus: OperatorShell["sourceStatus"];
  tariffStatus: OperatorShell["tariffStatus"];
  reviewStatus: OperatorShell["reviewStatus"];
  sourcePageUrl?: string;
  documentUrl?: string;
  stateStatus: VerifiedOperatorLoopOutcomeStatus | null;
  stateNote: string | null;
};

export type VerifiedOperatorLoopPlan = {
  selected: VerifiedOperatorLoopCandidate | null;
  eligible: VerifiedOperatorLoopCandidate[];
  skippedBlocked: VerifiedOperatorLoopCandidate[];
  skippedCompleted: VerifiedOperatorLoopCandidate[];
  selectorBlocked: VerifiedOperatorLoopCandidate[];
  summary: {
    eligibleCount: number;
    selectorBlockedCount: number;
    loopBlockedCount: number;
    completedCount: number;
  };
};

export function createEmptyVerifiedOperatorLoopState(
  now = new Date().toISOString()
): VerifiedOperatorLoopState {
  return {
    meta: {
      updatedAt: now,
      lastRunAt: null
    },
    outcomes: []
  };
}

export function getSeedVerifiedOperatorLoopState(): VerifiedOperatorLoopState {
  return verifiedOperatorLoopStateJson as VerifiedOperatorLoopState;
}

export function applyVerifiedOperatorLoopOutcome(
  state: VerifiedOperatorLoopState,
  outcome: VerifiedOperatorLoopOutcome
): VerifiedOperatorLoopState {
  const filtered = state.outcomes.filter((entry) => entry.slug !== outcome.slug);
  const outcomes = [...filtered, outcome].sort((left, right) => left.slug.localeCompare(right.slug, "de"));

  return {
    meta: {
      updatedAt: outcome.updatedAt,
      lastRunAt: outcome.updatedAt
    },
    outcomes
  };
}

export function planVerifiedOperatorLoop(input: {
  shells: OperatorShell[];
  registryEntries: OperatorRegistryEntry[];
  state: VerifiedOperatorLoopState;
}): VerifiedOperatorLoopPlan {
  const outcomeMap = new Map(input.state.outcomes.map((outcome) => [outcome.slug, outcome] as const));

  const candidates = input.shells
    .filter((shell) => shell.deprecatedStatus === "active")
    .filter((shell) => shell.reviewStatus !== "verified")
    .filter(
      (shell) =>
        !isExcludedTransmissionOperator({
          slug: shell.slug,
          name: shell.operatorName,
          websiteUrl: shell.websiteUrl,
          sourcePageUrl: shell.sourcePageUrl
        })
    )
    .map((shell) => {
      const candidate = classifyVerifiedCandidate(shell, input.registryEntries);
      const outcome = outcomeMap.get(shell.slug);

      return {
        ...candidate,
        shellStatus: shell.shellStatus,
        sourceStatus: shell.sourceStatus,
        tariffStatus: shell.tariffStatus,
        reviewStatus: shell.reviewStatus,
        sourcePageUrl: shell.sourcePageUrl,
        documentUrl: shell.documentUrl,
        stateStatus: outcome?.status ?? null,
        stateNote: outcome?.note ?? null
      } satisfies VerifiedOperatorLoopCandidate;
    });

  const eligible = candidates
    .filter((candidate) => candidate.stateStatus === null)
    .filter((candidate) => candidate.stage === "verification-ready" || candidate.stage === "evidence-ready")
    .sort((left, right) => right.score - left.score || left.slug.localeCompare(right.slug, "de"));

  const skippedBlocked = candidates
    .filter((candidate) => candidate.stateStatus === "blocked")
    .sort((left, right) => left.slug.localeCompare(right.slug, "de"));
  const skippedCompleted = candidates
    .filter((candidate) => candidate.stateStatus === "completed")
    .sort((left, right) => left.slug.localeCompare(right.slug, "de"));
  const selectorBlocked = candidates
    .filter((candidate) => candidate.stage === "blocked" && candidate.stateStatus === null)
    .sort((left, right) => left.slug.localeCompare(right.slug, "de"));

  return {
    selected: eligible[0] ?? null,
    eligible,
    skippedBlocked,
    skippedCompleted,
    selectorBlocked,
    summary: {
      eligibleCount: eligible.length,
      selectorBlockedCount: selectorBlocked.length,
      loopBlockedCount: skippedBlocked.length,
      completedCount: skippedCompleted.length
    }
  };
}

export function renderVerifiedOperatorLoopStateMarkdown(state: VerifiedOperatorLoopState) {
  const lines = [
    "# Verified Operator Loop",
    "",
    `Updated: ${state.meta.updatedAt}`,
    `Last run: ${state.meta.lastRunAt ?? "-"}`,
    "",
    "| Slug | Status | Updated | Note |",
    "| --- | --- | --- | --- |"
  ];

  for (const outcome of state.outcomes) {
    lines.push(`| ${outcome.slug} | ${outcome.status} | ${outcome.updatedAt} | ${outcome.note} |`);
  }

  return `${lines.join("\n")}\n`;
}
