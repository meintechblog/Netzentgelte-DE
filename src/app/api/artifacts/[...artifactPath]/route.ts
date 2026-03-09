import { loadArtifactFile, getArtifactContentType } from "../../../../modules/sources/artifact-files";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ artifactPath?: string[] }> }
) {
  void request;
  const { artifactPath = [] } = await context.params;

  try {
    const artifact = await loadArtifactFile(artifactPath);

    if (!artifact) {
      return Response.json({ error: "invalid_artifact_path" }, { status: 400 });
    }

    return new Response(artifact.body, {
      status: 200,
      headers: {
        "content-type": getArtifactContentType(artifact.path)
      }
    });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return Response.json({ error: "artifact_not_found" }, { status: 404 });
    }

    throw error;
  }
}
