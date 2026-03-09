import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { TariffTable } from "./tariff-table";

describe("TariffTable", () => {
  test("renders operator rows with current tariff value", () => {
    render(
      <TariffTable
        rows={[
          {
            operatorName: "Demo Netz",
            operatorSlug: "demo-netz",
            currentValue: "12.34 ct/kWh",
            validFrom: "2026-01-01",
            sourceUrl: "https://example.com/preise.pdf",
            reviewStatus: "pending"
          }
        ]}
      />
    );

    expect(screen.getByText("Demo Netz")).toBeInTheDocument();
    expect(screen.getByText("12.34 ct/kWh")).toBeInTheDocument();
  });
});
