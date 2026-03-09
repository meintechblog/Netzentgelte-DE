import { asc, eq, inArray, sql } from "drizzle-orm";

import type {
  EndcustomerOperatorReference,
  EndcustomerRequirementKey,
  EndcustomerTariffComponentKey
} from "./endcustomer-reference";
import { getStadtwerkeSchwaebischHallEndcustomerReference } from "./endcustomer-reference";

export type EndcustomerTariffCatalogComponent = {
  componentKey: EndcustomerTariffComponentKey;
  valueNumeric: string;
  unit: string;
};

export type EndcustomerTariffCatalogRequirement = {
  requirementKey: EndcustomerRequirementKey;
  requirementValue: string;
};

export type EndcustomerTariffCatalogTimeWindow = {
  quarterKey: "Q1" | "Q2" | "Q3" | "Q4";
  bandKey: "standard" | "high" | "low";
  startsAt: string;
  endsAt: string;
};

export type EndcustomerTariffCatalogProduct = {
  moduleKey: "modul-1" | "modul-2" | "modul-3";
  networkLevel: "niederspannung";
  meteringMode: "slp";
  validFrom: string;
  sourceDocumentUrl: string;
  humanReviewStatus: string;
  components: EndcustomerTariffCatalogComponent[];
  requirements: EndcustomerTariffCatalogRequirement[];
  timeWindows: EndcustomerTariffCatalogTimeWindow[];
};

export type EndcustomerTariffCatalogEntry = {
  operatorSlug: string;
  operatorName: string;
  products: EndcustomerTariffCatalogProduct[];
  meteringPrices: EndcustomerTariffCatalogComponent[];
};

export type EndcustomerTariffCatalogRow = {
  operatorSlug: string;
  operatorName: string;
  moduleKey: EndcustomerTariffCatalogProduct["moduleKey"];
  networkLevel: EndcustomerTariffCatalogProduct["networkLevel"];
  meteringMode: EndcustomerTariffCatalogProduct["meteringMode"];
  validFrom: string;
  sourceDocumentUrl: string;
  humanReviewStatus: string;
  componentKey: EndcustomerTariffCatalogComponent["componentKey"] | null;
  componentValueNumeric: string | null;
  componentUnit: string | null;
  requirementKey: EndcustomerTariffCatalogRequirement["requirementKey"] | null;
  requirementValue: string | null;
  quarterKey: EndcustomerTariffCatalogTimeWindow["quarterKey"] | null;
  bandKey: EndcustomerTariffCatalogTimeWindow["bandKey"] | null;
  startsAt: string | null;
  endsAt: string | null;
};

export function getSeedEndcustomerTariffCatalog(): EndcustomerTariffCatalogEntry[] {
  return [mapReferenceToCatalogEntry(getStadtwerkeSchwaebischHallEndcustomerReference())];
}

export function shouldUseSeedEndcustomerTariffs(input: {
  nodeEnv: string | undefined;
  databaseUrl: string | undefined;
}) {
  return input.nodeEnv === "test" || !input.databaseUrl;
}

export function buildEndcustomerTariffCatalog(rows: EndcustomerTariffCatalogRow[]): EndcustomerTariffCatalogEntry[] {
  const entries = new Map<string, EndcustomerTariffCatalogEntry>();

  for (const row of rows) {
    let entry = entries.get(row.operatorSlug);

    if (!entry) {
      entry = {
        operatorSlug: row.operatorSlug,
        operatorName: row.operatorName,
        products: [],
        meteringPrices: []
      };
      entries.set(row.operatorSlug, entry);
    }

    const productId = `${row.moduleKey}:${row.validFrom}`;
    let product = entry.products.find(
      (candidate) => candidate.moduleKey === row.moduleKey && candidate.validFrom === row.validFrom
    );

    if (!product) {
      product = {
        moduleKey: row.moduleKey,
        networkLevel: row.networkLevel,
        meteringMode: row.meteringMode,
        validFrom: row.validFrom,
        sourceDocumentUrl: row.sourceDocumentUrl,
        humanReviewStatus: row.humanReviewStatus,
        components: [],
        requirements: [],
        timeWindows: []
      };
      entry.products.push(product);
    }

    if (
      row.componentKey &&
      row.componentValueNumeric &&
      row.componentUnit &&
      !product.components.some((component) => component.componentKey === row.componentKey)
    ) {
      product.components.push({
        componentKey: row.componentKey,
        valueNumeric: normalizeNumericValue(row.componentValueNumeric),
        unit: row.componentUnit
      });
    }

    if (
      row.requirementKey &&
      row.requirementValue &&
      !product.requirements.some((requirement) => requirement.requirementKey === row.requirementKey)
    ) {
      product.requirements.push({
        requirementKey: row.requirementKey,
        requirementValue: row.requirementValue
      });
    }

    if (
      row.quarterKey &&
      row.bandKey &&
      row.startsAt &&
      row.endsAt &&
      !product.timeWindows.some(
        (window) =>
          window.quarterKey === row.quarterKey &&
          window.bandKey === row.bandKey &&
          window.startsAt === row.startsAt &&
          window.endsAt === row.endsAt
      )
    ) {
      product.timeWindows.push({
        quarterKey: row.quarterKey,
        bandKey: row.bandKey,
        startsAt: row.startsAt,
        endsAt: row.endsAt
      });
    }

    void productId;
  }

  return [...entries.values()].map((entry) => ({
    ...entry,
    products: entry.products
      .map((product) => ({
        ...product,
        components: [...product.components],
        requirements: [...product.requirements],
        timeWindows: [...product.timeWindows].sort(compareTimeWindows)
      }))
      .sort((left, right) => left.moduleKey.localeCompare(right.moduleKey, "de"))
  }));
}

