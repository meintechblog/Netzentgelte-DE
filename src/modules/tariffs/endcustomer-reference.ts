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
  operatorName: string;
  sourceDocumentUrl: string;
  products: EndcustomerTariffProductReference[];
  meteringPrices: EndcustomerTariffComponent[];
};

const VALID_FROM_2026 = "2026-01-01";

const STADTWERKE_SCHWAEBISCH_HALL_SOURCE =
  "https://stadtwerke-hall.de/fileadmin/files/Downloads/Netzdaten_Strom/4_Netzentgelte/4NNE_STW-SHA_ab_01.01.2026.pdf";
const NETZE_BW_SOURCE =
  "https://assets.ctfassets.net/xytfb1vrn7of/7eQvxehZzn3ECbR9rALmyD/ecc795b9dcd666ce1f53d9d04362a321/netzentgelte-strom-netze-bw-gmbh-2026.pdf";
const STROMNETZ_BERLIN_SOURCE =
  "https://www.stromnetz.berlin/files/globalassets/dokumente/entgelte/zugang/entgelte-01-01-2026/nne-b-2026_20251218.pdf";
const NETZE_ODR_SOURCE =
  "https://www.netze-odr.de/fileadmin/Netze-ODR/Dokumente/Unternehmen/Veroeffentlichungen/Netzentgelte/Netzentgelte_Strom_2026.pdf";
const MITNETZ_STROM_SOURCE =
  "https://www.mitnetz-strom.de/Media/docs/default-source/datei-ablage/2026_mns_pb_endg%C3%BCltig_12-12-2025.pdf?sfvrsn=2aee4cf8_3";
const ALLGAEUNETZ_SOURCE =
  "https://www.allgaeunetz.com/download/2025_12_22_preisblatt_nne_2026_endg.pdf";
const MAINZER_NETZE_SOURCE =
  "https://www.mainzer-netze.de/-/media/project/mainzer-stadtwerke/websites-mainzer-netze/mainzer-netze/dateien/ordnerstruktur-clean/g_s_w_preise-netzentgelte/strom/s_preisblatt_2026.pdf?rev=0b246c97be4b493188d844c94c08eb1f";
const ENERCITY_NETZ_SOURCE =
  "https://www.enercity-netz.de/assets/cms/eng/marktpartner/pdfs/netzentgelte-strom/preisblatt-netznutzung-strom-2026-jahr.pdf";
const TWS_NETZ_SOURCE =
  "https://www.tws-netz.de/de/Unsere-Netze/Netze-neu/Stromnetz/Netzzugang-Entgelte/5-132-TWS-Netz-Preisblatt-2026-final.pdf";
const WESERNETZ_BREMEN_SOURCE =
  "https://www.wesernetz.de/-/media/wesernetz/downloads-aktuell/fuer-partner/energielieferanten/stromnetz/stromentgelte/hb/nenu_hb_108_007_preisblatt_5_strom_paragraph_14a_enwg_web.pdf";
const WESERNETZ_BREMERHAVEN_SOURCE =
  "https://www.wesernetz.de/-/media/wesernetz/downloads-aktuell/fuer-partner/energielieferanten/stromnetz/stromentgelte/bhv/nenu_bhv_108_007_preisblatt_5_strom_paragraph_14a_enwg_2026_web.pdf";

export function getSeedEndcustomerReferences(): EndcustomerOperatorReference[] {
  return [
    getStadtwerkeSchwaebischHallEndcustomerReference(),
    getNetzeBwEndcustomerReference(),
    getStromnetzBerlinEndcustomerReference(),
    getNetzeOdrEndcustomerReference(),
    getMitnetzStromEndcustomerReference(),
    getAllgaeuNetzEndcustomerReference(),
    getMainzerNetzeEndcustomerReference(),
    getEnercityNetzEndcustomerReference(),
    getTwsNetzEndcustomerReference(),
    getWesernetzBremenEndcustomerReference(),
    getWesernetzBremerhavenEndcustomerReference()
  ];
}

