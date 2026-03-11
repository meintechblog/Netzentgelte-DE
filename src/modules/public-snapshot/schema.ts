import { z } from "zod";

import type { ProjectedGermanyMapScene } from "../../lib/maps/geojson";
import type { ComplianceRuleSetDisplay, TariffTableRow } from "../../lib/view-models/tariffs";
import type { PendingOperatorCatalog } from "../operators/pending-catalog";
import type { CurrentSource } from "../sources/current-sources";

const publicSnapshotSchema = z.object({
  generatedAt: z.string().datetime({ offset: true }),
  operatorCount: z.number().int().nonnegative(),
  operators: z.array(z.custom<TariffTableRow>()),
  pendingOperators: z.custom<PendingOperatorCatalog>(),
  map: z.custom<ProjectedGermanyMapScene>(),
  sources: z.array(z.custom<CurrentSource>()),
  compliance: z.custom<ComplianceRuleSetDisplay>()
});

export type PublicSnapshot = {
  generatedAt: string;
  operatorCount: number;
  operators: TariffTableRow[];
  pendingOperators: PendingOperatorCatalog;
  map: ProjectedGermanyMapScene;
  sources: CurrentSource[];
  compliance: ComplianceRuleSetDisplay;
};

export function parsePublicSnapshot(input: unknown): PublicSnapshot {
  return publicSnapshotSchema.parse(input) as PublicSnapshot;
}
