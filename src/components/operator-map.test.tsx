import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { projectGermanyMap, type OperatorMapFeature } from "../lib/maps/geojson";
import { OperatorMap } from "./operator-map";

describe("OperatorMap", () => {
  test("renders a projected germany stage with state boundaries and no visible map labels", () => {
    const { container } = render(
      <OperatorMap
        scene={projectGermanyMap([
          {
            id: "demo",
            operatorName: "Demo Netz",
            regionLabel: "Nord",
            mapRank: 1,
            coverageKind: "state-zone",
            geometryPrecision: "regional",
            geometrySourceLabel: "Testgeometrie",
            anchors: [{ longitude: 9.732, latitude: 52.375, radiusKm: 48 }],
            stateHints: ["03"],
            currentBandsSummary: "NT 1.00 · ST 2.00 · HT 3.00",
            sourcePageUrl: "https://example.com/netzentgelte",
            documentUrl: "https://example.com/preise.pdf"
          }
        ] satisfies OperatorMapFeature[])}
      />
    );

    expect(screen.getByLabelText("Deutschlandkarte der Netzbetreiber")).toBeInTheDocument();
    expect(container.querySelectorAll("[data-operator-region]").length).toBe(1);
    expect(container.querySelector("[data-country-base]")).not.toBeNull();
    expect(container.querySelectorAll("[data-state-boundary]").length).toBeGreaterThan(0);
    expect(screen.getByText("Demo Netz")).toBeInTheDocument();
    expect(screen.getByText("NT 1.00 · ST 2.00 · HT 3.00")).toBeInTheDocument();
    expect(screen.queryByText("DN")).not.toBeInTheDocument();
    expect(screen.getByText("Geometrie: regional")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Quellseite" })).toHaveAttribute(
      "href",
      "https://example.com/netzentgelte"
    );
  });

  test("renders a safe empty state without crashing", () => {
    render(<OperatorMap scene={projectGermanyMap([])} />);

    expect(screen.getByText("Noch keine Netzgebiete geladen")).toBeInTheDocument();
    expect(screen.getByLabelText("Netzgebietsübersicht")).toBeInTheDocument();
  });

  test("resets to the safe empty state when filtered features disappear", () => {
    const { rerender } = render(
      <OperatorMap
        scene={projectGermanyMap([
          {
            id: "demo",
            operatorName: "Demo Netz",
            regionLabel: "Nord",
            mapRank: 1,
            coverageKind: "state-zone",
            geometryPrecision: "regional",
            geometrySourceLabel: "Testgeometrie",
            anchors: [{ longitude: 9.732, latitude: 52.375, radiusKm: 48 }],
            stateHints: ["03"],
            currentBandsSummary: "NT 1.00 · ST 2.00 · HT 3.00",
            sourcePageUrl: "https://example.com/netzentgelte",
            documentUrl: "https://example.com/preise.pdf"
          }
        ] satisfies OperatorMapFeature[])}
      />
    );

    rerender(<OperatorMap scene={projectGermanyMap([])} />);

    expect(screen.getByText("Noch keine Netzgebiete geladen")).toBeInTheDocument();
    expect(screen.queryByText("Demo Netz")).not.toBeInTheDocument();
  });

  test("switches detail state when another projected region is activated", () => {
    const { container } = render(
      <OperatorMap
        scene={projectGermanyMap([
          {
            id: "berlin",
            operatorName: "Stromnetz Berlin",
            regionLabel: "Berlin",
            mapRank: 1,
            coverageKind: "metro-zone",
            geometryPrecision: "approximate",
            geometrySourceLabel: "Testgeometrie",
            anchors: [{ longitude: 13.405, latitude: 52.52, radiusKm: 24 }],
            stateHints: ["11"],
            currentBandsSummary: "NT 2.00 · ST 5.00 · HT 8.00",
            sourcePageUrl: "https://example.com/berlin",
            documentUrl: "https://example.com/berlin.pdf"
          },
          {
            id: "mvv",
            operatorName: "MVV Netze",
            regionLabel: "Mannheim",
            mapRank: 2,
            coverageKind: "metro-zone",
            geometryPrecision: "approximate",
            geometrySourceLabel: "Testgeometrie",
            anchors: [{ longitude: 8.467, latitude: 49.489, radiusKm: 26 }],
            stateHints: ["08"],
            currentBandsSummary: "NT 3.00 · ST 6.00 · HT 9.00",
            sourcePageUrl: "https://example.com/mvv",
            documentUrl: "https://example.com/mvv.pdf"
          }
        ] satisfies OperatorMapFeature[])}
      />
    );

    const regions = container.querySelectorAll("[data-operator-region]");
    expect(regions).toHaveLength(2);

    fireEvent.mouseEnter(regions[1] as Element);

    expect(screen.getByText("MVV Netze")).toBeInTheDocument();
    expect(screen.queryByText("MVV")).not.toBeInTheDocument();
    expect(screen.getByText("Geometrie: approximate")).toBeInTheDocument();
    expect(screen.getByText(/Bundesländer: Baden-Württemberg/)).toBeInTheDocument();
  });
});
