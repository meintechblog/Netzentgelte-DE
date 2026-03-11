import { withBasePath } from "../../../lib/base-path";
import { loadPublicSnapshotFromDisk } from "../../../lib/public-snapshot-loader";
import { loadPendingOperatorCatalog, type PendingOperatorPublic } from "../../../modules/operators/pending-catalog";

export default async function PendingOperatorsPage() {
  const exportedSnapshot = await loadPublicSnapshotFromDisk();
  const catalog = exportedSnapshot ? exportedSnapshot.pendingOperators : await loadPendingOperatorCatalog();
  const pendingDataHref = exportedSnapshot
    ? withBasePath("/data/netzentgelte/pending-operators.json")
    : withBasePath("/api/operators/pending");

  return (
    <main className="dashboard-shell">
      <section className="dashboard-hero">
        <span className="dashboard-eyebrow">Öffentliche Arbeitsliste · Betreiber-Funnel</span>
        <h1>Netzbetreiber in Prüfung</h1>
        <p>
          Tarifdetails bleiben verborgen, bis die offizielle Evidenz vollständig geprüft ist.
          Diese Übersicht zeigt nur den öffentlichen Fortschritt für Betreiber, die bereits im
          Prüfpfad angekommen sind.
        </p>
        <div className="hero-actions">
          <a className="hero-button" href={withBasePath("/")}>
            Zur verifizierten Tarifmatrix
          </a>
          <a className="hero-button-secondary" href={pendingDataHref}>
            Pending-Daten prüfen
          </a>
        </div>
      </section>

      <div className="dashboard-grid">
        <section className="stats-grid" aria-label="Pending Kennzahlen">
          <article className="stat-card">
            <div className="stat-label">Öffentlich in Prüfung</div>
            <div className="stat-value">{catalog.summary.operatorCount}</div>
            <div className="stat-footnote">Betreiber mit öffentlichem Pending-Status</div>
          </article>
          <article className="stat-card">
            <div className="stat-label">Quelle gefunden</div>
            <div className="stat-value">{catalog.summary.sourceFoundCount}</div>
            <div className="stat-footnote">Offizielle Quelle oder belastbarer Fund verlinkt</div>
          </article>
          <article className="stat-card">
            <div className="stat-label">Tarifprüfung läuft</div>
            <div className="stat-value">{catalog.summary.tariffReadyCount}</div>
            <div className="stat-footnote">Tarifdaten teilweise oder vollständig in Arbeit</div>
          </article>
        </section>

        <section className="content-panel" aria-labelledby="pending-operator-table-heading">
          <div className="panel-header">
            <div>
              <span className="section-eyebrow">Minimaldarstellung</span>
              <h2 id="pending-operator-table-heading">Öffentliche Pending-Liste</h2>
              <p>
                Die Tabelle zeigt nur Review- und Discovery-Status. Modul-3-Matrizen erscheinen
                erst nach belastbarer Verifikation in der Hauptoberfläche.
              </p>
            </div>
          </div>

          {catalog.items.length > 0 ? (
            <table aria-label="Netzbetreiber in Prüfung" className="pending-operators-table">
              <thead>
                <tr>
                  <th scope="col">Betreiber</th>
                  <th scope="col">Region</th>
                  <th scope="col">Quellenstatus</th>
                  <th scope="col">Tarifstatus</th>
                  <th scope="col">Prüfdatum</th>
                </tr>
              </thead>
              <tbody>
                {catalog.items.map((entry) => (
                  <tr key={entry.slug}>
                    <td>
                      <div className="pending-operators-table__name">{entry.name}</div>
                      <div className="pending-operators-table__slug">{entry.slug}</div>
                    </td>
                    <td>{entry.regionLabel}</td>
                    <td>{getSourceStatusLabel(entry)}</td>
                    <td>{getTariffStatusLabel(entry)}</td>
                    <td>{entry.checkedAt ?? "Noch kein Prüfdatum"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="tariff-empty-state">
              <h3>Aktuell gibt es keine öffentlich sichtbaren Pending-Betreiber.</h3>
              <p>Neue Discovery- oder Promotionsläufe erscheinen hier automatisch nach dem nächsten Export.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function getSourceStatusLabel(entry: PendingOperatorPublic) {
  switch (entry.sourceStatus) {
    case "source-found":
    case "reachable":
    case "snapshotted":
      return "Quelle gefunden";
    case "candidate":
      return "Quelle in Prüfung";
    default:
      return "Neu entdeckt";
  }
}

function getTariffStatusLabel(entry: PendingOperatorPublic) {
  switch (entry.tariffStatus) {
    case "verified":
    case "parsed":
    case "partial":
      return "Tarifprüfung läuft";
    default:
      return "Tarifdaten ausstehend";
  }
}
