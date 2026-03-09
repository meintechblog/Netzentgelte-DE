"use client";

import { useEffect, useState } from "react";

import {
  getGermanyStateName,
  type ProjectedGermanyMapScene
} from "../lib/maps/geojson";

type OperatorMapProps = {
  scene: ProjectedGermanyMapScene;
};

function getFeatureAriaLabel(feature: ProjectedGermanyMapScene["operators"][number]) {
  return `${feature.operatorName} in ${feature.regionLabel}`;
}

function getPrecisionLabel(feature: ProjectedGermanyMapScene["operators"][number]) {
  return `Geometrie: ${feature.geometryPrecision}`;
}

function getCoverageLabel(feature: ProjectedGermanyMapScene["operators"][number]) {
  const coverageLabel =
    feature.coverageKind === "municipality-union" ? "belegte Gemeinden" : feature.coverageKind;

  return `Kartenzuordnung: ${coverageLabel}`;
}

function getStateHintLabel(feature: ProjectedGermanyMapScene["operators"][number]) {
  if (feature.stateHints.length === 0) {
    return "Bundesländer: ohne Zuordnung";
  }

  return `Bundesländer: ${feature.stateHints.map(getGermanyStateName).join(", ")}`;
}

function getCoverageUnitsLabel(feature: ProjectedGermanyMapScene["operators"][number]) {
  if (!feature.coverageUnits || feature.coverageUnits.length === 0) {
    return "Gebietszuordnung: noch kein belastbarer Flächenschnitt";
  }

  if (feature.coverageUnits.length <= 4) {
    return `Gebietszuordnung: ${feature.coverageUnits.map((unit) => unit.name).join(", ")}`;
  }

  const head = feature.coverageUnits
    .slice(0, 4)
    .map((unit) => unit.name)
    .join(", ");

  return `Gebietszuordnung: ${head} +${feature.coverageUnits.length - 4} weitere`;
}

