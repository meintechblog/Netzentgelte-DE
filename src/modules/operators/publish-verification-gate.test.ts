import { describe, expect, test } from "vitest";

import { verifyPublishedOperatorInSnapshot } from "./publish-verification-gate";

describe("verifyPublishedOperatorInSnapshot", () => {
  test("passes when the expected slug is present in the main public snapshot", () => {
    const result = verifyPublishedOperatorInSnapshot({
      expectedSlug: "demo-netz",
      snapshot: {
        operatorCount: 1,
        operators: [{ operatorSlug: "demo-netz" }],
        pendingOperators: {
          summary: {
            operatorCount: 0,
            sourceFoundCount: 0,
            tariffReadyCount: 0
          },
          items: []
        }
      }
    });

    expect(result.passed).toBe(true);
  });

  test("fails when the slug only exists in pending but not in the published snapshot", () => {
    const result = verifyPublishedOperatorInSnapshot({
      expectedSlug: "pending-netz",
      snapshot: {
        operatorCount: 1,
        operators: [{ operatorSlug: "demo-netz" }],
        pendingOperators: {
          summary: {
            operatorCount: 1,
            sourceFoundCount: 1,
            tariffReadyCount: 0
          },
          items: [
            {
              slug: "pending-netz"
            }
          ]
        }
      }
    });

    expect(result.passed).toBe(false);
    expect(result.reason).toMatch(/pending/i);
  });
});
