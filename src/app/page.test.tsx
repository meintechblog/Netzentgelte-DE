import { render, screen, within } from "@testing-library/react";
import { expect, test } from "vitest";

import HomePage from "./page";

const HOMEPAGE_COLD_RENDER_TIMEOUT_MS = 30_000;

test("renders the page shell around a dominant germany map hero", async () => {
  render(await HomePage());

  const searchbox = screen.getByRole("searchbox", { name: "Suchbegriff" });
  const heroSection = searchbox.closest("section");

  expect(screen.getByText("Netzentgelte Deutschland")).toBeInTheDocument();
  expect(searchbox).toBeInTheDocument();
  expect(heroSection).not.toBeNull();
  expect(within(heroSection as HTMLElement).getByText("Deutschlandkarte im Fokus")).toBeInTheDocument();
  expect(within(heroSection as HTMLElement).getByLabelText("Deutschlandkarte der Netzbetreiber")).toBeInTheDocument();
  expect((heroSection as HTMLElement).querySelector("svg")).not.toBeNull();
  expect(
    (heroSection as HTMLElement).compareDocumentPosition(
      screen.getByRole("heading", { name: "Netzbetreiber & Tarifdaten" })
    ) & Node.DOCUMENT_POSITION_FOLLOWING
  ).toBeTruthy();
  expect(screen.getAllByText(/Stromnetz Berlin/).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Stadtwerke Schwäbisch Hall/).length).toBeGreaterThan(0);
  expect(screen.queryByRole("heading", { name: "Quellenprüfung" })).not.toBeInTheDocument();
  expect(screen.getByText("Zeitfenster")).toBeInTheDocument();
  expect(screen.getAllByText("Hero-Karte").length).toBeGreaterThan(0);
  expect(
    screen.getAllByRole("button", { name: /Endkunden · Niederspannung .* Bereich aufklappen/i }).length
  ).toBeGreaterThan(0);
  expect(screen.queryByText("Modul 1")).not.toBeInTheDocument();
  expect(screen.queryByText("Modul 2")).not.toBeInTheDocument();
  expect(screen.queryByText("Modul 3")).not.toBeInTheDocument();
  expect(screen.queryByText("Messung")).not.toBeInTheDocument();
  expect(
    screen.getByText(/Öffentlich erscheinen nur verifizierte und integritätsgeprüfte Betreiber/i)
  ).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "Netzbetreiber in Prüfung" })
  ).toHaveAttribute("href", "/netzbetreiber/in-pruefung");
  expect(screen.getByText("Dark mode · WCAG AA")).toBeInTheDocument();
  expect(screen.getAllByText(/Prüfstatus:/).length).toBeGreaterThan(0);
  expect(screen.getByRole("heading", { name: "BDEW Anwendungshilfe Modul 3 1.1" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Regelwerk aufklappen" })).toBeInTheDocument();
  expect(
    screen.queryByRole("link", { name: "BDEW Anwendungshilfe Modul 3, Version 1.1" })
  ).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /Regelkonform \(\d+\)/ })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /Mit Verstößen \(\d+\)/ })).not.toBeInTheDocument();
}, HOMEPAGE_COLD_RENDER_TIMEOUT_MS);
