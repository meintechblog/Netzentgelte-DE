export type OperatorMapFeature = {
  id: string;
  operatorName: string;
  regionLabel: string;
  currentValue: string;
  sourceUrl: string;
  geometry: Record<string, unknown> | null;
};

export function getDemoMapFeatures(): OperatorMapFeature[] {
  return [
    {
      id: "demo-nord",
      operatorName: "Demo Netz Nord",
      regionLabel: "Nord",
      currentValue: "12.34 ct/kWh",
      sourceUrl: "https://example.com/preise-nord.pdf",
      geometry: null
    },
    {
      id: "demo-west",
      operatorName: "Demo Netz West",
      regionLabel: "West",
      currentValue: "13.08 ct/kWh",
      sourceUrl: "https://example.com/preise-west.pdf",
      geometry: null
    },
    {
      id: "demo-sued",
      operatorName: "Demo Netz Sued",
      regionLabel: "Sued",
      currentValue: "11.92 ct/kWh",
      sourceUrl: "https://example.com/preise-sued.pdf",
      geometry: null
    }
  ];
}
