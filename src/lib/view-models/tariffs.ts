import {
  summarizePublishedOperatorBands,
  type PublishedOperator
} from "../../modules/operators/current-catalog";
import type {
  EndcustomerTariffCatalogComponent,
  EndcustomerTariffCatalogEntry,
  EndcustomerTariffCatalogProduct,
  EndcustomerTariffCatalogRequirement
} from "../../modules/tariffs/endcustomer-catalog";
import type { SourceHealthReport } from "../../modules/sources/source-health";
export {
  buildQuarterlyTariffMatrix,
  expandSeasonLabelToQuarters,
  type TariffQuarterEntry,
  type TariffQuarter,
  type TariffQuarterGroup,
  type TariffQuarterKey
} from "../../modules/operators/quarterly-tariffs";
import { buildQuarterlyTariffMatrix, type TariffQuarter } from "../../modules/operators/quarterly-tariffs";

export type TariffBandBadge = {
  key: "NT" | "ST" | "HT";
  valueCtPerKwh: string;
};

export type EndcustomerDisplayMetric = {
  label: string;
  value: string;
};

export type EndcustomerDisplayProduct = {
  key: "modul-1" | "modul-2" | "modul-3" | "messung";
  label: string;
  metrics: EndcustomerDisplayMetric[];
  requirementBadges: string[];
};

export type EndcustomerDisplay = {
  title: string;
  products: EndcustomerDisplayProduct[];
  searchText: string;
};

export type TariffTableRow = {
  operatorName: string;
  operatorSlug: string;
  regionLabel: string;
  currentBandsSummary: string;
  currentBandBadges?: TariffBandBadge[];
  validFrom: string;
  sourcePageUrl: string;
  documentUrl: string;
  sourceSlug: string;
  checkedAt: string | null;
  reviewStatus: "pending" | "verified";
  latestPageSnapshotFetchedAt?: string | null;
  latestPageSnapshotHash?: string | null;
  pageArtifactApiUrl?: string | null;
  latestDocumentSnapshotFetchedAt?: string | null;
  latestDocumentSnapshotHash?: string | null;
  documentArtifactApiUrl?: string | null;
  sourceHealthReport?: SourceHealthReport | null;
  timeWindows: PublishedOperator["timeWindows"];
  quarterMatrix: TariffQuarter[];
  endcustomerDisplay?: EndcustomerDisplay | null;
};

export function getRegistryTariffRows(operators: PublishedOperator[]): TariffTableRow[] {
  return operators.map((entry) => ({
    operatorName: entry.name,
    operatorSlug: entry.slug,
    regionLabel: entry.regionLabel,
    currentBandsSummary: summarizePublishedOperatorBands(entry),
    currentBandBadges: entry.bands.map((band) => ({
      key: band.key,
      valueCtPerKwh: band.valueCtPerKwh
    })),
    validFrom: entry.validFrom,
    sourcePageUrl: entry.sourcePageUrl,
    documentUrl: entry.documentUrl,
    sourceSlug: entry.sourceSlug,
    checkedAt: entry.checkedAt,
    reviewStatus: entry.reviewStatus,
    timeWindows: entry.timeWindows,
    quarterMatrix: buildQuarterlyTariffMatrix({
      bands: entry.bands,
      timeWindows: entry.timeWindows
    }),
    endcustomerDisplay: null
  }));
}

export function mergeTariffRowsWithEndcustomerCatalog(
  rows: TariffTableRow[],
  catalog: EndcustomerTariffCatalogEntry[]
) {
  const endcustomerByOperatorSlug = new Map(catalog.map((entry) => [entry.operatorSlug, entry] as const));

  return rows.map((row) => ({
    ...row,
    endcustomerDisplay: buildEndcustomerDisplay(endcustomerByOperatorSlug.get(row.operatorSlug))
  }));
}

function buildEndcustomerDisplay(entry: EndcustomerTariffCatalogEntry | undefined): EndcustomerDisplay | null {
  if (!entry) {
    return null;
  }

  const products: EndcustomerDisplayProduct[] = [
    buildProductDisplay(entry.products.find((product) => product.moduleKey === "modul-1")),
    buildProductDisplay(entry.products.find((product) => product.moduleKey === "modul-2")),
    buildProductDisplay(entry.products.find((product) => product.moduleKey === "modul-3")),
    buildMeteringDisplay(entry.meteringPrices)
  ].filter((product): product is EndcustomerDisplayProduct => product !== null);

  if (products.length === 0) {
    return null;
  }

  return {
    title: "Endkunden · Niederspannung",
    products,
    searchText: products
      .flatMap((product) => [
        product.label,
        ...product.metrics.flatMap((metric) => [metric.label, metric.value]),
        ...product.requirementBadges
      ])
      .join(" ")
  };
}