export function getStadtwerkeSchwaebischHallEndcustomerReference(): EndcustomerOperatorReference {
  return {
    operatorSlug: "stadtwerke-schwaebisch-hall",
    operatorName: "Stadtwerke Schwäbisch Hall GmbH",
    sourceDocumentUrl: STADTWERKE_SCHWAEBISCH_HALL_SOURCE,
    products: [
      {
        moduleKey: "modul-1",
        networkLevel: "niederspannung",
        meteringMode: "slp",
        validFrom: VALID_FROM_2026,
        sourceDocumentUrl: STADTWERKE_SCHWAEBISCH_HALL_SOURCE,
        components: [
          { componentKey: "base_price_eur_per_year", valueNumeric: "61.00", unit: "EUR/a" },
          { componentKey: "work_price_ct_per_kwh", valueNumeric: "5.53", unit: "ct/kWh" },
          { componentKey: "net_fee_reduction_eur_per_year", valueNumeric: "108.70", unit: "EUR/a" }
        ],
        requirements: defaultModul1Requirements(),
        timeWindows: []
      },
      {
        moduleKey: "modul-2",
        networkLevel: "niederspannung",
        meteringMode: "slp",
        validFrom: VALID_FROM_2026,
        sourceDocumentUrl: STADTWERKE_SCHWAEBISCH_HALL_SOURCE,
        components: [
          { componentKey: "base_price_eur_per_year", valueNumeric: "0.00", unit: "EUR/a" },
          { componentKey: "work_price_ct_per_kwh", valueNumeric: "2.21", unit: "ct/kWh" }
        ],
        requirements: defaultModul2Requirements(),
        timeWindows: []
      },
      {
        moduleKey: "modul-3",
        networkLevel: "niederspannung",
        meteringMode: "slp",
        validFrom: VALID_FROM_2026,
        sourceDocumentUrl: STADTWERKE_SCHWAEBISCH_HALL_SOURCE,
        components: modul3Components("5.53", "8.14", "1.11"),
        requirements: defaultModul3Requirements(),
        timeWindows: [
          ...buildHallQuarterWindows("Q1"),
          ...buildHallQuarterWindows("Q2"),
          { quarterKey: "Q3", bandKey: "standard", startsAt: "00:00", endsAt: "24:00" },
          ...buildHallQuarterWindows("Q4")
        ]
      }
    ],
    meteringPrices: meteringPrices("9.50", "14.75")
  };
}

export function getNetzeBwEndcustomerReference(): EndcustomerOperatorReference {
  return {
    operatorSlug: "netze-bw",
    operatorName: "Netze BW GmbH",
    sourceDocumentUrl: NETZE_BW_SOURCE,
    products: [
      {
        moduleKey: "modul-1",
        networkLevel: "niederspannung",
        meteringMode: "slp",
        validFrom: VALID_FROM_2026,
        sourceDocumentUrl: NETZE_BW_SOURCE,
        components: [
          { componentKey: "base_price_eur_per_year", valueNumeric: "84.00", unit: "EUR/a" },
          { componentKey: "work_price_ct_per_kwh", valueNumeric: "7.57", unit: "ct/kWh" },
          { componentKey: "net_fee_reduction_eur_per_year", valueNumeric: "124.00", unit: "EUR/a" }
        ],
        requirements: defaultModul1Requirements(),
        timeWindows: []
      },
      {
        moduleKey: "modul-2",
        networkLevel: "niederspannung",
        meteringMode: "slp",
        validFrom: VALID_FROM_2026,
        sourceDocumentUrl: NETZE_BW_SOURCE,
        components: [
          { componentKey: "base_price_eur_per_year", valueNumeric: "0.00", unit: "EUR/a" },
          { componentKey: "work_price_ct_per_kwh", valueNumeric: "3.03", unit: "ct/kWh" }
        ],
        requirements: defaultModul2Requirements(),
        timeWindows: []
      },
      {
        moduleKey: "modul-3",
        networkLevel: "niederspannung",
        meteringMode: "slp",
        validFrom: VALID_FROM_2026,
        sourceDocumentUrl: NETZE_BW_SOURCE,
        components: modul3Components("7.57", "11.06", "3.03"),
        requirements: defaultModul3Requirements(),
        timeWindows: buildFullYearWindows([
          ["standard", ["00:00-10:00", "14:00-17:00", "22:00-24:00"]],
          ["high", ["17:00-22:00"]],
          ["low", ["10:00-14:00"]]
        ])
      }
    ],
    meteringPrices: meteringPrices("10.67", "21.10")
  };
}

