"use client";

import { useState } from "react";

import type { OperatorMapFeature } from "../lib/maps/geojson";

type OperatorMapProps = {
  features: OperatorMapFeature[];
};

export function OperatorMap({ features }: OperatorMapProps) {
  const [activeFeature, setActiveFeature] = useState(features[0]);

  return (
    <section className="map-stage" aria-label="Netzgebietsuebersicht">
      <div className="map-stage__canvas" role="img" aria-label="Abstrakte Deutschlandkarte">
        {features.map((feature, index) => (
          <button
            key={feature.id}
            className={`map-node map-node--${index + 1}`}
            onFocus={() => setActiveFeature(feature)}
            onMouseEnter={() => setActiveFeature(feature)}
            type="button"
          >
            <span>{feature.regionLabel}</span>
          </button>
        ))}
      </div>

      <aside className="map-stage__detail">
        <span className="section-eyebrow">Hover / Fokus</span>
        <h3>{activeFeature.operatorName}</h3>
        <p>{activeFeature.currentValue}</p>
        <p className="table-muted">Region: {activeFeature.regionLabel}</p>
        <a className="source-link" href={activeFeature.sourceUrl} rel="noreferrer" target="_blank">
          PDF / Quelle
        </a>
      </aside>
    </section>
  );
}
