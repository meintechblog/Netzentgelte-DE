import { render, screen, within } from "@testing-library/react";
import { expect, test } from "vitest";

import HomePage from "./page";

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
  expect(screen.getAllByText("Endkunden · Niederspannung").length).toBeGreaterThan(0);
  expect(screen.getAllByText("Modul 1").length).toBeGreaterThan(0);
  expect(screen.getAllByText("Modul 2").length).toBeGreaterThan(0);
  expect(screen.getAllByText("Modul 3").length).toBeGreaterThan(0);
  expect(screen.getAllByText("Messung").length).toBeGreaterThan(0);
  expect(screen.getByText("61,00 €/a")).toBeInTheDocument();
  expect(screen.getByText("108,70 €/a")).toBeInTheDocument();
  expect(screen.getByText("9,50 €/a")).toBeInTheDocument();
  expect(
    screen.getByText(/Öffentlich erscheinen nur verifizierte und integritätsgeprüfte Betreiber/i)
  ).toBeInTheDocument();
  expect(screen.getByText("Dark mode · WCAG AA")).toBeInTheDocument();
  expect(screen.getAllByText(/Prüfstatus:/).length).toBeGreaterThan(0);
});