export function getStromnetzBerlinEndcustomerReference(): EndcustomerOperatorReference {
  return {
    operatorSlug: "stromnetz-berlin",
    operatorName: "Stromnetz Berlin GmbH",
    sourceDocumentUrl: STROMNETZ_BERLIN_SOURCE,
    products: [
      {
        moduleKey: "modul-1",
        networkLevel: "niederspannung",
        meteringMode: "slp",
        validFrom: VALID_FROM_2026,
        sourceDocumentUrl: STROMNETZ_BERLIN_SOURCE,
        components: [
          { componentKey: "base_price_eur_per_year", valueNumeric: "33.36", unit: "EUR/a" },
          { componentKey: "work_price_ct_per_kwh", valueNumeric: "7.46", unit: "ct/kWh" },
          { componentKey: "net_fee_reduction_eur_per_year", valueNumeric: "123.18", unit: "EUR/a" }
        ],
        requirements: defaultModul1Requirements(),
        timeWindows: []
      },
      {
        moduleKey: "modul-2",
        networkLevel: "niederspannung",
        meteringMode: "slp",
        validFrom: VALID_FROM_2026,
        sourceDocumentUrl: STROMNETZ_BERLIN_SOURCE,
        components: [
          { componentKey: "base_price_eur_per_year", valueNumeric: "0.00", unit: "EUR/a" },
          { componentKey: "work_price_ct_per_kwh", valueNumeric: "2.98", unit: "ct/kWh" }
        ],
        requirements: defaultModul2Requirements(),
        timeWindows: []
      },
      {
        moduleKey: "modul-3",
        networkLevel: "niederspannung",
        meteringMode: "slp",
        validFrom: VALID_FROM_2026,
        sourceDocumentUrl: STROMNETZ_BERLIN_SOURCE,
        components: modul3Components("7.46", "13.94", "2.61"),
        requirements: defaultModul3Requirements(),
        timeWindows: buildFullYearWindows([
          ["standard", ["06:30-17:15", "20:15-22:15"]],
          ["high", ["17:15-20:15"]],
          ["low", ["00:00-06:30", "22:15-24:00"]]
        ])
      }
    ],
    meteringPrices: meteringPrices("9.95", "19.08")
  };
}

export function getNetzeOdrEndcustomerReference(): EndcustomerOperatorReference {
  return {
    operatorSlug: "netze-odr",
    operatorName: "Netze ODR GmbH",
    sourceDocumentUrl: NETZE_ODR_SOURCE,
    products: [
      {
        moduleKey: "modul-1",
        networkLevel: "niederspannung",
        meteringMode: "slp",
        validFrom: VALID_FROM_2026,
        sourceDocumentUrl: NETZE_ODR_SOURCE,
        components: [
          { componentKey: "base_price_eur_per_year", valueNumeric: "65.70", unit: "EUR/a" },
          { componentKey: "work_price_ct_per_kwh", valueNumeric: "5.87", unit: "ct/kWh" },
          { componentKey: "net_fee_reduction_eur_per_year", valueNumeric: "111.25", unit: "EUR/a" }
        ],
        requirements: defaultModul1Requirements(),
        timeWindows: []
      },
      {
        moduleKey: "modul-2",
        networkLevel: "niederspannung",
        meteringMode: "slp",
        validFrom: VALID_FROM_2026,
        sourceDocumentUrl: NETZE_ODR_SOURCE,
        components: [
          { componentKey: "base_price_eur_per_year", valueNumeric: "0.00", unit: "EUR/a" },
          { componentKey: "work_price_ct_per_kwh", valueNumeric: "2.35", unit: "ct/kWh" }
        ],
        requirements: defaultModul2Requirements(),
        timeWindows: []
      },
      {
        moduleKey: "modul-3",
        networkLevel: "niederspannung",
        meteringMode: "slp",
        validFrom: VALID_FROM_2026,
        sourceDocumentUrl: NETZE_ODR_SOURCE,
        components: modul3Components("5.87", "10.18", "2.35"),
        requirements: defaultModul3Requirements(),
        timeWindows: [
          ...buildQuarterRanges("Q1", "standard", ["00:00-24:00"]),
          ...buildQuarterRanges("Q4", "standard", ["00:00-24:00"]),
          ...buildQuarterRanges("Q2", "low", ["11:00-17:00"]),
          ...buildQuarterRanges("Q2", "standard", ["00:00-05:00", "05:00-11:00", "17:00-22:00"]),
          ...buildQuarterRanges("Q2", "high", ["22:00-24:00"]),
          ...buildQuarterRanges("Q3", "low", ["11:00-17:00"]),
          ...buildQuarterRanges("Q3", "standard", ["00:00-05:00", "05:00-11:00", "17:00-22:00"]),
          ...buildQuarterRanges("Q3", "high", ["22:00-24:00"])
        ]
      }
    ],
    meteringPrices: meteringPrices("10.68", "18.12")
  };
}

