import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { OperatorMap } from "./operator-map";

describe("OperatorMap", () => {
  test("shows hovered operator provenance in overlay", () => {
    render(
      <OperatorMap
        features={[
          {
            id: "demo",
            operatorName: "Demo Netz",
            regionLabel: "Nord",
            currentBandsSummary: "NT 1.00 · ST 2.00 · HT 3.00",
            geometry: null,
            sourcePageUrl: "https://example.com/netzentgelte",
            documentUrl: "https://example.com/preise.pdf"
          }
        ]}
      />
    );

    expect(screen.getByText("Demo Netz")).toBeInTheDocument();
    expect(screen.getByText("NT 1.00 · ST 2.00 · HT 3.00")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Quellseite" })).toHaveAttribute(
      "href",
      "https://example.com/netzentgelte"
    );
  });

  test("renders a safe empty state without crashing", () => {
    render(<OperatorMap features={[]} />);

    expect(screen.getByText("Noch keine Netzgebiete geladen")).toBeInTheDocument();
  });

  test("keeps operator nodes positioned when the registry grows beyond ten regions", () => {
    render(
      <OperatorMap
        features={Array.from({ length: 13 }, (_, index) => ({
          id: `demo-${index + 1}`,
          operatorName: `Demo Netz ${index + 1}`,
          regionLabel: `Region ${index + 1}`,
          currentBandsSummary: "NT 1.00 · ST 2.00 · HT 3.00",
          geometry: null,
          sourcePageUrl: "https://example.com/netzentgelte",
          documentUrl: "https://example.com/preise.pdf"
        }))}
      />
    );

    const nodes = screen.getAllByRole("button");
    expect(nodes).toHaveLength(13);
    expect(nodes[12]).toHaveStyle({
      top: "82%",
      left: "58%"
    });
  });
});
