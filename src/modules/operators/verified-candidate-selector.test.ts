import { describe, expect, test } from "vitest";

import type { OperatorShell } from "./shell-catalog";
import { classifyVerifiedCandidate, selectVerifiedCandidate } from "./verified-candidate-selector";

function createShell(overrides: Partial<OperatorShell> = {}): OperatorShell {
  return {
    slug: "demo-netz",
    operatorName: "Demo Netz GmbH",
    countryCode: "DE",
    websiteUrl: "https://demo.example/",
    regionLabel: "Demo",
    shellStatus: "profile-found",
    coverageStatus: "hinted",
    sourceStatus: "candidate",
    tariffStatus: "missing",
    reviewStatus: "pending",
    deprecatedStatus: "active",
    sourcePageUrl: "https://demo.example/netzentgelte",
    documentUrl: undefined,
    notes: "Demo shell",
    lastCheckedAt: null,
    ...overrides
  };
}

describe("classifyVerifiedCandidate", () => {
  test("marks a documented published shell as verification-ready", () => {
    const result = classifyVerifiedCandidate(
      createShell({
        slug: "ready-netz",
        shellStatus: "published",
        sourceStatus: "source-found",
        documentUrl: "https://demo.example/preisblatt-2026.pdf"
      })
    );

    expect(result.stage).toBe("verification-ready");
    expect(result.blockedReasons).toEqual([]);
  });

  test("blocks fiktiv evidence from the verified lane", () => {
    const result = classifyVerifiedCandidate(
      createShell({
        slug: "fiktiv-netz",
        shellStatus: "published",
        sourceStatus: "source-found",
        documentUrl: "https://demo.example/preisblatt-fiktiv-2026.pdf",
        notes: "Official publication explicitly labels 2026 as fiktiv."
      })
    );

    expect(result.stage).toBe("blocked");
    expect(result.blockedReasons.join(" ")).toMatch(/fiktiv/i);
  });
});

describe("selectVerifiedCandidate", () => {
  test("prefers the strongest verification-ready shell over weaker source hunting candidates", () => {
    const result = selectVerifiedCandidate([
      createShell({
        slug: "candidate-netz",
        shellStatus: "profile-found",
        sourceStatus: "candidate"
      }),
      createShell({
        slug: "evidence-ready-netz",
        shellStatus: "profile-found",
        sourceStatus: "source-found",
        documentUrl: "https://demo.example/evidence.pdf"
      }),
      createShell({
        slug: "verification-ready-netz",
        shellStatus: "published",
        sourceStatus: "source-found",
        documentUrl: "https://demo.example/verified.pdf"
      })
    ]);

    expect(result.selected).toEqual(
      expect.objectContaining({
        slug: "verification-ready-netz",
        stage: "verification-ready"
      })
    );
    expect(result.summary.verificationReadyCount).toBe(1);
  });

  test("ignores already verified operators and returns blocked reasons when nothing qualifies", () => {
    const result = selectVerifiedCandidate([
      createShell({
        slug: "already-verified-netz",
        shellStatus: "verified",
        sourceStatus: "source-found",
        documentUrl: "https://demo.example/already-verified.pdf",
        reviewStatus: "verified"
      }),
      createShell({
        slug: "blocked-fiktiv-netz",
        shellStatus: "published",
        sourceStatus: "source-found",
        documentUrl: "https://demo.example/fiktiv.pdf",
        notes: "fiktiv"
      })
    ]);

    expect(result.selected).toBeNull();
    expect(result.blocked).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slug: "blocked-fiktiv-netz"
        })
      ])
    );
  });
});
