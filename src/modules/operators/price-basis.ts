export type PriceBasis = "netto" | "brutto" | "assumed-netto";

export function getPriceBasisLabel(priceBasis: PriceBasis) {
  switch (priceBasis) {
    case "netto":
      return "Nettobasis";
    case "brutto":
      return "Bruttobasis, auf Netto normiert";
    case "assumed-netto":
      return "Nettobasis (angenommen)";
  }
}

export function normalizePriceValueToNet(valueCtPerKwh: string, priceBasis: PriceBasis) {
  if (priceBasis !== "brutto") {
    return valueCtPerKwh;
  }

  if (!/^-?\d+(?:\.\d+)?$/.test(valueCtPerKwh)) {
    return valueCtPerKwh;
  }

  return (Number.parseFloat(valueCtPerKwh) / 1.19).toFixed(4);
}
