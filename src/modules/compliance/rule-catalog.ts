import { z } from "zod";

import ruleSetSeed from "../../../data/compliance/modul-3-rules.json";

const bandKeySchema = z.union([z.literal("NT"), z.literal("ST"), z.literal("HT")]);

const ruleParameterSchema = z.record(z.string(), z.unknown());

const complianceRuleSchema = z.object({
  ruleId: z.string(),
  title: z.string(),
  description: z.string(),
  scope: z.string(),
  severity: z.union([z.literal("low"), z.literal("medium"), z.literal("high")]),
  sourceCitation: z.string(),
  checkType: z.union([
    z.literal("min_window_duration_by_band"),
    z.literal("max_ratio_between_bands"),
    z.literal("band_ratio_range"),
    z.literal("min_active_quarters_for_bands"),
    z.literal("consistent_windows_across_active_quarters"),
    z.literal("full_day_coverage_in_active_quarters")
  ]),
  parameters: ruleParameterSchema
});

const complianceRuleSetSchema = z.object({
  ruleSetId: z.string(),
  title: z.string(),
  version: z.string(),
  sourceDocumentUrl: z.string().url(),
  sourceDocumentLabel: z.string(),
  effectiveFrom: z.string(),
  rules: z.array(complianceRuleSchema)
});

export type ComplianceBandKey = z.infer<typeof bandKeySchema>;
export type ComplianceRule = z.infer<typeof complianceRuleSchema>;
export type ComplianceRuleSet = z.infer<typeof complianceRuleSetSchema>;

const parsedRuleSet = complianceRuleSetSchema.parse(ruleSetSeed);

export function getActiveModul3RuleSet(): ComplianceRuleSet {
  return parsedRuleSet;
}

export function isComplianceBandKey(value: string): value is ComplianceBandKey {
  return bandKeySchema.safeParse(value).success;
}
