# Hetzner Production Rollout

## Zielbild

- Entwicklung und Build laufen auf `CT128` unter `/root/netzentgelte-de`
- Produktion laeuft auf `hetzner-netzentgelte` unter `/netzentgelte-deutschland`
- Die App wird unter dem Subpath `/netzentgelte-deutschland` veroeffentlicht
- Releases werden atomar ueber den Symlink `current` umgeschaltet

## Verzeichnislayout auf Hetzner

```text
/netzentgelte-deutschland/
  current -> /netzentgelte-deutschland/releases/<timestamp>
  releases/<timestamp>
  shared/.env
  logs/
```

## Vorbedingungen

1. Quellstand auf `CT128` ist aktuell und verifiziert:

```bash
ssh proxi1 'pct exec 128 -- bash -lc "
  cd /root/netzentgelte-de &&
  NEXT_PUBLIC_BASE_PATH=/netzentgelte-deutschland pnpm typecheck &&
  NEXT_PUBLIC_BASE_PATH=/netzentgelte-deutschland pnpm test &&
  NEXT_PUBLIC_BASE_PATH=/netzentgelte-deutschland pnpm build
"'
```

2. AppleDouble-Reste muessen vor dem Testen entfernt werden, falls der Stand von macOS synchronisiert wurde:

```bash
ssh proxi1 'pct exec 128 -- bash -lc "
  cd /root/netzentgelte-de &&
  find . -name \"._*\" -type f -delete
"'
```

## Release bauen und kopieren

```bash
timestamp=$(date +%Y%m%d%H%M%S)

ssh hetzner-netzentgelte "
  sudo mkdir -p \
    /netzentgelte-deutschland/releases/$timestamp \
    /netzentgelte-deutschland/shared \
    /netzentgelte-deutschland/logs
"

ssh proxi1 'pct exec 128 -- bash -lc "
  cd /root/netzentgelte-de &&
  tar \
    --exclude=.env \
    --exclude=.git \
    --exclude=node_modules \
    --exclude=.next/cache \
    --exclude=tmp \
    --exclude=tmp_missing_endcustomer.tsv \
    -czf - .
"' | ssh hetzner-netzentgelte "
  cd /netzentgelte-deutschland/releases/$timestamp &&
  tar xzf -
"
```

## Shared Environment

`/netzentgelte-deutschland/shared/.env` wird an jedes Release gelinkt.

Pflichtvariablen:

```bash
NEXT_PUBLIC_BASE_PATH=/netzentgelte-deutschland
NODE_ENV=production
```

Wenn die Produktivdatenbank erreichbar ist, kommt `DATABASE_URL` ausschliesslich in `shared/.env`.

## Symlink und Migration

```bash
ssh hetzner-netzentgelte "
  ln -sfn /netzentgelte-deutschland/shared/.env \
    /netzentgelte-deutschland/releases/$timestamp/.env &&
  ln -sfn /netzentgelte-deutschland/releases/$timestamp \
    /netzentgelte-deutschland/current
"
```

Migration nur ausfuehren, wenn `DATABASE_URL` auf dem Zielhost erreichbar ist:

```bash
ssh hetzner-netzentgelte '
  cd /netzentgelte-deutschland/current &&
  node scripts/db/migrate.mjs
'
```

## Systemd

Die Runtime laeuft ueber `netzentgelte-deutschland.service`:

```ini
[Unit]
Description=Netzentgelte Deutschland Next.js Runtime
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=/netzentgelte-deutschland/current
EnvironmentFile=/netzentgelte-deutschland/shared/.env
ExecStart=/usr/bin/node /netzentgelte-deutschland/current/node_modules/next/dist/bin/next start -p 3100 -H 127.0.0.1
Restart=always
RestartSec=5
StandardOutput=append:/netzentgelte-deutschland/logs/netzentgelte-deutschland.log
StandardError=append:/netzentgelte-deutschland/logs/netzentgelte-deutschland.log

[Install]
WantedBy=multi-user.target
```

Aktivierung:

```bash
ssh hetzner-netzentgelte '
  sudo systemctl daemon-reload &&
  sudo systemctl enable netzentgelte-deutschland.service &&
  sudo systemctl restart netzentgelte-deutschland.service
'
```

## Frontdoor

Auf dem Zielhost selbst laeuft kein oeffentlicher Webserver. Die App wird hinter dem vorhandenen `prince2-tutor-node`-Frontproxy unter `/netzentgelte-deutschland` eingebunden. Der oeffentliche Host `kigenerated.de` braucht zusaetzlich einen vorgeschalteten Apache-/Frontdoor-Eintrag fuer denselben Subpath.

## Verifikation

Intern auf dem Zielhost:

```bash
ssh hetzner-netzentgelte '
  systemctl status netzentgelte-deutschland --no-pager &&
  journalctl -u netzentgelte-deutschland -n 100 --no-pager &&
  curl -I http://127.0.0.1:8765/netzentgelte-deutschland &&
  curl -fsS http://127.0.0.1:8765/netzentgelte-deutschland | grep -i "<title>Netzentgelte Deutschland" &&
  curl -fsS http://127.0.0.1:8765/netzentgelte-deutschland/api/operators > /dev/null &&
  curl -fsS http://127.0.0.1:8765/netzentgelte-deutschland/api/tariffs/current > /dev/null &&
  curl -fsS http://127.0.0.1:8765/netzentgelte-deutschland/api/sources/current > /dev/null
'
```

## Rollback

```bash
ssh hetzner-netzentgelte '
  ln -sfn /netzentgelte-deutschland/releases/<previous-timestamp> /netzentgelte-deutschland/current &&
  sudo systemctl restart netzentgelte-deutschland.service
'
```
