import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { getSeedPublishedOperators } from "../modules/operators/current-catalog";
import { getSeedEndcustomerTariffCatalog } from "../modules/tariffs/endcustomer-catalog";
import { getRegistryTariffRows, mergeTariffRowsWithEndcustomerCatalog } from "../lib/view-models/tariffs";
import { TariffTable } from "./tariff-table";

describe("TariffTable", () => {
  test("renders a quarterly tariff matrix anchored on the Schwäbisch Hall source layout", () => {
    const schwaebischHall = mergeTariffRowsWithEndcustomerCatalog(
      getRegistryTariffRows(getSeedPublishedOperators()),
      getSeedEndcustomerTariffCatalog()
    ).find(
      (row) => row.operatorSlug === "stadtwerke-schwaebisch-hall"
    );

    render(<TariffTable rows={[schwaebischHall!]} />);

    expect(screen.getByText("Stadtwerke Schwäbisch Hall GmbH")).toBeInTheDocument();
    expect(screen.getByText("Schwäbisch Hall")).toBeInTheDocument();
    expect(screen.queryByText("NT 1.11 ct/kWh · ST 5.53 ct/kWh · HT 8.14 ct/kWh")).not.toBeInTheDocument();
    const bandBadges = within(screen.getByLabelText("Arbeitspreise in ct/kWh"));
    expect(bandBadges.getByText("NT")).toBeInTheDocument();
    expect(bandBadges.getByText("ST")).toBeInTheDocument();
    expect(bandBadges.getByText("HT")).toBeInTheDocument();
    expect(bandBadges.getByText("1.11")).toBeInTheDocument();
    expect(bandBadges.getByText("5.53")).toBeInTheDocument();
    expect(bandBadges.getByText("8.14")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Quellseite" })).toHaveAttribute(
      "href",
      "https://stadtwerke-hall.de/tarife-angebote/service/downloadcenter/netze"
    );
    expect(screen.getByText(/Zuletzt geprüft 2026-03-09/)).toBeInTheDocument();
    expect(screen.getByText("Quelle & Prüfstatus anzeigen")).toBeInTheDocument();
    expect(screen.queryByText("Gespeicherte Quellseite")).not.toBeInTheDocument();
    expect(screen.getByText("Q1")).toBeInTheDocument();
    expect(screen.getByText("Q2")).toBeInTheDocument();
    expect(screen.getByText("Q3")).toBeInTheDocument();
    expect(screen.getByText("Q4")).toBeInTheDocument();
    expect(screen.getByText("Endkunden · Niederspannung")).toBeInTheDocument();
    expect(screen.getByText("Modul 1")).toBeInTheDocument();
    expect(screen.getByText("Modul 2")).toBeInTheDocument();
    expect(screen.getByText("Modul 3")).toBeInTheDocument();
    expect(screen.getByText("Messung")).toBeInTheDocument();
    expect(screen.getByText("61,00 €/a")).toBeInTheDocument();
    expect(screen.getAllByText("5,53 ct/kWh").length).toBeGreaterThan(0);
    expect(screen.getByText("108,70 €/a")).toBeInTheDocument();
    expect(screen.getByText("9,50 €/a")).toBeInTheDocument();
    expect(screen.getByText("14,75 €/a")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Netzbetreiber" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Q1" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Q2" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Q3" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Q4" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Review" })).toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Quelle" })).not.toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Gültig ab" })).not.toBeInTheDocument();
    expect(screen.getByText("Nur Standardtarif")).toBeInTheDocument();
    expect(screen.getByText("00:00-24:00")).toBeInTheDocument();
    expect(screen.getAllByText("10:00-14:00")).toHaveLength(3);
    expect(screen.getAllByText("22:00-00:00")).toHaveLength(3);
    const q1Section = screen.getByLabelText("Stadtwerke Schwäbisch Hall GmbH Q1");
    const q1Times = within(q1Section).getAllByRole("listitem").map((item) => item.textContent);
    expect(q1Times).toEqual([
      "00:00-07:00NT1.11",
      "07:00-10:00ST5.53",
      "10:00-14:00HT8.14",
      "14:00-18:00ST5.53",
      "18:00-20:00HT8.14",
      "20:00-22:00ST5.53",
      "22:00-00:00NT1.11"
    ]);
    expect(
      screen.getByText(/Quelle stadtwerke-schwaebisch-hall-stadtwerke-schwaebisch-hall-14a-2026/)
    ).toBeInTheDocument();
  });

  test("shows exact snapshot and artifact details when the source panel is expanded", () => {
    const schwaebischHall = {
      ...mergeTariffRowsWithEndcustomerCatalog(
        getRegistryTariffRows(getSeedPublishedOperators()),
        getSeedEndcustomerTariffCatalog()
      ).find((row) => row.operatorSlug === "stadtwerke-schwaebisch-hall")!,
      latestPageSnapshotFetchedAt: "2026-03-09T11:00:00.000Z",
      latestPageSnapshotHash: "page-hash-123",
      pageArtifactApiUrl: "/api/artifacts/page.html",
      latestDocumentSnapshotFetchedAt: "2026-03-09T12:00:00.000Z",
      latestDocumentSnapshotHash: "doc-hash-456",
      documentArtifactApiUrl: "/api/artifacts/doc.pdf",
      sourceHealthReport: {
        status: "warning" as const,
        issues: [
          {
            key: "snapshot_missing" as const,
            message: "Die Quelle wurde geprüft, aber es liegt noch kein Snapshot-Artefakt vor."
          }
        ]
      }
    };

    render(<TariffTable rows={[schwaebischHall]} />);

    fireEvent.click(screen.getByRole("button", { name: "Quelle & Prüfstatus anzeigen" }));

    expect(screen.getByText("Seiten-Snapshot 2026-03-09")).toBeInTheDocument();
    expect(screen.getByText("Dokumenten-Snapshot 2026-03-09")).toBeInTheDocument();
    expect(screen.getByText("Seite Hash page-hash-123")).toBeInTheDocument();
    expect(screen.getByText("Dokument Hash doc-hash-456")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Gespeicherte Quellseite" })).toHaveAttribute(
      "href",
      "/api/artifacts/page.html"
    );
    expect(screen.getByRole("link", { name: "Gespeichertes Dokument" })).toHaveAttribute(
      "href",
      "/api/artifacts/doc.pdf"
    );
  });
});
