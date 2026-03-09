export type EndcustomerTariffComponentKey =
  | "base_price_eur_per_year"
  | "work_price_ct_per_kwh"
  | "net_fee_reduction_eur_per_year"
  | "standard_work_price_ct_per_kwh"
  | "high_work_price_ct_per_kwh"
  | "low_work_price_ct_per_kwh"
  | "single_register_meter_eur_per_year"
  | "dual_register_meter_eur_per_year";

export type EndcustomerRequirementKey =
  | "default_if_no_choice"
  | "zero_floor_applies"
  | "separate_meter_required"
  | "separate_market_location_required"
  | "intelligent_meter_required"
  | "must_be_combined_with_module_1";

export type EndcustomerTariffComponent = {
  componentKey: EndcustomerTariffComponentKey;
  valueNumeric: string;
  unit: "EUR/a" | "ct/kWh";
  sourceQuote?: string;
};

export type EndcustomerTariffRequirement = {
  requirementKey: EndcustomerRequirementKey;
  requirementValue: string;
  sourceQuote?: string;
};

export type EndcustomerTariffTimeWindow = {
  quarterKey: "Q1" | "Q2" | "Q3" | "Q4";
  bandKey: "standard" | "high" | "low";
  startsAt: string;
  endsAt: string;
  sourceQuote?: string;
};

export type EndcustomerTariffProductReference = {
  moduleKey: "modul-1" | "modul-2" | "modul-3";
  networkLevel: "niederspannung";
  meteringMode: "slp";
  validFrom: string;
  sourceDocumentUrl: string;
  components: EndcustomerTariffComponent[];
  requirements: EndcustomerTariffRequirement[];
  timeWindows: EndcustomerTariffTimeWindow[];
};

export type EndcustomerOperatorReference = {
  operatorSlug: string;
  sourceDocumentUrl: string;
  products: EndcustomerTariffProductReference[];
  meteringPrices: EndcustomerTariffComponent[];
};

const STADTWERKE_SCHWAEBISCH_HALL_SOURCE =
  "https://stadtwerke-hall.de/fileadmin/files/Downloads/Netzdaten_Strom/4_Netzentgelte/4NNE_STW-SHA_ab_01.01.2026.pdf";

export function getStadtwerkeSchwaebischHallEndcustomerReference(): EndcustomerOperatorReference {
  return {
    operatorSlug: "stadtwerke-schwaebisch-hall",
    sourceDocumentUrl: STADTWERKE_SCHWAEBISCH_HALL_SOURCE,
    products: [
      {
        moduleKey: "modul-1",
        networkLevel: "niederspannung",
        meteringMode: "slp",
        validFrom: "2026-01-01",
        sourceDocumentUrl: STADTWERKE_SCHWAEBISCH_HALL_SOURCE,
        components: [
          { componentKey: "base_price_eur_per_year", valueNumeric: "61.00", unit: "EUR/a" },
          { componentKey: "work_price_ct_per_kwh", valueNumeric: "5.53", unit: "ct/kWh" },
          {
            componentKey: "net_fee_reduction_eur_per_year",
            valueNumeric: "108.70",
            unit: "EUR/a"
          }
        ],
        requirements: [
          { requirementKey: "default_if_no_choice", requirementValue: "true" },
          { requirementKey: "zero_floor_applies", requirementValue: "true" }
        ],
        timeWindows: []
      },
      {
        moduleKey: "modul-2",
        networkLevel: "niederspannung",
        meteringMode: "slp",
        validFrom: "2026-01-01",
        sourceDocumentUrl: STADTWERKE_SCHWAEBISCH_HALL_SOURCE,
        components: [
          { componentKey: "base_price_eur_per_year", valueNumeric: "0.00", unit: "EUR/a" },
          { componentKey: "work_price_ct_per_kwh", valueNumeric: "2.21", unit: "ct/kWh" }
        ],
        requirements: [
          { requirementKey: "separate_meter_required", requirementValue: "true" },
          { requirementKey: "separate_market_location_required", requirementValue: "true" }
        ],
        timeWindows: []
      },
      {
        moduleKey: "modul-3",
        networkLevel: "niederspannung",
        meteringMode: "slp",
        validFrom: "2026-01-01",
        sourceDocumentUrl: STADTWERKE_SCHWAEBISCH_HALL_SOURCE,
        components: [
          { componentKey: "standard_work_price_ct_per_kwh", valueNumeric: "5.53", unit: "ct/kWh" },
          { componentKey: "high_work_price_ct_per_kwh", valueNumeric: "8.14", unit: "ct/kWh" },
          { componentKey: "low_work_price_ct_per_kwh", valueNumeric: "1.11", unit: "ct/kWh" }
        ],
        requirements: [
          { requirementKey: "intelligent_meter_required", requirementValue: "true" },
          { requirementKey: "must_be_combined_with_module_1", requirementValue: "true" }
        ],
        timeWindows: [
          ...buildQuarterWindows("Q1"),
          ...buildQuarterWindows("Q2"),
          {
            quarterKey: "Q3",
            bandKey: "standard",
            startsAt: "00:00",
            endsAt: "24:00"
          },
          ...buildQuarterWindows("Q4")
        ]
      }
    ],
    meteringPrices: [
      {
        componentKey: "single_register_meter_eur_per_year",
        valueNumeric: "9.50",
        unit: "EUR/a"
      },
      {
        componentKey: "dual_register_meter_eur_per_year",
        valueNumeric: "14.75",
        unit: "EUR/a"
      }
    ]
  };
}

function buildQuarterWindows(quarterKey: "Q1" | "Q2" | "Q4"): EndcustomerTariffTimeWindow[] {
  return [
    { quarterKey, bandKey: "low", startsAt: "00:00", endsAt: "07:00" },
    { quarterKey, bandKey: "standard", startsAt: "07:00", endsAt: "10:00" },
    { quarterKey, bandKey: "high", startsAt: "10:00", endsAt: "14:00" },
    { quarterKey, bandKey: "standard", startsAt: "14:00", endsAt: "18:00" },
    { quarterKey, bandKey: "high", startsAt: "18:00", endsAt: "20:00" },
    { quarterKey, bandKey: "standard", startsAt: "20:00", endsAt: "22:00" },
    { quarterKey, bandKey: "low", startsAt: "22:00", endsAt: "24:00" }
  ];
}
