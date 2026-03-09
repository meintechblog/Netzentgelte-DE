import type { PublishedOperator } from "../operators/current-catalog";
import type {
  EndcustomerTariffCatalogComponent,
  EndcustomerTariffCatalogEntry,
  EndcustomerTariffCatalogProduct,
  EndcustomerTariffCatalogRequirement
} from "./endcustomer-catalog";

const REQUIRED_PRODUCT_SPEC = {
  "modul-1": {
    components: [
      "base_price_eur_per_year",
      "work_price_ct_per_kwh",
      "net_fee_reduction_eur_per_year"
    ] as const,
    requirements: ["default_if_no_choice", "zero_floor_applies"] as const,
    requireTimeWindows: false
  },
  "modul-2": {
    components: ["base_price_eur_per_year", "work_price_ct_per_kwh"] as const,
    requirements: ["separate_meter_required", "separate_market_location_required"] as const,
    requireTimeWindows: false
  },
  "modul-3": {
    components: [
      "standard_work_price_ct_per_kwh",
      "high_work_price_ct_per_kwh",
      "low_work_price_ct_per_kwh"
    ] as const,
    requirements: ["intelligent_meter_required", "must_be_combined_with_module_1"] as const,
    requireTimeWindows: true
  }
} as const;

const REQUIRED_METERING_COMPONENTS = [
  "single_register_meter_eur_per_year",
  "dual_register_meter_eur_per_year"
] as const;

export type EndcustomerIntegrityStatus = "complete" | "missing-entry" | "incomplete";

export type EndcustomerIntegrityIssueKey =
  | "missing_entry"
  | "no_verified_products"
  | "missing_modul_1"
  | "missing_modul_2"
  | "missing_modul_3"
  | "missing_modul_1_components"
  | "missing_modul_2_components"
  | "missing_modul_3_components"
  | "missing_modul_1_requirements"
  | "missing_modul_2_requirements"
  | "missing_modul_3_requirements"
  | "missing_modul_3_time_windows"
  | "missing_metering_prices";

export type EndcustomerIntegrityIssue = {
  key: EndcustomerIntegrityIssueKey;
  message: string;
};

export type EndcustomerCompleteProductSet = {
  validFrom: string;
  modul1: EndcustomerTariffCatalogProduct;
  modul2: EndcustomerTariffCatalogProduct;
  modul3: EndcustomerTariffCatalogProduct;
};

export type EndcustomerIntegrityItem = {
  operatorSlug: string;
  operatorName: string;
  regionLabel: string;
  status: EndcustomerIntegrityStatus;
  currentValidFrom: string | null;
  issues: EndcustomerIntegrityIssue[];
};

export function selectCurrentCompleteEndcustomerSet(
  entry: EndcustomerTariffCatalogEntry | undefined
): EndcustomerCompleteProductSet | null {
  if (!entry || !hasCompleteMeteringSet(entry.meteringPrices)) {
    return null;
  }

  const verifiedProducts = entry.products.filter((product) => product.humanReviewStatus === "verified");
  const validFroms = [...new Set(verifiedProducts.map((product) => product.validFrom))].sort((left, right) =>
    right.localeCompare(left, "de")
  );

  for (const validFrom of validFroms) {
    const productsForDate = verifiedProducts.filter((product) => product.validFrom === validFrom);
    const modul1 = productsForDate.find((product) => product.moduleKey === "modul-1");
    const modul2 = productsForDate.find((product) => product.moduleKey === "modul-2");
    const modul3 = productsForDate.find((product) => product.moduleKey === "modul-3");

    if (
      modul1 &&
      modul2 &&
      modul3 &&
      getProductIssues(modul1).length === 0 &&
      getProductIssues(modul2).length === 0 &&
      getProductIssues(modul3).length === 0
    ) {
      return {
        validFrom,
        modul1,
        modul2,
        modul3
      };
    }
  }

  return null;
}

export function buildEndcustomerIntegrityAudit(
  operators: PublishedOperator[],
  catalog: EndcustomerTariffCatalogEntry[]
): EndcustomerIntegrityItem[] {
  const catalogByOperator = new Map(catalog.map((entry) => [entry.operatorSlug, entry] as const));

  return operators
    .map<EndcustomerIntegrityItem>((operator) => {
      const entry = catalogByOperator.get(operator.slug);

      if (!entry) {
        return {
          operatorSlug: operator.slug,
          operatorName: operator.name,
          regionLabel: operator.regionLabel,
          status: "missing-entry",
          currentValidFrom: null,
          issues: [
            {
              key: "missing_entry",
              message: "Für diesen veröffentlichten Betreiber liegt noch kein Endkundenmodell für Niederspannung vor."
            }
          ]
        };
      }

      const completeSet = selectCurrentCompleteEndcustomerSet(entry);
      if (completeSet) {
        return {
          operatorSlug: operator.slug,
          operatorName: operator.name,
          regionLabel: operator.regionLabel,
          status: "complete",
          currentValidFrom: completeSet.validFrom,
          issues: []
        };
      }

      const currentValidFrom = getLatestRelevantValidFrom(entry);
      const issues = buildEntryIssues(entry, currentValidFrom);

      return {
        operatorSlug: operator.slug,
        operatorName: operator.name,
        regionLabel: operator.regionLabel,
        status: "incomplete",
        currentValidFrom,
        issues
      };
    })
    .sort((left, right) => left.operatorSlug.localeCompare(right.operatorSlug, "de"));
}

export function getEndcustomerIntegrityAuditSummary(items: EndcustomerIntegrityItem[]) {
  return {
    operatorCount: items.length,
    completeCount: items.filter((item) => item.status === "complete").length,
    missingEntryCount: items.filter((item) => item.status === "missing-entry").length,
    incompleteCount: items.filter((item) => item.status === "incomplete").length
  };
}

