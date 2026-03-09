import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { projectGermanyMap, type OperatorMapFeature } from "../lib/maps/geojson";
import type { TariffTableRow } from "../lib/view-models/tariffs";
import { OperatorExplorer } from "./operator-explorer";

const rows: TariffTableRow[] = [
  {
    operatorName: "Stadtwerke Schwäbisch Hall",
    operatorSlug: "stadtwerke-schwaebisch-hall",
    regionLabel: "Schwäbisch Hall / Hohenlohe",
    currentBandsSummary: "NT 1.00 ct/kWh · ST 2.00 ct/kWh · HT 3.00 ct/kWh",
    validFrom: "2026-01-01",
    sourcePageUrl: "https://example.com/swh/netzentgelte",
    documentUrl: "https://example.com/swh/preisblatt-2026.pdf",
    sourceSlug: "stadtwerke-schwaebisch-hall-2026",
    checkedAt: "2026-03-09",
    reviewStatus: "pending",
    timeWindows: [],
    quarterMatrix: []
  },
  {
    operatorName: "Stromnetz Berlin",
    operatorSlug: "stromnetz-berlin",
    regionLabel: "Berlin",
    currentBandsSummary: "NT 4.00 ct/kWh · ST 5.00 ct/kWh · HT 6.00 ct/kWh",
    validFrom: "2026-01-01",
    sourcePageUrl: "https://example.com/berlin/netzentgelte",
    documentUrl: "https://example.com/berlin/preisblatt-2026.pdf",
    sourceSlug: "stromnetz-berlin-2026",
    checkedAt: "2026-03-09",
    reviewStatus: "verified",
    timeWindows: [],
    quarterMatrix: []
  }
];

const mapFeatures: OperatorMapFeature[] = [
  {
    id: "stadtwerke-schwaebisch-hall",
    operatorName: "Stadtwerke Schwäbisch Hall",
    regionLabel: "Schwäbisch Hall / Hohenlohe",
    mapRank: 1,
    coverageKind: "metro-zone",
    geometryPrecision: "approximate",
    geometrySourceLabel: "Testgeometrie",
    anchors: [{ longitude: 9.739, latitude: 49.112, radiusKm: 28 }],
    stateHints: ["08"],
    currentBandsSummary: "NT 1.00 ct/kWh · ST 2.00 ct/kWh · HT 3.00 ct/kWh",
    sourcePageUrl: "https://example.com/swh/netzentgelte",
    documentUrl: "https://example.com/swh/preisblatt-2026.pdf"
  },
  {
    id: "stromnetz-berlin",
    operatorName: "Stromnetz Berlin",
    regionLabel: "Berlin",
    mapRank: 2,
    coverageKind: "metro-zone",
    geometryPrecision: "approximate",
    geometrySourceLabel: "Testgeometrie",
    anchors: [{ longitude: 13.405, latitude: 52.52, radiusKm: 24 }],
    stateHints: ["11"],
    currentBandsSummary: "NT 4.00 ct/kWh · ST 5.00 ct/kWh · HT 6.00 ct/kWh",
    sourcePageUrl: "https://example.com/berlin/netzentgelte",
    documentUrl: "https://example.com/berlin/preisblatt-2026.pdf"
  }
];

describe("OperatorExplorer", () => {
  test("keeps the hero map detail panel in sync while dimming non-matching map regions", () => {
    const { container } = render(
      <OperatorExplorer rows={rows} mapScene={projectGermanyMap(mapFeatures)} />
    );

    fireEvent.change(screen.getByRole("searchbox", { name: "Suchbegriff" }), {
      target: { value: "berlin" }
    });

    expect(screen.getByLabelText("Deutschlandkarte der Netzbetreiber")).toBeInTheDocument();
    expect(screen.getAllByText("Stromnetz Berlin").length).toBeGreaterThan(0);
    expect(screen.queryByText("Stadtwerke Schwäbisch Hall")).not.toBeInTheDocument();
    expect(screen.getByText("1 Treffer")).toBeInTheDocument();
    expect(screen.getByText("Geometrie: approximate")).toBeInTheDocument();
    expect(container.querySelectorAll("[data-operator-region]").length).toBe(2);
    expect(container.querySelectorAll("[data-operator-region][data-filter-match='false']").length).toBe(1);
  });

  test("shows a dimmed map state when no operator matches the current query", () => {
    render(<OperatorExplorer rows={rows} mapScene={projectGermanyMap(mapFeatures)} />);

    fireEvent.change(screen.getByRole("searchbox", { name: "Suchbegriff" }), {
      target: { value: "hamburg" }
    });

    expect(screen.getByText("Kein Netzbetreiber passt zur aktuellen Suche.")).toBeInTheDocument();
    expect(screen.getByText("Keine belegte Netzfläche passt zur Suche")).toBeInTheDocument();
    expect(screen.getByText("0 Treffer")).toBeInTheDocument();
  });
});
