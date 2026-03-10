import { describe, expect, test } from "vitest";

import {
  buildShellCandidatesFromVnbdigital,
  parseVnbdigitalOperatorIndexResponse
} from "./vnbdigital-shells";
import type { OperatorShellRegistryEntry } from "./shell-registry";
import type { OperatorRegistryEntry } from "./registry";

const publishedOperators = [
  {
    slug: "mittelhessen-netz",
    name: "MIT.N Mittelhessen Netz GmbH",
    regionLabel: "Mittelhessen",
    websiteUrl: "https://www.mitn.de/",
    registrySourceIds: ["vnbdigital-portal"],
    sourceDocuments: [],
    currentTariff: {
      modelKey: "14a-model-3",
      validFrom: "2026-01-01",
      reviewStatus: "verified",
      sourceDocumentId: "demo",
      sourcePageUrl: "https://www.mitn.de/",
      documentUrl: "https://www.mitn.de/demo.pdf",
      bands: [],
      timeWindows: []
    }
  }
] satisfies OperatorRegistryEntry[];

const existingShells = [
  {
    slug: "mitn-mittelhessen-netz",
    operatorName: "MIT.N Mittelhessen Netz GmbH",
    websiteUrl: "https://www.mitn.de/",
    regionLabel: "Mittelhessen",
    shellStatus: "verified",
    coverageStatus: "hinted",
    sourceStatus: "source-found",
    tariffStatus: "verified",
    reviewStatus: "verified",
    deprecatedStatus: "active",
    sourcePageUrl: "https://www.mitn.de/"
  },
  {
    slug: "rhein-netz",
    operatorName: "Rhein-Netz GmbH",
    websiteUrl: "https://www.rhein-netz.de/",
    regionLabel: "Köln",
    shellStatus: "shell",
    coverageStatus: "unknown",
    sourceStatus: "candidate",
    tariffStatus: "missing",
    reviewStatus: "pending",
    deprecatedStatus: "active"
  }
] satisfies OperatorShellRegistryEntry[];

describe("parseVnbdigitalOperatorIndexResponse", () => {
  test("parses and normalizes the public VNBdigital operator index response", () => {
    const parsed = parseVnbdigitalOperatorIndexResponse({
      data: {
        vnb_vnbs: [
          {
            _id: "1068",
            name: "Bayernwerk Netz GmbH",
            website: "https://www.bayernwerk-netz.de/",
            postcode: "93055",
            city: " Regensburg ",
            address: "Lilienthalstraße 7\n",
            types: ["Strom"],
            publicRequired: true,
            layerUrl: "https://www.vnbdigital.de/layers/1068",
            bbox: [12.0, 49.0, 12.2, 49.1]
          }
        ]
      }
    });

    expect(parsed).toEqual([
      {
        id: "1068",
        operatorName: "Bayernwerk Netz GmbH",
        websiteUrl: "https://www.bayernwerk-netz.de/",
        postcode: "93055",
        city: "Regensburg",
        address: "Lilienthalstraße 7",
        types: ["Strom"],
        publicRequired: true,
        layerUrl: "https://www.vnbdigital.de/layers/1068",
        bbox: [12.0, 49.0, 12.2, 49.1]
      }
    ]);
  });
});

describe("buildShellCandidatesFromVnbdigital", () => {
  test("reuses published slugs before stale shell slugs when names match", () => {
    const candidates = buildShellCandidatesFromVnbdigital({
      vnbdigitalOperators: [
        {
          id: "7214",
          operatorName: "MIT.N Mittelhessen Netz GmbH",
          websiteUrl: "https://www.mitn.de/",
          postcode: "35398",
          city: "Gießen",
          address: "Lahnstraße 31",
          types: ["Strom"],
          publicRequired: true,
          layerUrl: "https://www.vnbdigital.de/layers/7214",
          bbox: [8.6, 50.5, 8.8, 50.7]
        }
      ],
      existingShells,
      publishedOperators
    });

    expect(candidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slug: "mittelhessen-netz",
          operatorName: "MIT.N Mittelhessen Netz GmbH",
          websiteUrl: "https://www.mitn.de/",
          shellStatus: "published",
          sourceStatus: "candidate",
          tariffStatus: "verified",
          reviewStatus: "verified"
        })
      ])
    );
  });

  test("reuses an existing shell slug when no published operator exists", () => {
    const candidates = buildShellCandidatesFromVnbdigital({
      vnbdigitalOperators: [
        {
          id: "1001",
          operatorName: "Rhein-Netz GmbH",
          websiteUrl: "https://www.rhein-netz.de/",
          postcode: "50823",
          city: "Köln",
          address: "Parkgürtel 24",
          types: ["Strom"],
          publicRequired: false,
          layerUrl: null,
          bbox: null
        }
      ],
      existingShells,
      publishedOperators: []
    });

    expect(candidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slug: "rhein-netz",
          operatorName: "Rhein-Netz GmbH",
          regionLabel: "Köln"
        })
      ])
    );
  });

  test("creates a deterministic slug and shell defaults for unmatched operators", () => {
    const candidates = buildShellCandidatesFromVnbdigital({
      vnbdigitalOperators: [
        {
          id: "ascanetz-1",
          operatorName: "ASCANETZ GmbH",
          websiteUrl: undefined,
          postcode: undefined,
          city: "Aschersleben",
          address: undefined,
          types: [],
          publicRequired: false,
          layerUrl: "https://www.vnbdigital.de/layers/ascanetz",
          bbox: [11.4, 51.7, 11.5, 51.8]
        }
      ],
      existingShells: [],
      publishedOperators: []
    });

    expect(candidates).toEqual([
      expect.objectContaining({
        slug: "ascanetz",
        operatorName: "ASCANETZ GmbH",
        regionLabel: "Aschersleben",
        websiteUrl: undefined,
        shellStatus: "profile-found",
        coverageStatus: "hinted",
        sourceStatus: "missing",
        tariffStatus: "missing",
        reviewStatus: "pending",
        notes: expect.stringContaining("VNBdigital ID ascanetz-1")
      })
    ]);
  });

  test("keeps existing shell entries that are not present in the VNBdigital batch", () => {
    const candidates = buildShellCandidatesFromVnbdigital({
      vnbdigitalOperators: [],
      existingShells: [
        {
          slug: "demo-netz",
          operatorName: "Demo Netz GmbH",
          websiteUrl: "https://demo.example/",
          regionLabel: "Demo",
          shellStatus: "shell",
          coverageStatus: "unknown",
          sourceStatus: "missing",
          tariffStatus: "missing",
          reviewStatus: "pending",
          deprecatedStatus: "active"
        }
      ],
      publishedOperators: []
    });

    expect(candidates).toEqual([
      expect.objectContaining({
        slug: "demo-netz",
        operatorName: "Demo Netz GmbH"
      })
    ]);
  });
});
