import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { TariffTable } from "./tariff-table";

describe("TariffTable", () => {
  test("renders operator rows with source page and manual review fallback", () => {
    render(
      <TariffTable
        rows={[
          {
            operatorName: "Demo Netz",
            operatorSlug: "demo-netz",
            currentBandsSummary: "Manuelle Pruefung offen",
            validFrom: "2026-01-01",
            sourcePageUrl: "https://example.com/netzentgelte",
            documentUrl: "https://example.com/preise.pdf",
            sourceSlug: "demo-netz-example-com-preise-pdf",
            checkedAt: "2026-03-09",
            reviewStatus: "pending",
            timeWindows: [
              {
                id: "demo-high-evening",
                bandKey: "HT",
                label: "Hochtarif",
                seasonLabel: "Winter 2026",
                dayLabel: "Alle Tage",
                timeRangeLabel: "18:00-21:00",
                sourceQuote: "Hochtarif 11,77 ct/kWh, 18:00-21:00"
              }
            ]
          }
        ]}
      />
    );

    expect(screen.getByText("Demo Netz")).toBeInTheDocument();
    expect(screen.getByText("Manuelle Pruefung offen")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Quellseite" })).toHaveAttribute(
      "href",
      "https://example.com/netzentgelte"
    );
    expect(screen.getByText(/Zuletzt geprueft 2026-03-09/)).toBeInTheDocument();
    expect(screen.getByText(/Quelle demo-netz-example-com-preise-pdf/)).toBeInTheDocument();
    expect(screen.getByText("Winter 2026")).toBeInTheDocument();
    expect(screen.getByText("18:00-21:00")).toBeInTheDocument();
  });
});
