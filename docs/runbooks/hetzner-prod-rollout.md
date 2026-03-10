# Hetzner Production Rollout

## Zielbild

- Entwicklung, Backfills, Compliance und Verifikation laufen auf `CT128` unter `/root/netzentgelte-de`.
- Oeffentliche Auslieferung auf `kigenerated.de` ist eine statische Public-Version.
- Finale Haupt-URL ist `https://kigenerated.de/netzentgelte/`.
- Bestehende App `https://kigenerated.de/prince2-vorbereitung` bleibt unberuehrt.
- Shared Hosting bekommt keinen zweiten Node-Prozess fuer Netzentgelte, sondern nur Dateien.

## Warum dieses Modell

- Hetzner Webhosting L laesst sich fuer die bestehende `prince2`-App nutzen, ist aber unzuverlaessig fuer einen zweiten parallelen Node-Subpath.
- Die Public-App ist read-only und kann aus einem exportierten Snapshot gebaut werden.
- Die produktive Daten- und Job-Last bleibt damit auf `CT128`.

## Finales Public-Layout auf dem Hosting

```text
/usr/www/users/bpjwjy/netzentgelte/
  index.html
  404.html
  _next/static/...
  data/netzentgelte/meta.json
  data/netzentgelte/snapshot.json

/usr/www/users/bpjwjy/public_html/netzentgelte/
  index.html
  404.html
  _next/static/...
  data/netzentgelte/meta.json
  data/netzentgelte/snapshot.json
```

Die doppelte Ablage ist Absicherung gegen die undokumentierte Frontdoor-/Docroot-Variante des Webhostings.

## Build auf CT128

Vor dem Build:

```bash
ssh proxi1 'pct exec 128 -- bash -lc "
  cd /root/netzentgelte-de &&
  find . -name \"._*\" -type f -delete
"'
```

Public-Build:

```bash
ssh proxi1 'pct exec 128 -- bash -lc "
  cd /root/netzentgelte-de &&
  NEXT_PUBLIC_BASE_PATH=/netzentgelte pnpm export:public &&
  NEXT_PUBLIC_BASE_PATH=/netzentgelte pnpm typecheck &&
  NEXT_PUBLIC_BASE_PATH=/netzentgelte pnpm test &&
  NEXT_PUBLIC_BASE_PATH=/netzentgelte pnpm build
"'
```

## Deploy auf `www438.your-server.de`

Die Zielpfade sind per Domain-SSH erreichbar:

```bash
ssh -p 222 bpjwjy@www438.your-server.de
```

Artefakte ausrollen:

```bash
ssh -p 222 bpjwjy@www438.your-server.de '
  mkdir -p \
    /usr/www/users/bpjwjy/netzentgelte/_next/static \
    /usr/www/users/bpjwjy/netzentgelte/data/netzentgelte \
    /usr/www/users/bpjwjy/public_html/netzentgelte/_next/static \
    /usr/www/users/bpjwjy/public_html/netzentgelte/data/netzentgelte
'

scp -P 222 .next/server/app/index.html \
  bpjwjy@www438.your-server.de:/usr/www/users/bpjwjy/netzentgelte/index.html
scp -P 222 .next/server/app/_not-found.html \
  bpjwjy@www438.your-server.de:/usr/www/users/bpjwjy/netzentgelte/404.html
scp -P 222 public/netzentgelte/meta.json public/netzentgelte/snapshot.json \
  bpjwjy@www438.your-server.de:/usr/www/users/bpjwjy/netzentgelte/data/netzentgelte/
rsync -az --delete -e 'ssh -p 222' .next/static/ \
  bpjwjy@www438.your-server.de:/usr/www/users/bpjwjy/netzentgelte/_next/static/

scp -P 222 .next/server/app/index.html \
  bpjwjy@www438.your-server.de:/usr/www/users/bpjwjy/public_html/netzentgelte/index.html
scp -P 222 .next/server/app/_not-found.html \
  bpjwjy@www438.your-server.de:/usr/www/users/bpjwjy/public_html/netzentgelte/404.html
scp -P 222 public/netzentgelte/meta.json public/netzentgelte/snapshot.json \
  bpjwjy@www438.your-server.de:/usr/www/users/bpjwjy/public_html/netzentgelte/data/netzentgelte/
rsync -az --delete -e 'ssh -p 222' .next/static/ \
  bpjwjy@www438.your-server.de:/usr/www/users/bpjwjy/public_html/netzentgelte/_next/static/
```

## Altpfade

- Alte aktive Haupt-URL: `https://kigenerated.de/prince2-vorbereitung/netzentgelte/`
- Neue Haupt-URL: `https://kigenerated.de/netzentgelte/`

Der verschachtelte Altpfad sollte nur noch per Redirect oder statischer Hinweis-Seite auf die neue Haupt-URL zeigen.

## Verifikation

```bash
curl -I https://kigenerated.de/netzentgelte/
curl -I https://kigenerated.de/netzentgelte/_next/static/chunks/4f89753f-1e7502e145cbdcac.js
curl -I https://kigenerated.de/prince2-vorbereitung
curl -L https://kigenerated.de/netzentgelte/ | grep -i '<title>Netzentgelte Deutschland'
```

Browser-Check:

- URL endet auf `/netzentgelte/`
- Titel `Netzentgelte Deutschland`
- keine Asset-404s ausser optional `favicon.ico`
- `prince2-vorbereitung` bleibt funktionsfaehig

## Wichtige Lessons Learned

- Auf diesem Hosting-Paket ist ein zusaetzlicher Node-Subpath neben `prince2-vorbereitung` nicht belastbar.
- `/netzentgelte/` funktioniert als statischer Webspace-Pfad.
- Die eigentliche Anwendungslogik gehoert auf `CT128`; das Hosting liefert nur den Snapshot aus.
- Fuer kuenftige Webapps unter `kigenerated.de/<projektname>/` zuerst pruefen, ob ein statischer Export moeglich ist. Das ist auf diesem Setup der schnellste und stabilste Weg.
