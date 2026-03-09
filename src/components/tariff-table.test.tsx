import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { TariffTable } from "./tariff-table";

describe("TariffTable", () => {
  test("renders grouped schedule headings when tariff windows span multiple seasons", () => {
    render(
      <TariffTable
        rows={[
          {
            operatorName: "Demo Netz",
            operatorSlug: "demo-netz",
            regionLabel: "Nord",
            currentBandsSummary: "Manuelle Prüfung offen",
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
              },
              {
                id: "demo-standard-summer",
                bandKey: "ST",
                label: "Standardtarif",
                seasonLabel: "Sommer 2026",
                dayLabel: "Alle Tage",
                timeRangeLabel: "00:00-10:00",
                sourceQuote: "Standardtarif 4,72 ct/kWh, 00:00-10:00"
              }
            ]
          }
        ]}
      />
    );

    expect(screen.getByText("Demo Netz")).toBeInTheDocument();
    expect(screen.getByText("Nord")).toBeInTheDocument();
    expect(screen.getByText("Manuelle Prüfung offen")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Quellseite" })).toHaveAttribute(
      "href",
      "https://example.com/netzentgelte"
    );
    expect(screen.getByText(/Zuletzt geprüft 2026-03-09/)).toBeInTheDocument();
    expect(screen.getByText(/Quelle demo-netz-example-com-preise-pdf/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Winter 2026" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sommer 2026" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Gültig ab" })).toBeInTheDocument();
    expect(screen.getByText("18:00-21:00")).toBeInTheDocument();
  });
});
