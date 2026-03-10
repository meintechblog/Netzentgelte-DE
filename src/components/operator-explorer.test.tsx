import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { projectGermanyMap, type OperatorMapFeature } from "../lib/maps/geojson";
import type { ComplianceRuleSetDisplay, TariffTableRow } from "../lib/view-models/tariffs";
import { OperatorExplorer } from "./operator-explorer";

const rows: TariffTableRow[] = [
  {
    operatorName: "Stadtwerke Schwäbisch Hall",
    operatorSlug: "stadtwerke-schwaebisch-hall",
    regionLabel: "Schwäbisch Hall / Hohenlohe",
    currentBandsSummary: "NT 1.00 ct/kWh · ST 2.00 ct/kWh · HT 3.00 ct/kWh",
    validFrom: "2026-01-01",
    sourcePageUrl: "https://example.com/swh/netzentgelte",
    documentUrl: "https://example.com/swh/preisblatt-2026.pdf",
    sourceSlug: "stadtwerke-schwaebisch-hall-2026",
    checkedAt: "2026-03-09",
    reviewStatus: "pending",
    priceBasis: "assumed-netto",
    priceBasisLabel: "Nettobasis (angenommen)",
    compliance: {
      ruleSetId: "bdew-modul-3-v1-1",
      status: "violation",
      violations: [
        {
          ruleId: "ht_min_2h_per_day",
          title: "HT mindestens 2 Stunden pro Tag",
          severity: "high",
          message: "HT-Zeitfenster 18:00-18:30 unterschreitet die Mindestdauer von 2 Stunden.",
          sourceCitation: "Hochlasttarif (HT): min. an 2 Stunden pro Tag"
        }
      ],
      passes: [],
      notEvaluated: []
    },
    latestPageSnapshotFetchedAt: "2026-03-09T01:22:00.000Z",
    latestPageSnapshotHash: "page123",
    pageArtifactApiUrl: "/api/artifacts/swh-page.html",
    latestDocumentSnapshotFetchedAt: "2026-03-09T01:23:00.000Z",
    latestDocumentSnapshotHash: "doc123",
    documentArtifactApiUrl: "/api/artifacts/swh-doc.pdf",
    sourceHealthReport: {
      status: "warning",
      issues: [
        {
          key: "snapshot_missing",
          message: "Die Quelle wurde geprüft, aber es liegt noch kein Snapshot-Artefakt vor."
        }
      ]
    },
    timeWindows: [],
    quarterMatrix: []
  },
  {
    operatorName: "Stromnetz Berlin",
    operatorSlug: "stromnetz-berlin",
    regionLabel: "Berlin",
    currentBandsSummary: "NT 4.00 ct/kWh · ST 5.00 ct/kWh · HT 6.00 ct/kWh",
    validFrom: "2026-01-01",
    sourcePageUrl: "https://example.com/berlin/netzentgelte",
    documentUrl: "https://example.com/berlin/preisblatt-2026.pdf",
    sourceSlug: "stromnetz-berlin-2026",
    checkedAt: "2026-03-09",
    reviewStatus: "verified",
    priceBasis: "assumed-netto",
    priceBasisLabel: "Nettobasis (angenommen)",
    compliance: {
      ruleSetId: "bdew-modul-3-v1-1",
      status: "compliant",
      violations: [],
      passes: [
        {
          ruleId: "ht_min_2h_per_day",
          title: "HT mindestens 2 Stunden pro Tag",
          severity: "high",
          message: "HT-Zeitfenster erfüllen die Mindestdauer von 2 Stunden.",
          sourceCitation: "Hochlasttarif (HT): min. an 2 Stunden pro Tag"
        }
      ],
      notEvaluated: []
    },
    latestPageSnapshotFetchedAt: null,
    latestPageSnapshotHash: null,
    pageArtifactApiUrl: null,
    latestDocumentSnapshotFetchedAt: null,
    latestDocumentSnapshotHash: null,
    documentArtifactApiUrl: null,
    sourceHealthReport: {
      status: "ok",
      issues: []
    },
    timeWindows: [],
    quarterMatrix: []
  }
];

