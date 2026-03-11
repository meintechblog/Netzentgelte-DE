# Netzentgelte Deutschland

Zentrale Datenplattform fuer deutsche Stromnetzbetreiber mit Fokus auf `Paragraf 14a`-Netzentgelte, Quellenpruefung und nachvollziehbare Publikation.

Live:

- Public app: [https://kigenerated.de/netzentgelte/](https://kigenerated.de/netzentgelte/)
- Public API: [https://kigenerated.de/netzentgelte/api/operators.json](https://kigenerated.de/netzentgelte/api/operators.json)
- LXC development app: `http://192.168.3.178:3000`

## Projektueberblick

Das Projekt sammelt Netzbetreiberdaten, Tariflogiken, Zeitfenster, Quellenbelege und Geometriehinweise in einer eigenen Datenbasis und spielt daraus einen oeffentlichen Read-Stand als Webapp und API aus.

Der aktuelle Fokus liegt auf:

- Betreiber-Registry fuer Deutschland
- `14a Modul 3`-Tarife mit Bands, Zeitfenstern und Quartalslogik
- nachvollziehbaren Quellen- und Compliance-Informationen
- sauberer Trennung zwischen internem Arbeitsstand und oeffentlichem Snapshot

## API Ueberblick

Die API ist oeffentlich lesbar und liefert JSON.

Eigenschaften:

- nur `GET`
- keine Authentifizierung
- keine Query-Parameter fuer die oeffentlichen Endpunkte
- Content-Type: `application/json`
- oeffentliche Auslieferung als statischer Snapshot unter dem App-Pfad
- `id === slug`

Es gibt zwei Zugriffsebenen mit gleichem Datenmodell:

### Oeffentliche Snapshot-API

- `GET /netzentgelte/api/operators.json`
- `GET /netzentgelte/api/operators/<slug>.json`

Beispiel:

- [https://kigenerated.de/netzentgelte/api/operators.json](https://kigenerated.de/netzentgelte/api/operators.json)
- [https://kigenerated.de/netzentgelte/api/operators/netze-bw.json](https://kigenerated.de/netzentgelte/api/operators/netze-bw.json)

### Interne Next.js-API fuer Entwicklung und Betrieb

- `GET /api/operators`
- `GET /api/operators/<slug>`

Beispiel LXC:

- `http://192.168.3.178:3000/api/operators`
- `http://192.168.3.178:3000/api/operators/netze-bw`

## Schnellstart fuer Integrationen

Typischer Ablauf:

1. Betreiberliste laden
2. `items[].id` oder `items[].slug` fuer die UI-Auswahl verwenden
3. beim Absenden das Detail fuer genau diesen Betreiber laden
4. `item.bands`, `item.timeWindows` oder `item.quarterMatrix[].slots[]` weiterverarbeiten

Beispiel in JavaScript:

```ts
const list = await fetch("https://kigenerated.de/netzentgelte/api/operators.json").then((response) =>
  response.json()
);

const operatorId = list.items[0].id;

const detail = await fetch(
  `https://kigenerated.de/netzentgelte/api/operators/${operatorId}.json`
).then((response) => response.json());

console.log(detail.item.name);
console.log(detail.item.bands);
console.log(detail.item.timeWindows);
console.log(detail.item.quarterMatrix[0].slots[0]);
```

Beispiel mit `curl`:

```bash
curl -fsS https://kigenerated.de/netzentgelte/api/operators.json | jq '.items[0]'
curl -fsS https://kigenerated.de/netzentgelte/api/operators/netze-bw.json | jq '.item.bands'
curl -fsS https://kigenerated.de/netzentgelte/api/operators/netze-bw.json | jq '.item.quarterMatrix[0].slots[0]'
```

## Endpoint Referenz

| Endpoint | Zweck | Erfolg |
| --- | --- | --- |
| `GET /netzentgelte/api/operators.json` | Liste aller oeffentlich publizierten Betreiber | `200` |
| `GET /netzentgelte/api/operators/<slug>.json` | Detaildaten fuer einen Betreiber | `200` |
| `GET /api/operators` | Interne Liste im Next.js-App-Runtime-Kontext | `200` |
| `GET /api/operators/<slug>` | Internes Detail im Next.js-App-Runtime-Kontext | `200`, sonst `404` |

## GET /netzentgelte/api/operators.json

Liefert die oeffentlich publizierte Betreiberliste fuer Auswahlfelder, Suchindizes und erste Uebersichten.

### Response

```json
{
  "items": [
    {
      "id": "netze-bw",
      "slug": "netze-bw",
      "name": "Netze BW GmbH",
      "regionLabel": "Baden-Wuerttemberg",
      "reviewStatus": "verified",
      "sourceDocumentCount": 1,
      "latestValidFrom": "2026-01-01",
      "priceBasis": "assumed-netto",
      "complianceStatus": "violation",
      "complianceViolationCount": 1,
      "complianceNotEvaluatedCount": 0
    }
  ]
}
```

### Felder je Listeneintrag

| Feld | Typ | Bedeutung |
| --- | --- | --- |
| `id` | `string` | stabiler API-Identifier, identisch zu `slug` |
| `slug` | `string` | URL-tauglicher Betreiber-Slug |
| `name` | `string` | Anzeigename des Betreibers |
| `regionLabel` | `string` | grobe regionale Zuordnung |
| `reviewStatus` | `"verified" \| "pending"` | Pruefstatus des publizierten Datensatzes |
| `sourceDocumentCount` | `number` | Anzahl beruecksichtigter Quelldokumente im Snapshot |
| `latestValidFrom` | `string` | Tarifgueltigkeit ab, Format `YYYY-MM-DD` |
| `priceBasis` | `string` | Preisbasis, z. B. `netto` oder `assumed-netto` |
| `complianceStatus` | `"compliant" \| "violation" \| "not-evaluable"` | Ergebnis der Regelpruefung |
| `complianceViolationCount` | `number` | Anzahl gefundener Regelverstoesse |
| `complianceNotEvaluatedCount` | `number` | Anzahl nicht bewertbarer Regeln |

## GET /netzentgelte/api/operators/<slug>.json

Liefert den vollstaendigen publizierten Datensatz fuer einen Betreiber.

Dieser Endpunkt ist fuer die eigentliche Weiterverarbeitung gedacht, zum Beispiel fuer:

- Tarif-Rendering
- Zeitslot-Mapping
- Preisband-Zuordnung
- Compliance-Hinweise
- Quellenverlinkung

### Response

```json
{
  "item": {
    "id": "netze-bw",
    "slug": "netze-bw",
    "name": "Netze BW GmbH",
    "regionLabel": "Baden-Wuerttemberg",
    "operatorSlug": "netze-bw",
    "operatorName": "Netze BW GmbH",
    "modelKey": "14a-model-3",
    "validFrom": "2026-01-01",
    "reviewStatus": "verified",
    "sourceSlug": "netze-bw-netze-bw-14a-2026",
    "checkedAt": "2026-03-09",
    "priceBasis": "assumed-netto",
    "sourcePageUrl": "https://www.netze-bw.de/neuregelung-14a-enwg",
    "documentUrl": "https://assets.ctfassets.net/example/netzentgelte.pdf",
    "summary": "NT 3.03 ct/kWh · ST 7.57 ct/kWh · HT 11.06 ct/kWh · Preisbasis Netto angenommen",
    "bands": [],
    "timeWindows": [],
    "quarterMatrix": [],
    "compliance": {}
  }
}
```

### Top-Level Felder in `item`

| Feld | Typ | Bedeutung |
| --- | --- | --- |
| `id` | `string` | stabiler API-Identifier |
| `slug` | `string` | URL-tauglicher Betreiber-Slug |
| `name` | `string` | Anzeigename |
| `regionLabel` | `string` | regionale Kurzbeschreibung |
| `operatorSlug` | `string` | fachlicher Betreiber-Slug, identisch zum aktuellen `slug` |
| `operatorName` | `string` | fachlicher Betreibername, identisch zu `name` |
| `modelKey` | `string` | Tarifmodell, aktuell `14a-model-3` |
| `validFrom` | `string` | Tarifgueltigkeit ab, `YYYY-MM-DD` |
| `reviewStatus` | `string` | Publikationsstatus des Datensatzes |
| `sourceSlug` | `string` | eindeutiger Snapshot-/Quellen-Identifier |
| `checkedAt` | `string \| null` | letzter Pruefzeitpunkt |
| `priceBasis` | `string` | Preisbasis des publizierten Datensatzes |
| `sourcePageUrl` | `string` | Quellseite |
| `documentUrl` | `string` | konkretes Dokument oder Artefakt |
| `summary` | `string` | kompakte Preiszusammenfassung |
| `bands` | `Band[]` | Preisstufen |
| `timeWindows` | `TimeWindow[]` | veroeffentlichte Tarifzeitfenster |
| `quarterMatrix` | `Quarter[]` | vorberechnete Quartals- und Slot-Darstellung |
| `compliance` | `Compliance` | Regelpruefung gegen das hinterlegte Regelwerk |

### `bands`

`bands` beschreibt die publizierten Preisstufen.

Beispiel:

```json
[
  {
    "key": "NT",
    "label": "Niedertarifstufe",
    "valueCtPerKwh": "3.03",
    "sourceQuote": "Niedertarifstufe 3,03 ct/kWh",
    "priceBasis": "assumed-netto"
  }
]
```

| Feld | Typ | Bedeutung |
| --- | --- | --- |
| `key` | `"NT" \| "ST" \| "HT"` | Band-Schluessel |
| `label` | `string` | menschenlesbare Band-Bezeichnung |
| `valueCtPerKwh` | `string` | Preis in `ct/kWh` als String |
| `sourceQuote` | `string` | kurzer Herkunftsausschnitt |
| `priceBasis` | `string` | Preisbasis dieses Bands |

### `timeWindows`

`timeWindows` bildet die publizierten Zeitfenster in komprimierter Form ab.

Beispiel:

```json
[
  {
    "id": "netze-bw-2026-high-peak",
    "bandKey": "HT",
    "label": "Hochtarif",
    "seasonLabel": "Q1-Q4 2026",
    "dayLabel": "Alle Tage",
    "timeRangeLabel": "17:00-22:00",
    "sourceQuote": "Hochtarif 17:00-22:00 Uhr"
  }
]
```

| Feld | Typ | Bedeutung |
| --- | --- | --- |
| `id` | `string` | stabiles Zeitfenster-Id |
| `bandKey` | `"NT" \| "ST" \| "HT"` | zugeordnete Preisstufe |
| `label` | `string` | menschenlesbare Bezeichnung |
| `seasonLabel` | `string` | saisonale oder quartalsbezogene Gueltigkeit |
| `dayLabel` | `string` | Tagesregel, aktuell haeufig `Alle Tage` |
| `timeRangeLabel` | `string` | Zeitbereich, z. B. `17:00-22:00` |
| `sourceQuote` | `string` | kurze Quellenangabe |

### `quarterMatrix`

`quarterMatrix` ist die fuer Clients am leichtesten nutzbare Darstellung, wenn konkrete Zeitslots benoetigt werden.

Sie enthaelt fuer jedes Quartal:

- zusammengefasste Gruppen
- Timeline-Eintraege
- `slots` in 15-Minuten-Aufloesung
- `segments` fuer blockartige Visualisierung

Minimalbeispiel:

```json
[
  {
    "key": "Q1",
    "label": "Q1",
    "summaryLabel": "Tarifstufen aktiv",
    "coverageStatus": "official",
    "groups": [],
    "timelineEntries": [],
    "slots": [
      {
        "slotIndex": 0,
        "startLabel": "00:00",
        "endLabel": "00:15",
        "timeLabel": "00:00-00:15",
        "bandKey": "ST",
        "bandLabel": "Standardtarif",
        "valueCtPerKwh": "7.57",
        "priceBasis": "assumed-netto",
        "isHourStart": true,
        "coverageStatus": "official"
      }
    ],
    "segments": []
  }
]
```

#### Felder auf Quartalsebene

| Feld | Typ | Bedeutung |
| --- | --- | --- |
| `key` | `"Q1" \| "Q2" \| "Q3" \| "Q4"` | Quartalsschluessel |
| `label` | `string` | Anzeigename |
| `summaryLabel` | `string` | kompakte Quartalszusammenfassung |
| `coverageStatus` | `"official" \| "assumed-st" \| "empty"` | Herkunft/Deckungsstatus |
| `groups` | `QuarterGroup[]` | zusammengefasste Preisgruppen |
| `timelineEntries` | `QuarterTimelineEntry[]` | verdichtete Zeitlinien-Eintraege |
| `slots` | `QuarterSlot[]` | 96 Slots pro Tag in 15-Minuten-Schritten |
| `segments` | `QuarterSegment[]` | grobere Blockdarstellung |

#### `QuarterGroup`

| Feld | Typ | Bedeutung |
| --- | --- | --- |
| `bandKey` | `"NT" \| "ST" \| "HT"` | Preisband |
| `label` | `string` | menschenlesbarer Band-Name |
| `valueCtPerKwh` | `string` | Preis fuer die Gruppe |
| `priceBasis` | `string` | Preisbasis der Gruppe |
| `timeRanges` | `string[]` | zusammengefasste Zeitbereiche |
| `sourceQuotes` | `string[]` | Quellenzitate der Gruppe |
| `coverageStatus` | `"official" \| "assumed-st"` | Herkunft der Gruppenzuordnung |

#### `QuarterTimelineEntry`

| Feld | Typ | Bedeutung |
| --- | --- | --- |
| `bandKey` | `"NT" \| "ST" \| "HT"` | Preisband |
| `label` | `string` | menschenlesbarer Band-Name |
| `valueCtPerKwh` | `string` | Preis fuer den Zeitblock |
| `priceBasis` | `string` | Preisbasis |
| `timeRange` | `string` | kompakter Zeitblock, z. B. `00:00-10:00` |

#### Felder auf Slot-Ebene

| Feld | Typ | Bedeutung |
| --- | --- | --- |
| `slotIndex` | `number` | laufender 15-Minuten-Index von `0` bis `95` |
| `startLabel` | `string` | Startzeit |
| `endLabel` | `string` | Endzeit |
| `timeLabel` | `string` | kombinierte Darstellung, z. B. `00:00-00:15` |
| `bandKey` | `"NT" \| "ST" \| "HT" \| null` | zugeordnetes Band |
| `bandLabel` | `string` | menschenlesbare Band-Bezeichnung |
| `valueCtPerKwh` | `string` | Preis fuer diesen Slot |
| `priceBasis` | `string \| null` | Preisbasis fuer diesen Slot |
| `isHourStart` | `boolean` | `true`, wenn der Slot auf voller Stunde beginnt |
| `coverageStatus` | `"official" \| "assumed-st" \| "empty"` | Herkunft des Slot-Werts |

#### `QuarterSegment`

| Feld | Typ | Bedeutung |
| --- | --- | --- |
| `startSlotIndex` | `number` | erster Slot des Segments |
| `endSlotIndex` | `number` | erster Slot nach Segmentende |
| `startLabel` | `string` | Startzeit des Segments |
| `endLabel` | `string` | Endzeit des Segments |
| `timeLabel` | `string` | kompakter Zeitblock |
| `bandKey` | `"NT" \| "ST" \| "HT" \| null` | Preisband des Segments |
| `bandLabel` | `string` | menschenlesbarer Band-Name |
| `valueCtPerKwh` | `string` | Preis fuer das Segment |
| `priceBasis` | `string \| null` | Preisbasis |
| `coverageStatus` | `"official" \| "assumed-st" \| "empty"` | Herkunft der Segmentbelegung |

### `compliance`

`compliance` liefert die Regelpruefung gegen das hinterlegte Modul-3-Regelwerk.

Beispiel:

```json
{
  "ruleSetId": "bdew-modul-3-v1-1",
  "status": "violation",
  "violations": [
    {
      "ruleId": "nt_between_10_and_40_percent_of_st",
      "title": "NT zwischen 10 und 40 Prozent des ST",
      "severity": "high",
      "message": "NT liegt mit 3.03 ct/kWh ausserhalb des zulaessigen Korridors relativ zu ST 7.57 ct/kWh.",
      "sourceCitation": "Niedriglasttarif (NT): Korridor zwischen 10 % und 40 % des ST."
    }
  ],
  "passes": [],
  "notEvaluated": []
}
```

| Feld | Typ | Bedeutung |
| --- | --- | --- |
| `ruleSetId` | `string` | verwendetes Regelwerk |
| `status` | `"compliant" \| "violation" \| "not-evaluable"` | Gesamtergebnis |
| `violations` | `ComplianceRuleResult[]` | verletzte Regeln |
| `passes` | `ComplianceRuleResult[]` | bestandene Regeln |
| `notEvaluated` | `ComplianceRuleResult[]` | nicht ausgewertete Regeln |

## Statuscodes

### Oeffentliche Snapshot-API

| Status | Bedeutung |
| --- | --- |
| `200` | Datei vorhanden und erfolgreich geladen |
| `404` | Betreiberdatei oder Snapshot-Datei existiert nicht |

### Interne Next.js-API

| Status | Bedeutung |
| --- | --- |
| `200` | erfolgreicher JSON-Response |
| `404` | Betreiber nicht gefunden |

Beispiel fuer den internen `404`-Body:

```json
{
  "error": "operator_not_found",
  "operatorSlug": "unbekannt"
}
```

## TypeScript Referenz

```ts
type OperatorListResponse = {
  items: OperatorListItem[];
};

type OperatorListItem = {
  id: string;
  slug: string;
  name: string;
  regionLabel: string;
  reviewStatus: "verified" | "pending";
  sourceDocumentCount: number;
  latestValidFrom: string;
  priceBasis: string;
  complianceStatus: "compliant" | "violation" | "not-evaluable";
  complianceViolationCount: number;
  complianceNotEvaluatedCount: number;
};

type OperatorDetailResponse = {
  item: OperatorDetail;
};

type OperatorDetail = {
  id: string;
  slug: string;
  name: string;
  regionLabel: string;
  operatorSlug: string;
  operatorName: string;
  modelKey: "14a-model-3";
  validFrom: string;
  reviewStatus: "verified" | "pending";
  sourceSlug: string;
  checkedAt: string | null;
  priceBasis: string;
  sourcePageUrl: string;
  documentUrl: string;
  summary: string;
  bands: Band[];
  timeWindows: TimeWindow[];
  quarterMatrix: Quarter[];
  compliance: Compliance;
};

type Band = {
  key: "NT" | "ST" | "HT";
  label: string;
  valueCtPerKwh: string;
  sourceQuote: string;
  priceBasis: string;
};

type TimeWindow = {
  id: string;
  bandKey: "NT" | "ST" | "HT";
  label: string;
  seasonLabel: string;
  dayLabel: string;
  timeRangeLabel: string;
  sourceQuote: string;
};

type Quarter = {
  key: "Q1" | "Q2" | "Q3" | "Q4";
  label: string;
  summaryLabel: string;
  coverageStatus: "official" | "assumed-st" | "empty";
  groups: QuarterGroup[];
  timelineEntries: QuarterTimelineEntry[];
  slots: QuarterSlot[];
  segments: QuarterSegment[];
};

type QuarterGroup = {
  bandKey: "NT" | "ST" | "HT";
  label: string;
  valueCtPerKwh: string;
  priceBasis: string;
  timeRanges: string[];
  sourceQuotes: string[];
  coverageStatus: "official" | "assumed-st";
};

type QuarterTimelineEntry = {
  bandKey: "NT" | "ST" | "HT";
  label: string;
  valueCtPerKwh: string;
  priceBasis: string;
  timeRange: string;
};

type QuarterSlot = {
  slotIndex: number;
  startLabel: string;
  endLabel: string;
  timeLabel: string;
  bandKey: "NT" | "ST" | "HT" | null;
  bandLabel: string;
  valueCtPerKwh: string;
  priceBasis: string | null;
  isHourStart: boolean;
  coverageStatus: "official" | "assumed-st" | "empty";
};

type QuarterSegment = {
  startSlotIndex: number;
  endSlotIndex: number;
  startLabel: string;
  endLabel: string;
  timeLabel: string;
  bandKey: "NT" | "ST" | "HT" | null;
  bandLabel: string;
  valueCtPerKwh: string;
  priceBasis: string | null;
  coverageStatus: "official" | "assumed-st" | "empty";
};

type Compliance = {
  ruleSetId: string;
  status: "compliant" | "violation" | "not-evaluable";
  violations: ComplianceRuleResult[];
  passes: ComplianceRuleResult[];
  notEvaluated: ComplianceRuleResult[];
};

type ComplianceRuleResult = {
  ruleId: string;
  title: string;
  severity: "low" | "medium" | "high";
  message: string;
  sourceCitation: string;
};
```

## Maintainer Hinweise

Die oeffentliche API unter `/netzentgelte/api/*.json` ist aktuell ein statischer Snapshot der publizierten Betreiberdaten.

Wichtige Pfade:

- interner App-Code auf Hetzner: `/usr/home/bpjwjy/apps/netzentgelte-deutschland`
- oeffentliche statische Auslieferung: `/usr/home/bpjwjy/apps/prince2-vorbereitung/web/netzentgelte`
- LXC-Entwicklung: `/root/netzentgelte-de`

Weiterfuehrende Runbooks:

- [hetzner-public-netzentgelte.md](/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/docs/runbooks/hetzner-public-netzentgelte.md)
- [lxc-release.md](/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/docs/runbooks/lxc-release.md)
