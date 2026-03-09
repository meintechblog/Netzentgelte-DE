"use client";

import { useEffect, useState } from "react";

import type { OperatorMapFeature } from "../lib/maps/geojson";

type OperatorMapProps = {
  features: OperatorMapFeature[];
};

const GERMANY_BASE_PATH =
  "M 292 42 L 356 60 L 430 98 L 490 170 L 550 216 L 586 320 L 564 410 L 612 514 L 574 630 L 528 776 L 442 884 L 360 912 L 286 880 L 222 796 L 170 746 L 146 630 L 108 538 L 130 438 L 158 360 L 162 270 L 214 176 L 250 104 Z";

function getFeatureAriaLabel(feature: OperatorMapFeature) {
  return `${feature.operatorName} in ${feature.regionLabel}`;
}

function getPrecisionLabel(feature: OperatorMapFeature) {
  return `Geometrie: ${feature.geometryPrecision}`;
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
        <div className="map-stage__empty" role="img" aria-label="Deutschlandkarte der Netzbetreiber">
          <p className="table-muted">Noch keine Netzgebiete geladen</p>
        </div>
      </section>
    );
  }

  return (
    <section className="map-stage map-stage--hero" aria-label="Netzgebietsübersicht">
      <div className="map-stage__canvas map-stage__canvas--hero">
        <svg
          aria-label="Deutschlandkarte der Netzbetreiber"
          className="operator-map-svg"
          role="img"
          viewBox="0 0 720 960"
        >
          <path className="operator-map-svg__base" d={GERMANY_BASE_PATH} />
          {features.map((feature) => {
            const isActive = activeFeature.id === feature.id;

            return (
              <g className="operator-map-region" key={feature.id}>
                <path
                  aria-label={getFeatureAriaLabel(feature)}
                  className={isActive ? "operator-map-region__shape is-active" : "operator-map-region__shape"}
                  d={feature.geometry.path}
                  data-operator-region=""
                  onClick={() => setActiveFeature(feature)}
                  onFocus={() => setActiveFeature(feature)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setActiveFeature(feature);
                    }
                  }}
                  onMouseEnter={() => setActiveFeature(feature)}
                  role="button"
                  tabIndex={0}
                />
                <text
                  className={isActive ? "operator-map-region__label is-active" : "operator-map-region__label"}
                  x={feature.labelAnchor.x}
                  y={feature.labelAnchor.y}
                >
                  {feature.mapLabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <aside className="map-stage__detail map-stage__detail--hero">
        <span className="section-eyebrow">Hover / Fokus</span>
        <h3>{activeFeature.operatorName}</h3>
        <p>{activeFeature.currentBandsSummary}</p>
        <div className="table-operator">
          <span className="table-muted">Region: {activeFeature.regionLabel}</span>
          <span className="table-muted">{getPrecisionLabel(activeFeature)}</span>
          <span className="table-muted">Abdeckung: {activeFeature.coverageType}</span>
          <span className="table-muted">{activeFeature.geometrySourceLabel}</span>
        </div>
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
