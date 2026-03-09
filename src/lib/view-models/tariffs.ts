export type TariffTableRow = {
  operatorName: string;
  operatorSlug: string;
  currentValue: string;
  validFrom: string;
  sourceUrl: string;
  reviewStatus: "pending" | "verified";
};

export function getDemoTariffRows(): TariffTableRow[] {
  return [
    {
      operatorName: "Demo Netz Nord",
      operatorSlug: "demo-nord",
      currentValue: "12.34 ct/kWh",
      validFrom: "2026-01-01",
      sourceUrl: "https://example.com/preise-nord.pdf",
      reviewStatus: "verified"
    },
    {
      operatorName: "Demo Netz West",
      operatorSlug: "demo-west",
      currentValue: "13.08 ct/kWh",
      validFrom: "2026-01-01",
      sourceUrl: "https://example.com/preise-west.pdf",
      reviewStatus: "pending"
    },
    {
      operatorName: "Demo Netz Sued",
      operatorSlug: "demo-sued",
      currentValue: "11.92 ct/kWh",
      validFrom: "2026-01-01",
      sourceUrl: "https://example.com/preise-sued.pdf",
      reviewStatus: "verified"
    }
  ];
}
