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
      screen.getByRole("heading", { name: "Aktuelle Tarifmatrix" })
    ) & Node.DOCUMENT_POSITION_FOLLOWING
  ).toBeTruthy();
  expect(screen.getAllByText(/Stromnetz Berlin/).length).toBeGreaterThan(0);
  expect(screen.getAllByText("Avacon Netz GmbH").length).toBeGreaterThan(0);
  expect(screen.getByRole("heading", { name: "Quellenprüfung" })).toBeInTheDocument();
  expect(screen.getByText("Zeitfenster")).toBeInTheDocument();
  expect(screen.getAllByText("Hero-Karte").length).toBeGreaterThan(0);
  expect(
    screen.getByText(/Öffentlich erscheinen nur verifizierte und integritätsgeprüfte Betreiber/i)
  ).toBeInTheDocument();
  expect(screen.getByText("Dark mode · WCAG AA")).toBeInTheDocument();
});
