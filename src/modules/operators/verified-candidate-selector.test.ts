import { describe, expect, test } from "vitest";

import type { OperatorRegistryEntry } from "./registry";
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

function createRegistryEntry(overrides: Partial<OperatorRegistryEntry> = {}): OperatorRegistryEntry {
  return {
    slug: "demo-netz",
    name: "Demo Netz GmbH",
    regionLabel: "Demo",
    websiteUrl: "https://demo.example/",
    registrySourceIds: ["vnbdigital-portal"],
    sourceDocuments: [
      {
        id: "demo-netz-14a-2026",
        title: "Demo source",
        documentType: "pdf",
        sourcePageUrl: "https://demo.example/netzentgelte",
        documentUrl: "https://demo.example/preisblatt-2026.pdf",
        checkedAt: "2026-03-11",
        validFrom: "2026-01-01",
        reviewStatus: "pending",
        notes: []
      }
    ],
    currentTariff: {
      modelKey: "14a-model-3",
      validFrom: "2026-01-01",
      reviewStatus: "pending",
      sourceDocumentId: "demo-netz-14a-2026",
      sourcePageUrl: "https://demo.example/netzentgelte",
      documentUrl: "https://demo.example/preisblatt-2026.pdf",
      summaryFallback: "Quelle erfasst, Matrix offen",
      bands: [],
      timeWindows: []
    },
    ...overrides
  };
}

describe("classifyVerifiedCandidate", () => {
  test("marks a structured published shell as verification-ready", () => {
    const result = classifyVerifiedCandidate(
      createShell({
        slug: "ready-netz",
        shellStatus: "published",
        sourceStatus: "source-found",
        tariffStatus: "partial",
        documentUrl: "https://demo.example/preisblatt-2026.pdf"
      }),
      []
    );

    expect(result.stage).toBe("verification-ready");
    expect(result.blockedReasons).toEqual([]);
  });

  test("keeps shell-only candidates with raw source links in evidence-ready until tariff extraction exists", () => {
    const result = classifyVerifiedCandidate(
      createShell({
        slug: "shell-only-netz",
        shellStatus: "published",
        sourceStatus: "source-found",
        tariffStatus: "missing",
        documentUrl: "https://demo.example/preisblatt-2026.pdf"
      }),
      []
    );

    expect(result.stage).toBe("evidence-ready");
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
      }),
      []
    );

    expect(result.stage).toBe("blocked");
    expect(result.blockedReasons.join(" ")).toMatch(/fiktiv/i);
  });

  test("blocks explicitly provisional evidence from the verified lane", () => {
    const result = classifyVerifiedCandidate(
      createShell({
        slug: "vorlaeufig-netz",
        shellStatus: "published",
        sourceStatus: "source-found",
        documentUrl: "https://demo.example/preisblatt-vorlaeufig-2026.pdf",
        notes: "Offizielle Quelle listet nur vorlaeufige Netzentgelte 2026."
      }),
      []
    );

    expect(result.stage).toBe("blocked");
    expect(result.blockedReasons.join(" ")).toMatch(/vorlaeufig/i);
  });

  test("blocks evidence notes that already document a non-publishable annual matrix", () => {
    const result = classifyVerifiedCandidate(
      createShell({
        slug: "winter-only-netz",
        shellStatus: "published",
        sourceStatus: "source-found",
        tariffStatus: "missing",
        documentUrl: "https://demo.example/preisblatt-2026.pdf",
        notes: "Finale 2026-Quelle erfasst, aber keine publizierbare Modul-3-Jahresmatrix; gilt nur fuer Q1/Q4."
      }),
      []
    );

    expect(result.stage).toBe("blocked");
    expect(result.blockedReasons.join(" ")).toMatch(/non-publishable|annual tariff matrix/i);
  });

  test("keeps homepage-only shell links out of the verify lane until a concrete artifact exists", () => {
    const result = classifyVerifiedCandidate(
      createShell({
        slug: "homepage-only-netz",
        shellStatus: "published",
        sourceStatus: "source-found",
        sourcePageUrl: "https://demo.example/",
        documentUrl: "https://demo.example/"
      }),
      []
    );

    expect(result.stage).toBe("evidence-ready");
    expect(result.blockedReasons).toEqual([]);
  });

  test("downgrades known pending registry entries without structured matrix out of the verify lane", () => {
    const result = classifyVerifiedCandidate(
      createShell({
        slug: "egt-energie",
        shellStatus: "published",
        sourceStatus: "source-found",
        tariffStatus: "partial",
        documentUrl: "https://demo.example/final-2026.pdf"
      }),
      [
        createRegistryEntry({
          slug: "egt-energie",
          name: "EGT Energie GmbH"
        })
      ]
    );

    expect(result.stage).toBe("evidence-ready");
    expect(result.blockedReasons).toEqual([]);
  });
});

