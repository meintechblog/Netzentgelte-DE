import { describe, expect, test } from "vitest";

import { buildCurrentSources, getSeedCurrentSources } from "./current-sources";

describe("buildCurrentSources", () => {
  test("maps source catalog rows and latest snapshots into reviewable source entries", () => {
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
        latestSnapshotFetchedAt: "2026-03-09T01:23:00.000Z",
        latestSnapshotHash: "abc123",
        latestSnapshotStoragePath:
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
        latestSnapshotFetchedAt: "2026-03-09T01:23:00.000Z",
        latestSnapshotHash: "abc123",
        latestSnapshotStoragePath:
          "artifacts/netze-bw-netze-bw-14a-2026/2026-03-09/netzentgelte-strom-netze-bw-gmbh-2026.pdf",
        artifactApiUrl:
          "/api/artifacts/netze-bw-netze-bw-14a-2026/2026-03-09/netzentgelte-strom-netze-bw-gmbh-2026.pdf"
      }
    ]);
  });
});

describe("getSeedCurrentSources", () => {
  test("keeps a seed-backed review list available when no database is configured", () => {
    const sources = getSeedCurrentSources();

    expect(sources[0]).toMatchObject({
      sourceSlug: expect.any(String),
      operatorSlug: expect.any(String),
      pageUrl: expect.stringContaining("https://"),
      documentUrl: expect.stringContaining("https://")
    });
  });
});
