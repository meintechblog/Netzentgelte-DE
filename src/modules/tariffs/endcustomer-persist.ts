import type { EndcustomerOperatorReference } from "./endcustomer-reference";

export type EndcustomerPersistencePayload = {
  operatorId: string;
  sourceCatalogId: string | null;
  products: Array<{
    moduleKey: string;
    networkLevel: string;
    meteringMode: string;
    validFrom: string;
    sourceDocumentUrl: string;
    humanReviewStatus: string;
  }>;
  components: Array<{
    moduleKey: string;
    componentKey: string;
    valueNumeric: string;
    unit: string;
  }>;
  meteringPrices: Array<{
    componentKey: string;
    valueNumeric: string;
    unit: string;
    validFrom: string;
  }>;
  requirements: Array<{
    moduleKey: string;
    requirementKey: string;
    requirementValue: string;
  }>;
  timeWindows: Array<{
    moduleKey: string;
    quarterKey: string;
    bandKey: string;
    startsAt: string;
    endsAt: string;
  }>;
};

export type EndcustomerPersistenceSummary = {
  operatorSlug: string;
  productCount: number;
  componentCount: number;
  meteringPriceCount: number;
  requirementCount: number;
  timeWindowCount: number;
};

export type EndcustomerPersistenceGateway = {
  replaceOperatorProducts: (operatorSlug: string, payload: EndcustomerPersistencePayload) => Promise<void>;
  insertRun: (input: {
    runType: string;
    status: "success" | "failed";
    summary: EndcustomerPersistenceSummary;
  }) => Promise<void>;
};

export function buildEndcustomerPersistencePayload(input: {
  operatorSlug: string;
  operatorId: string;
  sourceCatalogId: string | null;
  reference: EndcustomerOperatorReference;
}): EndcustomerPersistencePayload {
  return {
    operatorId: input.operatorId,
    sourceCatalogId: input.sourceCatalogId,
    products: input.reference.products.map((product) => ({
      moduleKey: product.moduleKey,
      networkLevel: product.networkLevel,
      meteringMode: product.meteringMode,
      validFrom: product.validFrom,
      sourceDocumentUrl: product.sourceDocumentUrl,
      humanReviewStatus: "verified"
    })),
    components: input.reference.products.flatMap((product) =>
      product.components.map((component) => ({
        moduleKey: product.moduleKey,
        componentKey: component.componentKey,
        valueNumeric: component.valueNumeric,
        unit: component.unit
      }))
    ),
    meteringPrices: input.reference.meteringPrices.map((component) => ({
      componentKey: component.componentKey,
      valueNumeric: component.valueNumeric,
      unit: component.unit,
      validFrom: input.reference.products[0]?.validFrom ?? "2026-01-01"
    })),
    requirements: input.reference.products.flatMap((product) =>
      product.requirements.map((requirement) => ({
        moduleKey: product.moduleKey,
        requirementKey: requirement.requirementKey,
        requirementValue: requirement.requirementValue
      }))
    ),
    timeWindows: input.reference.products.flatMap((product) =>
      product.timeWindows.map((window) => ({
        moduleKey: product.moduleKey,
        quarterKey: window.quarterKey,
        bandKey: window.bandKey,
        startsAt: window.startsAt,
        endsAt: window.endsAt
      }))
    )
  };
}

export async function persistEndcustomerReference(input: {
  gateway: EndcustomerPersistenceGateway;
  operatorSlug: string;
  payload: EndcustomerPersistencePayload;
}) {
  const summary: EndcustomerPersistenceSummary = {
    operatorSlug: input.operatorSlug,
    productCount: input.payload.products.length,
    componentCount: input.payload.components.length,
    meteringPriceCount: input.payload.meteringPrices.length,
    requirementCount: input.payload.requirements.length,
    timeWindowCount: input.payload.timeWindows.length
  };

  await input.gateway.replaceOperatorProducts(input.operatorSlug, input.payload);
  await input.gateway.insertRun({
    runType: "endcustomer-reference-import",
    status: "success",
    summary
  });

  return summary;
}
