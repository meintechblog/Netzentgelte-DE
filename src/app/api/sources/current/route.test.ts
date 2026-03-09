import { describe, expect, test } from "vitest";

import { getSeedPublishedOperators } from "../../../../modules/operators/current-catalog";
import { GET } from "./route";

describe("GET /api/sources/current", () => {
  test("returns reviewable current source entries with page and document artifact metadata", async () => {
    const response = await GET(new Request("http://localhost/api/sources/current"));
    const data = await response.json();

    expect(data.items[0]).toMatchObject({
      sourceSlug: expect.any(String),
      operatorSlug: expect.any(String),
      pageUrl: expect.any(String),
      documentUrl: expect.any(String),
      checkedAt: expect.any(String)
    });
    expect(data.items[0]).toHaveProperty("pageArtifactApiUrl");
    expect(data.items[0]).toHaveProperty("documentArtifactApiUrl");
    expect(data.items).toHaveLength(getSeedPublishedOperators().length);
    expect(
      data.items.find((item: { operatorSlug: string }) => item.operatorSlug === "avacon-netz")
    ).toBeUndefined();
  });
});