export function getMitnetzStromEndcustomerReference(): EndcustomerOperatorReference {
  return {
    operatorSlug: "mitnetz-strom",
    operatorName: "Mitteldeutsche Netzgesellschaft Strom mbH",
    sourceDocumentUrl: MITNETZ_STROM_SOURCE,
    products: [
      {
        moduleKey: "modul-1",
        networkLevel: "niederspannung",
        meteringMode: "slp",
        validFrom: VALID_FROM_2026,
        sourceDocumentUrl: MITNETZ_STROM_SOURCE,
        components: [
          { componentKey: "base_price_eur_per_year", valueNumeric: "73.00", unit: "EUR/a" },
          { componentKey: "work_price_ct_per_kwh", valueNumeric: "6.31", unit: "ct/kWh" },
          { componentKey: "net_fee_reduction_eur_per_year", valueNumeric: "114.55", unit: "EUR/a" }
        ],
        requirements: defaultModul1Requirements(),
        timeWindows: []
      },
      {
        moduleKey: "modul-2",
        networkLevel: "niederspannung",
        meteringMode: "slp",
        validFrom: VALID_FROM_2026,
        sourceDocumentUrl: MITNETZ_STROM_SOURCE,
        components: [
          { componentKey: "base_price_eur_per_year", valueNumeric: "0.00", unit: "EUR/a" },
          { componentKey: "work_price_ct_per_kwh", valueNumeric: "2.52", unit: "ct/kWh" }
        ],
        requirements: defaultModul2Requirements(),
        timeWindows: []
      },
      {
        moduleKey: "modul-3",
        networkLevel: "niederspannung",
        meteringMode: "slp",
        validFrom: VALID_FROM_2026,
        sourceDocumentUrl: MITNETZ_STROM_SOURCE,
        components: modul3Components("6.31", "12.62", "0.69"),
        requirements: defaultModul3Requirements(),
        timeWindows: [
          ...buildQuarterRanges("Q1", "standard", ["03:00-08:00", "12:00-17:00"]),
          ...buildQuarterRanges("Q1", "high", ["08:00-12:00", "17:00-19:00"]),
          ...buildQuarterRanges("Q1", "low", ["00:00-03:00", "19:00-24:00"]),
          ...buildQuarterRanges("Q2", "standard", ["00:00-24:00"]),
          ...buildQuarterRanges("Q3", "standard", ["00:00-24:00"]),
          ...buildQuarterRanges("Q4", "standard", ["03:00-08:00", "12:00-17:00"]),
          ...buildQuarterRanges("Q4", "high", ["08:00-12:00", "17:00-19:00"]),
          ...buildQuarterRanges("Q4", "low", ["00:00-03:00", "19:00-24:00"])
        ]
      }
    ],
    meteringPrices: meteringPrices("7.84", "7.84")
  };
}

