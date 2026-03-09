import { render, screen, within } from "@testing-library/react";
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
    expect(screen.queryByText("NT 1.11 ct/kWh · ST 5.53 ct/kWh · HT 8.14 ct/kWh")).not.toBeInTheDocument();
    const bandBadges = within(screen.getByLabelText("Arbeitspreise in ct/kWh"));
    expect(bandBadges.getByText("NT")).toBeInTheDocument();
    expect(bandBadges.getByText("ST")).toBeInTheDocument();
    expect(bandBadges.getByText("HT")).toBeInTheDocument();
    expect(bandBadges.getByText("1.11")).toBeInTheDocument();
    expect(bandBadges.getByText("5.53")).toBeInTheDocument();
    expect(bandBadges.getByText("8.14")).toBeInTheDocument();
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
    const q1Section = screen.getByLabelText("Stadtwerke Schwäbisch Hall GmbH Q1");
    const q1Times = within(q1Section).getAllByRole("listitem").map((item) => item.textContent);
    expect(q1Times).toEqual([
      "00:00-07:00NT1.11",
      "07:00-10:00ST5.53",
      "10:00-14:00HT8.14",
      "14:00-18:00ST5.53",
      "18:00-20:00HT8.14",
      "20:00-22:00ST5.53",
      "22:00-00:00NT1.11"
    ]);
    expect(
      screen.getByText(/Quelle stadtwerke-schwaebisch-hall-stadtwerke-schwaebisch-hall-14a-2026/)
    ).toBeInTheDocument();
  });
});
