type OperatorExclusionInput = {
  slug?: string;
  name?: string;
  legalName?: string;
  websiteUrl?: string;
  sourcePageUrl?: string;
};

const EXCLUDED_TRANSMISSION_PATTERNS = [
  "50hertz",
  "amprion",
  "tennet",
  "transnetbw",
  "transnet-bw"
];

const EXCLUDED_TRANSMISSION_HOSTS = [
  "50hertz.com",
  "amprion.net",
  "tennet.eu",
  "transnetbw.de"
];

function normalizeText(value: string | undefined) {
  return (value ?? "")
    .toLocaleLowerCase("de")
    .normalize("NFKD")
    .replace(/[^\w\s.-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getHostname(value: string | undefined) {
  if (!value) {
    return "";
  }

  try {
    return new URL(value).hostname.replace(/^www\./, "").toLocaleLowerCase("de");
  } catch {
    return "";
  }
}

export function isExcludedTransmissionOperator(input: OperatorExclusionInput) {
  const searchText = [
    normalizeText(input.slug),
    normalizeText(input.name),
    normalizeText(input.legalName),
    getHostname(input.websiteUrl),
    getHostname(input.sourcePageUrl)
  ]
    .filter(Boolean)
    .join(" ");

  return (
    EXCLUDED_TRANSMISSION_PATTERNS.some((pattern) => searchText.includes(pattern)) ||
    EXCLUDED_TRANSMISSION_HOSTS.some((host) => searchText.includes(host))
  );
}
