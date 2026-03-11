# LXC Release Runbook

## Ziel

Neue App-Staende kontrolliert auf den Entwicklungs-Container `root@192.168.3.178` ausrollen, ohne gespeicherte Artefakte unter `data/artifacts` zu verlieren.

## Release-Ablauf

1. Release-Verzeichnis neu befuellen:

```bash
COPYFILE_DISABLE=1 tar \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.playwright-cli' \
  --exclude='data/artifacts' \
  --exclude='tmp' \
  -C /Users/hulki/projects/netzentgelte-de \
  -czf - . \
| ssh root@192.168.3.178 '
    rm -rf /root/netzentgelte-de-release &&
    mkdir -p /root/netzentgelte-de-release &&
    tar -xzf - -C /root/netzentgelte-de-release &&
    mkdir -p /root/netzentgelte-de-release/data &&
    if [ -d /root/netzentgelte-de/data/artifacts ]; then
      cp -R /root/netzentgelte-de/data/artifacts /root/netzentgelte-de-release/data/;
    fi &&
    if [ -f /root/netzentgelte-de/.env ]; then
      cp /root/netzentgelte-de/.env /root/netzentgelte-de-release/.env;
    fi
  '
```

2. Falls noetig AppleDouble-Reste loeschen:

```bash
ssh root@192.168.3.178 'find /root/netzentgelte-de-release -name "._*" -delete'
```

3. Release-Verzeichnis verifizieren:

```bash
ssh root@192.168.3.178 '
  cd /root/netzentgelte-de-release &&
  pnpm install --frozen-lockfile &&
  pnpm test &&
  pnpm lint &&
  rm -rf .next &&
  env -u NEXT_PUBLIC_BASE_PATH pnpm build &&
  pnpm typecheck
'
```

4. Verzeichnis umschalten und Port `3000` neu starten:

```bash
ssh root@192.168.3.178 '
  set -e
  old_pid=$(ss -ltnp | sed -n "s/.*:3000 .*pid=\\([0-9]\\+\\).*/\\1/p" | head -n 1)
  rm -rf /root/netzentgelte-de-prev
  if [ -d /root/netzentgelte-de ]; then mv /root/netzentgelte-de /root/netzentgelte-de-prev; fi
  mv /root/netzentgelte-de-release /root/netzentgelte-de
  if [ -n "$old_pid" ]; then kill "$old_pid"; fi
  cd /root/netzentgelte-de
  nohup pnpm start > /root/netzentgelte-de.log 2>&1 &
'
```

5. Live-Checks:

```bash
ssh root@192.168.3.178 '
  pid=$(ss -ltnp | sed -n "s/.*:3000 .*pid=\\([0-9]\\+\\).*/\\1/p" | head -n 1)
  readlink /proc/$pid/cwd
'

curl -fsS http://192.168.3.178:3000 | rg 'Zeitfenster|18:00-21:00|N-ERGIE'
curl -fsS http://192.168.3.178:3000 | rg 'href="/_next/static/css/'
curl -fsS http://192.168.3.178:3000/api/tariffs/current | rg 'timeWindows|18:00-21:00|n-ergie-netz'
```

Nach dem Code-Deploy fuer neue Registry-/Shell-Eintraege:

```bash
ssh root@192.168.3.178 '
  cd /root/netzentgelte-de &&
  pnpm registry:import &&
  pnpm shells:import
'
```

Fuer den automatisierten Betrieb ist dieser LXC-Teil Teil des stuedlichen Koordinators. Der lokale Vorab-Check dafuer ist:

```bash
pnpm automation:backfill-koordinator:dry-run
```

## Hinweise

- `COPYFILE_DISABLE=1` ist auf macOS Pflicht. Ohne diese Variable erzeugt `tar` zusaetzliche `._*`-Dateien, die Vitest als kaputte Testdateien einsammelt.
- `data/artifacts` bleibt bewusst ausserhalb des Paket-Transfers und wird aus dem aktiven Verzeichnis in das Release kopiert.
- `tmp/` muss aus dem Transfer ausgeschlossen bleiben. Der Ordner kann lokale Import- oder Extraktionsartefakte im GB-Bereich enthalten und blockiert sonst den Release-Upload.
- Der Release-Check muss im Release-Verzeichnis selbst laufen, nicht nur lokal.
- Der LXC-Host laeuft bewusst ohne `NEXT_PUBLIC_BASE_PATH`. Vor jedem Root-Build deshalb `.next` loeschen und `env -u NEXT_PUBLIC_BASE_PATH pnpm build` verwenden, sonst zeigen HTML und CSS-Linking auf `/netzentgelte/_next/...` und das Styling faellt auf `http://192.168.3.178:3000` aus.