export function getAllgaeuNetzEndcustomerReference(): EndcustomerOperatorReference {
  return {
    operatorSlug: "allgaeunetz",
    operatorName: "AllgäuNetz GmbH & Co. KG",
    sourceDocumentUrl: ALLGAEUNETZ_SOURCE,
    products: [
      {
        moduleKey: "modul-1",
        networkLevel: "niederspannung",
        meteringMode: "slp",
        validFrom: VALID_FROM_2026,
        sourceDocumentUrl: ALLGAEUNETZ_SOURCE,
        components: [
          { componentKey: "base_price_eur_per_year", valueNumeric: "96.00", unit: "EUR/a" },
          { componentKey: "work_price_ct_per_kwh", valueNumeric: "8.63", unit: "ct/kWh" },
          { componentKey: "net_fee_reduction_eur_per_year", valueNumeric: "131.95", unit: "EUR/a" }
        ],
        requirements: defaultModul1Requirements(),
        timeWindows: []
      },
      {
        moduleKey: "modul-2",
        networkLevel: "niederspannung",
        meteringMode: "slp",
        validFrom: VALID_FROM_2026,
        sourceDocumentUrl: ALLGAEUNETZ_SOURCE,
        components: [
          { componentKey: "base_price_eur_per_year", valueNumeric: "0.00", unit: "EUR/a" },
          { componentKey: "work_price_ct_per_kwh", valueNumeric: "3.45", unit: "ct/kWh" }
        ],
        requirements: defaultModul2Requirements(),
        timeWindows: []
      },
      {
        moduleKey: "modul-3",
        networkLevel: "niederspannung",
        meteringMode: "slp",
        validFrom: VALID_FROM_2026,
        sourceDocumentUrl: ALLGAEUNETZ_SOURCE,
        components: modul3Components("8.63", "13.84", "3.45"),
        requirements: defaultModul3Requirements(),
        timeWindows: [
          ...buildQuarterRanges("Q1", "standard", ["00:00-02:00", "04:00-17:30", "19:30-24:00"]),
          ...buildQuarterRanges("Q1", "low", ["02:00-04:00"]),
          ...buildQuarterRanges("Q1", "high", ["17:30-19:30"]),
          ...buildQuarterRanges("Q2", "standard", ["00:00-24:00"]),
          ...buildQuarterRanges("Q3", "standard", ["00:00-24:00"]),
          ...buildQuarterRanges("Q4", "standard", ["00:00-02:00", "04:00-17:30", "19:30-24:00"]),
          ...buildQuarterRanges("Q4", "low", ["02:00-04:00"]),
          ...buildQuarterRanges("Q4", "high", ["17:30-19:30"])
        ]
      }
    ],
    meteringPrices: meteringPrices("10.75", "20.30")
  };
}

export function getMainzerNetzeEndcustomerReference(): EndcustomerOperatorReference {
  return {
    operatorSlug: "mainzer-netze",
    operatorName: "Mainzer Netze GmbH",
    sourceDocumentUrl: MAINZER_NETZE_SOURCE,
    products: [
      {
        moduleKey: "modul-1",
        networkLevel: "niederspannung",
        meteringMode: "slp",
        validFrom: VALID_FROM_2026,
        sourceDocumentUrl: MAINZER_NETZE_SOURCE,
        components: [
          { componentKey: "base_price_eur_per_year", valueNumeric: "75.00", unit: "EUR/a" },
          { componentKey: "work_price_ct_per_kwh", valueNumeric: "6.72", unit: "ct/kWh" },
          { componentKey: "net_fee_reduction_eur_per_year", valueNumeric: "117.63", unit: "EUR/a" }
        ],
        requirements: defaultModul1Requirements(),
        timeWindows: []
      },
      {
        moduleKey: "modul-2",
        networkLevel: "niederspannung",
        meteringMode: "slp",
        validFrom: VALID_FROM_2026,
        sourceDocumentUrl: MAINZER_NETZE_SOURCE,
        components: [
          { componentKey: "base_price_eur_per_year", valueNumeric: "0.00", unit: "EUR/a" },
          { componentKey: "work_price_ct_per_kwh", valueNumeric: "2.69", unit: "ct/kWh" }
        ],
        requirements: defaultModul2Requirements(),
        timeWindows: []
      },
      {
        moduleKey: "modul-3",
        networkLevel: "niederspannung",
        meteringMode: "slp",
        validFrom: VALID_FROM_2026,
        sourceDocumentUrl: MAINZER_NETZE_SOURCE,
        components: modul3Components("6.72", "7.86", "1.01"),
        requirements: defaultModul3Requirements(),
        timeWindows: [
          ...buildQuarterRanges("Q1", "standard", ["06:00-16:45", "20:00-22:00"]),
          ...buildQuarterRanges("Q1", "high", ["16:45-20:00"]),
          ...buildQuarterRanges("Q1", "low", ["22:00-06:00"]),
          ...buildQuarterRanges("Q2", "standard", ["00:00-24:00"]),
          ...buildQuarterRanges("Q3", "standard", ["00:00-24:00"]),
          ...buildQuarterRanges("Q4", "standard", ["06:00-16:45", "20:00-22:00"]),
          ...buildQuarterRanges("Q4", "high", ["16:45-20:00"]),
          ...buildQuarterRanges("Q4", "low", ["22:00-06:00"])
        ]
      }
    ],
    meteringPrices: meteringPrices("15.90", "19.90")
  };
}

