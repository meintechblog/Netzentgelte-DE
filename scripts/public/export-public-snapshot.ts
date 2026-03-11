import { resolve } from "node:path";

import { getActiveModul3RuleSet } from "../../src/modules/compliance/rule-catalog";
import { loadPublishedOperatorSnapshot } from "../../src/modules/operators/current-catalog";
import { loadCurrentSources } from "../../src/modules/sources/current-sources";
import { loadEndcustomerTariffCatalog } from "../../src/modules/tariffs/endcustomer-catalog";
import { buildPublicSnapshot } from "../../src/modules/public-snapshot/build-public-snapshot";
import { writePublicSnapshotFiles } from "../../src/modules/public-snapshot/export-public-snapshot";

async function main() {
  const outputRoot = resolve(process.cwd(), "public");
  const [publishedOperatorSnapshot, currentSources, endcustomerCatalog] = await Promise.all([
    loadPublishedOperatorSnapshot(),
    loadCurrentSources(),
    loadEndcustomerTariffCatalog()
  ]);

  const snapshot = buildPublicSnapshot({
    publishedOperatorSnapshot,
    currentSources,
    endcustomerCatalog,
    complianceRuleSet: getActiveModul3RuleSet()
  });

  const result = await writePublicSnapshotFiles({
    outputRoot,
    snapshot
  });

  process.stdout.write(
    `${JSON.stringify(
      {
        generatedAt: snapshot.generatedAt,
        operatorCount: snapshot.operatorCount,
        snapshotPath: result.snapshotPath,
        metaPath: result.metaPath
      },
      null,
      2
    )}\n`
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
