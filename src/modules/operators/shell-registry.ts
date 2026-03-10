import { z } from "zod";

import operatorShellRegistrySeed from "../../../data/source-registry/operator-shells.seed.json";

const shellStatusSchema = z.union([
  z.literal("shell"),
  z.literal("profile-found"),
  z.literal("source-found"),
  z.literal("document-found"),
  z.literal("parsed"),
  z.literal("verified"),
  z.literal("published")
]);

const coverageStatusSchema = z.union([
  z.literal("unknown"),
  z.literal("hinted"),
  z.literal("exact")
]);

const sourceStatusSchema = z.union([
  z.literal("missing"),
  z.literal("candidate"),
  z.literal("source-found"),
  z.literal("reachable"),
  z.literal("snapshotted")
]);

const tariffStatusSchema = z.union([
  z.literal("missing"),
  z.literal("partial"),
  z.literal("parsed"),
  z.literal("verified")
]);

const reviewStatusSchema = z.union([z.literal("pending"), z.literal("verified")]);
const deprecatedStatusSchema = z.union([
  z.literal("active"),
  z.literal("disappearance-review"),
  z.literal("deprecated")
]);

const operatorShellRegistryEntrySchema = z.object({
  slug: z.string(),
  operatorName: z.string(),
  legalName: z.string().optional(),
  websiteUrl: z.string().url().optional(),
  regionLabel: z.string(),
  shellStatus: shellStatusSchema.default("shell"),
  coverageStatus: coverageStatusSchema.default("unknown"),
  sourceStatus: sourceStatusSchema.default("missing"),
  tariffStatus: tariffStatusSchema.default("missing"),
  reviewStatus: reviewStatusSchema.default("pending"),
  registryFeedSource: z.string().optional(),
  registryFeedLabel: z.string().optional(),
  lastSeenInRegistryFeed: z.string().optional(),
  deprecatedStatus: deprecatedStatusSchema.default("active"),
  deprecatedCheckedAt: z.string().optional(),
  deprecatedReason: z.string().optional(),
  mastrId: z.string().optional(),
  sourcePageUrl: z.string().url().optional(),
  documentUrl: z.string().url().optional(),
  notes: z.string().optional()
});

const operatorShellRegistrySchema = z.array(operatorShellRegistryEntrySchema).superRefine((entries, context) => {
  const seen = new Set<string>();

  for (const [index, entry] of entries.entries()) {
    if (seen.has(entry.slug)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Duplicate shell slug ${entry.slug}.`,
        path: [index, "slug"]
      });
      continue;
    }

    seen.add(entry.slug);
  }
});

export type OperatorShellRegistryEntry = z.infer<typeof operatorShellRegistryEntrySchema>;

export function parseOperatorShellRegistry(input: unknown) {
  return operatorShellRegistrySchema.parse(input);
}

const parsedOperatorShellRegistry = parseOperatorShellRegistry(operatorShellRegistrySeed);

export function getOperatorShellRegistry(): OperatorShellRegistryEntry[] {
  return parsedOperatorShellRegistry;
}

export function getOperatorShellRegistryStats() {
  const entries = getOperatorShellRegistry();

  return {
    operatorCount: entries.length,
    shellCount: entries.filter((entry) => entry.shellStatus === "shell").length,
    sourceFoundCount: entries.filter((entry) => entry.sourceStatus !== "missing").length,
    verifiedCount: entries.filter((entry) => entry.reviewStatus === "verified").length,
    exactCoverageCount: entries.filter((entry) => entry.coverageStatus === "exact").length,
    deprecatedCount: entries.filter((entry) => entry.deprecatedStatus === "deprecated").length
  };
}
