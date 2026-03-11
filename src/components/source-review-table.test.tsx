import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { SourceReviewTable } from "./source-review-table";

describe("SourceReviewTable", () => {
  test("renders review links for source page, external document and both stored artifacts", () => {
    render(
      <SourceReviewTable
        rows={[
          {
            sourceSlug: "netze-bw-netze-bw-14a-2026",
            operatorName: "Netze BW GmbH",
            operatorSlug: "netze-bw",
            checkedAt: "2026-03-09",
            latestPageSnapshotFetchedAt: "2026-03-09T01:22:00.000Z",
            latestPageSnapshotHash: "page123",
            latestDocumentSnapshotFetchedAt: "2026-03-09T01:23:00.000Z",
            latestDocumentSnapshotHash: "doc123",
            pageUrl: "https://www.netze-bw.de/neuregelung-14a-enwg",
            documentUrl:
              "https://assets.ctfassets.net/xytfb1vrn7of/7eQvxehZzn3ECbR9rALmyD/ecc795b9dcd666ce1f53d9d04362a321/netzentgelte-strom-netze-bw-gmbh-2026.pdf",
            pageArtifactApiUrl: "/api/artifacts/netze-bw-netze-bw-14a-2026/2026-03-09/source-page.html",
            documentArtifactApiUrl:
              "/api/artifacts/netze-bw-netze-bw-14a-2026/2026-03-09/netzentgelte-strom-netze-bw-gmbh-2026.pdf",
            reviewStatus: "verified"
          }
        ]}
      />
    );

    expect(screen.getByText("Netze BW GmbH")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Gespeicherte Quellseite" })).toHaveAttribute(
      "href",
      "/api/artifacts/netze-bw-netze-bw-14a-2026/2026-03-09/source-page.html"
    );
    expect(screen.getByRole("link", { name: "Gespeichertes Dokument" })).toHaveAttribute(
      "href",
      "/api/artifacts/netze-bw-netze-bw-14a-2026/2026-03-09/netzentgelte-strom-netze-bw-gmbh-2026.pdf"
    );
    expect(screen.getByText(/Seite Hash page123/)).toBeInTheDocument();
    expect(screen.getByText(/Dokument Hash doc123/)).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Quellenprüfung" })).toBeInTheDocument();
  });
});
