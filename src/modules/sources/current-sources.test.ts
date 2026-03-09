import { describe, expect, test } from "vitest";

import { buildCurrentSources, getSeedCurrentSources } from "./current-sources";

describe("buildCurrentSources", () => {
  test("maps separate page and document snapshots into reviewable source entries", () => {
    const sources = buildCurrentSources([
      {
        sourceCatalogId: "source-1",
        sourceSlug: "netze-bw-netze-bw-14a-2026",
        operatorSlug: "netze-bw",
        operatorName: "Netze BW GmbH",
        pageUrl: "https://www.netze-bw.de/neuregelung-14a-enwg",
        documentUrl:
          "https://assets.ctfassets.net/xytfb1vrn7of/7eQvxehZzn3ECbR9rALmyD/ecc795b9dcd666ce1f53d9d04362a321/netzentgelte-strom-netze-bw-gmbh-2026.pdf",
        reviewStatus: "verified",
        checkedAt: "2026-03-09",
        lastSuccessfulAt: "2026-03-09",
        latestPageSnapshotFetchedAt: "2026-03-09T01:22:00.000Z",
        latestPageSnapshotHash: "page123",
        latestPageSnapshotStoragePath:
          "artifacts/netze-bw-netze-bw-14a-2026/2026-03-09/source-page.html",
        latestDocumentSnapshotFetchedAt: "2026-03-09T01:23:00.000Z",
        latestDocumentSnapshotHash: "doc123",
        latestDocumentSnapshotStoragePath:
          "artifacts/netze-bw-netze-bw-14a-2026/2026-03-09/netzentgelte-strom-netze-bw-gmbh-2026.pdf"
      }
    ]);

    expect(sources).toEqual([
      {
        sourceCatalogId: "source-1",
        sourceSlug: "netze-bw-netze-bw-14a-2026",
        operatorSlug: "netze-bw",
        operatorName: "Netze BW GmbH",
        pageUrl: "https://www.netze-bw.de/neuregelung-14a-enwg",
        documentUrl:
          "https://assets.ctfassets.net/xytfb1vrn7of/7eQvxehZzn3ECbR9rALmyD/ecc795b9dcd666ce1f53d9d04362a321/netzentgelte-strom-netze-bw-gmbh-2026.pdf",
        reviewStatus: "verified",
        checkedAt: "2026-03-09",
        lastSuccessfulAt: "2026-03-09",
        latestPageSnapshotFetchedAt: "2026-03-09T01:22:00.000Z",
        latestPageSnapshotHash: "page123",
        latestPageSnapshotStoragePath:
          "artifacts/netze-bw-netze-bw-14a-2026/2026-03-09/source-page.html",
        pageArtifactApiUrl: "/api/artifacts/netze-bw-netze-bw-14a-2026/2026-03-09/source-page.html",
        latestDocumentSnapshotFetchedAt: "2026-03-09T01:23:00.000Z",
        latestDocumentSnapshotHash: "doc123",
        latestDocumentSnapshotStoragePath:
          "artifacts/netze-bw-netze-bw-14a-2026/2026-03-09/netzentgelte-strom-netze-bw-gmbh-2026.pdf",
        documentArtifactApiUrl:
          "/api/artifacts/netze-bw-netze-bw-14a-2026/2026-03-09/netzentgelte-strom-netze-bw-gmbh-2026.pdf",
        healthReport: {
          status: "ok",
          issues: []
        }
      }
    ]);
  });
});

describe("getSeedCurrentSources", () => {
  test("keeps a seed-backed review list available when no database is configured", () => {
    const sources = getSeedCurrentSources();
    const syna = sources.find((entry) => entry.operatorSlug === "syna");
    const sweNetz = sources.find((entry) => entry.operatorSlug === "swe-netz");

    expect(sources[0]).toMatchObject({
      sourceSlug: expect.any(String),
      operatorSlug: expect.any(String),
      pageUrl: expect.stringContaining("https://"),
      documentUrl: expect.stringContaining("https://"),
      healthReport: expect.objectContaining({
        status: expect.any(String)
      })
    });
    expect(syna).toMatchObject({
      healthReport: expect.objectContaining({
        status: "blocked",
        issues: expect.arrayContaining([
          expect.objectContaining({
            key: "access_blocked"
          })
        ])
      })
    });
    expect(sweNetz).toMatchObject({
      healthReport: expect.objectContaining({
        status: "warning",
        issues: expect.arrayContaining([
          expect.objectContaining({
            key: "pending_source_only"
          })
        ])
      })
    });
  });
});
