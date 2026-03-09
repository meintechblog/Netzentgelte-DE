import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { getOperatorRegistry } from "../../src/modules/operators/registry";
import { getOperatorShellRegistry } from "../../src/modules/operators/shell-registry";
import {
  buildShellCandidatesFromVnbdigital,
  parseVnbdigitalOperatorIndexResponse
} from "../../src/modules/operators/vnbdigital-shells";

const directoryName = path.dirname(fileURLToPath(import.meta.url));
const seedFilePath = path.resolve(directoryName, "../../data/source-registry/operator-shells.seed.json");

const query = `
  query {
    vnb_vnbs {
      _id
      name
      website
      postcode
      city
      address
      types
      publicRequired
      layerUrl
      bbox
    }
  }
`;

const response = await fetch("https://www.vnbdigital.de/gateway/graphql", {
  method: "POST",
  headers: {
    "content-type": "application/json"
  },
  body: JSON.stringify({
    query
  })
});

if (!response.ok) {
  throw new Error(`VNBdigital request failed with ${response.status} ${response.statusText}.`);
}

const responseBody = await response.json();
const vnbdigitalOperators = parseVnbdigitalOperatorIndexResponse(responseBody);
const mergedShells = buildShellCandidatesFromVnbdigital({
  vnbdigitalOperators,
  existingShells: getOperatorShellRegistry(),
  publishedOperators: getOperatorRegistry()
});

await writeFile(seedFilePath, `${JSON.stringify(mergedShells, null, 2)}\n`, "utf8");

const verifiedCount = mergedShells.filter((entry) => entry.reviewStatus === "verified").length;
const exactCoverageCount = mergedShells.filter((entry) => entry.coverageStatus === "exact").length;
const sourceFoundCount = mergedShells.filter((entry) => entry.sourceStatus !== "missing").length;

console.log(
  JSON.stringify(
    {
      status: "ok",
      summary: {
        operatorCount: mergedShells.length,
        verifiedCount,
        exactCoverageCount,
        sourceFoundCount
      },
      outputFile: seedFilePath
    },
    null,
    2
  )
);
