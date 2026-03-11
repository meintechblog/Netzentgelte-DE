#!/usr/bin/env bash

set -euo pipefail

DRY_RUN=0
SKIP_BUILD=0

for arg in "$@"; do
  case "$arg" in
    --dry-run)
      DRY_RUN=1
      ;;
    --skip-build)
      SKIP_BUILD=1
      ;;
    *)
      echo "Unknown argument: $arg" >&2
      echo "Usage: $0 [--dry-run] [--skip-build]" >&2
      exit 1
      ;;
  esac
done

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
PROJECT_ROOT=$(cd "$SCRIPT_DIR/../.." && pwd)
STAGING_DIR="$PROJECT_ROOT/.deploy-public"
UPLOAD_DIR="/tmp/netzentgelte-public-upload"

TARGETS=(
  "/usr/www/users/bpjwjy/netzentgelte"
  "/usr/www/users/bpjwjy/public_html/netzentgelte"
  "/usr/home/bpjwjy/apps/prince2-vorbereitung/web/netzentgelte"
)

run() {
  if [[ "$DRY_RUN" -eq 1 ]]; then
    printf '[dry-run] %s\n' "$*"
    return 0
  fi

  eval "$@"
}

cd "$PROJECT_ROOT"

if [[ "$SKIP_BUILD" -eq 0 ]]; then
  run "NEXT_PUBLIC_BASE_PATH=/netzentgelte pnpm export:public"
  run "NEXT_PUBLIC_BASE_PATH=/netzentgelte pnpm build"
fi

run "rm -rf '$STAGING_DIR'"
run "mkdir -p '$STAGING_DIR/data/netzentgelte' '$STAGING_DIR/_next' '$STAGING_DIR/netzbetreiber/in-pruefung'"
run "cp '.next/server/app/index.html' '$STAGING_DIR/index.html'"
run "cp '.next/server/app/netzbetreiber/in-pruefung.html' '$STAGING_DIR/netzbetreiber/in-pruefung/index.html'"
run "cp '.next/server/app/_not-found.html' '$STAGING_DIR/_not-found.html'"
run "cp '.next/server/app/_not-found.html' '$STAGING_DIR/404.html'"
run "cp 'public/data/netzentgelte/meta.json' '$STAGING_DIR/data/netzentgelte/meta.json'"
run "cp 'public/data/netzentgelte/snapshot.json' '$STAGING_DIR/data/netzentgelte/snapshot.json'"
run "cp 'public/data/netzentgelte/pending-operators.json' '$STAGING_DIR/data/netzentgelte/pending-operators.json'"
run "cp -R '.next/static' '$STAGING_DIR/_next/static'"

echo "Publishing static snapshot to:"
for target in "${TARGETS[@]}"; do
  echo " - $target"
done

if [[ "$DRY_RUN" -eq 1 ]]; then
  exit 0
fi

COPYFILE_DISABLE=1 COPY_EXTENDED_ATTRIBUTES_DISABLE=1 tar -C "$STAGING_DIR" -czf - . | ssh hetzner-netzentgelte "ssh -p 222 bpjwjy@kigenerated.de 'rm -rf $UPLOAD_DIR && mkdir -p $UPLOAD_DIR && tar xzf - -C $UPLOAD_DIR'"

ssh hetzner-netzentgelte "ssh -p 222 bpjwjy@kigenerated.de 'for target in ${TARGETS[*]}; do \
  mkdir -p \"\$target\" \"\$target/_next\" \"\$target/data\" \"\$target/netzbetreiber/in-pruefung\"; \
  rm -rf \"\$target/_next/static\" \"\$target/data/netzentgelte\" \"\$target/netzbetreiber/in-pruefung\"; \
  cp \"$UPLOAD_DIR/index.html\" \"\$target/index.html\"; \
  mkdir -p \"\$target/netzbetreiber/in-pruefung\"; \
  cp \"$UPLOAD_DIR/netzbetreiber/in-pruefung/index.html\" \"\$target/netzbetreiber/in-pruefung/index.html\"; \
  cp \"$UPLOAD_DIR/_not-found.html\" \"\$target/_not-found.html\"; \
  cp \"$UPLOAD_DIR/404.html\" \"\$target/404.html\"; \
  cp -R \"$UPLOAD_DIR/_next/static\" \"\$target/_next/static\"; \
  mkdir -p \"\$target/data\"; \
  cp -R \"$UPLOAD_DIR/data/netzentgelte\" \"\$target/data/netzentgelte\"; \
done'"

TMP_VERIFY_HTML=$(mktemp)
TMP_PENDING_HTML=$(mktemp)
trap 'rm -f "$TMP_VERIFY_HTML" "$TMP_PENDING_HTML"' EXIT
curl -fsSL https://kigenerated.de/netzentgelte/ -o "$TMP_VERIFY_HTML"
grep -qi '<title>Netzentgelte Deutschland' "$TMP_VERIFY_HTML"
curl -fsSL https://kigenerated.de/netzentgelte/netzbetreiber/in-pruefung -o "$TMP_PENDING_HTML"
grep -qi 'Netzbetreiber in Prüfung' "$TMP_PENDING_HTML"
grep -q '/netzentgelte/data/netzentgelte/pending-operators.json' "$TMP_PENDING_HTML"
curl -IfsS https://kigenerated.de/prince2-vorbereitung >/dev/null

echo "Public deploy complete: https://kigenerated.de/netzentgelte/"
