import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { OperatorMap } from "./operator-map";

describe("OperatorMap", () => {
  test("renders an SVG germany stage with operator regions and geometry precision", () => {
    const { container } = render(
      <OperatorMap
        features={[
          {
            id: "demo",
            operatorName: "Demo Netz",
            regionLabel: "Nord",
            mapLabel: "DN",
            mapRank: 1,
            coverageType: "state",
            geometryPrecision: "regional",
            geometrySourceLabel: "Testgeometrie",
            centroid: { x: 420, y: 160 },
            labelAnchor: { x: 420, y: 160 },
            currentBandsSummary: "NT 1.00 · ST 2.00 · HT 3.00",
            geometry: {
              kind: "svg-path",
              path: "M 420 120 L 470 120 L 470 180 L 420 180 Z"
            },
            sourcePageUrl: "https://example.com/netzentgelte",
            documentUrl: "https://example.com/preise.pdf"
          }
        ]}
      />
    );

    expect(screen.getByLabelText("Deutschlandkarte der Netzbetreiber")).toBeInTheDocument();
    expect(container.querySelectorAll("[data-operator-region]").length).toBe(1);
    expect(screen.getByText("Demo Netz")).toBeInTheDocument();
    expect(screen.getByText("NT 1.00 · ST 2.00 · HT 3.00")).toBeInTheDocument();
    expect(screen.getByText("DN")).toBeInTheDocument();
    expect(screen.getByText("Geometrie: regional")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Quellseite" })).toHaveAttribute(
      "href",
      "https://example.com/netzentgelte"
    );
  });

  test("renders a safe empty state without crashing", () => {
    render(<OperatorMap features={[]} />);

    expect(screen.getByText("Noch keine Netzgebiete geladen")).toBeInTheDocument();
    expect(screen.getByLabelText("Netzgebietsübersicht")).toBeInTheDocument();
  });

  test("resets to the safe empty state when filtered features disappear", () => {
    const { rerender } = render(
      <OperatorMap
        features={[
          {
            id: "demo",
            operatorName: "Demo Netz",
            regionLabel: "Nord",
            mapLabel: "DN",
            mapRank: 1,
            coverageType: "state",
            geometryPrecision: "regional",
            geometrySourceLabel: "Testgeometrie",
            centroid: { x: 420, y: 160 },
            labelAnchor: { x: 420, y: 160 },
            currentBandsSummary: "NT 1.00 · ST 2.00 · HT 3.00",
            geometry: {
              kind: "svg-path",
              path: "M 420 120 L 470 120 L 470 180 L 420 180 Z"
            },
            sourcePageUrl: "https://example.com/netzentgelte",
            documentUrl: "https://example.com/preise.pdf"
          }
        ]}
      />
    );

    rerender(<OperatorMap features={[]} />);

    expect(screen.getByText("Noch keine Netzgebiete geladen")).toBeInTheDocument();
    expect(screen.queryByText("Demo Netz")).not.toBeInTheDocument();
  });

  test("switches detail state when another region is activated", () => {
    const { container } = render(
      <OperatorMap
        features={[
          {
            id: "berlin",
            operatorName: "Stromnetz Berlin",
            regionLabel: "Berlin",
            mapLabel: "BER",
            mapRank: 1,
            coverageType: "metro",
            geometryPrecision: "approximate",
            geometrySourceLabel: "Testgeometrie",
            centroid: { x: 530, y: 156 },
            labelAnchor: { x: 530, y: 156 },
            currentBandsSummary: "NT 2.00 · ST 5.00 · HT 8.00",
            geometry: {
              kind: "svg-path",
              path: "M 520 140 L 548 140 L 548 168 L 520 168 Z"
            },
            sourcePageUrl: "https://example.com/berlin",
            documentUrl: "https://example.com/berlin.pdf"
          },
          {
            id: "mvv",
            operatorName: "MVV Netze",
            regionLabel: "Mannheim",
            mapLabel: "MVV",
            mapRank: 2,
            coverageType: "metro",
            geometryPrecision: "approximate",
            geometrySourceLabel: "Testgeometrie",
            centroid: { x: 360, y: 260 },
            labelAnchor: { x: 360, y: 260 },
            currentBandsSummary: "NT 3.00 · ST 6.00 · HT 9.00",
            geometry: {
              kind: "svg-path",
              path: "M 345 246 L 375 246 L 375 276 L 345 276 Z"
            },
            sourcePageUrl: "https://example.com/mvv",
            documentUrl: "https://example.com/mvv.pdf"
          }
        ]}
      />
    );

    const regions = container.querySelectorAll("[data-operator-region]");
    expect(regions).toHaveLength(2);

    fireEvent.mouseEnter(regions[1] as Element);

    expect(screen.getByText("MVV Netze")).toBeInTheDocument();
    expect(screen.getByText("MVV")).toBeInTheDocument();
    expect(screen.getByText("Geometrie: approximate")).toBeInTheDocument();
  });
});
