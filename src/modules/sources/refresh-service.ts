import { createHash } from "node:crypto";

type CreateSourceSnapshotFromFetchInput = {
  sourceCatalogId: string;
  sourceSlug: string;
  pageUrl: string;
  documentUrl: string;
  fetchDocument: () => Promise<Response>;
  fetchedAt?: Date;
};

export async function createSourceSnapshotFromFetch(input: CreateSourceSnapshotFromFetchInput) {
  const response = await input.fetchDocument();
  const fetchedAt = input.fetchedAt ?? new Date();
  const documentBuffer = Buffer.from(await response.arrayBuffer());
  const documentUrl = new URL(input.documentUrl);
  const fileName = documentUrl.pathname.split("/").at(-1) ?? "artifact.bin";
  const contentHash = createHash("sha256").update(documentBuffer).digest("hex");
  const storagePath = [
    "artifacts",
    input.sourceSlug,
    fetchedAt.toISOString().slice(0, 10),
    fileName
  ].join("/");

  return {
    documentBuffer,
    sourceCatalogId: input.sourceCatalogId,
    fetchedAt,
    pageUrl: input.pageUrl,
    fileUrl: input.documentUrl,
    fileName,
    mimeType: response.headers.get("content-type") ?? "application/octet-stream",
    contentHash,
    storagePath,
    parserStatus: "pending" as const,
    metadata: {
      byteLength: documentBuffer.byteLength
    }
  };
}