export function getEnercityNetzEndcustomerReference(): EndcustomerOperatorReference {
  return {
    operatorSlug: "enercity-netz",
    operatorName: "enercity Netz GmbH",
    sourceDocumentUrl: ENERCITY_NETZ_SOURCE,
    products: [
      {
        moduleKey: "modul-1",
        networkLevel: "niederspannung",
        meteringMode: "slp",
        validFrom: VALID_FROM_2026,
        sourceDocumentUrl: ENERCITY_NETZ_SOURCE,
        components: [
          { componentKey: "base_price_eur_per_year", valueNumeric: "53.00", unit: "EUR/a" },
          { componentKey: "work_price_ct_per_kwh", valueNumeric: "8.54", unit: "ct/kWh" },
          { componentKey: "net_fee_reduction_eur_per_year", valueNumeric: "131.28", unit: "EUR/a" }
        ],
        requirements: defaultModul1Requirements(),
        timeWindows: []
      },
      {
        moduleKey: "modul-2",
        networkLevel: "niederspannung",
        meteringMode: "slp",
        validFrom: VALID_FROM_2026,
        sourceDocumentUrl: ENERCITY_NETZ_SOURCE,
        components: [
          { componentKey: "base_price_eur_per_year", valueNumeric: "0.00", unit: "EUR/a" },
          { componentKey: "work_price_ct_per_kwh", valueNumeric: "3.42", unit: "ct/kWh" }
        ],
        requirements: defaultModul2Requirements(),
        timeWindows: []
      },
      {
        moduleKey: "modul-3",
        networkLevel: "niederspannung",
        meteringMode: "slp",
        validFrom: VALID_FROM_2026,
        sourceDocumentUrl: ENERCITY_NETZ_SOURCE,
        components: modul3Components("8.54", "13.35", "0.86"),
        requirements: defaultModul3Requirements(),
        timeWindows: buildFullYearWindows([
          ["low", ["00:00-06:00"]],
          ["standard", ["06:00-16:30", "20:15-24:00"]],
          ["high", ["16:30-20:15"]]
        ])
      }
    ],
    meteringPrices: meteringPrices("12.34", "25.33")
  };
}

