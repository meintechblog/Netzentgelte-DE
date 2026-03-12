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
    expect(data.items).toHaveLength(102);
    expect(data.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slug: "netze-bad-langensalza",
          reviewStatus: "verified",
          complianceStatus: "violation",
          complianceViolationCount: 1,
          priceBasis: "assumed-netto"
        }),
        expect.objectContaining({
          slug: "nahwerk-energie-und",
          reviewStatus: "verified",
          complianceStatus: "compliant",
          complianceViolationCount: 0,
          priceBasis: "assumed-netto"
        }),
        expect.objectContaining({
          slug: "naturenergie-netze",
          reviewStatus: "verified",
          complianceStatus: "compliant",
          complianceViolationCount: 0,
          priceBasis: "assumed-netto"
        }),
        expect.objectContaining({
          slug: "mega-monheimer-elektrizitats-und-gasversorgung",
          reviewStatus: "verified",
          complianceStatus: "compliant",
          complianceViolationCount: 0,
          priceBasis: "assumed-netto"
        }),
        expect.objectContaining({
          slug: "markt-zellingen",
          reviewStatus: "verified",
          complianceStatus: "compliant",
          complianceViolationCount: 0,
          priceBasis: "assumed-netto"
        }),
        expect.objectContaining({
          slug: "maintal-werke",
          reviewStatus: "verified",
          complianceStatus: "compliant",
          complianceViolationCount: 0,
          priceBasis: "assumed-netto"
        }),
        expect.objectContaining({
          slug: "mainsite-und",
          reviewStatus: "verified",
          complianceStatus: "compliant",
          complianceViolationCount: 0,
          priceBasis: "assumed-netto"
        }),
        expect.objectContaining({
          slug: "mainnetz",
          reviewStatus: "verified",
          complianceStatus: "compliant",
          complianceViolationCount: 0,
          priceBasis: "assumed-netto"
        }),
        expect.objectContaining({
          slug: "lsw-netz-und",
          reviewStatus: "verified",
          complianceStatus: "compliant",
          complianceViolationCount: 0,
          priceBasis: "assumed-netto"
        }),
        expect.objectContaining({
          slug: "lokalwerke",
          reviewStatus: "verified",
          complianceStatus: "compliant",
          complianceViolationCount: 0,
          priceBasis: "assumed-netto"
        }),
        expect.objectContaining({
          slug: "licht-und-kraftwerke-sonneberg",
          reviewStatus: "verified",
          complianceStatus: "compliant",
          complianceViolationCount: 0,
          priceBasis: "assumed-netto"
        }),
        expect.objectContaining({
          slug: "licht-und-kraftwerke-helmbrechts",
          reviewStatus: "verified",
          complianceStatus: "compliant",
          complianceViolationCount: 0,
          priceBasis: "assumed-netto"
        }),
        expect.objectContaining({
          slug: "licht-kraft-und-wasserwerke-kitzingen",
          reviewStatus: "verified",
          complianceStatus: "compliant",
          complianceViolationCount: 0,
          priceBasis: "assumed-netto"
        }),
        expect.objectContaining({
          slug: "kraftwerk-farchant-a-poettinger-und",
          reviewStatus: "verified",
          complianceStatus: "compliant",
          complianceViolationCount: 0
        }),
        expect.objectContaining({
          slug: "leinenetz",
          reviewStatus: "verified",
          complianceStatus: "compliant",
          complianceViolationCount: 0
        }),
        expect.objectContaining({
          slug: "leitungspartner",
          reviewStatus: "verified",
          complianceStatus: "compliant",
          complianceViolationCount: 0,
          priceBasis: "assumed-netto"
        }),
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
          slug: "stadtwerk-tauberfranken",
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
          slug: "stadtwerke-bad-pyrmont",
          reviewStatus: "verified",
          complianceStatus: "compliant",
          complianceViolationCount: 0
        }),
        expect.objectContaining({
          slug: "strom-und-gasnetz-wismar",
          reviewStatus: "verified",
          complianceStatus: "compliant",
          complianceViolationCount: 0
        }),
        expect.objectContaining({
          slug: "evu-langenpreising",
          reviewStatus: "verified",
          complianceStatus: "violation",
          complianceViolationCount: 1
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
