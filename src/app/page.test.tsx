import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import HomePage from "./page";

test("renders project shell", async () => {
  render(await HomePage());
  expect(screen.getByText("Netzentgelte Deutschland")).toBeInTheDocument();
  expect(screen.getAllByText(/Netze BW/).length).toBeGreaterThan(0);
  expect(screen.getByRole("heading", { name: "Quellenpruefung" })).toBeInTheDocument();
  expect(screen.getByText("Zeitfenster")).toBeInTheDocument();
});
