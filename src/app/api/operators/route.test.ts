import { describe, expect, test } from "vitest";

import { GET } from "./route";

describe("GET /api/operators", () => {
  test("returns registry-backed operators", async () => {
    const response = await GET(new Request("http://localhost/api/operators"));
    const data = await response.json();

    expect(data.items[0]).toMatchObject({
      slug: expect.any(String),
      name: expect.any(String),
      sourceDocumentCount: expect.any(Number)
    });
    expect(data.items).toHaveLength(20);
    expect(data.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slug: "lew-verteilnetz",
          reviewStatus: "verified"
        }),
        expect.objectContaining({
          slug: "stadtwerke-schwaebisch-hall",
          reviewStatus: "verified"
        }),
        expect.objectContaining({
          slug: "mainzer-netze",
          reviewStatus: "verified"
        })
      ])
    );
    expect(
      data.items.find((item: { slug: string }) => item.slug === "avacon-netz")
    ).toBeUndefined();
    expect(
      data.items.find((item: { slug: string }) => item.slug === "nordnetz")
    ).toBeUndefined();
    expect(
      data.items.find((item: { slug: string }) => item.slug === "heidelberg-netze")
    ).toBeUndefined();
  });
});
