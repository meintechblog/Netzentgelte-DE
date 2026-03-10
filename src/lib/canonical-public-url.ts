const LEGACY_NETZENTGELTE_PREFIX = "/prince2-vorbereitung/netzentgelte";
const CANONICAL_NETZENTGELTE_PREFIX = "/netzentgelte";

export function resolveCanonicalNetzentgeltePath(
  pathname: string,
  search = "",
  hash = ""
) {
  const normalizedPathname = String(pathname || "").trim() || "/";

  if (
    normalizedPathname !== LEGACY_NETZENTGELTE_PREFIX &&
    !normalizedPathname.startsWith(`${LEGACY_NETZENTGELTE_PREFIX}/`)
  ) {
    return null;
  }

  const suffix = normalizedPathname.slice(LEGACY_NETZENTGELTE_PREFIX.length);
  const canonicalPath = `${CANONICAL_NETZENTGELTE_PREFIX}${suffix || "/"}`;
  return `${canonicalPath}${search}${hash}`;
}

export function buildCanonicalNetzentgelteRedirectScript() {
  return `
(() => {
  const LEGACY_PREFIX = "${LEGACY_NETZENTGELTE_PREFIX}";
  const CANONICAL_PREFIX = "${CANONICAL_NETZENTGELTE_PREFIX}";
  const pathname = String(window.location.pathname || "").trim() || "/";
  const search = window.location.search || "";
  const hash = window.location.hash || "";

  if (pathname !== LEGACY_PREFIX && !pathname.startsWith(LEGACY_PREFIX + "/")) {
    return;
  }

  const suffix = pathname.slice(LEGACY_PREFIX.length);
  const target = CANONICAL_PREFIX + (suffix || "/") + search + hash;

  if (target !== pathname + search + hash) {
    window.location.replace(target);
  }
})();
`.trim();
}
