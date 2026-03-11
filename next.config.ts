import type { NextConfig } from "next";

function normalizeBasePath(value: string | undefined) {
  if (!value) {
    return "";
  }

  const trimmed = value.trim();

  if (!trimmed || trimmed === "/") {
    return "";
  }

  const withoutTrailingSlash = trimmed.replace(/\/+$/, "");

  return withoutTrailingSlash.startsWith("/") ? withoutTrailingSlash : `/${withoutTrailingSlash}`;
}

const basePath = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH);

const nextConfig: NextConfig = basePath
  ? {
      basePath
    }
  : {};

export default nextConfig;
