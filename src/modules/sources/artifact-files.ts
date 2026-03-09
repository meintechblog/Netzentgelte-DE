import { readFile } from "node:fs/promises";
import path from "node:path";

export function getArtifactsRootDir() {
  return process.env.ARTIFACTS_ROOT_DIR ?? path.join(process.cwd(), "data", "artifacts");
}

export function resolveArtifactPath(artifactPath: string[], rootDir = getArtifactsRootDir()) {
  if (artifactPath.length === 0 || artifactPath.some((segment) => segment.length === 0)) {
    return null;
  }

  const resolvedPath = path.resolve(rootDir, ...artifactPath);
  const normalizedRootDir = path.resolve(rootDir);

  if (resolvedPath !== normalizedRootDir && !resolvedPath.startsWith(`${normalizedRootDir}${path.sep}`)) {
    return null;
  }

  return resolvedPath;
}

export async function loadArtifactFile(artifactPath: string[], rootDir = getArtifactsRootDir()) {
  const resolvedPath = resolveArtifactPath(artifactPath, rootDir);

  if (!resolvedPath) {
    return null;
  }

  const body = await readFile(resolvedPath);

  return {
    path: resolvedPath,
    body
  };
}

export function getArtifactContentType(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();

  switch (extension) {
    case ".htm":
    case ".html":
      return "text/html; charset=utf-8";
    case ".pdf":
      return "application/pdf";
    case ".json":
      return "application/json; charset=utf-8";
    case ".txt":
      return "text/plain; charset=utf-8";
    default:
      return "application/octet-stream";
  }
}