export function OperatorMap({ scene }: OperatorMapProps) {
  const visibleFeatures = scene.operators.filter((feature) => feature.mapDisplayMode !== "hidden");
  const [hoveredFeatureId, setHoveredFeatureId] = useState<string | null>(visibleFeatures[0]?.id ?? null);
  const [lockedFeatureId, setLockedFeatureId] = useState<string | null>(null);

  useEffect(() => {
    if (visibleFeatures.length === 0) {
      setHoveredFeatureId(null);
      setLockedFeatureId(null);
      return;
    }

    setLockedFeatureId((current) => {
      const currentFeature = current
        ? visibleFeatures.find((feature) => feature.id === current)
        : null;

      if (!currentFeature || !currentFeature.searchMatch) {
        return null;
      }

      return currentFeature.id;
    });

    setHoveredFeatureId((current) => {
      const currentFeature = current
        ? visibleFeatures.find((feature) => feature.id === current)
        : null;
      const firstMatchingFeature = visibleFeatures.find((feature) => feature.searchMatch);

      if (!firstMatchingFeature) {
        return null;
      }

      if (currentFeature && currentFeature.searchMatch) {
        return currentFeature.id;
      }

      return firstMatchingFeature.id;
    });
  }, [visibleFeatures]);

  const lockedFeature = lockedFeatureId
    ? visibleFeatures.find((feature) => feature.id === lockedFeatureId) ?? null
    : null;
  const hoveredFeature = hoveredFeatureId
    ? visibleFeatures.find((feature) => feature.id === hoveredFeatureId) ?? null
    : null;
  const fallbackFeature = visibleFeatures.find((feature) => feature.searchMatch) ?? null;
  const activeFeature = lockedFeature ?? hoveredFeature ?? fallbackFeature;

  const activateFeature = (featureId: string) => {
    setHoveredFeatureId(featureId);
  };

  const lockFeature = (featureId: string) => {
    setLockedFeatureId(featureId);
    setHoveredFeatureId(featureId);
  };

  const unlockFeature = () => {
    setLockedFeatureId(null);
    setHoveredFeatureId(visibleFeatures.find((feature) => feature.searchMatch)?.id ?? null);
  };

  if (scene.operators.length === 0) {
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
          viewBox="0 0 780 960"
        >
          <defs>
            <radialGradient id="operator-map-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(34, 197, 94, 0.42)" />
              <stop offset="100%" stopColor="rgba(34, 197, 94, 0)" />
            </radialGradient>
          </defs>

          <rect
            className="operator-map-svg__background-hitarea"
            data-testid="map-background-hitarea"
            fill="transparent"
            height="960"
            onClick={unlockFeature}
            width="780"
            x="0"
            y="0"
          />

          <g data-country-base="">
            {scene.states.map((state) => (
              <path
                key={`base-${state.code}`}
                className="operator-map-svg__state-fill"
                d={state.path}
              />
            ))}
          </g>

          {activeFeature ? (
            <g className="operator-map-svg__state-context">
              {activeFeature.highlightedStates.map((state) => (
                <path
                  key={`context-${activeFeature.id}-${state.code}`}
                  className="operator-map-svg__state-highlight"
                  d={state.path}
                />
              ))}
            </g>
          ) : null}

          <g className="operator-map-svg__state-borders">
            {scene.states.map((state) => (
              <path
                key={`border-${state.code}`}
                className="operator-map-svg__state-boundary"
                d={state.path}
                data-state-boundary=""
              />
            ))}
          </g>

          {visibleFeatures.map((feature) => {
            const isActive = activeFeature?.id === feature.id;
            const isDimmed = !feature.searchMatch;

            return (
              <g
                className="operator-map-region"
                data-filter-match={String(feature.searchMatch)}
                data-operator-region=""
                key={feature.id}
                onMouseEnter={() => {
                  if (!lockedFeature) {
                    activateFeature(feature.id);
                  }
                }}
              >
                {feature.mapDisplayMode === "polygon" && feature.projectedGeometryPath ? (
                  <path
                    aria-hidden="true"
                    className={[
                      "operator-map-region__shape",
                      "operator-map-region__shape--polygon",
                      isActive ? "is-active" : "",
                      isDimmed ? "is-dimmed" : ""
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    d={feature.projectedGeometryPath}
                    onClick={() => lockFeature(feature.id)}
                    onMouseEnter={() => {
                      if (!lockedFeature) {
                        activateFeature(feature.id);
                      }
                    }}
                  />
                ) : null}
                {feature.mapDisplayMode !== "polygon"
                  ? feature.projectedOverlays.map((overlay, index) => (
                      <path
                        aria-hidden="true"
                        className={[
                          "operator-map-region__shape",
                          isActive ? "is-active" : "",
                          isDimmed ? "is-dimmed" : ""
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        d={overlay.path}
                        key={`${feature.id}-${index}`}
                        onClick={() => lockFeature(feature.id)}
                        onMouseEnter={() => {
                          if (!lockedFeature) {
                            activateFeature(feature.id);
                          }
                        }}
                      />
                    ))
                  : null}
                {feature.mapDisplayMode !== "polygon" ? (
                  <>
                    <circle
                      aria-hidden="true"
                      className={[
                        "operator-map-region__pulse",
                        isActive ? "is-active" : "",
                        isDimmed ? "is-dimmed" : ""
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      cx={feature.projectedFocusPoint.x}
                      cy={feature.projectedFocusPoint.y}
                      r={isActive ? 18 : 12}
                    />
                    <circle
                      aria-hidden="true"
                      className={[
                        "operator-map-region__dot",
                        isActive ? "is-active" : "",
                        isDimmed ? "is-dimmed" : ""
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      cx={feature.projectedFocusPoint.x}
                      cy={feature.projectedFocusPoint.y}
                      r={isActive ? 6 : 4.5}
                    />
                  </>
                ) : null}
                <circle
                  aria-label={getFeatureAriaLabel(feature)}
                  className="operator-map-region__focus-target"
                  cx={feature.projectedFocusPoint.x}
                  cy={feature.projectedFocusPoint.y}
                  onClick={() => lockFeature(feature.id)}
                  onFocus={() => {
                    if (!lockedFeature) {
                      activateFeature(feature.id);
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      lockFeature(feature.id);
                    }

                    if (event.key === "Escape") {
                      event.preventDefault();
                      unlockFeature();
                    }
                  }}
                  onMouseEnter={() => {
                    if (!lockedFeature) {
                      activateFeature(feature.id);
                    }
                  }}
                  r={22}
                  role="button"
                  tabIndex={0}
                />
              </g>
            );
          })}
        </svg>
      </div>

      <aside className="map-stage__detail map-stage__detail--hero">
        <span className="section-eyebrow">
          {lockedFeature ? "Auswahl fixiert" : "Hover / Fokus"}
        </span>
        {activeFeature ? (
          <>
            <h3>{activeFeature.operatorName}</h3>
            <p>{activeFeature.currentBandsSummary}</p>
            <div className="table-operator">
              <span className="table-muted">Region: {activeFeature.regionLabel}</span>
              <span className="table-muted">{getPrecisionLabel(activeFeature)}</span>
              <span className="table-muted">{getCoverageLabel(activeFeature)}</span>
              <span className="table-muted">{getCoverageUnitsLabel(activeFeature)}</span>
              <span className="table-muted">{getStateHintLabel(activeFeature)}</span>
              <span className="table-muted">{activeFeature.geometrySourceLabel}</span>
            </div>
            <div className="table-operator">
              {activeFeature.geometrySourceUrl ? (
                <a
                  className="source-link"
                  href={activeFeature.geometrySourceUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Flächennachweis
                </a>
              ) : null}
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
          </>
        ) : (
          <>
            <h3>Keine belegte Netzfläche passt zur Suche</h3>
            <p>
              Die Deutschlandkarte bleibt sichtbar, zeigt aktuell aber nur Betreiber mit
              belastbarer Flächengeometrie.
            </p>
          </>
        )}
        <p className="map-stage__attribution">{scene.attribution}</p>
      </aside>
    </section>
  );
}
