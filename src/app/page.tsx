import { OperatorMap } from "../components/operator-map";
import { TariffTable } from "../components/tariff-table";
import { getDemoMapFeatures } from "../lib/maps/geojson";
import { getDemoTariffRows } from "../lib/view-models/tariffs";

const rows = getDemoTariffRows();
const mapFeatures = getDemoMapFeatures();

export default function HomePage() {
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
            <div className="stat-value">3</div>
            <div className="stat-footnote">Demo-Slice fuer Pipeline, UI und API</div>
          </article>
          <article className="stat-card">
            <div className="stat-label">Nachweise</div>
            <div className="stat-value">3 PDFs</div>
            <div className="stat-footnote">Jeder Datensatz bleibt zur Quelle verlinkt</div>
          </article>
          <article className="stat-card">
            <div className="stat-label">Review Status</div>
            <div className="stat-value">2/3</div>
            <div className="stat-footnote">Gepruefte Werte sind im UI sichtbar markiert</div>
          </article>
        </section>

        <section className="content-panel" aria-labelledby="darstellungsmodi">
          <div className="panel-header">
            <div>
              <span className="section-eyebrow">Darstellungsmodi</span>
              <h2 id="darstellungsmodi">Tabelle zuerst, Karte direkt vorbereitet</h2>
              <p>
                Die Kartenansicht folgt im naechsten Schritt auf derselben Datenbasis und
                mit denselben Provenance-Feldern.
              </p>
            </div>
          </div>
          <div className="toggle-row">
            <article className="toggle-card active">
              <span className="surface-chip">Aktiv</span>
              <h3>Tarifmatrix</h3>
              <p>Data-dense Tabelle mit Quellenlink, Gueltigkeit und Review-Status.</p>
            </article>
            <article className="toggle-card active">
              <span className="surface-chip">Interaktiv</span>
              <h3>Interaktive Karte</h3>
              <p>Hover-Details fuer Netzgebiete mit direktem Link zu PDF und Rohwert.</p>
            </article>
          </div>
        </section>

        <section className="content-panel" aria-labelledby="kartenstufe">
          <div className="panel-header">
            <div>
              <span className="section-eyebrow">Raumliche Lesart</span>
              <h2 id="kartenstufe">Interaktive Netzgebiets-Stufe</h2>
              <p>
                Noch abstrakt, aber bereits mit Hover-Overlay, Review-Kontext und direkter
                Quellenverlinkung.
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
                Jeder Tabellenwert bleibt mit Quell-PDF und Review-Markierung sichtbar.
              </p>
            </div>
            <div className="panel-actions">
              <span className="surface-chip">Light mode · WCAG AA</span>
              <span className="surface-chip">Blue / Amber Dashboard</span>
            </div>
          </div>
          <TariffTable rows={rows} />
        </section>
      </div>
    </main>
  );
}
