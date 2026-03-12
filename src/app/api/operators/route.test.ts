import { describe, expect, test } from "vitest";

import { GET } from "./route";

describe("GET /api/operators", () => {
  test("returns registry-backed operators with compliance metadata", async () => {
    const response = await GET(new Request("http://localhost/api/operators"));
    const data = await response.json();

    expect(data.items[0]).toMatchObject({
      slug: expect.any(String),
      name: expect.any(String),
      sourceDocumentCount: expect.any(Number),
      priceBasis: expect.any(String),
      complianceStatus: expect.any(String),
      complianceViolationCount: expect.any(Number),
      complianceNotEvaluatedCount: expect.any(Number)
    });
    expect(data.items).toHaveLength(82);
    expect(data.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slug: "alliander-netz-heinsberg",
          reviewStatus: "verified",
          complianceStatus: "violation",
          complianceViolationCount: 1
        }),
        expect.objectContaining({
          slug: "ahrtal-werke",
          reviewStatus: "verified",
          complianceStatus: "compliant",
          complianceViolationCount: 0
        }),
        expect.objectContaining({
          slug: "abita-energie-otterberg",
          reviewStatus: "verified",
          complianceStatus: "compliant",
          complianceViolationCount: 0
        }),
        expect.objectContaining({
          slug: "stadtwerke-achim",
          reviewStatus: "verified",
          complianceStatus: "compliant",
          complianceViolationCount: 0
        }),
        expect.objectContaining({
          slug: "stadtnetze-munster",
          reviewStatus: "verified",
          complianceStatus: "compliant",
          complianceViolationCount: 0
        }),
        expect.objectContaining({
          slug: "stadtische-betriebswerke-luckenwalde",
          reviewStatus: "verified",
          complianceStatus: "compliant",
          complianceViolationCount: 0
        }),
        expect.objectContaining({
          slug: "stadtwerke-altdorf",
          reviewStatus: "verified",
          complianceStatus: "compliant",
          complianceViolationCount: 0
        }),
        expect.objectContaining({
          slug: "stadtwerke-bad-aibling",
          reviewStatus: "verified",
          complianceStatus: "compliant",
          complianceViolationCount: 0
        }),
        expect.objectContaining({
          slug: "stadtwerke-andernach-energie",
          reviewStatus: "verified",
          complianceStatus: "compliant",
          complianceViolationCount: 0
        }),
        expect.objectContaining({
          slug: "stadtwerke-schwaebisch-hall",
          reviewStatus: "verified",
          complianceStatus: "compliant",
          priceBasis: "assumed-netto"
        }),
        expect.objectContaining({
          slug: "mainzer-netze",
          reviewStatus: "verified",
          complianceStatus: "compliant",
          priceBasis: "assumed-netto"
        }),
        expect.objectContaining({
          slug: "tws-netz",
          reviewStatus: "verified",
          priceBasis: "assumed-netto"
        }),
        expect.objectContaining({
          slug: "netze-bw",
          reviewStatus: "verified",
          complianceStatus: "compliant",
          complianceViolationCount: 0
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
