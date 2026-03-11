import { createHash } from "node:crypto";

import { describe, expect, test } from "vitest";

import { createSourceSnapshotFromFetch } from "./refresh-service";

describe("createSourceSnapshotFromFetch", () => {
  test("builds page and document snapshots with explicit artifact kinds and deterministic storage paths", async () => {
    const body = Buffer.from("preisblatt 2026");
    const expectedHash = createHash("sha256").update(body).digest("hex");

    const pageSnapshot = await createSourceSnapshotFromFetch({
      sourceCatalogId: "source-1",
      sourceSlug: "netze-bw-netze-bw-14a-2026",
      pageUrl: "https://www.netze-bw.de/neuregelung-14a-enwg",
      artifactKind: "page",
      artifactUrl: "https://www.netze-bw.de/neuregelung-14a-enwg",
      fetchArtifact: async () =>
        new Response(body, {
          headers: {
            "content-type": "text/html; charset=utf-8"
          }
        }),
      fetchedAt: new Date("2026-03-10T00:00:00.000Z")
    });

    const documentSnapshot = await createSourceSnapshotFromFetch({
      sourceCatalogId: "source-1",
      sourceSlug: "netze-bw-netze-bw-14a-2026",
      pageUrl: "https://www.netze-bw.de/neuregelung-14a-enwg",
      artifactKind: "document",
      artifactUrl:
        "https://assets.ctfassets.net/xytfb1vrn7of/7eQvxehZzn3ECbR9rALmyD/ecc795b9dcd666ce1f53d9d04362a321/netzentgelte-strom-netze-bw-gmbh-2026.pdf",
      fetchArtifact: async () =>
        new Response(body, {
          headers: {
            "content-type": "application/pdf"
          }
        }),
      fetchedAt: new Date("2026-03-10T00:00:00.000Z")
    });

    expect(pageSnapshot).toMatchObject({
      sourceCatalogId: "source-1",
      artifactKind: "page",
      contentHash: expectedHash,
      storagePath: "artifacts/netze-bw-netze-bw-14a-2026/2026-03-10/source-page.html",
      fileName: "source-page.html",
      fileUrl: "https://www.netze-bw.de/neuregelung-14a-enwg",
      mimeType: "text/html; charset=utf-8",
      parserStatus: "pending"
    });

    expect(documentSnapshot).toMatchObject({
      sourceCatalogId: "source-1",
      artifactKind: "document",
      contentHash: expectedHash,
      storagePath:
        "artifacts/netze-bw-netze-bw-14a-2026/2026-03-10/netzentgelte-strom-netze-bw-gmbh-2026.pdf",
      fileName: "netzentgelte-strom-netze-bw-gmbh-2026.pdf",
      fileUrl:
        "https://assets.ctfassets.net/xytfb1vrn7of/7eQvxehZzn3ECbR9rALmyD/ecc795b9dcd666ce1f53d9d04362a321/netzentgelte-strom-netze-bw-gmbh-2026.pdf",
      mimeType: "application/pdf",
      parserStatus: "pending"
    });
  });
});
