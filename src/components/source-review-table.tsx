type SourceReviewRow = {
  sourceSlug: string;
  operatorName: string;
  operatorSlug: string;
  checkedAt: string | null;
  latestPageSnapshotFetchedAt: string | null;
  latestPageSnapshotHash: string | null;
  latestDocumentSnapshotFetchedAt: string | null;
  latestDocumentSnapshotHash: string | null;
  pageUrl: string;
  documentUrl: string;
  pageArtifactApiUrl: string | null;
  documentArtifactApiUrl: string | null;
  reviewStatus: string;
};

type SourceReviewTableProps = {
  rows: SourceReviewRow[];
};

export function SourceReviewTable({ rows }: SourceReviewTableProps) {
  return (
    <div className="tariff-table-wrap">
      <table className="tariff-table">
        <thead>
          <tr>
            <th scope="col">Quellenpruefung</th>
            <th scope="col">Letzter Check</th>
            <th scope="col">Artefakt</th>
            <th scope="col">Review</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.sourceSlug}>
              <td>
                <div className="table-operator">
                  <strong>{row.operatorName}</strong>
                  <span className="table-muted">{row.operatorSlug}</span>
                  <span className="table-muted">{row.sourceSlug}</span>
                </div>
              </td>
              <td>
                <div className="table-operator">
                  <span>{row.checkedAt ? `Zuletzt geprueft ${row.checkedAt}` : "Noch nicht geprueft"}</span>
                  <span className="table-muted">
                    {row.latestPageSnapshotFetchedAt
                      ? `Seite ${row.latestPageSnapshotFetchedAt.slice(0, 10)}`
                      : "Seiten-Snapshot ausstehend"}
                  </span>
                  <span className="table-muted">
                    {row.latestPageSnapshotHash
                      ? `Seite Hash ${row.latestPageSnapshotHash}`
                      : "Seiten-Hash ausstehend"}
                  </span>
                  <span className="table-muted">
                    {row.latestDocumentSnapshotFetchedAt
                      ? `Dokument ${row.latestDocumentSnapshotFetchedAt.slice(0, 10)}`
                      : "Dokumenten-Snapshot ausstehend"}
                  </span>
                  <span className="table-muted">
                    {row.latestDocumentSnapshotHash
                      ? `Dokument Hash ${row.latestDocumentSnapshotHash}`
                      : "Dokumenten-Hash ausstehend"}
                  </span>
                </div>
              </td>
              <td>
                <div className="table-operator">
                  <a className="source-link" href={row.pageUrl} rel="noreferrer" target="_blank">
                    Quellseite
                  </a>
                  <a className="source-link" href={row.documentUrl} rel="noreferrer" target="_blank">
                    Originaldokument
                  </a>
                  {row.pageArtifactApiUrl ? (
                    <a className="source-link" href={row.pageArtifactApiUrl} rel="noreferrer" target="_blank">
                      Gespeicherte Quellseite
                    </a>
                  ) : (
                    <span className="table-muted">Noch kein gespeicherter Seitenbeleg</span>
                  )}
                  {row.documentArtifactApiUrl ? (
                    <a
                      className="source-link"
                      href={row.documentArtifactApiUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Gespeichertes Dokument
                    </a>
                  ) : (
                    <span className="table-muted">Noch kein gespeichertes Dokument</span>
                  )}
                </div>
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
