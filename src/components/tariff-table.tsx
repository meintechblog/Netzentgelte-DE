import type { TariffTableRow } from "../lib/view-models/tariffs";

type TariffTableProps = {
  rows: TariffTableRow[];
};

function getGroupedTimeWindows(row: TariffTableRow) {
  const groups = new Map<string, TariffTableRow["timeWindows"]>();

  for (const window of row.timeWindows) {
    const existing = groups.get(window.seasonLabel);

    if (existing) {
      existing.push(window);
      continue;
    }

    groups.set(window.seasonLabel, [window]);
  }

  return [...groups.entries()].map(([seasonLabel, windows]) => ({
    seasonLabel,
    windows
  }));
}

function getTimeWindowMeta(row: TariffTableRow) {
  if (row.timeWindows.length === 0) {
    return "Zeitfenster noch nicht strukturiert";
  }

  return `${row.timeWindows.length} strukturierte Zeitfenster`;
}

export function TariffTable({ rows }: TariffTableProps) {
  return (
    <div className="tariff-table-wrap">
      <table className="tariff-table">
        <thead>
          <tr>
            <th scope="col">Netzbetreiber</th>
            <th scope="col">Modul 3 aktuell</th>
            <th scope="col">Gültig ab</th>
            <th scope="col">Quelle</th>
            <th scope="col">Review</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.operatorSlug}>
              <td>
                <div className="table-operator">
                  <strong>{row.operatorName}</strong>
                  <span className="table-muted">{row.operatorSlug}</span>
                </div>
              </td>
              <td>
                <div className="tariff-breakdown">
                  <div className="table-value">{row.currentBandsSummary}</div>
                  <div className="tariff-windows">
                    <div className="tariff-windows__header">
                      <span className="tariff-windows__title">Tariffenster</span>
                      <span className="table-muted">{getTimeWindowMeta(row)}</span>
                    </div>
                    {row.timeWindows.length > 0 ? (
                      <div className="tariff-window-groups">
                        {getGroupedTimeWindows(row).map((group) => (
                          <section className="tariff-window-group" key={`${row.operatorSlug}-${group.seasonLabel}`}>
                            <div className="tariff-window-group__header">
                              <h3>{group.seasonLabel}</h3>
                              <span className="table-muted">
                                {group.windows.length} Zeitfenster
                              </span>
                            </div>
                            <div className="tariff-window-list">
                              {group.windows.map((window) => (
                                <article className="tariff-window-card" key={window.id}>
                                  <div className="tariff-window-card__topline">
                                    <span className="tariff-window-chip">{window.label}</span>
                                    <span className="tariff-window-time">{window.timeRangeLabel}</span>
                                  </div>
                                  <div className="tariff-window-card__meta">
                                    <span>{window.dayLabel}</span>
                                  </div>
                                  <p>{window.sourceQuote}</p>
                                </article>
                              ))}
                            </div>
                          </section>
                        ))}
                      </div>
                    ) : (
                      <p className="tariff-window-empty">
                        Die Quelle ist bereits verknüpft, aber die saisonalen oder täglichen
                        Zeitfenster sind noch nicht strukturiert erfasst.
                      </p>
                    )}
                  </div>
                </div>
              </td>
              <td>{row.validFrom}</td>
              <td>
                <div className="table-operator">
                  <a
                    className="source-link"
                    href={row.sourcePageUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Quellseite
                  </a>
                  <a
                    className="source-link"
                    href={row.documentUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    PDF / Dokument
                  </a>
                  <span className="table-muted">
                    {row.checkedAt ? `Zuletzt geprüft ${row.checkedAt}` : "Noch nicht geprüft"}
                  </span>
                  <span className="table-muted">{`Quelle ${row.sourceSlug}`}</span>
                </div>
              </td>
              <td>
                <span className={`review-pill ${row.reviewStatus}`}>
                  {row.reviewStatus === "verified" ? "Geprüft" : "Offen"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
