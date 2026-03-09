import { createHash } from "node:crypto";

import { describe, expect, test } from "vitest";

import { createSourceSnapshotFromFetch } from "./refresh-service";

describe("createSourceSnapshotFromFetch", () => {
  test("builds a source snapshot with sha256 hash and deterministic storage path", async () => {
    const body = Buffer.from("preisblatt 2026");
    const expectedHash = createHash("sha256").update(body).digest("hex");

    const snapshot = await createSourceSnapshotFromFetch({
      sourceCatalogId: "source-1",
      sourceSlug: "netze-bw-netze-bw-14a-2026",
      pageUrl: "https://www.netze-bw.de/neuregelung-14a-enwg",
      documentUrl:
        "https://assets.ctfassets.net/xytfb1vrn7of/7eQvxehZzn3ECbR9rALmyD/ecc795b9dcd666ce1f53d9d04362a321/netzentgelte-strom-netze-bw-gmbh-2026.pdf",
      fetchDocument: async () =>
        new Response(body, {
          headers: {
            "content-type": "application/pdf"
          }
        }),
      fetchedAt: new Date("2026-03-10T00:00:00.000Z")
    });

    expect(snapshot).toMatchObject({
      sourceCatalogId: "source-1",
      contentHash: expectedHash,
      storagePath:
        "artifacts/netze-bw-netze-bw-14a-2026/2026-03-10/netzentgelte-strom-netze-bw-gmbh-2026.pdf",
      fileName: "netzentgelte-strom-netze-bw-gmbh-2026.pdf",
      mimeType: "application/pdf",
      parserStatus: "pending"
    });
  });
});
