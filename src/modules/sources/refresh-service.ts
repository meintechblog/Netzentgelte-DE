import { createHash } from "node:crypto";
import path from "node:path";

type CreateSourceSnapshotFromFetchInput = {
  sourceCatalogId: string;
  sourceSlug: string;
  pageUrl: string;
  artifactKind: "page" | "document";
  artifactUrl: string;
  fetchArtifact: () => Promise<Response>;
  fetchedAt?: Date;
};

export async function createSourceSnapshotFromFetch(input: CreateSourceSnapshotFromFetchInput) {
  const response = await input.fetchArtifact();
  const fetchedAt = input.fetchedAt ?? new Date();
  const documentBuffer = Buffer.from(await response.arrayBuffer());
  const fileName = getArtifactFileName({
    artifactKind: input.artifactKind,
    artifactUrl: input.artifactUrl,
    contentType: response.headers.get("content-type")
  });
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
    artifactKind: input.artifactKind,
    fetchedAt,
    pageUrl: input.pageUrl,
    fileUrl: input.artifactUrl,
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

function getArtifactFileName(input: {
  artifactKind: "page" | "document";
  artifactUrl: string;
  contentType: string | null;
}) {
  if (input.artifactKind === "page") {
    return inferPageFileName(input.contentType);
  }

  const artifactUrl = new URL(input.artifactUrl);
  const fileName = artifactUrl.pathname.split("/").at(-1);

  if (!fileName || fileName.length === 0) {
    return "artifact.bin";
  }

  return fileName;
}

function inferPageFileName(contentType: string | null) {
  if (!contentType) {
    return "source-page.html";
  }

  if (contentType.includes("application/json")) {
    return "source-page.json";
  }

  if (contentType.includes("text/plain")) {
    return "source-page.txt";
  }

  if (contentType.includes("text/html")) {
    return "source-page.html";
  }

  const extension = path.extname(contentType);

  if (extension.length > 0) {
    return `source-page${extension}`;
  }

  return "source-page.html";
}
