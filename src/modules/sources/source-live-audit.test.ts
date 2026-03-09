import { mkdtemp, readFile, rm } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";

import { afterEach, describe, expect, test, vi } from "vitest";

import { auditLiveSources } from "./source-live-audit";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true }))
  );
});

describe("auditLiveSources", () => {
  test("persists snapshots and returns ok when page and document fetch successfully", async () => {
    const artifactRootDir = await mkdtemp(path.join(tmpdir(), "netzentgelte-live-audit-"));
    temporaryDirectories.push(artifactRootDir);

    const pageBody = Buffer.from("<html>Quelle</html>");
    const documentBody = Buffer.from("preisblatt 2026");
    const gateway = {
      insertSnapshot: vi.fn(async (snapshot) => ({ ...snapshot, id: "snapshot-1" })),
      markSourceRefreshed: vi.fn(async () => undefined),
      insertRun: vi.fn(async () => undefined)
    };

    const result = await auditLiveSources({
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
      fetchPage: vi.fn(async () =>
        new Response(pageBody, {
          headers: {
            "content-type": "text/html; charset=utf-8"
          }
        })
      ),
      fetchDocument: vi.fn(async () =>
        new Response(documentBody, {
          headers: {
            "content-type": "application/pdf"
          }
        })
      ),
      gateway
    });

    await expect(
      readFile(
        path.join(artifactRootDir, "artifacts/netze-bw-netze-bw-14a-2026/2026-03-10/source-page.html")
      )
    ).resolves.toEqual(pageBody);
    await expect(
      readFile(
        path.join(
          artifactRootDir,
          "artifacts/netze-bw-netze-bw-14a-2026/2026-03-10/netzentgelte-strom-netze-bw-gmbh-2026.pdf"
        )
      )
    ).resolves.toEqual(documentBody);
    expect(result).toMatchObject({
      fetchedCount: 1,
      snapshotCount: 2,
      results: [
        expect.objectContaining({
          sourceSlug: "netze-bw-netze-bw-14a-2026",
          status: "ok",
          snapshotCount: 2
        })
      ]
    });
  });

  test("marks blocked sources when the document fetch returns 403", async () => {
    const artifactRootDir = await mkdtemp(path.join(tmpdir(), "netzentgelte-live-audit-"));
    temporaryDirectories.push(artifactRootDir);

    const result = await auditLiveSources({
      sources: [
        {
          sourceCatalogId: "source-2",
          sourceSlug: "syna-syna-14a-2026",
          pageUrl: "https://www.syna.de/corp/ueber-syna/netz/netzentgelte",
          documentUrl:
            "https://www.syna.de/content/dam/revu-global/syna/documents/netze/netzentgelte-strom-netzentgelte-und-abgaben/2026/finales-preisblatt-netzentgelte-strom-2026.pdf"
        }
      ],
      artifactRootDir,
      fetchPage: vi.fn(async () => new Response("<html>challenge</html>", { status: 403 })),
      fetchDocument: vi.fn(async () => new Response("blocked", { status: 403 })),
      gateway: {
        insertSnapshot: vi.fn(async () => undefined),
        markSourceRefreshed: vi.fn(async () => undefined),
        insertRun: vi.fn(async () => undefined)
      }
    });

    expect(result).toMatchObject({
      fetchedCount: 0,
      snapshotCount: 0,
      results: [
        expect.objectContaining({
          sourceSlug: "syna-syna-14a-2026",
          status: "blocked",
          issues: expect.arrayContaining([
            expect.objectContaining({
              key: "access_blocked"
            })
          ])
        })
      ]
    });
  });

  test("marks warning when the document content type is not a document artifact", async () => {
    const artifactRootDir = await mkdtemp(path.join(tmpdir(), "netzentgelte-live-audit-"));
    temporaryDirectories.push(artifactRootDir);

    const result = await auditLiveSources({
      sources: [
        {
          sourceCatalogId: "source-3",
          sourceSlug: "demo-demo-14a-2026",
          pageUrl: "https://example.com/page",
          documentUrl: "https://example.com/document"
        }
      ],
      artifactRootDir,
      fetchPage: vi.fn(async () =>
        new Response("<html>ok</html>", {
          headers: {
            "content-type": "text/html; charset=utf-8"
          }
        })
      ),
      fetchDocument: vi.fn(async () =>
        new Response("<html>still a page</html>", {
          headers: {
            "content-type": "text/html; charset=utf-8"
          }
        })
      ),
      gateway: {
        insertSnapshot: vi.fn(async () => undefined),
        markSourceRefreshed: vi.fn(async () => undefined),
        insertRun: vi.fn(async () => undefined)
      }
    });

    expect(result).toMatchObject({
      fetchedCount: 0,
      snapshotCount: 0,
      results: [
        expect.objectContaining({
          sourceSlug: "demo-demo-14a-2026",
          status: "warning",
          issues: expect.arrayContaining([
            expect.objectContaining({
              key: "unexpected_content_type"
            })
          ])
        })
      ]
    });
  });
});
