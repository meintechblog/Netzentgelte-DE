import { OperatorMap } from "../components/operator-map";
import { SourceReviewTable } from "../components/source-review-table";
import { TariffTable } from "../components/tariff-table";
import { getRegistryMapFeatures } from "../lib/maps/geojson";
import { getRegistryTariffRows } from "../lib/view-models/tariffs";
import {
  getPublishedOperatorStats,
  loadPublishedOperators
} from "../modules/operators/current-catalog";
import { loadCurrentSources } from "../modules/sources/current-sources";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const operators = await loadPublishedOperators();
  const currentSources = await loadCurrentSources();
  const rows = getRegistryTariffRows(operators);
  const mapFeatures = getRegistryMapFeatures(operators);
  const stats = getPublishedOperatorStats(operators);

  return (
    <main className="dashboard-shell">
      <section className="dashboard-hero">
        <span className="dashboard-eyebrow">§14a Modell 3 · Deutschlandweite Datenbasis</span>
        <h1>Netzentgelte Deutschland</h1>
        <p>
          Vergleichbare Netzentgelte, nachvollziehbare Quellen und ein klarer
          Human-in-the-loop-Pruefpfad fuer jede gezeigte Zahl.
        </p>
        <div className="hero-actions">
          <a className="hero-button" href="#tarifmatrix">
            Tarifmatrix oeffnen
          </a>
          <a className="hero-button-secondary" href="/api/tariffs/current">
            API pruefen
          </a>
        </div>
      </section>

      <div className="dashboard-grid">
        <section className="stats-grid" aria-label="Kennzahlen">
          <article className="stat-card">
            <div className="stat-label">Erfasste Betreiber</div>
            <div className="stat-value">{stats.operatorCount}</div>
            <div className="stat-footnote">Kuratiertes Startregister aus offiziellen Betreiberquellen</div>
          </article>
          <article className="stat-card">
            <div className="stat-label">Nachweise</div>
            <div className="stat-value">{stats.sourceDocumentCount} Dokumente</div>
            <div className="stat-footnote">Quellseite und PDF werden getrennt dokumentiert</div>
          </article>
          <article className="stat-card">
            <div className="stat-label">Review Status</div>
            <div className="stat-value">
              {stats.verifiedCount}/{stats.operatorCount}
            </div>
            <div className="stat-footnote">Reviewstatus und Quellenpfad bleiben pro Betreiber transparent</div>
          </article>
        </section>

        <section className="content-panel" aria-labelledby="darstellungsmodi">
          <div className="panel-header">
            <div>
              <span className="section-eyebrow">Darstellungsmodi</span>
              <h2 id="darstellungsmodi">Tabelle und Karte auf demselben Quellenregister</h2>
              <p>
                Die Weboberflaeche zeigt bereits reale Betreiber, offizielle Dokumentlinks
                und den Review-Status pro Quelle.
              </p>
            </div>
          </div>
          <div className="toggle-row">
            <article className="toggle-card active">
              <span className="surface-chip">Aktiv</span>
              <h3>Tarifmatrix</h3>
              <p>Modul-3-Baender oder klarer Review-Fallback direkt neben Quellseite und PDF.</p>
            </article>
            <article className="toggle-card active">
              <span className="surface-chip">Interaktiv</span>
              <h3>Interaktive Karte</h3>
              <p>Hover-Details fuer Betreiberregionen mit direktem Sprung zur Quellseite.</p>
            </article>
          </div>
        </section>

        <section className="content-panel" aria-labelledby="kartenstufe">
          <div className="panel-header">
            <div>
              <span className="section-eyebrow">Raumliche Lesart</span>
              <h2 id="kartenstufe">Interaktive Netzgebiets-Stufe</h2>
              <p>
                Die Geometrie ist noch abstrakt, die Betreiber- und Quellenebene ist jetzt
                jedoch bereits echt und reviewbar.
              </p>
            </div>
            <div className="panel-actions">
              <span className="surface-chip">Map hover</span>
              <span className="surface-chip">Source trace</span>
            </div>
          </div>
          <OperatorMap features={mapFeatures} />
        </section>

        <section className="content-panel" aria-labelledby="tarifmatrix" id="tarifmatrix">
          <div className="panel-header">
            <div>
              <span className="section-eyebrow">Nachvollziehbare Daten</span>
              <h2>Aktuelle Tarifmatrix</h2>
              <p>
                Jeder Eintrag fuehrt zur Betreiberseite, zum Dokument und zeigt offen, ob die
                Bandwerte bereits sauber kuratiert sind.
              </p>
            </div>
            <div className="panel-actions">
              <span className="surface-chip">Zeitfenster</span>
              <span className="surface-chip">Light mode · WCAG AA</span>
              <span className="surface-chip">Blue / Amber Dashboard</span>
            </div>
          </div>
          <TariffTable rows={rows} />
        </section>

        <section className="content-panel" aria-labelledby="quellenpruefung">
          <div className="panel-header">
            <div>
              <span className="section-eyebrow">Human In The Loop</span>
              <h2 id="quellenpruefung">Quellenpruefung</h2>
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
          <SourceReviewTable rows={currentSources} />
        </section>
      </div>
    </main>
  );
}