function buildProductDisplay(
  product: EndcustomerTariffCatalogProduct | undefined
): EndcustomerDisplayProduct | null {
  if (!product) {
    return null;
  }

  if (product.moduleKey === "modul-1") {
    return {
      key: "modul-1",
      label: "Modul 1",
      metrics: [
        formatMetric("Grundpreis", findComponentValue(product.components, "base_price_eur_per_year"), "EUR/a"),
        formatMetric("Arbeitspreis", findComponentValue(product.components, "work_price_ct_per_kwh"), "ct/kWh"),
        formatMetric(
          "Reduzierung",
          findComponentValue(product.components, "net_fee_reduction_eur_per_year"),
          "EUR/a"
        )
      ].filter((metric): metric is EndcustomerDisplayMetric => metric !== null),
      requirementBadges: mapRequirementBadges(product.requirements)
    };
  }

  if (product.moduleKey === "modul-2") {
    return {
      key: "modul-2",
      label: "Modul 2",
      metrics: [
        formatMetric("Grundpreis", findComponentValue(product.components, "base_price_eur_per_year"), "EUR/a"),
        formatMetric("Arbeitspreis", findComponentValue(product.components, "work_price_ct_per_kwh"), "ct/kWh")
      ].filter((metric): metric is EndcustomerDisplayMetric => metric !== null),
      requirementBadges: mapRequirementBadges(product.requirements)
    };
  }

  return {
    key: "modul-3",
    label: "Modul 3",
    metrics: [
      formatMetric("NT", findComponentValue(product.components, "low_work_price_ct_per_kwh"), "ct/kWh"),
      formatMetric("ST", findComponentValue(product.components, "standard_work_price_ct_per_kwh"), "ct/kWh"),
      formatMetric("HT", findComponentValue(product.components, "high_work_price_ct_per_kwh"), "ct/kWh")
    ].filter((metric): metric is EndcustomerDisplayMetric => metric !== null),
    requirementBadges: mapRequirementBadges(product.requirements)
  };
}

function buildMeteringDisplay(components: EndcustomerTariffCatalogComponent[]): EndcustomerDisplayProduct | null {
  const metrics = [
    formatMetric("Eintarifzähler", findComponentValue(components, "single_register_meter_eur_per_year"), "EUR/a"),
    formatMetric("Zweitarifzähler", findComponentValue(components, "dual_register_meter_eur_per_year"), "EUR/a")
  ].filter((metric): metric is EndcustomerDisplayMetric => metric !== null);

  if (metrics.length === 0) {
    return null;
  }

  return {
    key: "messung",
    label: "Messung",
    metrics,
    requirementBadges: []
  };
}

function findComponentValue(
  components: EndcustomerTariffCatalogComponent[],
  key: EndcustomerTariffCatalogComponent["componentKey"]
) {
  return components.find((component) => component.componentKey === key)?.valueNumeric ?? null;
}

function formatMetric(label: string, value: string | null, unit: "EUR/a" | "ct/kWh") {
  if (!value) {
    return null;
  }

  return {
    label,
    value: unit === "EUR/a" ? `${formatGermanNumber(value)} €/a` : `${formatGermanNumber(value)} ct/kWh`
  };
}

function formatGermanNumber(value: string) {
  return value.replace(".", ",");
}

function mapRequirementBadges(requirements: EndcustomerTariffCatalogRequirement[]) {
  return requirements.flatMap((requirement) => {
    if (requirement.requirementValue !== "true") {
      return [];
    }

    switch (requirement.requirementKey) {
      case "default_if_no_choice":
        return ["Standardwahl"];
      case "zero_floor_applies":
        return ["nicht unter 0 €"];
      case "separate_meter_required":
        return ["separater Zähler"];
      case "separate_market_location_required":
        return ["separate Marktlokation"];
      case "intelligent_meter_required":
        return ["iMSys"];
      case "must_be_combined_with_module_1":
        return ["mit Modul 1"];
      default:
        return [];
    }
  });
}
