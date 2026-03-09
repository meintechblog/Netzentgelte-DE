import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import HomePage from "./page";

test("renders project shell", () => {
  render(<HomePage />);
  expect(screen.getByText("Netzentgelte Deutschland")).toBeInTheDocument();
  expect(screen.getAllByText(/Netze BW/).length).toBeGreaterThan(0);
});