export async function loadEndcustomerTariffCatalog() {
  if (
    shouldUseSeedEndcustomerTariffs({
      nodeEnv: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL
    })
  ) {
    return getSeedEndcustomerTariffCatalog();
  }

  const { db } = await import("../../db/client");
  const { operators, sourceCatalog, tariffComponents, tariffProducts, tariffRequirements, tariffTimeWindows } =
    await import("../../db/schema");

  const products = await db
    .select({
      productId: tariffProducts.id,
      operatorSlug: operators.slug,
      operatorName: operators.name,
      moduleKey: tariffProducts.moduleKey,
      networkLevel: tariffProducts.networkLevel,
      meteringMode: tariffProducts.meteringMode,
      validFrom: sql<string>`${tariffProducts.validFrom}::text`,
      sourceDocumentUrl: sql<string>`coalesce(${sourceCatalog.sourceUrl}, '')`,
      humanReviewStatus: tariffProducts.humanReviewStatus
    })
    .from(tariffProducts)
    .innerJoin(operators, eq(tariffProducts.operatorId, operators.id))
    .leftJoin(sourceCatalog, eq(tariffProducts.sourceCatalogId, sourceCatalog.id))
    .orderBy(asc(operators.slug), asc(tariffProducts.moduleKey));

  if (products.length === 0) {
    return [];
  }

  const productIds = products.map((product) => product.productId);

  const [components, requirements, timeWindows] = await Promise.all([
    db
      .select({
        tariffProductId: tariffComponents.tariffProductId,
        componentKey: tariffComponents.componentKey,
        componentValueNumeric: sql<string>`${tariffComponents.valueNumeric}::text`,
        componentUnit: tariffComponents.unit
      })
      .from(tariffComponents)
      .where(inArray(tariffComponents.tariffProductId, productIds)),
    db
      .select({
        tariffProductId: tariffRequirements.tariffProductId,
        requirementKey: tariffRequirements.requirementKey,
        requirementValue: tariffRequirements.requirementValue
      })
      .from(tariffRequirements)
      .where(inArray(tariffRequirements.tariffProductId, productIds)),
    db
      .select({
        tariffProductId: tariffTimeWindows.tariffProductId,
        quarterKey: tariffTimeWindows.quarterKey,
        bandKey: tariffTimeWindows.bandKey,
        startsAt: tariffTimeWindows.startsAt,
        endsAt: tariffTimeWindows.endsAt
      })
      .from(tariffTimeWindows)
      .where(inArray(tariffTimeWindows.tariffProductId, productIds))
  ]);

  const componentsByProductId = new Map<string, typeof components>();
  for (const component of components) {
    const current = componentsByProductId.get(component.tariffProductId) ?? [];
    current.push(component);
    componentsByProductId.set(component.tariffProductId, current);
  }

  const requirementsByProductId = new Map<string, typeof requirements>();
  for (const requirement of requirements) {
    const current = requirementsByProductId.get(requirement.tariffProductId) ?? [];
    current.push(requirement);
    requirementsByProductId.set(requirement.tariffProductId, current);
  }

  const timeWindowsByProductId = new Map<string, typeof timeWindows>();
  for (const window of timeWindows) {
    const current = timeWindowsByProductId.get(window.tariffProductId) ?? [];
    current.push(window);
    timeWindowsByProductId.set(window.tariffProductId, current);
  }

  return buildEndcustomerTariffCatalog(
    products.flatMap((product) => {
      const productComponents = componentsByProductId.get(product.productId) ?? [null];
      const productRequirements = requirementsByProductId.get(product.productId) ?? [null];
      const productTimeWindows = timeWindowsByProductId.get(product.productId) ?? [null];
      const rowCount = Math.max(productComponents.length, productRequirements.length, productTimeWindows.length);

      return Array.from({ length: rowCount }, (_, index) => {
        const component = productComponents[index] ?? null;
        const requirement = productRequirements[index] ?? null;
        const window = productTimeWindows[index] ?? null;

        return {
          operatorSlug: product.operatorSlug,
          operatorName: product.operatorName,
          moduleKey: product.moduleKey as EndcustomerTariffCatalogProduct["moduleKey"],
          networkLevel: product.networkLevel as EndcustomerTariffCatalogProduct["networkLevel"],
          meteringMode: product.meteringMode as EndcustomerTariffCatalogProduct["meteringMode"],
          validFrom: product.validFrom,
          sourceDocumentUrl: product.sourceDocumentUrl,
          humanReviewStatus: product.humanReviewStatus,
          componentKey: component?.componentKey as EndcustomerTariffCatalogComponent["componentKey"] | null,
          componentValueNumeric: component?.componentValueNumeric ?? null,
          componentUnit: component?.componentUnit ?? null,
          requirementKey:
            (requirement?.requirementKey as EndcustomerTariffCatalogRequirement["requirementKey"] | null) ?? null,
          requirementValue: requirement?.requirementValue ?? null,
          quarterKey: (window?.quarterKey as EndcustomerTariffCatalogTimeWindow["quarterKey"] | null) ?? null,
          bandKey: (window?.bandKey as EndcustomerTariffCatalogTimeWindow["bandKey"] | null) ?? null,
          startsAt: window?.startsAt ?? null,
          endsAt: window?.endsAt ?? null
        };
      });
    })
  );
}

