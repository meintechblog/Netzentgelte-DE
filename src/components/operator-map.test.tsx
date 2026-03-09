import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { OperatorMap } from "./operator-map";

describe("OperatorMap", () => {
  test("shows hovered operator name in overlay", () => {
    render(
      <OperatorMap
        features={[
          {
            id: "demo",
            operatorName: "Demo Netz",
            regionLabel: "Nord",
            currentValue: "12.34 ct/kWh",
            geometry: null,
            sourceUrl: "https://example.com/preise.pdf"
          }
        ]}
      />
    );

    expect(screen.getByText("Demo Netz")).toBeInTheDocument();
  });
});
