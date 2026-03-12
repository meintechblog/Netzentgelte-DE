import { render, screen, within } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";

vi.mock("../../../lib/public-snapshot-loader", () => ({
  loadPublicSnapshotFromDisk: vi.fn()
}));

vi.mock("../../../modules/operators/pending-catalog", () => ({
  loadPendingOperatorCatalog: vi.fn()
}));

import PendingOperatorsPage from "./page";
import { loadPublicSnapshotFromDisk } from "../../../lib/public-snapshot-loader";
import { loadPendingOperatorCatalog } from "../../../modules/operators/pending-catalog";

beforeEach(() => {
  vi.resetAllMocks();
});

test("renders the public pending operator page with minimal review rows", async () => {
  vi.mocked(loadPublicSnapshotFromDisk).mockResolvedValue({
    pendingOperators: {
      summary: {
        operatorCount: 1,
        sourceFoundCount: 1,
        tariffReadyCount: 1
      },
      items: [
        {
          slug: "mainnetz",
          name: "Mainnetz GmbH",
          regionLabel: "Wuerzburg",
          sourceSlug: "mainnetz-pending",
          reviewStatus: "pending",
          sourceStatus: "source-found",
          tariffStatus: "partial",
          checkedAt: "2026-03-11",
          publicationStatus: "pending",
          statusSummary: "Quelle geprüft, Tarifdaten noch unvollständig.",
          missingInformation: ["Verifiziertes Niederspannungsprodukt fehlt"],
          hasVerifiedLowVoltageProduct: false
        }
      ]
    }
  } as never);

  render(await PendingOperatorsPage());

  expect(screen.getByRole("heading", { name: "Netzbetreiber in Prüfung" })).toBeInTheDocument();
  expect(
    screen.getByText(/Die Hauptseite zeigt sie inzwischen ebenfalls transparent an/i)
  ).toBeInTheDocument();
  expect(screen.getByText(/Mainnetz GmbH/i)).toBeInTheDocument();
  expect(screen.queryByText(/Netze BW GmbH/i)).not.toBeInTheDocument();

  const table = screen.getByRole("table", { name: "Netzbetreiber in Prüfung" });
  expect(within(table).getAllByText("Quelle gefunden").length).toBeGreaterThan(0);
  expect(within(table).getAllByText("Tarifprüfung läuft").length).toBeGreaterThan(0);
  expect(screen.getByRole("link", { name: "Pending-Daten prüfen" })).toHaveAttribute(
    "href",
    "/data/netzentgelte/pending-operators.json"
  );
});

test("keeps the live pending API link when no exported public snapshot exists", async () => {
  vi.mocked(loadPublicSnapshotFromDisk).mockResolvedValue(null);
  vi.mocked(loadPendingOperatorCatalog).mockResolvedValue({
    summary: {
      operatorCount: 1,
      sourceFoundCount: 1,
      tariffReadyCount: 0
    },
    items: [
      {
        slug: "mainnetz",
        name: "Mainnetz GmbH",
        regionLabel: "Wuerzburg",
        sourceSlug: "mainnetz-pending",
        reviewStatus: "pending",
        sourceStatus: "source-found",
        tariffStatus: "missing",
        checkedAt: "2026-03-11",
        publicationStatus: "missing-data",
        statusSummary: "Quelle geprüft, Dokument fehlt.",
        missingInformation: ["Offizielles 2026-Dokument fehlt"],
        hasVerifiedLowVoltageProduct: false
      }
    ]
  });

  render(await PendingOperatorsPage());

  expect(screen.getByRole("link", { name: "Pending-Daten prüfen" })).toHaveAttribute(
    "href",
    "/api/operators/pending"
  );
});
