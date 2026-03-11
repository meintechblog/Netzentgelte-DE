import { describe, expect, test } from "vitest";

import { GET } from "./route";

describe("GET /api/tariffs/history", () => {
  test("returns a history payload instead of 501", async () => {
    const response = await GET(new Request("http://localhost/api/tariffs/history"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      items: expect.any(Array)
    });
    expect(data.items[0]).toMatchObject({
      operatorSlug: expect.any(String),
      sourceSlug: expect.any(String),
      bands: expect.any(Array),
      timeWindows: expect.any(Array)
    });
  });

  test("supports filtering the history feed by operator slug", async () => {
    const response = await GET(
      new Request("http://localhost/api/tariffs/history?operator=netze-bw")
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.items.length).toBeGreaterThan(0);
    expect(data.items.every((item: { operatorSlug: string }) => item.operatorSlug === "netze-bw")).toBe(
      true
    );
    expect(data.items[0]).toMatchObject({
      operatorSlug: "netze-bw"
    });
  });
});
