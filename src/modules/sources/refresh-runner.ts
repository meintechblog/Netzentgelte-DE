import type { RefreshableSource } from "./refresh-pipeline";

export async function runSourceRefresh(input: {
  sourceSlugs?: string[];
  loadSources: () => Promise<RefreshableSource[]>;
  refreshBatch: (input: { sources: RefreshableSource[] }) => Promise<{
    fetchedCount: number;
    snapshotCount: number;
    results?: Array<{
      status: "ok" | "warning" | "blocked";
    }>;
  }>;
}) {
  const availableSources = await input.loadSources();
  const selectedSources =
    input.sourceSlugs && input.sourceSlugs.length > 0
      ? availableSources.filter((source) => input.sourceSlugs?.includes(source.sourceSlug))
      : availableSources;
  const batchResult = await input.refreshBatch({
    sources: selectedSources
  });

  return {
    selectedSourceCount: selectedSources.length,
    selectedSourceSlugs: selectedSources.map((source) => source.sourceSlug),
    fetchedCount: batchResult.fetchedCount,
    snapshotCount: batchResult.snapshotCount,
    okCount: batchResult.results?.filter((result) => result.status === "ok").length ?? 0,
    warningCount: batchResult.results?.filter((result) => result.status === "warning").length ?? 0,
    blockedCount: batchResult.results?.filter((result) => result.status === "blocked").length ?? 0
  };
}
