import { mkdtemp, readFile, rm } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";

import { afterEach, describe, expect, test, vi } from "vitest";

import { refreshSources } from "./refresh-pipeline";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true }))
  );
});

describe("refreshSources", () => {
  test("downloads artifacts, persists source snapshots and records refresh bookkeeping", async () => {
    const artifactRootDir = await mkdtemp(path.join(tmpdir(), "netzentgelte-refresh-"));
    temporaryDirectories.push(artifactRootDir);

    const documentBody = Buffer.from("preisblatt 2026");
    const gateway = {
      insertSnapshot: vi.fn(async (snapshot) => ({
        ...snapshot,
        id: "snapshot-1"
      })),
      markSourceRefreshed: vi.fn(async () => undefined),
      insertRun: vi.fn(async () => undefined)
    };

    const result = await refreshSources({
      sources: [
        {
          sourceCatalogId: "source-1",
          sourceSlug: "netze-bw-netze-bw-14a-2026",
          pageUrl: "https://www.netze-bw.de/neuregelung-14a-enwg",
          documentUrl:
            "https://assets.ctfassets.net/xytfb1vrn7of/7eQvxehZzn3ECbR9rALmyD/ecc795b9dcd666ce1f53d9d04362a321/netzentgelte-strom-netze-bw-gmbh-2026.pdf"
        }
      ],
      artifactRootDir,
      fetchedAt: new Date("2026-03-10T00:00:00.000Z"),
      fetchDocument: vi.fn(async () =>
        new Response(documentBody, {
          headers: {
            "content-type": "application/pdf"
          }
        })
      ),
      gateway
    });

    const persistedPath = path.join(
      artifactRootDir,
      "artifacts/netze-bw-netze-bw-14a-2026/2026-03-10/netzentgelte-strom-netze-bw-gmbh-2026.pdf"
    );

    await expect(readFile(persistedPath)).resolves.toEqual(documentBody);
    expect(gateway.insertSnapshot).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceCatalogId: "source-1",
        pageUrl: "https://www.netze-bw.de/neuregelung-14a-enwg",
        fileUrl:
          "https://assets.ctfassets.net/xytfb1vrn7of/7eQvxehZzn3ECbR9rALmyD/ecc795b9dcd666ce1f53d9d04362a321/netzentgelte-strom-netze-bw-gmbh-2026.pdf",
        storagePath:
          "artifacts/netze-bw-netze-bw-14a-2026/2026-03-10/netzentgelte-strom-netze-bw-gmbh-2026.pdf",
        mimeType: "application/pdf",
        metadata: expect.objectContaining({
          byteLength: documentBody.byteLength
        })
      })
    );
    expect(gateway.markSourceRefreshed).toHaveBeenCalledWith({
      sourceCatalogId: "source-1",
      checkedAt: new Date("2026-03-10T00:00:00.000Z"),
      successfulAt: new Date("2026-03-10T00:00:00.000Z")
    });
    expect(gateway.insertRun).toHaveBeenCalledWith({
      sourceCatalogId: "source-1",
      runType: "source-refresh",
      status: "success",
      summary: {
        fetchedCount: 1,
        snapshotCount: 1
      }
    });
    expect(result).toEqual({
      fetchedCount: 1,
      snapshotCount: 1
    });
  });
});
