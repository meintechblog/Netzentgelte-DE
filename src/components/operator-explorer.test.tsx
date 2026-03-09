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
    currentBandsSummary: "NT 1.00 ct/kWh · ST 2.00 ct/kWh · HT 3.00 ct/kWh",
    sourcePageUrl: "https://example.com/swh/netzentgelte",
    documentUrl: "https://example.com/swh/preisblatt-2026.pdf",
    geometry: null
  },
  {
    id: "stromnetz-berlin",
    operatorName: "Stromnetz Berlin",
    regionLabel: "Berlin",
    currentBandsSummary: "NT 4.00 ct/kWh · ST 5.00 ct/kWh · HT 6.00 ct/kWh",
    sourcePageUrl: "https://example.com/berlin/netzentgelte",
    documentUrl: "https://example.com/berlin/preisblatt-2026.pdf",
    geometry: null
  }
];

describe("OperatorExplorer", () => {
  test("filters operators live while typing and tolerates umlaut-free input", () => {
    render(<OperatorExplorer rows={rows} mapFeatures={mapFeatures} />);

    fireEvent.change(screen.getByRole("searchbox", { name: "Suchbegriff" }), {
      target: { value: "schwabisch" }
    });

    expect(screen.getAllByText("Stadtwerke Schwäbisch Hall").length).toBeGreaterThan(0);
    expect(screen.queryByText("Stromnetz Berlin")).not.toBeInTheDocument();
    expect(screen.getByText("1 Treffer")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Schwäbisch Hall \/ Hohenlohe/i })).toBeInTheDocument();
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
