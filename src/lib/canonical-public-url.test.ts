import { describe, expect, test } from "vitest";

import {
  buildCanonicalNetzentgelteRedirectScript,
  resolveCanonicalNetzentgeltePath
} from "./canonical-public-url";

describe("resolveCanonicalNetzentgeltePath", () => {
  test("returns null for canonical and unrelated paths", () => {
    expect(resolveCanonicalNetzentgeltePath("/netzentgelte/")).toBeNull();
    expect(resolveCanonicalNetzentgeltePath("/prince2-vorbereitung")).toBeNull();
  });

  test("redirects the legacy nested root path to the canonical public path", () => {
    expect(resolveCanonicalNetzentgeltePath("/prince2-vorbereitung/netzentgelte/")).toBe("/netzentgelte/");
    expect(resolveCanonicalNetzentgeltePath("/prince2-vorbereitung/netzentgelte")).toBe("/netzentgelte/");
  });

  test("preserves nested suffixes, query strings, and hashes", () => {
    expect(
      resolveCanonicalNetzentgeltePath(
        "/prince2-vorbereitung/netzentgelte/data/netzentgelte/snapshot.json",
        "?v=1",
        "#top"
      )
    ).toBe("/netzentgelte/data/netzentgelte/snapshot.json?v=1#top");
  });
});

describe("buildCanonicalNetzentgelteRedirectScript", () => {
  test("embeds the legacy prefix and canonical target", () => {
    const script = buildCanonicalNetzentgelteRedirectScript();

    expect(script).toContain("/prince2-vorbereitung/netzentgelte");
    expect(script).toContain("/netzentgelte");
    expect(script).toContain("window.location.replace");
  });
});
