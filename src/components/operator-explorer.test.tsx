import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import type { OperatorMapFeature } from "../lib/maps/geojson";
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
    timeWindows: []
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
    timeWindows: []
  }
];

const mapFeatures: OperatorMapFeature[] = [
  {
    id: "stadtwerke-schwaebisch-hall",
    operatorName: "Stadtwerke Schwäbisch Hall",
    regionLabel: "Schwäbisch Hall / Hohenlohe",
    mapLabel: "SHA",
    mapRank: 1,
    coverageType: "metro",
    geometryPrecision: "approximate",
    geometrySourceLabel: "Testgeometrie",
    centroid: { x: 390, y: 250 },
    labelAnchor: { x: 390, y: 250 },
    currentBandsSummary: "NT 1.00 ct/kWh · ST 2.00 ct/kWh · HT 3.00 ct/kWh",
    sourcePageUrl: "https://example.com/swh/netzentgelte",
    documentUrl: "https://example.com/swh/preisblatt-2026.pdf",
    geometry: {
      kind: "svg-path",
      path: "M 370 230 L 410 230 L 410 270 L 370 270 Z"
    }
  },
  {
    id: "stromnetz-berlin",
    operatorName: "Stromnetz Berlin",
    regionLabel: "Berlin",
    mapLabel: "BER",
    mapRank: 2,
    coverageType: "metro",
    geometryPrecision: "approximate",
    geometrySourceLabel: "Testgeometrie",
    centroid: { x: 530, y: 156 },
    labelAnchor: { x: 530, y: 156 },
    currentBandsSummary: "NT 4.00 ct/kWh · ST 5.00 ct/kWh · HT 6.00 ct/kWh",
    sourcePageUrl: "https://example.com/berlin/netzentgelte",
    documentUrl: "https://example.com/berlin/preisblatt-2026.pdf",
    geometry: {
      kind: "svg-path",
      path: "M 520 140 L 548 140 L 548 168 L 520 168 Z"
    }
  }
];

describe("OperatorExplorer", () => {
  test("keeps the hero map detail panel and visible regions in sync while filtering", () => {
    const { container } = render(<OperatorExplorer rows={rows} mapFeatures={mapFeatures} />);

    fireEvent.change(screen.getByRole("searchbox", { name: "Suchbegriff" }), {
      target: { value: "berlin" }
    });

    expect(screen.getByLabelText("Deutschlandkarte der Netzbetreiber")).toBeInTheDocument();
    expect(screen.getAllByText("Stromnetz Berlin").length).toBeGreaterThan(0);
    expect(screen.queryByText("Stadtwerke Schwäbisch Hall")).not.toBeInTheDocument();
    expect(screen.getByText("1 Treffer")).toBeInTheDocument();
    expect(screen.getByText("BER")).toBeInTheDocument();
    expect(screen.getByText("Geometrie: approximate")).toBeInTheDocument();
    expect(container.querySelectorAll("[data-operator-region]").length).toBe(1);
    expect(screen.queryByText("SHA")).not.toBeInTheDocument();
  });

  test("shows a clear empty state when no operator matches the current query", () => {
    render(<OperatorExplorer rows={rows} mapFeatures={mapFeatures} />);

    fireEvent.change(screen.getByRole("searchbox", { name: "Suchbegriff" }), {
      target: { value: "hamburg" }
    });

    expect(screen.getByText("Kein Netzbetreiber passt zur aktuellen Suche.")).toBeInTheDocument();
    expect(screen.getByText("Noch keine Netzgebiete geladen")).toBeInTheDocument();
    expect(screen.getByText("0 Treffer")).toBeInTheDocument();
  });
});