export function getTwsNetzEndcustomerReference(): EndcustomerOperatorReference {
  return {
    operatorSlug: "tws-netz",
    operatorName: "TWS Netz GmbH",
    sourceDocumentUrl: TWS_NETZ_SOURCE,
    products: [
      {
        moduleKey: "modul-1",
        networkLevel: "niederspannung",
        meteringMode: "slp",
        validFrom: VALID_FROM_2026,
        sourceDocumentUrl: TWS_NETZ_SOURCE,
        components: [
          { componentKey: "base_price_eur_per_year", valueNumeric: "74.00", unit: "EUR/a" },
          { componentKey: "work_price_ct_per_kwh", valueNumeric: "9.74", unit: "ct/kWh" },
          { componentKey: "net_fee_reduction_eur_per_year", valueNumeric: "140.28", unit: "EUR/a" }
        ],
        requirements: defaultModul1Requirements(),
        timeWindows: []
      },
      {
        moduleKey: "modul-2",
        networkLevel: "niederspannung",
        meteringMode: "slp",
        validFrom: VALID_FROM_2026,
        sourceDocumentUrl: TWS_NETZ_SOURCE,
        components: [
          { componentKey: "base_price_eur_per_year", valueNumeric: "0.00", unit: "EUR/a" },
          { componentKey: "work_price_ct_per_kwh", valueNumeric: "3.90", unit: "ct/kWh" }
        ],
        requirements: defaultModul2Requirements(),
        timeWindows: []
      },
      {
        moduleKey: "modul-3",
        networkLevel: "niederspannung",
        meteringMode: "slp",
        validFrom: VALID_FROM_2026,
        sourceDocumentUrl: TWS_NETZ_SOURCE,
        components: modul3Components("9.74", "12.26", "3.21"),
        requirements: defaultModul3Requirements(),
        timeWindows: buildFullYearWindows([
          ["low", ["00:00-06:00"]],
          ["standard", ["06:00-17:00", "22:00-24:00"]],
          ["high", ["17:00-22:00"]]
        ])
      }
    ],
    meteringPrices: meteringPrices("13.70", "21.32")
  };
}

export function getWesernetzBremenEndcustomerReference(): EndcustomerOperatorReference {
  return {
    operatorSlug: "wesernetz-bremen",
    operatorName: "wesernetz Bremen GmbH",
    sourceDocumentUrl: WESERNETZ_BREMEN_SOURCE,
    products: [
      {
        moduleKey: "modul-1",
        networkLevel: "niederspannung",
        meteringMode: "slp",
        validFrom: VALID_FROM_2026,
        sourceDocumentUrl: WESERNETZ_BREMEN_SOURCE,
        components: [
          { componentKey: "base_price_eur_per_year", valueNumeric: "65.00", unit: "EUR/a" },
          { componentKey: "work_price_ct_per_kwh", valueNumeric: "5.46", unit: "ct/kWh" },
          { componentKey: "net_fee_reduction_eur_per_year", valueNumeric: "108.18", unit: "EUR/a" }
        ],
        requirements: defaultModul1Requirements(),
        timeWindows: []
      },
      {
        moduleKey: "modul-2",
        networkLevel: "niederspannung",
        meteringMode: "slp",
        validFrom: VALID_FROM_2026,
        sourceDocumentUrl: WESERNETZ_BREMEN_SOURCE,
        components: [
          { componentKey: "base_price_eur_per_year", valueNumeric: "0.00", unit: "EUR/a" },
          { componentKey: "work_price_ct_per_kwh", valueNumeric: "2.18", unit: "ct/kWh" }
        ],
        requirements: defaultModul2Requirements(),
        timeWindows: []
      },
      {
        moduleKey: "modul-3",
        networkLevel: "niederspannung",
        meteringMode: "slp",
        validFrom: VALID_FROM_2026,
        sourceDocumentUrl: WESERNETZ_BREMEN_SOURCE,
        components: modul3Components("5.46", "7.65", "2.18"),
        requirements: defaultModul3Requirements(),
        timeWindows: buildFullYearWindows([
          ["low", ["01:00-05:00"]],
          ["standard", ["00:00-01:00", "05:00-17:00", "19:30-24:00"]],
          ["high", ["17:00-19:30"]]
        ])
      }
    ],
    meteringPrices: meteringPrices("14.20", "30.00")
  };
}

