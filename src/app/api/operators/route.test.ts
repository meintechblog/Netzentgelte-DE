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
    expect(data.items).toHaveLength(27);
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
        }),
        expect.objectContaining({
          slug: "enercity-netz",
          reviewStatus: "verified"
        }),
        expect.objectContaining({
          slug: "fairnetz",
          reviewStatus: "verified"
        }),
        expect.objectContaining({
          slug: "stadtwerke-bamberg",
          reviewStatus: "verified"
        }),
        expect.objectContaining({
          slug: "schleswig-holstein-netz",
          reviewStatus: "verified"
        }),
        expect.objectContaining({
          slug: "mitnetz-strom",
          reviewStatus: "verified"
        }),
        expect.objectContaining({
          slug: "avacon-netz",
          reviewStatus: "verified"
        }),
        expect.objectContaining({
          slug: "netz-duesseldorf",
          reviewStatus: "verified"
        }),
        expect.objectContaining({
          slug: "nordnetz",
          reviewStatus: "verified"
        }),
        expect.objectContaining({
          slug: "nrm-netzdienste",
          reviewStatus: "verified"
        }),
        expect.objectContaining({
          slug: "thueringer-energienetze",
          reviewStatus: "verified"
        }),
        expect.objectContaining({
          slug: "tws-netz",
          reviewStatus: "verified"
        })
      ])
    );
    expect(
      data.items.find((item: { slug: string }) => item.slug === "heidelberg-netze")
    ).toBeUndefined();
    expect(
      data.items.find((item: { slug: string }) => item.slug === "swm-infrastruktur")
    ).toBeUndefined();
    expect(
      data.items.find((item: { slug: string }) => item.slug === "ewr-netz")
    ).toBeUndefined();
    expect(
      data.items.find((item: { slug: string }) => item.slug === "geranetz")
    ).toBeUndefined();
    expect(
      data.items.find((item: { slug: string }) => item.slug === "e-netz-suedhessen")
    ).toBeUndefined();
  });
});