const complianceRuleSet: ComplianceRuleSetDisplay = {
  ruleSetId: "bdew-modul-3-v1-1",
  title: "BDEW Anwendungshilfe Modul 3",
  version: "1.1",
  sourceDocumentUrl:
    "https://www.bdew.de/media/documents/BDEW-AWH_Modul_3_V1.1_Korrektur070225.pdf",
  sourceDocumentLabel: "BDEW Anwendungshilfe Modul 3, Version 1.1",
  rules: [
    {
      ruleId: "ht_min_2h_per_day",
      title: "HT mindestens 2 Stunden pro Tag",
      description: "Hochlasttarif-Zeitfenster müssen mindestens 2 Stunden pro Tag umfassen.",
      severity: "high",
      sourceCitation: "Hochlasttarif (HT): min. an 2 Stunden pro Tag"
    }
  ]
};

const mapFeatures: OperatorMapFeature[] = [
  {
    id: "stadtwerke-schwaebisch-hall",
    operatorName: "Stadtwerke Schwäbisch Hall",
    regionLabel: "Schwäbisch Hall / Hohenlohe",
    mapRank: 1,
    coverageKind: "metro-zone",
    geometryPrecision: "approximate",
    geometrySourceLabel: "Testgeometrie",
    anchors: [{ longitude: 9.739, latitude: 49.112, radiusKm: 28 }],
    stateHints: ["08"],
    currentBandsSummary: "NT 1.00 ct/kWh · ST 2.00 ct/kWh · HT 3.00 ct/kWh",
    sourcePageUrl: "https://example.com/swh/netzentgelte",
    documentUrl: "https://example.com/swh/preisblatt-2026.pdf"
  },
  {
    id: "stromnetz-berlin",
    operatorName: "Stromnetz Berlin",
    regionLabel: "Berlin",
    mapRank: 2,
    coverageKind: "metro-zone",
    geometryPrecision: "approximate",
    geometrySourceLabel: "Testgeometrie",
    anchors: [{ longitude: 13.405, latitude: 52.52, radiusKm: 24 }],
    stateHints: ["11"],
    currentBandsSummary: "NT 4.00 ct/kWh · ST 5.00 ct/kWh · HT 6.00 ct/kWh",
    sourcePageUrl: "https://example.com/berlin/netzentgelte",
    documentUrl: "https://example.com/berlin/preisblatt-2026.pdf"
  }
];

