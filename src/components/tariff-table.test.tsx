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
    expect(bandBadges.getByText("NT").closest(".tariff-band-badge")).toHaveClass("tariff-band-badge--nt");
    expect(bandBadges.getByText("ST").closest(".tariff-band-badge")).toHaveClass("tariff-band-badge--st");
    expect(bandBadges.getByText("HT").closest(".tariff-band-badge")).toHaveClass("tariff-band-badge--ht");
    expect(bandBadges.getByText("1.11")).toBeInTheDocument();
    expect(bandBadges.getByText("5.53")).toBeInTheDocument();
    expect(bandBadges.getByText("8.14")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Quellseite" })).toHaveAttribute(
      "href",
      "https://stadtwerke-hall.de/tarife-angebote/service/downloadcenter/netze"
    );
    expect(screen.getByText(/Zuletzt geprüft 2026-03-09/)).toBeInTheDocument();
    expect(screen.queryByText("Quelle & Prüfstatus anzeigen")).not.toBeInTheDocument();
    expect(screen.queryByText("Prüfstatus: Geprüft")).not.toBeInTheDocument();
    expect(screen.queryByText("Sichtbarkeit: Veröffentlicht")).not.toBeInTheDocument();
    expect(screen.queryByText("Regelstatus: Regelkonform")).not.toBeInTheDocument();
    expect(screen.queryByText(/Quellenstatus:/)).not.toBeInTheDocument();
    expect(screen.queryByText("Gespeicherte Quellseite")).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText("Stadtwerke Schwäbisch Hall GmbH Veröffentlichungsstatus")
    ).not.toBeInTheDocument();
    const endcustomerToggle = screen.getByRole("button", {
      name: "Endkunden · Niederspannung verifiziertes Niederspannungsprodukt Bereich aufklappen"
    });
    expect(endcustomerToggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Modul 1")).not.toBeInTheDocument();
    fireEvent.click(endcustomerToggle);
    expect(endcustomerToggle).toHaveAttribute("aria-expanded", "true");
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
    expect(screen.queryByRole("columnheader", { name: "Review" })).not.toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Quelle" })).not.toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Gültig ab" })).not.toBeInTheDocument();
    expect(screen.getAllByText("Nur Standardtarif").length).toBeGreaterThan(0);
    const q1Section = screen.getByLabelText("Stadtwerke Schwäbisch Hall GmbH Q1");
    const q3Section = screen.getByLabelText("Stadtwerke Schwäbisch Hall GmbH Q3");
    expect(within(q1Section).getByText("Q1")).toBeInTheDocument();
    expect(within(q1Section).getByText("Tarifstufen aktiv")).toBeInTheDocument();
    expect(within(q3Section).getByText("Q3")).toBeInTheDocument();
    expect(within(q3Section).getByText("Nur Standardtarif")).toBeInTheDocument();
    expect(q1Section.querySelectorAll(".tariff-quarter-segment")).toHaveLength(7);
    expect(q3Section.querySelectorAll(".tariff-quarter-segment")).toHaveLength(1);
    expect(within(q1Section).getByText("00:00")).toBeInTheDocument();
    expect(within(q1Section).getByText("04:00")).toBeInTheDocument();
    expect(within(q1Section).getByText("08:00")).toBeInTheDocument();
    expect(within(q1Section).getByText("12:00")).toBeInTheDocument();
    expect(within(q1Section).getByText("16:00")).toBeInTheDocument();
    expect(within(q1Section).getByText("20:00")).toBeInTheDocument();
    expect(within(q1Section).getByText("24:00")).toBeInTheDocument();
    expect(
      within(q1Section).getByLabelText("Q1 10:00-14:00 · HT · 8.14 ct/kWh")
    ).toHaveClass("tariff-quarter-segment--ht");
    expect(
      within(q1Section).getByLabelText("Q1 22:00-24:00 · NT · 1.11 ct/kWh")
    ).toHaveClass("tariff-quarter-segment--nt");
    expect(
      within(q3Section).getByLabelText("Q3 00:00-24:00 · ST · 5.53 ct/kWh")
    ).toHaveClass("tariff-quarter-segment--st");
    expect(
      screen.getByText(/Quelle stadtwerke-schwaebisch-hall-stadtwerke-schwaebisch-hall-14a-2026/)
    ).toBeInTheDocument();
  });

  test("renders a dedicated mobile quarter stack inside the operator panel", () => {
    const schwaebischHall = mergeTariffRowsWithEndcustomerCatalog(
      getRegistryTariffRows(getSeedPublishedOperators()),
      getSeedEndcustomerTariffCatalog()
    ).find((row) => row.operatorSlug === "stadtwerke-schwaebisch-hall");

    const { container } = render(<TariffTable rows={[schwaebischHall!]} />);
    const mobileStack = container.querySelector(".tariff-quarter-mobile-stack");

    expect(mobileStack).not.toBeNull();
    expect(within(mobileStack as HTMLElement).getByLabelText("Stadtwerke Schwäbisch Hall GmbH Q1 mobil")).toBeInTheDocument();
    expect(within(mobileStack as HTMLElement).getByLabelText("Stadtwerke Schwäbisch Hall GmbH Q2 mobil")).toBeInTheDocument();
    expect(within(mobileStack as HTMLElement).getByLabelText("Stadtwerke Schwäbisch Hall GmbH Q3 mobil")).toBeInTheDocument();
    expect(within(mobileStack as HTMLElement).getByLabelText("Stadtwerke Schwäbisch Hall GmbH Q4 mobil")).toBeInTheDocument();
  });

  test("renders source review details inline without duplicating primary links", () => {
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

    expect(screen.queryByRole("button", { name: "Quelle & Prüfstatus anzeigen" })).not.toBeInTheDocument();
    expect(screen.queryByText("Prüfstatus: Geprüft")).not.toBeInTheDocument();
    expect(screen.queryByText("Sichtbarkeit: Veröffentlicht")).not.toBeInTheDocument();
    expect(screen.queryByText("Regelstatus: Regelkonform")).not.toBeInTheDocument();
    expect(screen.queryByText(/Quellenstatus:/)).not.toBeInTheDocument();
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
    expect(screen.getAllByRole("link", { name: "Quellseite" })).toHaveLength(1);
    expect(screen.getAllByRole("link", { name: "PDF / Dokument" })).toHaveLength(1);
    expect(screen.queryByText("Die Quelle wurde geprüft, aber es liegt noch kein Snapshot-Artefakt vor.")).not.toBeInTheDocument();
  });

  test("renders assumed ST quarters without inline time text and with explicit assumption messaging", () => {
    const mvv = mergeTariffRowsWithEndcustomerCatalog(
      getRegistryTariffRows(getSeedPublishedOperators()),
      getSeedEndcustomerTariffCatalog()
    ).find((row) => row.operatorSlug === "mvv-netze");

    render(<TariffTable rows={[mvv!]} />);

    const q2Section = screen.getByLabelText("MVV Netze GmbH Q2");

    expect(within(q2Section).getByText("Q2")).toBeInTheDocument();
    expect(within(q2Section).getByText("Quelle ohne Zeitfenster")).toBeInTheDocument();
    expect(
      within(q2Section).getByLabelText(
        "Q2 00:00-24:00 · ST · 4.32 ct/kWh · Verifizierte ST-Annahme, da im Originaldokument für dieses Quartal keine Zeitfenster veröffentlicht sind"
      )
    ).toHaveClass("tariff-quarter-segment--st-assumed");
    expect(q2Section.querySelector(".tariff-quarter-segment__time")).toBeNull();
  });

  test("renders the Albstadtwerke Q2 and Q3 reference case as assumed ST segments", () => {
    const albstadtwerke = mergeTariffRowsWithEndcustomerCatalog(
      getRegistryTariffRows(getSeedPublishedOperators()),
      getSeedEndcustomerTariffCatalog()
    ).find((row) => row.operatorSlug === "albstadtwerke");

    render(<TariffTable rows={[albstadtwerke!]} />);

    const q2Section = screen.getByLabelText("Albstadtwerke GmbH Q2");
    const q3Section = screen.getByLabelText("Albstadtwerke GmbH Q3");

    expect(within(q2Section).getByText("Quelle ohne Zeitfenster")).toBeInTheDocument();
    expect(within(q3Section).getByText("Quelle ohne Zeitfenster")).toBeInTheDocument();
    expect(
      within(q2Section).getByLabelText(
        "Q2 00:00-24:00 · ST · 6.54 ct/kWh · Verifizierte ST-Annahme, da im Originaldokument für dieses Quartal keine Zeitfenster veröffentlicht sind"
      )
    ).toHaveClass("tariff-quarter-segment--st-assumed");
    expect(
      within(q3Section).getByLabelText(
        "Q3 00:00-24:00 · ST · 6.54 ct/kWh · Verifizierte ST-Annahme, da im Originaldokument für dieses Quartal keine Zeitfenster veröffentlicht sind"
      )
    ).toHaveClass("tariff-quarter-segment--st-assumed");
  });

  test("renders concrete compliance violations for operators that break the BDEW Modul-3 rules", () => {
    const violatingOperator = mergeTariffRowsWithEndcustomerCatalog(
      getRegistryTariffRows(getSeedPublishedOperators()),
      getSeedEndcustomerTariffCatalog()
    ).find((row) => row.operatorSlug === "albwerk-und");

    render(<TariffTable rows={[violatingOperator!]} />);

    expect(screen.getByText("Regelstatus: Mit Verstößen")).toBeInTheDocument();
    const violationsPanel = screen.getByLabelText(/Albwerk GmbH & Co\. KG Regelverstöße/i);
    expect(within(violationsPanel).getByText("Abweichungen vom Regelwerk")).toBeInTheDocument();
    expect(within(violationsPanel).getAllByRole("listitem").length).toBeGreaterThan(0);
  });

  test("renders uncovered official quarter slots as empty segments for verified operators with violations", () => {
    const violatingOperator = mergeTariffRowsWithEndcustomerCatalog(
      getRegistryTariffRows(getSeedPublishedOperators()),
      getSeedEndcustomerTariffCatalog()
    ).find((row) => row.operatorSlug === "alliander-netz-heinsberg");

    render(<TariffTable rows={[violatingOperator!]} />);

    expect(screen.getByText("Alliander Netz Heinsberg GmbH")).toBeInTheDocument();
    expect(screen.getByText("Regelstatus: Mit Verstößen")).toBeInTheDocument();
    const q1Section = screen.getByLabelText("Alliander Netz Heinsberg GmbH Q1");
    expect(
      within(q1Section).getByLabelText("Q1 06:00-07:00 · keine Zuordnung")
    ).toHaveClass("tariff-quarter-segment--empty");
  });

  test("renders incomplete published operators with transparent missing-info and problem blocks", () => {
    render(
      <TariffTable
        rows={[
          {
            operatorName: "Demo Netz GmbH",
            operatorSlug: "demo-netz",
            regionLabel: "Demo",
            currentBandsSummary: "Noch kein vollständiger Tarifdatensatz veröffentlicht",
            currentBandBadges: [],
            validFrom: "2026-01-01",
            sourcePageUrl: "https://demo.example/netz",
            documentUrl: undefined,
            sourceSlug: "demo-netz-pending",
            checkedAt: "2026-03-12",
            reviewStatus: "pending",
            publicationStatus: "blocked",
            statusSummary:
              "Offizielle 2026-Veröffentlichung geprüft, aber aktuell nur vorläufige oder widersprüchliche Angaben vorhanden.",
            missingInformation: [
              "Verifiziertes Niederspannungsprodukt fehlt",
              "Offizielles 2026-Dokument fehlt",
              "Modul-3-Tarifdaten unvollständig"
            ],
            hasVerifiedLowVoltageProduct: false,
            priceBasis: "assumed-netto",
            priceBasisLabel: "Nettobasis (angenommen)",
            compliance: {
              ruleSetId: "bdew-modul-3-v1-1",
              status: "not-evaluable",
              violations: [],
              passes: [],
              notEvaluated: [
                {
                  ruleId: "missing_primary_artifact",
                  title: "Primärquelle unvollständig",
                  severity: "high",
                  message: "Eine belastbare Auswertung ist noch nicht möglich.",
                  sourceCitation: "Projektregel"
                }
              ]
            },
            latestPageSnapshotFetchedAt: null,
            latestPageSnapshotHash: null,
            pageArtifactApiUrl: null,
            latestDocumentSnapshotFetchedAt: null,
            latestDocumentSnapshotHash: null,
            documentArtifactApiUrl: null,
            sourceHealthReport: null,
            timeWindows: [],
            quarterMatrix: [],
            endcustomerDisplay: null
          }
        ]}
      />
    );

    expect(screen.getByText("Sichtbarkeit: Blockiert")).toBeInTheDocument();
    expect(screen.getAllByText("Verifiziertes Niederspannungsprodukt fehlt").length).toBeGreaterThan(0);
    expect(screen.getByText("Fehlende Informationen")).toBeInTheDocument();
    expect(screen.getByText("Problemgrund")).toBeInTheDocument();
    expect(screen.getByText(/aktuell nur vorläufige oder widersprüchliche Angaben/i)).toBeInTheDocument();
    expect(screen.getByText("Noch kein vollständiger Tarifdatensatz veröffentlicht")).toBeInTheDocument();
  });

  test("renders fallback Modul-3 details for verified operators without a full extracted endcustomer catalog", () => {
    const duesseldorf = mergeTariffRowsWithEndcustomerCatalog(
      getRegistryTariffRows(getSeedPublishedOperators()),
      getSeedEndcustomerTariffCatalog()
    ).find((row) => row.operatorSlug === "netz-duesseldorf");

    render(<TariffTable rows={[duesseldorf!]} />);

    expect(screen.getByText("Netzgesellschaft Düsseldorf mbH")).toBeInTheDocument();
    expect(screen.queryByText("Prüfstatus: Geprüft")).not.toBeInTheDocument();
    expect(screen.queryByText("Sichtbarkeit: Veröffentlicht")).not.toBeInTheDocument();
    expect(screen.queryByText("Regelstatus: Regelkonform")).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText("Netzgesellschaft Düsseldorf mbH Veröffentlichungsstatus")
    ).not.toBeInTheDocument();

    const endcustomerToggle = screen.getByRole("button", {
      name: "Endkunden · Niederspannung verifiziertes Niederspannungsprodukt Bereich aufklappen"
    });

    fireEvent.click(endcustomerToggle);

    expect(screen.getByText("Modul 3")).toBeInTheDocument();
    expect(screen.getByText("3,16 ct/kWh")).toBeInTheDocument();
    expect(screen.getByText("7,91 ct/kWh")).toBeInTheDocument();
    expect(screen.getByText("8,19 ct/kWh")).toBeInTheDocument();
    expect(screen.queryByText("Modul 1")).not.toBeInTheDocument();
    expect(screen.queryByText("Modul 2")).not.toBeInTheDocument();
  });
});
