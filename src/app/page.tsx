import { OperatorExplorer } from "../components/operator-explorer";
import { SourceReviewTable } from "../components/source-review-table";
import { getRegistryMapFeatures, projectGermanyMap } from "../lib/maps/geojson";
import { getRegistryTariffRows } from "../lib/view-models/tariffs";
import {
  getPublishedOperatorSnapshotStats,
  loadPublishedOperatorSnapshot
} from "../modules/operators/current-catalog";
import { loadCurrentSources } from "../modules/sources/current-sources";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const operatorSnapshot = await loadPublishedOperatorSnapshot();
  const operators = operatorSnapshot.operators;
  const currentSources = await loadCurrentSources();
  const publishedOperatorSlugs = new Set(operators.map((entry) => entry.slug));
  const rows = getRegistryTariffRows(operators);
  const mapScene = projectGermanyMap(getRegistryMapFeatures(operators));
  const stats = getPublishedOperatorSnapshotStats(operatorSnapshot);
  const publicSources = currentSources.filter((row) => publishedOperatorSlugs.has(row.operatorSlug));

  return (
    <main className="dashboard-shell">
      <section className="dashboard-hero">
        <span className="dashboard-eyebrow">§14a Modell 3 · Deutschlandweite Datenbasis</span>
        <h1>Netzentgelte Deutschland</h1>
        <p>
          Vergleichbare Netzentgelte, nachvollziehbare Quellen und ein klarer
          Human-in-the-loop-Prüfpfad. Öffentlich erscheinen nur verifizierte und
          integritätsgeprüfte Betreiber.
        </p>
        <div className="hero-actions">
          <a className="hero-button" href="#tarifmatrix">
            Tarifmatrix öffnen
          </a>
          <a className="hero-button-secondary" href="/api/tariffs/current">
            API prüfen
          </a>
        </div>
      </section>

      <div className="dashboard-grid">
        <OperatorExplorer mapScene={mapScene} rows={rows} />

        <section className="stats-grid" aria-label="Kennzahlen">
          <article className="stat-card">
            <div className="stat-label">Erfasste Betreiber</div>
            <div className="stat-value">{stats.operatorCount}</div>
            <div className="stat-footnote">Kuratiertes Startregister aus offiziellen Betreiberquellen</div>
          </article>
          <article className="stat-card">
            <div className="stat-label">Nachweise</div>
            <div className="stat-value">{stats.sourceDocumentCount} Dokumente</div>
            <div className="stat-footnote">Nur veröffentlichte Betreiber mit belastbarem Prüfpfad</div>
          </article>
          <article className="stat-card">
            <div className="stat-label">Review Status</div>
            <div className="stat-value">
              {stats.verifiedCount}/{stats.operatorCount}
            </div>
            <div className="stat-footnote">
              {stats.withheldCount > 0
                ? `${stats.withheldCount} Betreiber bleiben bis zur Vollprüfung verborgen`
                : "Alle sichtbaren Betreiber bestehen die Public-Gates"}
            </div>
          </article>
        </section>

        <section className="content-panel" aria-labelledby="darstellungsmodi">
          <div className="panel-header">
            <div>
              <span className="section-eyebrow">Darstellungsmodi</span>
              <h2 id="darstellungsmodi">Tabelle und Karte auf demselben Quellenregister</h2>
              <p>
                Die Weboberfläche zeigt nur verifizierte und integritätsgeprüfte Betreiber
                mit offiziellen Dokumentlinks und Reviewpfad.
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

        <section className="content-panel" aria-labelledby="quellenpruefung">
          <div className="panel-header">
            <div>
              <span className="section-eyebrow">Human In The Loop</span>
              <h2 id="quellenpruefung">Quellenprüfung</h2>
              <p>
                Gespeicherte Artefakte, Snapshot-Zeitpunkte und Hashes bleiben pro Quelle
                direkt aus der Datenbasis nachvollziehbar.
              </p>
            </div>
            <div className="panel-actions">
              <span className="surface-chip">Snapshot trail</span>
              <span className="surface-chip">Artifact access</span>
            </div>
          </div>
          <SourceReviewTable rows={publicSources} />
        </section>
      </div>
    </main>
  );
}