export function getNextEndcustomerBackfillTargets(items: EndcustomerIntegrityItem[], limit = 10) {
  return items.filter((item) => item.status !== "complete").slice(0, limit);
}

export function hasCompleteMeteringSet(components: EndcustomerTariffCatalogComponent[]) {
  return REQUIRED_METERING_COMPONENTS.every((key) => hasComponent(components, key));
}

function buildEntryIssues(
  entry: EndcustomerTariffCatalogEntry,
  validFrom: string | null
): EndcustomerIntegrityIssue[] {
  const issues: EndcustomerIntegrityIssue[] = [];
  const productsForDate = validFrom
    ? entry.products.filter((product) => product.validFrom === validFrom)
    : [];

  if (!entry.products.some((product) => product.humanReviewStatus === "verified")) {
    issues.push({
      key: "no_verified_products",
      message: "Es gibt noch keinen verifizierten Produktsatz für diesen Betreiber."
    });
  }

  const modul1 = productsForDate.find((product) => product.moduleKey === "modul-1");
  const modul2 = productsForDate.find((product) => product.moduleKey === "modul-2");
  const modul3 = productsForDate.find((product) => product.moduleKey === "modul-3");

  if (!modul1) {
    issues.push({ key: "missing_modul_1", message: "Modul 1 fehlt im aktuellen Produktsatz." });
  } else {
    issues.push(...getProductIssues(modul1));
  }

  if (!modul2) {
    issues.push({ key: "missing_modul_2", message: "Modul 2 fehlt im aktuellen Produktsatz." });
  } else {
    issues.push(...getProductIssues(modul2));
  }

  if (!modul3) {
    issues.push({ key: "missing_modul_3", message: "Modul 3 fehlt im aktuellen Produktsatz." });
  } else {
    issues.push(...getProductIssues(modul3));
  }

  if (!hasCompleteMeteringSet(entry.meteringPrices)) {
    issues.push({
      key: "missing_metering_prices",
      message: "Messpreise für Ein- und Zweitarifzähler sind noch nicht vollständig erfasst."
    });
  }

  return dedupeIssues(issues);
}

function getProductIssues(product: EndcustomerTariffCatalogProduct): EndcustomerIntegrityIssue[] {
  const spec = REQUIRED_PRODUCT_SPEC[product.moduleKey];
  const missingComponents = spec.components.filter((key) => !hasComponent(product.components, key));
  const missingRequirements = spec.requirements.filter((key) => !hasRequirement(product.requirements, key));
  const issues: EndcustomerIntegrityIssue[] = [];

  if (missingComponents.length > 0) {
    issues.push({
      key: getMissingComponentIssueKey(product.moduleKey),
      message: `${formatModuleLabel(product.moduleKey)} fehlt mindestens eine Pflichtkomponente: ${missingComponents.join(", ")}.`
    });
  }

  if (missingRequirements.length > 0) {
    issues.push({
      key: getMissingRequirementIssueKey(product.moduleKey),
      message: `${formatModuleLabel(product.moduleKey)} fehlt mindestens eine Pflichtregel: ${missingRequirements.join(", ")}.`
    });
  }

  if (spec.requireTimeWindows && product.timeWindows.length === 0) {
    issues.push({
      key: "missing_modul_3_time_windows",
      message: "Modul 3 hat noch keine strukturierten Zeitfenster."
    });
  }

  return issues;
}

function getLatestRelevantValidFrom(entry: EndcustomerTariffCatalogEntry) {
  const dates = [
    ...new Set(
      entry.products
        .filter((product) => product.humanReviewStatus === "verified")
        .map((product) => product.validFrom)
    )
  ].sort((left, right) => right.localeCompare(left, "de"));

  if (dates.length > 0) {
    return dates[0]!;
  }

  const anyDates = [...new Set(entry.products.map((product) => product.validFrom))].sort((left, right) =>
    right.localeCompare(left, "de")
  );
  return anyDates[0] ?? null;
}

function hasComponent(
  components: EndcustomerTariffCatalogComponent[],
  key: EndcustomerTariffCatalogComponent["componentKey"]
) {
  return components.some((component) => component.componentKey === key && component.valueNumeric.length > 0);
}

function hasRequirement(
  requirements: EndcustomerTariffCatalogRequirement[],
  key: EndcustomerTariffCatalogRequirement["requirementKey"]
) {
  return requirements.some(
    (requirement) => requirement.requirementKey === key && requirement.requirementValue.length > 0
  );
}

function formatModuleLabel(moduleKey: EndcustomerTariffCatalogProduct["moduleKey"]) {
  return moduleKey.replace("modul-", "Modul ");
}

function getMissingComponentIssueKey(moduleKey: EndcustomerTariffCatalogProduct["moduleKey"]) {
  if (moduleKey === "modul-1") {
    return "missing_modul_1_components" as const;
  }

  if (moduleKey === "modul-2") {
    return "missing_modul_2_components" as const;
  }

  return "missing_modul_3_components" as const;
}

function getMissingRequirementIssueKey(moduleKey: EndcustomerTariffCatalogProduct["moduleKey"]) {
  if (moduleKey === "modul-1") {
    return "missing_modul_1_requirements" as const;
  }

  if (moduleKey === "modul-2") {
    return "missing_modul_2_requirements" as const;
  }

  return "missing_modul_3_requirements" as const;
}

function dedupeIssues(issues: EndcustomerIntegrityIssue[]) {
  return issues.filter(
    (issue, index) => issues.findIndex((candidate) => candidate.key === issue.key) === index
  );
}
