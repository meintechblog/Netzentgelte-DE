import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Netzentgelte Deutschland",
  description: "Datenplattform fuer §14a Modell 3 Netzentgelte in Deutschland."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
