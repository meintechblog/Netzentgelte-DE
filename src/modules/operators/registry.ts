import { z } from "zod";

import operatorRegistrySeed from "../../../data/source-registry/operators.seed.json";

const reviewStatusSchema = z.union([z.literal("pending"), z.literal("verified")]);

const operatorBandSchema = z.object({
  key: z.union([z.literal("NT"), z.literal("ST"), z.literal("HT")]),
  label: z.string(),
  valueCtPerKwh: z.string(),
  sourceQuote: z.string()
});

const operatorTimeWindowSchema = z.object({
  id: z.string(),
  bandKey: z.union([z.literal("NT"), z.literal("ST"), z.literal("HT")]),
  label: z.string(),
  seasonLabel: z.string(),
  dayLabel: z.string(),
  timeRangeLabel: z.string(),
  sourceQuote: z.string()
});

const sourceDocumentSchema = z.object({
  id: z.string(),
  title: z.string(),
  documentType: z.union([z.literal("pdf"), z.literal("html"), z.literal("csv"), z.literal("json")]),
  sourcePageUrl: z.string().url(),
  documentUrl: z.string().url(),
  checkedAt: z.string(),
  validFrom: z.string(),
  reviewStatus: reviewStatusSchema,
  notes: z.array(z.string()).default([])
});

const currentTariffSchema = z.object({
  modelKey: z.literal("14a-model-3"),
  validFrom: z.string(),
  reviewStatus: reviewStatusSchema,
  sourceDocumentId: z.string(),
  sourcePageUrl: z.string().url(),
  documentUrl: z.string().url(),
  summaryFallback: z.string().optional(),
  bands: z.array(operatorBandSchema),
  timeWindows: z.array(operatorTimeWindowSchema).default([])
});

const operatorRegistryEntrySchema = z.object({
  slug: z.string(),
  name: z.string(),
  regionLabel: z.string(),
  websiteUrl: z.string().url(),
  registrySourceIds: z.array(z.string()),
  sourceDocuments: z.array(sourceDocumentSchema),
  currentTariff: currentTariffSchema
}).superRefine((entry, context) => {
  const sourceDocument = entry.sourceDocuments.find(
    (document) => document.id === entry.currentTariff.sourceDocumentId
  );

  if (!sourceDocument) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Current tariff references unknown source document ${entry.currentTariff.sourceDocumentId}.`,
      path: ["currentTariff", "sourceDocumentId"]
    });
    return;
  }

  if (sourceDocument.sourcePageUrl !== entry.currentTariff.sourcePageUrl) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Current tariff source page does not match the referenced source document.",
      path: ["currentTariff", "sourcePageUrl"]
    });
  }

  if (sourceDocument.documentUrl !== entry.currentTariff.documentUrl) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Current tariff document URL does not match the referenced source document.",
      path: ["currentTariff", "documentUrl"]
    });
  }
});

const operatorRegistrySchema = z.array(operatorRegistryEntrySchema);

export type OperatorBand = z.infer<typeof operatorBandSchema>;
export type OperatorTimeWindow = z.infer<typeof operatorTimeWindowSchema>;
export type OperatorSourceDocument = z.infer<typeof sourceDocumentSchema>;
export type OperatorRegistryEntry = z.infer<typeof operatorRegistryEntrySchema>;

export function parseOperatorRegistry(input: unknown) {
  return operatorRegistrySchema.parse(input);
}

const parsedRegistry = parseOperatorRegistry(operatorRegistrySeed);

export function getOperatorRegistry(): OperatorRegistryEntry[] {
  return parsedRegistry;
}

export function getOperatorRegistryStats() {
  const operators = getOperatorRegistry();
  const verifiedCount = operators.filter(
    (entry) => entry.currentTariff.reviewStatus === "verified"
  ).length;
  const sourceDocumentCount = operators.reduce(
    (count, entry) => count + entry.sourceDocuments.length,
    0
  );

  return {
    operatorCount: operators.length,
    sourceDocumentCount,
    verifiedCount
  };
}

export function formatBandSummary(entry: OperatorRegistryEntry) {
  if (entry.currentTariff.bands.length === 0) {
    return entry.currentTariff.summaryFallback ?? "Quelle erfasst, Parsing ausstehend";
  }

  return entry.currentTariff.bands
    .map((band) => `${band.key} ${band.valueCtPerKwh} ct/kWh`)
    .join(" · ");
}
