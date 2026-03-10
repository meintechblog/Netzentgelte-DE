import type { Metadata } from "next";
import { Fira_Code, Fira_Sans } from "next/font/google";
import type { ReactNode } from "react";

import { buildCanonicalNetzentgelteRedirectScript } from "../lib/canonical-public-url";

import "./globals.css";

const firaSans = Fira_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700"]
});

const firaCode = Fira_Code({
  subsets: ["latin", "latin-ext"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "Netzentgelte Deutschland",
  description: "Datenplattform für §14a Modell 3 Netzentgelte in Deutschland."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: buildCanonicalNetzentgelteRedirectScript()
          }}
        />
      </head>
      <body className={`${firaSans.variable} ${firaCode.variable}`}>{children}</body>
    </html>
  );
}
