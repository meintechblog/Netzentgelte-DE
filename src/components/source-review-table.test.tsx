import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { SourceReviewTable } from "./source-review-table";

describe("SourceReviewTable", () => {
  test("renders review links for source page, external document and stored artifact", () => {
    render(
      <SourceReviewTable
        rows={[
          {
            sourceSlug: "netze-bw-netze-bw-14a-2026",
            operatorName: "Netze BW GmbH",
            operatorSlug: "netze-bw",
            checkedAt: "2026-03-09",
            latestSnapshotFetchedAt: "2026-03-09T01:23:00.000Z",
            latestSnapshotHash: "abc123",
            pageUrl: "https://www.netze-bw.de/neuregelung-14a-enwg",
            documentUrl:
              "https://assets.ctfassets.net/xytfb1vrn7of/7eQvxehZzn3ECbR9rALmyD/ecc795b9dcd666ce1f53d9d04362a321/netzentgelte-strom-netze-bw-gmbh-2026.pdf",
            artifactApiUrl:
              "/api/artifacts/netze-bw-netze-bw-14a-2026/2026-03-09/netzentgelte-strom-netze-bw-gmbh-2026.pdf",
            reviewStatus: "verified"
          }
        ]}
      />
    );

    expect(screen.getByText("Netze BW GmbH")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Gespeichertes Artefakt" })).toHaveAttribute(
      "href",
      "/api/artifacts/netze-bw-netze-bw-14a-2026/2026-03-09/netzentgelte-strom-netze-bw-gmbh-2026.pdf"
    );
    expect(screen.getByText(/Hash abc123/)).toBeInTheDocument();
  });
});
