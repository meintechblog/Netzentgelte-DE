import {
  summarizePublishedOperatorBands,
  type PublishedOperator
} from "../../modules/operators/current-catalog";
import type { ComplianceEvaluation } from "../../modules/compliance/modul-3-evaluator";
import type { ComplianceRuleSet } from "../../modules/compliance/rule-catalog";
import type { PendingOperatorCatalog } from "../../modules/operators/pending-catalog";
import type { CurrentSource } from "../../modules/sources/current-sources";
import type {
  EndcustomerTariffCatalogComponent,
  EndcustomerTariffCatalogEntry,
  EndcustomerTariffCatalogProduct,
  EndcustomerTariffCatalogRequirement
} from "../../modules/tariffs/endcustomer-catalog";
import {
  hasCompleteMeteringSet,
  selectCurrentCompleteEndcustomerSet
} from "../../modules/tariffs/endcustomer-integrity";
import type { SourceHealthReport } from "../../modules/sources/source-health";
import { getPriceBasisLabel, type PriceBasis } from "../../modules/operators/price-basis";
export {
  buildQuarterlyTariffMatrix,
  expandSeasonLabelToQuarters,
  type TariffQuarterEntry,
  type TariffQuarter,
  type TariffQuarterGroup,
  type TariffQuarterKey,
  type TariffQuarterSegment,
  type TariffQuarterSlot
} from "../../modules/operators/quarterly-tariffs";
import { buildQuarterlyTariffMatrix, type TariffQuarter } from "../../modules/operators/quarterly-tariffs";

