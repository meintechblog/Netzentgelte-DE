"use client";

import { useEffect, useState } from "react";

import type { OperatorMapFeature } from "../lib/maps/geojson";

type OperatorMapProps = {
  features: OperatorMapFeature[];
};

const MAP_NODE_POSITIONS = [
  { top: "12%", left: "48%" },
  { top: "22%", left: "28%" },
  { top: "22%", left: "68%" },
  { top: "36%", left: "18%" },
  { top: "38%", left: "48%" },
  { top: "38%", left: "78%" },
  { top: "52%", left: "28%" },
  { top: "54%", left: "62%" },
  { top: "66%", left: "16%" },
  { top: "68%", left: "46%" },
  { top: "68%", left: "76%" },
  { top: "82%", left: "30%" },
  { top: "82%", left: "58%" }
] as const;

function getMapNodePosition(index: number) {
  return MAP_NODE_POSITIONS[index] ?? MAP_NODE_POSITIONS[index % MAP_NODE_POSITIONS.length];
}

export function OperatorMap({ features }: OperatorMapProps) {
  const [activeFeature, setActiveFeature] = useState<OperatorMapFeature | null>(features[0] ?? null);

  useEffect(() => {
    if (features.length === 0) {
      setActiveFeature(null);
      return;
    }

    setActiveFeature((current) => {
      if (current && features.some((feature) => feature.id === current.id)) {
        return current;
      }

      return features[0];
    });
  }, [features]);

  if (!activeFeature) {
    return (
      <section className="map-stage" aria-label="Netzgebietsübersicht">
        <div className="map-stage__canvas" role="img" aria-label="Abstrakte Deutschlandkarte">
          <p className="table-muted">Noch keine Netzgebiete geladen</p>
        </div>
      </section>
    );
  }

  return (
    <section className="map-stage" aria-label="Netzgebietsübersicht">
      <div className="map-stage__canvas" role="img" aria-label="Abstrakte Deutschlandkarte">
        {features.map((feature, index) => (
          <button
            key={feature.id}
            className="map-node"
            onFocus={() => setActiveFeature(feature)}
            onMouseEnter={() => setActiveFeature(feature)}
            style={getMapNodePosition(index)}
            type="button"
          >
            <span>{feature.regionLabel}</span>
          </button>
        ))}
      </div>

      <aside className="map-stage__detail">
        <span className="section-eyebrow">Hover / Fokus</span>
        <h3>{activeFeature.operatorName}</h3>
        <p>{activeFeature.currentBandsSummary}</p>
        <p className="table-muted">Region: {activeFeature.regionLabel}</p>
        <div className="table-operator">
          <a
            className="source-link"
            href={activeFeature.sourcePageUrl}
            rel="noreferrer"
            target="_blank"
          >
            Quellseite
          </a>
          <a
            className="source-link"
            href={activeFeature.documentUrl}
            rel="noreferrer"
            target="_blank"
          >
            PDF / Dokument
          </a>
        </div>
      </aside>
    </section>
  );
}
