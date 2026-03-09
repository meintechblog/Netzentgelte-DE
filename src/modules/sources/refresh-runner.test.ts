import { describe, expect, test, vi } from "vitest";

import { runSourceRefresh } from "./refresh-runner";

describe("runSourceRefresh", () => {
  test("filters refresh work to the requested source slugs and returns a structured summary", async () => {
    const loadSources = vi.fn(async () => [
      {
        sourceCatalogId: "source-1",
        sourceSlug: "netze-bw-netze-bw-14a-2026",
        pageUrl: "https://www.netze-bw.de/neuregelung-14a-enwg",
        documentUrl: "https://example.com/netze-bw.pdf"
      },
      {
        sourceCatalogId: "source-2",
        sourceSlug: "westnetz-westnetz-14a-2026",
        pageUrl: "https://www.westnetz.de/de/ueber-westnetz/unser-netz/netzentgelte-strom.html",
        documentUrl: "https://example.com/westnetz.pdf"
      }
    ]);
    const refreshBatch = vi.fn(async ({ sources }: { sources: Array<{ sourceSlug: string }> }) => ({
      fetchedCount: sources.length,
      snapshotCount: sources.length
    }));

    const result = await runSourceRefresh({
      sourceSlugs: ["westnetz-westnetz-14a-2026"],
      loadSources,
      refreshBatch
    });

    expect(refreshBatch).toHaveBeenCalledWith({
      sources: [
        expect.objectContaining({
          sourceSlug: "westnetz-westnetz-14a-2026"
        })
      ]
    });
    expect(result).toEqual({
      selectedSourceCount: 1,
      selectedSourceSlugs: ["westnetz-westnetz-14a-2026"],
      fetchedCount: 1,
      snapshotCount: 1
    });
  });
});
