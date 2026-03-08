import { FlatCompat } from "@eslint/eslintrc";
import nextVitals from "eslint-config-next/core-web-vitals.js";
import nextTypescript from "eslint-config-next/typescript.js";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname
});

const config = [
  ...compat.config(nextVitals),
  ...compat.config(nextTypescript),
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts"]
  }
];

export default config;