function mapReferenceToCatalogEntry(reference: EndcustomerOperatorReference): EndcustomerTariffCatalogEntry {
  return {
    operatorSlug: reference.operatorSlug,
    operatorName: "Stadtwerke Schwäbisch Hall GmbH",
    products: reference.products.map((product) => ({
      moduleKey: product.moduleKey,
      networkLevel: product.networkLevel,
      meteringMode: product.meteringMode,
      validFrom: product.validFrom,
      sourceDocumentUrl: product.sourceDocumentUrl,
      humanReviewStatus: "verified",
      components: product.components.map((component) => ({
        componentKey: component.componentKey,
        valueNumeric: normalizeNumericValue(component.valueNumeric),
        unit: component.unit
      })),
      requirements: product.requirements.map((requirement) => ({
        requirementKey: requirement.requirementKey,
        requirementValue: requirement.requirementValue
      })),
      timeWindows: [...product.timeWindows].sort(compareTimeWindows)
    })),
    meteringPrices: reference.meteringPrices.map((component) => ({
      componentKey: component.componentKey,
      valueNumeric: normalizeNumericValue(component.valueNumeric),
      unit: component.unit
    }))
  };
}

function normalizeNumericValue(value: string) {
  if (!/^-?\d+(?:\.\d+)?$/.test(value)) {
    return value;
  }

  const [integerPart, fractionalPart = ""] = value.split(".");
  if (fractionalPart.length === 0) {
    return `${integerPart}.00`;
  }

  const trimmed = fractionalPart.replace(/0+$/, "");
  if (trimmed.length === 0) {
    return `${integerPart}.00`;
  }

  return trimmed.length === 1 ? `${integerPart}.${trimmed}0` : `${integerPart}.${trimmed}`;
}

function compareTimeWindows(
  left: EndcustomerTariffCatalogTimeWindow,
  right: EndcustomerTariffCatalogTimeWindow
) {
  const quarterOrder = ["Q1", "Q2", "Q3", "Q4"];
  const bandOrder = ["low", "standard", "high"];

  const quarterComparison = quarterOrder.indexOf(left.quarterKey) - quarterOrder.indexOf(right.quarterKey);
  if (quarterComparison !== 0) {
    return quarterComparison;
  }

  const timeComparison = left.startsAt.localeCompare(right.startsAt, "de");
  if (timeComparison !== 0) {
    return timeComparison;
  }

  return bandOrder.indexOf(left.bandKey) - bandOrder.indexOf(right.bandKey);
}
