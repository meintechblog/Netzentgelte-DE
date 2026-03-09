# Operator Shell Registry Design

## Ziel

Eine belastbare Grundhülle für alle deutschen Strom-Verteilnetzbetreiber aufbauen, damit die Plattform nicht erst mit vollständig geparsten Tarifdaten skalieren kann. Die Hülle soll Discovery, Quellensuche, Geometrie-Arbeit und spätere Preisbefüllung voneinander trennen.

## Entscheidung

- Die Plattform bekommt ein eigenes `Operator Shell Registry` als interne Vollständigkeitsbasis.
- Ein Shell-Eintrag ist noch kein veröffentlichter Tarifdatensatz.
- Öffentlich sichtbar bleiben weiterhin nur `verified` und `publishable` Tarifstände.
- Die Shell darf dagegen auch unvollständig sein, solange klar dokumentiert ist, was bereits bekannt ist und was noch fehlt.

## Warum dieser Schritt jetzt sinnvoll ist

- Die aktuelle Plattform hat bereits API, Tarifmodell, Kartenbasis und Review-Gates.
- Der Engpass ist nun nicht mehr Architektur, sondern Abdeckung.
- Für knapp 900 Netzbetreiber wäre ein “direkt vollständig extrahieren”-Ansatz zu langsam und zu fehleranfällig.
- Mit einer Shell-Struktur können mehrere Agenten später parallel arbeiten, ohne jedes Mal erst dieselbe Discovery-Grundlage neu aufzubauen.

## Scope der Shell

Ein Shell-Eintrag soll mindestens folgende Basisfelder tragen:

- `slug`
- `operatorName`
- `legalName` oder offizieller Registername
- `websiteUrl`
- `mastrId` oder alternative Registerkennung, wenn vorhanden
- `operatorType` / grobe Kategorie
- `regionLabel`
- `stateHints`
- `coverageStatus`
- `sourceStatus`
- `tariffStatus`
- `reviewStatus`
- `lastCheckedAt`
- `notes`

Zusätzlich braucht jeder Shell-Eintrag verknüpfte Kandidaten für:

- Registerquelle
- Betreiberprofil
- Quellseite
- Dokument/PDF
- Geometriehinweis

## Statusmodell

Die Shell braucht einen expliziten Ausbaupfad:

- `shell`
- `profile-found`
- `source-found`
- `document-found`
- `parsed`
- `verified`
- `published`

Ergänzend dazu getrennte Teilstatus:

- `coverageStatus`: `unknown | hinted | exact`
- `sourceStatus`: `missing | candidate | reachable | snapshotted`
- `tariffStatus`: `missing | partial | parsed | verified`

Damit können Discovery und Tarifqualität unabhängig voneinander wachsen.

## Datenquellen

Die erste Vollständigkeitsbasis soll nicht aus den bisherigen kuratierten Tarifquellen kommen, sondern aus Register- und Verzeichnisquellen:

- Bundesnetzagentur / MaStR als Primärliste
- VNBdigital als Profil- und Website-Enrichment
- später ergänzend Betreiberseiten, Registerexporte und regionale Listen

Für den ersten Ausbau reicht es, die Shell auf belastbaren Listen- und Profilquellen aufzubauen. Tarifwerte werden in dieser Phase noch nicht vorausgesetzt.

## Datenmodell

Bestehende veröffentlichte Tarifmodelle bleiben erhalten. Neu kommt eine eigenständige Shell-Schicht hinzu:

- `operator_shells`
- `operator_shell_sources`
- optional `operator_shell_aliases`

Diese Schicht speichert Vollständigkeit, Discovery-Notizen und Kandidatenquellen, ohne das bestehende `operators`/`tariff_versions`-Publikationsmodell zu vermischen.

Die spätere Beziehung ist:

- `operator_shell` ist der interne Master-Kandidat
- `operators` bleibt das veröffentlichte, qualitätsgegate Abbild
- ein verifizierter Shell-Eintrag kann in `operators` materialisiert oder damit synchronisiert werden

## Import- und Pflegefluss

1. Registerquelle importieren und in `operator_shells` normalisieren
2. Shell-Dubletten über Name/Slug/Identifier prüfen
3. Profil-/Website-Kandidaten ergänzen
4. Quellseite- und Dokumentkandidaten ergänzen
5. Erst dann tarifliche Befüllung starten

Wichtig: Das System muss idempotent sein. Ein späterer Refresh darf Shell-Einträge aktualisieren, aber nicht chaotisch duplizieren.

## UI / API

Kurzfristig:

- Öffentliche Seite bleibt bei `verified`-Tarifen
- Neue interne bzw. erweiterte API liefert Shell-Status und Ausbaugrad

Mittelfristig:

- eigener Bereich `Netzbetreiberabdeckung`
- Filter nach `shell/source-found/parsed/verified`
- Such- und Arbeitsoberfläche für Human-in-the-loop

## Guardrails

- Keine Shell-Daten als fertige Tarifwahrheit ausgeben
- Keine automatischen Tarifwerte ohne Quellbeleg publizieren
- Keine Geometriebehauptungen ohne belastbare Quelle
- Shell und veröffentlichte Tarifdaten strikt trennen

## Erfolgskriterium für den ersten Slice

- Das System kann mehr Betreiber als die heutige kuratierte Tarifmenge speichern
- Die Shell-Struktur ist DB-backed und importierbar
- Ein API-/Read-Model zeigt Ausbaugrad pro Betreiber
- Der spätere Parallelbetrieb ist vorbereitet, weil Discovery und Tarifbefüllung getrennt sind
