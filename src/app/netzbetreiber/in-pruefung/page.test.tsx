import { render, screen, within } from "@testing-library/react";
import { expect, test } from "vitest";

import PendingOperatorsPage from "./page";

test("renders the public pending operator page with minimal review rows", async () => {
  render(await PendingOperatorsPage());

  expect(screen.getByRole("heading", { name: "Netzbetreiber in Prüfung" })).toBeInTheDocument();
  expect(
    screen.getByText(/Tarifdetails bleiben verborgen, bis die offizielle Evidenz vollständig geprüft ist/i)
  ).toBeInTheDocument();
  expect(screen.getByText(/Mainnetz GmbH/i)).toBeInTheDocument();
  expect(screen.queryByText(/Netze BW GmbH/i)).not.toBeInTheDocument();

  const table = screen.getByRole("table", { name: "Netzbetreiber in Prüfung" });
  expect(within(table).getAllByText("Quelle gefunden").length).toBeGreaterThan(0);
  expect(within(table).getAllByText("Tarifprüfung läuft").length).toBeGreaterThan(0);
});
