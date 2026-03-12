import { getRegistryMapFeatures, projectGermanyMap } from "../../lib/maps/geojson";
import {
  getComplianceRuleSetDisplay,
  getPendingTariffRows,
  getRegistryTariffRows,
  mergeTariffRowsWithCurrentSources,
  mergeTariffRowsWithEndcustomerCatalog
} from "../../lib/view-models/tariffs";
import type { ComplianceRuleSet } from "../compliance/rule-catalog";
import type { PublishedOperatorSnapshot } from "../operators/current-catalog";
import type { PendingOperatorCatalog } from "../operators/pending-catalog";
import type { CurrentSource } from "../sources/current-sources";
import type { EndcustomerTariffCatalogEntry } from "../tariffs/endcustomer-catalog";

import { parsePublicSnapshot, type PublicSnapshot } from "./schema";

export type BuildPublicSnapshotInput = {
  generatedAt?: string;
  publishedOperatorSnapshot: PublishedOperatorSnapshot;
  pendingOperatorCatalog: PendingOperatorCatalog;
  currentSources: CurrentSource[];
  endcustomerCatalog: EndcustomerTariffCatalogEntry[];
  complianceRuleSet: ComplianceRuleSet;
};

export function buildPublicSnapshot(input: BuildPublicSnapshotInput): PublicSnapshot {
  const publishedOperatorSlugs = new Set(
    input.publishedOperatorSnapshot.operators.map((operator) => operator.slug)
  );
  const filteredSources = input.currentSources.filter((source) =>
    publishedOperatorSlugs.has(source.operatorSlug)
  );
  const publishedRows = mergeTariffRowsWithCurrentSources(
    mergeTariffRowsWithEndcustomerCatalog(
      getRegistryTariffRows(input.publishedOperatorSnapshot.operators),
      input.endcustomerCatalog
    ),
    filteredSources
  );
  const rows = [...publishedRows, ...getPendingTariffRows(input.pendingOperatorCatalog)];

  return parsePublicSnapshot({
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    operatorCount: rows.length,
    operators: rows.map((row) => ({
      ...row,
      pageArtifactApiUrl: null,
      documentArtifactApiUrl: null
    })),
    pendingOperators: input.pendingOperatorCatalog,
    map: projectGermanyMap(getRegistryMapFeatures(input.publishedOperatorSnapshot.operators)),
    sources: filteredSources.map((source) => ({
      ...source,
      pageArtifactApiUrl: null,
      documentArtifactApiUrl: null
    })),
    compliance: getComplianceRuleSetDisplay(input.complianceRuleSet)
  });
}
