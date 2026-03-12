import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { getOperatorRegistry } from "../../src/modules/operators/registry";
import { loadOperatorShells } from "../../src/modules/operators/shell-catalog";
import {
  applyVerifiedOperatorLoopOutcome,
  createEmptyVerifiedOperatorLoopState,
  planVerifiedOperatorLoop,
  renderVerifiedOperatorLoopStateMarkdown,
  type VerifiedOperatorLoopOutcome,
  type VerifiedOperatorLoopState
} from "../../src/modules/operators/verified-operator-loop";

const STATE_JSON_PATH = join(process.cwd(), "docs/coordination/verified-operator-loop.json");
const STATE_MD_PATH = join(process.cwd(), "docs/coordination/verified-operator-loop.md");

function ensureParentDirectory(path: string) {
  mkdirSync(dirname(path), { recursive: true });
}

function readState(): VerifiedOperatorLoopState {
  if (!existsSync(STATE_JSON_PATH)) {
    return createEmptyVerifiedOperatorLoopState();
  }

  return JSON.parse(readFileSync(STATE_JSON_PATH, "utf8")) as VerifiedOperatorLoopState;
}

function writeState(state: VerifiedOperatorLoopState) {
  ensureParentDirectory(STATE_JSON_PATH);
  writeFileSync(STATE_JSON_PATH, `${JSON.stringify(state, null, 2)}\n`, "utf8");
  writeFileSync(STATE_MD_PATH, renderVerifiedOperatorLoopStateMarkdown(state), "utf8");
}

function readFlagValue(flag: string) {
  const index = process.argv.indexOf(flag);

  if (index < 0) {
    return null;
  }

  return process.argv[index + 1] ?? null;
}

function buildOutcomeFromArgs():
  | {
      kind: "block" | "complete";
      outcome: VerifiedOperatorLoopOutcome;
    }
  | null {
  const blockedSlug = readFlagValue("--mark-blocked");
  const completedSlug = readFlagValue("--mark-completed");

  if (!blockedSlug && !completedSlug) {
    return null;
  }

  const slug = blockedSlug ?? completedSlug;
  const note = readFlagValue("--note") ?? "Updated by automation run.";
  const updatedAt = readFlagValue("--updated-at") ?? new Date().toISOString();
  const commitSha = readFlagValue("--commit");
  const sourcePageUrl = readFlagValue("--source-page-url");
  const documentUrl = readFlagValue("--document-url");

  return {
    kind: blockedSlug ? "block" : "complete",
    outcome: {
      slug: slug!,
      status: blockedSlug ? "blocked" : "completed",
      updatedAt,
      note,
      commitSha,
      sourcePageUrl,
      documentUrl
    }
  };
}

async function main() {
  const mode = process.argv.includes("--live") ? "live" : "dry-run";
  let state = readState();
  const outcomeUpdate = buildOutcomeFromArgs();

  if (outcomeUpdate) {
    state = applyVerifiedOperatorLoopOutcome(state, outcomeUpdate.outcome);
    writeState(state);
  }

  const shells = await loadOperatorShells();
  const registryEntries = getOperatorRegistry();
  const plan = planVerifiedOperatorLoop({
    shells,
    registryEntries,
    state
  });

  console.log(
    JSON.stringify(
      {
        mode,
        statePath: STATE_JSON_PATH,
        selected: plan.selected,
        summary: plan.summary,
        eligible: plan.eligible.slice(0, 12),
        skippedBlocked: plan.skippedBlocked.slice(0, 12),
        skippedCompleted: plan.skippedCompleted.slice(0, 12),
        selectorBlocked: plan.selectorBlocked.slice(0, 12)
      },
      null,
      2
    )
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