describe("selectVerifiedCandidate", () => {
  test("prefers the strongest verification-ready shell over weaker source hunting candidates", () => {
    const result = selectVerifiedCandidate(
      [
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
          tariffStatus: "partial",
          documentUrl: "https://demo.example/verified.pdf"
        })
      ],
      []
    );

    expect(result.selected).toEqual(
      expect.objectContaining({
        slug: "verification-ready-netz",
        stage: "verification-ready"
      })
    );
    expect(result.summary.verificationReadyCount).toBe(1);
  });

  test("ignores already verified operators and returns blocked reasons when nothing qualifies", () => {
    const result = selectVerifiedCandidate(
      [
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
      ],
      []
    );

    expect(result.selected).toBeNull();
    expect(result.blocked).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slug: "blocked-fiktiv-netz"
        })
      ])
    );
  });

  test("prefers a structured registry-backed candidate over a known pending fallback-only entry", () => {
    const result = selectVerifiedCandidate(
      [
        createShell({
          slug: "egt-energie",
          operatorName: "EGT Energie GmbH",
          shellStatus: "published",
          sourceStatus: "source-found",
          tariffStatus: "partial",
          documentUrl: "https://demo.example/egt-final.pdf"
        }),
        createShell({
          slug: "structured-netz",
          operatorName: "Structured Netz GmbH",
          shellStatus: "published",
          sourceStatus: "source-found",
          tariffStatus: "partial",
          documentUrl: "https://demo.example/structured.pdf"
        })
      ],
      [
        createRegistryEntry({
          slug: "egt-energie",
          name: "EGT Energie GmbH"
        }),
        createRegistryEntry({
          slug: "structured-netz",
          name: "Structured Netz GmbH",
          currentTariff: {
            modelKey: "14a-model-3",
            validFrom: "2026-01-01",
            reviewStatus: "pending",
            sourceDocumentId: "demo-netz-14a-2026",
            sourcePageUrl: "https://demo.example/netzentgelte",
            documentUrl: "https://demo.example/preisblatt-2026.pdf",
            bands: [
              {
                key: "NT",
                label: "Niedrigtarif",
                valueCtPerKwh: "1.11",
                sourceQuote: "NT 1,11"
              },
              {
                key: "ST",
                label: "Standardtarif",
                valueCtPerKwh: "5.55",
                sourceQuote: "ST 5,55"
              },
              {
                key: "HT",
                label: "Hochtarif",
                valueCtPerKwh: "8.88",
                sourceQuote: "HT 8,88"
              }
            ],
            timeWindows: [
              {
                id: "structured-netz-high",
                bandKey: "HT",
                label: "Hochtarif",
                seasonLabel: "Q1-Q4 2026",
                dayLabel: "Alle Tage",
                timeRangeLabel: "17:00-19:00",
                sourceQuote: "HT 17:00-19:00"
              }
            ]
          }
        })
      ]
    );

    expect(result.selected).toEqual(
      expect.objectContaining({
        slug: "structured-netz",
        stage: "verification-ready"
      })
    );
    expect(result.candidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slug: "egt-energie",
          stage: "evidence-ready"
        })
      ])
    );
  });
});
