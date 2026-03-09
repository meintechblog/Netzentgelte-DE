import { and, eq, inArray } from "drizzle-orm";

import { createCliDb } from "../../src/db/cli-client";
import {
  ingestRuns,
  operators,
  sourceCatalog,
  tariffComponents,
  tariffMeteringPrices,
  tariffProducts,
  tariffRequirements,
  tariffTimeWindows
} from "../../src/db/schema";
import { getStadtwerkeSchwaebischHallEndcustomerReference } from "../../src/modules/tariffs/endcustomer-reference";
import {
  buildEndcustomerPersistencePayload,
  persistEndcustomerReference
} from "../../src/modules/tariffs/endcustomer-persist";

async function main() {
  const { db, sql } = createCliDb();
  const operatorSlug = "stadtwerke-schwaebisch-hall";
  const reference = getStadtwerkeSchwaebischHallEndcustomerReference();

  try {
    const operator = await db.query.operators.findFirst({
      where: eq(operators.slug, operatorSlug)
    });

    if (!operator) {
      throw new Error(`Operator ${operatorSlug} not found.`);
    }

    const source = await db.query.sourceCatalog.findFirst({
      where: and(eq(sourceCatalog.operatorId, operator.id), eq(sourceCatalog.sourceUrl, reference.sourceDocumentUrl))
    });

    const payload = buildEndcustomerPersistencePayload({
      operatorSlug,
      operatorId: operator.id,
      sourceCatalogId: source?.id ?? null,
      reference
    });

    const summary = await persistEndcustomerReference({
      operatorSlug,
      payload,
      gateway: {
        replaceOperatorProducts: async (_operatorSlug, persistencePayload) => {
          await db.transaction(async (tx) => {
            const existingProducts = await tx
              .select({ id: tariffProducts.id })
              .from(tariffProducts)
              .where(eq(tariffProducts.operatorId, persistencePayload.operatorId));

            const existingProductIds = existingProducts.map((product) => product.id);

            if (existingProductIds.length > 0) {
              await tx.delete(tariffComponents).where(inArray(tariffComponents.tariffProductId, existingProductIds));
              await tx
                .delete(tariffRequirements)
                .where(inArray(tariffRequirements.tariffProductId, existingProductIds));
              await tx
                .delete(tariffTimeWindows)
                .where(inArray(tariffTimeWindows.tariffProductId, existingProductIds));
              await tx.delete(tariffProducts).where(eq(tariffProducts.operatorId, persistencePayload.operatorId));
            }

            await tx.delete(tariffMeteringPrices).where(eq(tariffMeteringPrices.operatorId, persistencePayload.operatorId));

            const insertedProducts = await tx
              .insert(tariffProducts)
              .values(
                persistencePayload.products.map((product) => ({
                  operatorId: persistencePayload.operatorId,
                  sourceCatalogId: persistencePayload.sourceCatalogId,
                  networkLevel: product.networkLevel,
                  moduleKey: product.moduleKey,
                  meteringMode: product.meteringMode,
                  validFrom: product.validFrom,
                  humanReviewStatus: product.humanReviewStatus,
                  sourceQuote: product.sourceDocumentUrl
                }))
              )
              .returning({
                id: tariffProducts.id,
                moduleKey: tariffProducts.moduleKey
              });

            const productIdsByModuleKey = new Map(insertedProducts.map((product) => [product.moduleKey, product.id]));

            await tx.insert(tariffComponents).values(
              persistencePayload.components.map((component) => ({
                tariffProductId: mustGetProductId(productIdsByModuleKey, component.moduleKey),
                componentKey: component.componentKey,
                valueNumeric: component.valueNumeric,
                unit: component.unit
              }))
            );

            await tx.insert(tariffRequirements).values(
              persistencePayload.requirements.map((requirement) => ({
                tariffProductId: mustGetProductId(productIdsByModuleKey, requirement.moduleKey),
                requirementKey: requirement.requirementKey,
                requirementValue: requirement.requirementValue
              }))
            );

            await tx.insert(tariffTimeWindows).values(
              persistencePayload.timeWindows.map((window) => ({
                tariffProductId: mustGetProductId(productIdsByModuleKey, window.moduleKey),
                quarterKey: window.quarterKey,
                bandKey: window.bandKey,
                startsAt: window.startsAt,
                endsAt: window.endsAt
              }))
            );

            if (persistencePayload.meteringPrices.length > 0) {
              await tx.insert(tariffMeteringPrices).values(
                persistencePayload.meteringPrices.map((price) => ({
                  operatorId: persistencePayload.operatorId,
                  sourceCatalogId: persistencePayload.sourceCatalogId,
                  validFrom: price.validFrom,
                  componentKey: price.componentKey,
                  valueNumeric: price.valueNumeric,
                  unit: price.unit
                }))
              );
            }
          });
        },
        insertRun: async ({ runType, status, summary: runSummary }) => {
          await db.insert(ingestRuns).values({
            runType,
            status,
            summary: runSummary
          });
        }
      },
    });

    console.log(JSON.stringify(summary, null, 2));
  } finally {
    await sql.end();
  }
}

function mustGetProductId(productIdsByModuleKey: Map<string, string>, moduleKey: string) {
  const productId = productIdsByModuleKey.get(moduleKey);

  if (!productId) {
    throw new Error(`Missing inserted tariff product for ${moduleKey}.`);
  }

  return productId;
}

void main();