export type TariffBandBadge = {
  key: "NT" | "ST" | "HT";
  valueCtPerKwh: string;
  priceBasis: PriceBasis;
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

export type PublicationStatus = "verified" | "pending" | "blocked" | "violation" | "missing-data";

export type TariffTableRow = {
  operatorName: string;
  operatorSlug: string;
  regionLabel: string;
  currentBandsSummary: string;
  currentBandBadges?: TariffBandBadge[];
  validFrom: string;
  sourcePageUrl?: string;
  documentUrl?: string;
  sourceSlug: string;
  checkedAt: string | null;
  reviewStatus: "pending" | "verified";
  publicationStatus?: PublicationStatus;
  statusSummary?: string;
  missingInformation?: string[];
  hasVerifiedLowVoltageProduct?: boolean;
  priceBasis: PriceBasis;
  priceBasisLabel: string;
  compliance: ComplianceEvaluation;
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

export type ComplianceDisplayRule = {
  ruleId: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high";
  sourceCitation: string;
};

export type ComplianceRuleSetDisplay = {
  ruleSetId: string;
  title: string;
  version: string;
  sourceDocumentUrl: string;
  sourceDocumentLabel: string;
  rules: ComplianceDisplayRule[];
};

export function getRegistryTariffRows(operators: PublishedOperator[]): TariffTableRow[] {
  return operators.map((entry) => ({
    operatorName: entry.name,
    operatorSlug: entry.slug,
    regionLabel: entry.regionLabel,
    currentBandsSummary: summarizePublishedOperatorBands(entry),
    currentBandBadges: entry.bands.map((band) => ({
      key: band.key,
      valueCtPerKwh: band.valueCtPerKwh,
      priceBasis: band.priceBasis
    })),
    validFrom: entry.validFrom,
    sourcePageUrl: entry.sourcePageUrl,
    documentUrl: entry.documentUrl,
    sourceSlug: entry.sourceSlug,
    checkedAt: entry.checkedAt,
    reviewStatus: entry.reviewStatus,
    publicationStatus: entry.compliance.status === "violation" ? "violation" : "verified",
    statusSummary: entry.compliance.violations[0]?.message ?? nullToUndefined(entry.compliance.notEvaluated[0]?.message),
    missingInformation: [],
    hasVerifiedLowVoltageProduct: true,
    priceBasis: entry.priceBasis,
    priceBasisLabel: getPriceBasisLabel(entry.priceBasis),
    compliance: entry.compliance,
    timeWindows: entry.timeWindows,
    quarterMatrix: buildQuarterlyTariffMatrix({
      bands: entry.bands,
      timeWindows: entry.timeWindows
    }),
    endcustomerDisplay: null
  }));
}

export function getPendingTariffRows(pendingCatalog: PendingOperatorCatalog): TariffTableRow[] {
  return pendingCatalog.items.map((entry) => ({
    operatorName: entry.name,
    operatorSlug: entry.slug,
    regionLabel: entry.regionLabel,
    currentBandsSummary:
      entry.tariffStatus === "missing"
        ? "Noch kein vollständiger Tarifdatensatz veröffentlicht"
        : "Tarifdaten in Prüfung oder noch unvollständig",
    currentBandBadges: [],
    validFrom: "2026-01-01",
    sourcePageUrl: entry.sourcePageUrl ?? entry.websiteUrl,
    documentUrl: entry.documentUrl,
    sourceSlug: entry.sourceSlug ?? `${entry.slug}-pending`,
    checkedAt: entry.checkedAt,
    reviewStatus: entry.reviewStatus,
    publicationStatus: entry.publicationStatus ?? getFallbackPendingPublicationStatus(entry),
    statusSummary: entry.statusSummary ?? getFallbackPendingStatusSummary(entry),
    missingInformation: entry.missingInformation ?? getFallbackPendingMissingInformation(entry),
    hasVerifiedLowVoltageProduct: entry.hasVerifiedLowVoltageProduct ?? false,
    priceBasis: "assumed-netto",
    priceBasisLabel: getPriceBasisLabel("assumed-netto"),
    compliance: {
      ruleSetId: "bdew-modul-3-v1-1",
      status: "not-evaluable",
      violations: [],
      passes: [],
      notEvaluated: [
        {
          ruleId: `publication-${entry.publicationStatus ?? getFallbackPendingPublicationStatus(entry)}`,
          title: "Transparente Problemveröffentlichung",
          severity: "high",
          message: entry.statusSummary ?? getFallbackPendingStatusSummary(entry),
          sourceCitation: entry.documentUrl ?? entry.sourcePageUrl ?? entry.websiteUrl ?? "Öffentliche Betreiberquelle"
        }
      ]
    },
    timeWindows: [],
    quarterMatrix: [],
    endcustomerDisplay: null
  }));
}

export function getComplianceRuleSetDisplay(ruleSet: ComplianceRuleSet): ComplianceRuleSetDisplay {
  return {
    ruleSetId: ruleSet.ruleSetId,
    title: ruleSet.title,
    version: ruleSet.version,
    sourceDocumentUrl: ruleSet.sourceDocumentUrl,
    sourceDocumentLabel: ruleSet.sourceDocumentLabel,
    rules: ruleSet.rules.map((rule) => ({
      ruleId: rule.ruleId,
      title: rule.title,
      description: rule.description,
      severity: rule.severity,
      sourceCitation: rule.sourceCitation
    }))
  };
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

export function mergeTariffRowsWithCurrentSources(rows: TariffTableRow[], sources: CurrentSource[]) {
  const sourceBySlug = new Map(sources.map((source) => [source.sourceSlug, source] as const));

  return rows.map((row) => {
    const source = sourceBySlug.get(row.sourceSlug);

    if (!source) {
      return row;
    }

    return {
      ...row,
      latestPageSnapshotFetchedAt: source.latestPageSnapshotFetchedAt,
      latestPageSnapshotHash: source.latestPageSnapshotHash,
      pageArtifactApiUrl: source.pageArtifactApiUrl,
      latestDocumentSnapshotFetchedAt: source.latestDocumentSnapshotFetchedAt,
      latestDocumentSnapshotHash: source.latestDocumentSnapshotHash,
      documentArtifactApiUrl: source.documentArtifactApiUrl,
      sourceHealthReport: source.healthReport
    };
  });
}

function nullToUndefined(value: string | undefined) {
  return value ?? undefined;
}

function getFallbackPendingPublicationStatus(
  entry: Pick<PendingOperatorCatalog["items"][number], "sourceStatus" | "tariffStatus">
): PublicationStatus {
  if (entry.sourceStatus === "missing" || entry.tariffStatus === "missing") {
    return "missing-data";
  }

  return "pending";
}

function getFallbackPendingStatusSummary(
  entry: Pick<PendingOperatorCatalog["items"][number], "sourceStatus" | "tariffStatus">
) {
  if (entry.sourceStatus === "missing") {
    return "Offizielle 2026-Quellseite ist noch nicht belastbar belegt.";
  }

  if (entry.tariffStatus === "missing") {
    return "Offizielle Quelle liegt vor, aber ein vollständiger 2026-Modul-3-Tarifdatensatz fehlt noch.";
  }

  return "Offizielle 2026-Veröffentlichung wurde geprüft, ist aber noch nicht vollständig verifiziert.";
}

function getFallbackPendingMissingInformation(
  entry: Pick<PendingOperatorCatalog["items"][number], "sourceStatus" | "tariffStatus" | "documentUrl">
) {
  const missing = ["Verifiziertes Niederspannungsprodukt fehlt"];

  if (!entry.documentUrl) {
    missing.push("Offizielles 2026-Dokument fehlt");
  }

  if (entry.sourceStatus === "missing" || entry.tariffStatus === "missing" || entry.tariffStatus === "partial") {
    missing.push("Modul-3-Tarifdaten unvollständig");
  }

  return missing;
}

function buildEndcustomerDisplay(entry: EndcustomerTariffCatalogEntry | undefined): EndcustomerDisplay | null {
  if (!entry) {
    return null;
  }

  const selectedProducts = selectCurrentCompleteEndcustomerSet(entry);
  if (!selectedProducts || !hasCompleteMeteringSet(entry.meteringPrices)) {
    return null;
  }

  const products: EndcustomerDisplayProduct[] = [
    buildProductDisplay(selectedProducts.modul1),
    buildProductDisplay(selectedProducts.modul2),
    buildProductDisplay(selectedProducts.modul3),
    buildMeteringDisplay(entry.meteringPrices)
  ].filter((product): product is EndcustomerDisplayProduct => product !== null);

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
