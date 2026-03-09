import type { TariffTableRow } from "../lib/view-models/tariffs";

type TariffTableProps = {
  rows: TariffTableRow[];
};

export function TariffTable({ rows }: TariffTableProps) {
  return (
    <div className="tariff-table-wrap">
      <table className="tariff-table">
        <thead>
          <tr>
            <th scope="col">Netzbetreiber</th>
            <th scope="col">Aktueller Wert</th>
            <th scope="col">Gueltig ab</th>
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
              <td className="table-value">{row.currentValue}</td>
              <td>{row.validFrom}</td>
              <td>
                <a
                  className="source-link"
                  href={row.sourceUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  PDF / Quelle
                </a>
              </td>
              <td>
                <span className={`review-pill ${row.reviewStatus}`}>
                  {row.reviewStatus === "verified" ? "Geprueft" : "Offen"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
