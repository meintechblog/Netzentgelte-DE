import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import HomePage from "./page";

test("renders project shell", async () => {
  render(await HomePage());
  expect(screen.getByText("Netzentgelte Deutschland")).toBeInTheDocument();
  expect(screen.getByRole("searchbox", { name: "Suchbegriff" })).toBeInTheDocument();
  expect(screen.getAllByText(/Stromnetz Berlin/).length).toBeGreaterThan(0);
  expect(screen.getByRole("heading", { name: "Quellenprüfung" })).toBeInTheDocument();
  expect(screen.getByText("Zeitfenster")).toBeInTheDocument();
  expect(screen.getAllByRole("heading", { name: "Q1-Q4 2026" }).length).toBeGreaterThan(0);
  expect(screen.getAllByText("17:00-22:00").length).toBeGreaterThan(0);
  expect(screen.getByText("Dark mode · WCAG AA")).toBeInTheDocument();
});
