import { describe, expect, test } from "vitest";

import { GET } from "./route";

describe("GET /api/operators/pending", () => {
  test("returns the filtered public pending catalog without tariff matrix fields", async () => {
    const response = await GET(new Request("http://localhost/api/operators/pending"));
    const data = await response.json();

    expect(data.summary).toMatchObject({
      operatorCount: expect.any(Number),
      sourceFoundCount: expect.any(Number),
      tariffReadyCount: expect.any(Number)
    });
    expect(data.items.length).toBeGreaterThan(20);
    expect(data.items.find((item: { slug: string }) => item.slug === "maintal-werke")).toBeUndefined();
    expect(data.items.find((item: { slug: string }) => item.slug === "mainnetz")).toBeUndefined();
    expect(data.items.find((item: { slug: string }) => item.slug === "mainsite-und")).toBeUndefined();
    expect(data.items.find((item: { slug: string }) => item.slug === "netze-bw")).toBeUndefined();
    expect(data.items.find((item: { slug: string }) => item.slug === "50hertz-transmission")).toBeUndefined();
    expect(data.items[0]).not.toHaveProperty("bands");
    expect(data.items[0]).not.toHaveProperty("timeWindows");
  });
});
