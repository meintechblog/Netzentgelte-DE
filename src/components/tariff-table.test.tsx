import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { getSeedPublishedOperators } from "../modules/operators/current-catalog";
import { getRegistryTariffRows } from "../lib/view-models/tariffs";
import { TariffTable } from "./tariff-table";

describe("TariffTable", () => {
  test("renders a quarterly tariff matrix anchored on the Schwäbisch Hall source layout", () => {
    const schwaebischHall = getRegistryTariffRows(getSeedPublishedOperators()).find(
      (row) => row.operatorSlug === "stadtwerke-schwaebisch-hall"
    );

    render(
      <TariffTable
        rows={[schwaebischHall!]}
      />
    );

    expect(screen.getByText("Stadtwerke Schwäbisch Hall GmbH")).toBeInTheDocument();
    expect(screen.getByText("Schwäbisch Hall")).toBeInTheDocument();
    expect(screen.getByText("NT 1.11 ct/kWh · ST 5.53 ct/kWh · HT 8.14 ct/kWh")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Quellseite" })).toHaveAttribute(
      "href",
      "https://stadtwerke-hall.de/tarife-angebote/service/downloadcenter/netze"
    );
    expect(screen.getByText(/Zuletzt geprüft 2026-03-09/)).toBeInTheDocument();
    expect(screen.getByText("Q1")).toBeInTheDocument();
    expect(screen.getByText("Q2")).toBeInTheDocument();
    expect(screen.getByText("Q3")).toBeInTheDocument();
    expect(screen.getByText("Q4")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Netzbetreiber" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Q1" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Q2" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Q3" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Q4" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Review" })).toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Quelle" })).not.toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Gültig ab" })).not.toBeInTheDocument();
    expect(screen.getByText("Nur Standardtarif")).toBeInTheDocument();
    expect(screen.getByText("00:00-24:00")).toBeInTheDocument();
    expect(screen.getAllByText("10:00-14:00")).toHaveLength(3);
    expect(screen.getAllByText("22:00-00:00")).toHaveLength(3);
    expect(
      screen.getByText(/Quelle stadtwerke-schwaebisch-hall-stadtwerke-schwaebisch-hall-14a-2026/)
    ).toBeInTheDocument();
  });
});