export function getWesernetzBremerhavenEndcustomerReference(): EndcustomerOperatorReference {
  return {
    operatorSlug: "wesernetz-bremerhaven",
    operatorName: "wesernetz Bremerhaven GmbH",
    sourceDocumentUrl: WESERNETZ_BREMERHAVEN_SOURCE,
    products: [
      {
        moduleKey: "modul-1",
        networkLevel: "niederspannung",
        meteringMode: "slp",
        validFrom: VALID_FROM_2026,
        sourceDocumentUrl: WESERNETZ_BREMERHAVEN_SOURCE,
        components: [
          { componentKey: "base_price_eur_per_year", valueNumeric: "70.00", unit: "EUR/a" },
          { componentKey: "work_price_ct_per_kwh", valueNumeric: "5.34", unit: "ct/kWh" },
          { componentKey: "net_fee_reduction_eur_per_year", valueNumeric: "107.28", unit: "EUR/a" }
        ],
        requirements: defaultModul1Requirements(),
        timeWindows: []
      },
      {
        moduleKey: "modul-2",
        networkLevel: "niederspannung",
        meteringMode: "slp",
        validFrom: VALID_FROM_2026,
        sourceDocumentUrl: WESERNETZ_BREMERHAVEN_SOURCE,
        components: [
          { componentKey: "base_price_eur_per_year", valueNumeric: "0.00", unit: "EUR/a" },
          { componentKey: "work_price_ct_per_kwh", valueNumeric: "2.14", unit: "ct/kWh" }
        ],
        requirements: defaultModul2Requirements(),
        timeWindows: []
      },
      {
        moduleKey: "modul-3",
        networkLevel: "niederspannung",
        meteringMode: "slp",
        validFrom: VALID_FROM_2026,
        sourceDocumentUrl: WESERNETZ_BREMERHAVEN_SOURCE,
        components: modul3Components("5.34", "7.29", "2.14"),
        requirements: defaultModul3Requirements(),
        timeWindows: buildFullYearWindows([
          ["low", ["01:00-05:00"]],
          ["standard", ["00:00-01:00", "05:00-16:30", "19:30-24:00"]],
          ["high", ["16:30-19:30"]]
        ])
      }
    ],
    meteringPrices: meteringPrices("14.20", "30.00")
  };
}

function defaultModul1Requirements(): EndcustomerTariffRequirement[] {
  return [
    { requirementKey: "default_if_no_choice", requirementValue: "true" },
    { requirementKey: "zero_floor_applies", requirementValue: "true" }
  ];
}

function defaultModul2Requirements(): EndcustomerTariffRequirement[] {
  return [
    { requirementKey: "separate_meter_required", requirementValue: "true" },
    { requirementKey: "separate_market_location_required", requirementValue: "true" }
  ];
}

function defaultModul3Requirements(): EndcustomerTariffRequirement[] {
  return [
    { requirementKey: "intelligent_meter_required", requirementValue: "true" },
    { requirementKey: "must_be_combined_with_module_1", requirementValue: "true" }
  ];
}

function modul3Components(standard: string, high: string, low: string): EndcustomerTariffComponent[] {
  return [
    { componentKey: "standard_work_price_ct_per_kwh", valueNumeric: standard, unit: "ct/kWh" },
    { componentKey: "high_work_price_ct_per_kwh", valueNumeric: high, unit: "ct/kWh" },
    { componentKey: "low_work_price_ct_per_kwh", valueNumeric: low, unit: "ct/kWh" }
  ];
}

function meteringPrices(singleRegister: string, dualRegister: string): EndcustomerTariffComponent[] {
  return [
    { componentKey: "single_register_meter_eur_per_year", valueNumeric: singleRegister, unit: "EUR/a" },
    { componentKey: "dual_register_meter_eur_per_year", valueNumeric: dualRegister, unit: "EUR/a" }
  ];
}

function buildHallQuarterWindows(quarterKey: "Q1" | "Q2" | "Q4"): EndcustomerTariffTimeWindow[] {
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

function buildFullYearWindows(
  bands: Array<[EndcustomerTariffTimeWindow["bandKey"], string[]]>
): EndcustomerTariffTimeWindow[] {
  return (["Q1", "Q2", "Q3", "Q4"] as const).flatMap((quarterKey) =>
    bands.flatMap(([bandKey, ranges]) => buildQuarterRanges(quarterKey, bandKey, ranges))
  );
}

function buildQuarterRanges(
  quarterKey: EndcustomerTariffTimeWindow["quarterKey"],
  bandKey: EndcustomerTariffTimeWindow["bandKey"],
  ranges: string[]
): EndcustomerTariffTimeWindow[] {
  return ranges.map((range) => {
    const [startsAt, endsAt] = range.split("-");

    return {
      quarterKey,
      bandKey,
      startsAt: startsAt ?? "00:00",
      endsAt: endsAt === "00:00" ? "24:00" : endsAt ?? "24:00"
    };
  });
}