describe("OperatorExplorer", () => {
  test("renders the compliance rule block collapsed by default with filter counters", () => {
    render(
      <OperatorExplorer
        complianceRuleSet={complianceRuleSet}
        rows={rows}
        mapScene={projectGermanyMap(mapFeatures)}
      />
    );

    const ruleSection = screen.getByRole("region", {
      name: "BDEW Anwendungshilfe Modul 3 1.1"
    });

    expect(screen.getByRole("button", { name: "Regelwerk aufklappen" })).toBeInTheDocument();
    expect(screen.getByText("Regelwerk")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "BDEW Anwendungshilfe Modul 3 1.1" })).toBeInTheDocument();
    expect(
      screen.queryByText("Strukturierte Modul-3-Regeln aus der BDEW-Anwendungshilfe als Filter- und Prüfgrundlage.")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "BDEW Anwendungshilfe Modul 3, Version 1.1" })
    ).not.toBeInTheDocument();
    expect(within(ruleSection).queryByText("Hochlasttarif (HT): min. an 2 Stunden pro Tag")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Alle (2)" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Regelkonform (1)" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Mit Verstößen (1)" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Nicht bewertbar (0)" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Regelwerk aufklappen" }));

    expect(screen.getByRole("button", { name: "Regelwerk zuklappen" })).toBeInTheDocument();
    expect(
      screen.getByText("Strukturierte Modul-3-Regeln aus der BDEW-Anwendungshilfe als Filter- und Prüfgrundlage.")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "BDEW Anwendungshilfe Modul 3, Version 1.1" })
    ).toBeInTheDocument();
    const rulePanel = screen.getByRole("button", { name: "Regelwerk zuklappen" }).closest("section");
    const complianceFilter = within(rulePanel as HTMLElement).getByLabelText("Compliance-Filter");
    expect(complianceFilter).toBeInTheDocument();
    expect(within(complianceFilter).getByRole("button", { name: "Alle (2)" })).toBeInTheDocument();
    expect(within(complianceFilter).getByRole("button", { name: "Regelkonform (1)" })).toBeInTheDocument();
    expect(within(complianceFilter).getByRole("button", { name: "Mit Verstößen (1)" })).toBeInTheDocument();
    expect(within(complianceFilter).getByRole("button", { name: "Nicht bewertbar (0)" })).toBeInTheDocument();
    expect(within(ruleSection).getByText("HT mindestens 2 Stunden pro Tag")).toBeInTheDocument();
  });

  test("keeps the hero map detail panel in sync while dimming non-matching map regions", () => {
    const { container } = render(
      <OperatorExplorer
        complianceRuleSet={complianceRuleSet}
        rows={rows}
        mapScene={projectGermanyMap(mapFeatures)}
      />
    );

    fireEvent.change(screen.getByRole("searchbox", { name: "Suchbegriff" }), {
      target: { value: "berlin" }
    });

    expect(screen.getByLabelText("Deutschlandkarte der Netzbetreiber")).toBeInTheDocument();
    expect(screen.getAllByText("Stromnetz Berlin").length).toBeGreaterThan(0);
    expect(screen.queryByText("Stadtwerke Schwäbisch Hall")).not.toBeInTheDocument();
    expect(screen.getByText("1 Treffer")).toBeInTheDocument();
    expect(screen.getByText("Geometrie: approximate")).toBeInTheDocument();
    expect(container.querySelectorAll("[data-operator-region]").length).toBe(2);
    expect(container.querySelectorAll("[data-operator-region][data-filter-match='false']").length).toBe(1);
  });

  test("shows a dimmed map state when no operator matches the current query", () => {
    render(
      <OperatorExplorer
        complianceRuleSet={complianceRuleSet}
        rows={rows}
        mapScene={projectGermanyMap(mapFeatures)}
      />
    );

    fireEvent.change(screen.getByRole("searchbox", { name: "Suchbegriff" }), {
      target: { value: "hamburg" }
    });

    expect(screen.getByText("Kein Netzbetreiber passt zur aktuellen Suche.")).toBeInTheDocument();
    expect(screen.getByText("Keine belegte Netzfläche passt zur Suche")).toBeInTheDocument();
    expect(screen.getByText("0 Treffer")).toBeInTheDocument();
  });

  test("filters the merged operator list by integrated source fields and shows inline source details", () => {
    render(
      <OperatorExplorer
        complianceRuleSet={complianceRuleSet}
        rows={rows}
        mapScene={projectGermanyMap(mapFeatures)}
      />
    );

    expect(screen.getByRole("heading", { name: "Netzbetreiber & Tarifdaten" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "BDEW Anwendungshilfe Modul 3 1.1" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Regelwerk aufklappen" }));
    expect(
      screen.getByRole("link", { name: "BDEW Anwendungshilfe Modul 3, Version 1.1" })
    ).toBeInTheDocument();
    expect(screen.getByText("Prüfstatus: Offen")).toBeInTheDocument();
    expect(screen.getByText("Gespeicherte Quellseite")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mit Verstößen (1)" })).toHaveAttribute("aria-pressed", "false");

    fireEvent.change(screen.getByRole("searchbox", { name: "Suchbegriff" }), {
      target: { value: "stromnetz-berlin-2026" }
    });

    expect(screen.getAllByText("Stromnetz Berlin").length).toBeGreaterThan(0);
    expect(screen.queryByText("Stadtwerke Schwäbisch Hall")).not.toBeInTheDocument();
  });

  test("filters the operator list by compliance status and composes with the global search", () => {
    render(
      <OperatorExplorer
        complianceRuleSet={complianceRuleSet}
        rows={rows}
        mapScene={projectGermanyMap(mapFeatures)}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Regelwerk aufklappen" }));
    fireEvent.click(screen.getByRole("button", { name: "Mit Verstößen (1)" }));

    expect(screen.getByRole("button", { name: "Mit Verstößen (1)" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getAllByText("Stadtwerke Schwäbisch Hall").length).toBeGreaterThan(0);
    expect(screen.queryByText("Stromnetz Berlin")).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole("searchbox", { name: "Suchbegriff" }), {
      target: { value: "ht mindestens 2 stunden" }
    });

    expect(screen.getAllByText("Stadtwerke Schwäbisch Hall").length).toBeGreaterThan(0);
    expect(screen.queryByText("Stromnetz Berlin")).not.toBeInTheDocument();
  });
});
