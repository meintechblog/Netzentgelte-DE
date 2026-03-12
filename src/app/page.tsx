import { OperatorExplorer } from "../components/operator-explorer";
import { withBasePath } from "../lib/base-path";
import { getRegistryMapFeatures, projectGermanyMap } from "../lib/maps/geojson";
import { loadPublicSnapshotFromDisk } from "../lib/public-snapshot-loader";
import {
  getComplianceRuleSetDisplay,
  getPendingTariffRows,
  getRegistryTariffRows,
  mergeTariffRowsWithCurrentSources,
  mergeTariffRowsWithEndcustomerCatalog
} from "../lib/view-models/tariffs";
import { getActiveModul3RuleSet } from "../modules/compliance/rule-catalog";
import { loadPublishedOperatorSnapshot } from "../modules/operators/current-catalog";
import { loadPendingOperatorCatalog } from "../modules/operators/pending-catalog";
import { loadCurrentSources } from "../modules/sources/current-sources";
import { loadEndcustomerTariffCatalog } from "../modules/tariffs/endcustomer-catalog";

export default async function HomePage() {
  const exportedSnapshot = await loadPublicSnapshotFromDisk();
  const mergedRows = exportedSnapshot ? mergeSnapshotRows(exportedSnapshot) : await loadRuntimeTariffRows();
  const mapScene = exportedSnapshot ? exportedSnapshot.map : await loadRuntimeMapScene();
  const complianceRuleSet = exportedSnapshot
    ? exportedSnapshot.compliance
    : getComplianceRuleSetDisplay(getActiveModul3RuleSet());
  const stats = exportedSnapshot ? buildSnapshotStats(mergedRows) : await loadRuntimeStats();

  return (
    <main className="dashboard-shell">
      <section className="dashboard-hero">
        <span className="dashboard-eyebrow">§14a Modell 3 · Deutschlandweite Datenbasis</span>
        <h1>Netzentgelte Deutschland</h1>
        <p>
          Vergleichbare Netzentgelte, nachvollziehbare Quellen und ein klarer
          Human-in-the-loop-Prüfpfad. Auch unvollständige oder blockierte Betreiber
          bleiben online sichtbar, inklusive transparenter Problemhinweise.
        </p>
        <div className="hero-actions">
          <a className="hero-button" href="#tarifmatrix">
            Tarifmatrix öffnen
          </a>
          <a className="hero-button-secondary" href={withBasePath("/netzbetreiber/in-pruefung")}>
            Netzbetreiber in Prüfung
          </a>
          {exportedSnapshot ? (
            <span className="hero-button-secondary" aria-label={`Datenstand ${exportedSnapshot.generatedAt}`}>
              {`Datenstand ${exportedSnapshot.generatedAt.slice(0, 10)}`}
            </span>
          ) : (
            <a className="hero-button-secondary" href={withBasePath("/api/tariffs/current")}>
              API prüfen
            </a>
          )}
        </div>
      </section>

      <div className="dashboard-grid">
        <OperatorExplorer complianceRuleSet={complianceRuleSet} mapScene={mapScene} rows={mergedRows} />

        <section className="stats-grid" aria-label="Kennzahlen">
          <article className="stat-card">
            <div className="stat-label">Erfasste Betreiber</div>
            <div className="stat-value">{stats.operatorCount}</div>
            <div className="stat-footnote">Kuratiertes Startregister aus offiziellen Betreiberquellen</div>
          </article>
          <article className="stat-card">
            <div className="stat-label">Nachweise</div>
            <div className="stat-value">{stats.sourceDocumentCount} Dokumente</div>
            <div className="stat-footnote">Verfügbare offizielle Dokumente oder belastbare Veröffentlichungen</div>
          </article>
          <article className="stat-card">
            <div className="stat-label">Review Status</div>
            <div className="stat-value">
              {stats.verifiedCount}/{stats.operatorCount}
            </div>
            <div className="stat-footnote">
              {stats.transparentIssueCount > 0
                ? `${stats.transparentIssueCount} Betreiber bleiben sichtbar mit offenem Problemstatus`
                : "Alle sichtbaren Betreiber haben ein verifiziertes Niederspannungsprodukt"}
            </div>
          </article>
        </section>

        <section className="content-panel" aria-labelledby="darstellungsmodi">
          <div className="panel-header">
            <div>
              <span className="section-eyebrow">Darstellungsmodi</span>
              <h2 id="darstellungsmodi">Tabelle und Karte auf demselben Quellenregister</h2>
              <p>
                Die Weboberfläche blendet gescannte Betreiber nicht mehr aus. Fehlende
                Tarifdaten, Regelkonflikte oder vorläufige Quellen werden direkt im Eintrag
                offengelegt.
              </p>
            </div>
          </div>
          <div className="toggle-row">
            <article className="toggle-card active">
              <span className="surface-chip">Aktiv</span>
              <h3>Tarifmatrix</h3>
              <p>Modul-3-Bänder oder klarer Review-Fallback direkt neben Quellseite und PDF.</p>
            </article>
            <article className="toggle-card active">
              <span className="surface-chip">Interaktiv</span>
              <h3>Interaktive Karte</h3>
              <p>Hover-Details für Betreiberregionen mit direktem Sprung zur Quellseite.</p>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}

async function loadRuntimeTariffRows() {
  const [operatorSnapshot, pendingOperatorCatalog] = await Promise.all([
    loadPublishedOperatorSnapshot(),
    loadPendingOperatorCatalog()
  ]);
  const endcustomerCatalog = await loadEndcustomerTariffCatalog();
  const currentSources = await loadCurrentSources();
  const publishedOperatorSlugs = new Set(operatorSnapshot.operators.map((entry) => entry.slug));
  const publishedRows = mergeTariffRowsWithEndcustomerCatalog(
    getRegistryTariffRows(operatorSnapshot.operators),
    endcustomerCatalog
  );
  const publicSources = currentSources.filter((row) => publishedOperatorSlugs.has(row.operatorSlug));

  return [
    ...mergeTariffRowsWithCurrentSources(publishedRows, publicSources),
    ...getPendingTariffRows(pendingOperatorCatalog)
  ];
}

async function loadRuntimeMapScene() {
  const operatorSnapshot = await loadPublishedOperatorSnapshot();
  return projectGermanyMap(getRegistryMapFeatures(operatorSnapshot.operators));
}

async function loadRuntimeStats() {
  return buildPageStats(await loadRuntimeTariffRows());
}

function buildSnapshotStats(rows: Awaited<ReturnType<typeof loadRuntimeTariffRows>>) {
  return buildPageStats(rows);
}

function buildPageStats(rows: Awaited<ReturnType<typeof loadRuntimeTariffRows>>) {
  const verifiedCount = rows.filter(
    (row) => row.hasVerifiedLowVoltageProduct ?? row.reviewStatus === "verified"
  ).length;

  return {
    operatorCount: rows.length,
    sourceDocumentCount: rows.filter((row) => Boolean(row.documentUrl)).length,
    verifiedCount,
    transparentIssueCount: rows.length - verifiedCount
  };
}

function mergeSnapshotRows(snapshot: NonNullable<Awaited<ReturnType<typeof loadPublicSnapshotFromDisk>>>) {
  const existingOperatorSlugs = new Set(snapshot.operators.map((row) => row.operatorSlug));
  const transparentRows = getPendingTariffRows(snapshot.pendingOperators).filter(
    (row) => !existingOperatorSlugs.has(row.operatorSlug)
  );

  return [...snapshot.operators, ...transparentRows];
}
