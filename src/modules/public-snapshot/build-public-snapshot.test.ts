import { describe, expect, test } from "vitest";

import { getRegistryMapFeatures, projectGermanyMap } from "../../lib/maps/geojson";
import {
  getComplianceRuleSetDisplay,
  getRegistryTariffRows,
  mergeTariffRowsWithCurrentSources,
  mergeTariffRowsWithEndcustomerCatalog
} from "../../lib/view-models/tariffs";
import { getActiveModul3RuleSet } from "../compliance/rule-catalog";
import { buildPublishedOperatorSnapshot, getSeedPublishedOperators } from "../operators/current-catalog";
import { getSeedCurrentSources } from "../sources/current-sources";
import { getSeedEndcustomerTariffCatalog } from "../tariffs/endcustomer-catalog";

import { buildPublicSnapshot } from "./build-public-snapshot";

describe("buildPublicSnapshot", () => {
  test("composes published operators, map data, sources, compliance and endcustomer data into one public payload", () => {
    const publishedOperatorSnapshot = buildPublishedOperatorSnapshot(getSeedPublishedOperators());
    const currentSources = getSeedCurrentSources();
    const endcustomerCatalog = getSeedEndcustomerTariffCatalog();
    const complianceRuleSet = getActiveModul3RuleSet();

    const snapshot = buildPublicSnapshot({
      generatedAt: "2026-03-10T18:00:00.000Z",
      publishedOperatorSnapshot,
      currentSources,
      endcustomerCatalog,
      complianceRuleSet
    });

    const expectedRows = mergeTariffRowsWithCurrentSources(
      mergeTariffRowsWithEndcustomerCatalog(
        getRegistryTariffRows(publishedOperatorSnapshot.operators),
        endcustomerCatalog
      ),
      currentSources.filter((source) =>
        new Set(publishedOperatorSnapshot.operators.map((operator) => operator.slug)).has(source.operatorSlug)
      )
    );

    expect(snapshot).toMatchObject({
      generatedAt: "2026-03-10T18:00:00.000Z",
      operatorCount: publishedOperatorSnapshot.operators.length,
      operators: expectedRows,
      map: projectGermanyMap(getRegistryMapFeatures(publishedOperatorSnapshot.operators)),
      sources: currentSources.filter((source) =>
        new Set(publishedOperatorSnapshot.operators.map((operator) => operator.slug)).has(source.operatorSlug)
      ),
      compliance: getComplianceRuleSetDisplay(complianceRuleSet)
    });

    expect(snapshot.operators.some((row) => row.endcustomerDisplay?.title === "Endkunden · Niederspannung")).toBe(
      true
    );
    expect(
      snapshot.operators.every(
        (row) => row.pageArtifactApiUrl === null && row.documentArtifactApiUrl === null
      )
    ).toBe(true);
    expect(
      snapshot.sources.every(
        (source) => source.pageArtifactApiUrl === null && source.documentArtifactApiUrl === null
      )
    ).toBe(true);
  });
});
