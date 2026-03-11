import { describe, expect, test } from "vitest";

import { GET } from "./route";

describe("GET /api/tariffs/endcustomer/audit", () => {
  test("returns a completeness audit for published operators", async () => {
    const response = await GET(new Request("http://localhost/api/tariffs/endcustomer/audit"));
    const data = await response.json();

    expect(data.summary).toMatchObject({
      operatorCount: expect.any(Number),
      completeCount: expect.any(Number),
      missingEntryCount: expect.any(Number),
      incompleteCount: expect.any(Number)
    });
    expect(data.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          operatorSlug: "stadtwerke-schwaebisch-hall",
          status: "complete"
        }),
        expect.objectContaining({
          operatorSlug: expect.any(String),
          status: expect.stringMatching(/complete|missing-entry|incomplete/)
        })
      ])
    );
    expect(data.nextTargets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          operatorSlug: expect.any(String),
          status: expect.stringMatching(/missing-entry|incomplete/)
        })
      ])
    );
  });
});
