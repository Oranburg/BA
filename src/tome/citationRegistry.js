import { DOCUMENTS } from "./corpus";

function normalize(value = "") {
  return value
    .toLowerCase()
    .replace(/[.,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function collectAliases(doc) {
  const aliases = [
    doc.shortName,
    doc.title,
    doc.id,
    doc.slug,
    ...(doc.aliases || []),
  ];

  if (doc.id === "genius-act") {
    aliases.push(
      "Public Law 119-27",
      "Pub. L. 119-27",
      "Pub L 119-27",
      "PLAW 119-27",
      "PLAW-119-27",
      "PLAW 119",
      "PLAW-119"
    );
  }

  return aliases;
}

function buildAliasIndex() {
  const index = new Map();

  DOCUMENTS.forEach((doc) => {
    collectAliases(doc).forEach((alias) => {
      index.set(normalize(alias), doc);
    });
  });

  return index;
}

const CITATION_ALIAS_INDEX = buildAliasIndex();

function parseSectionNumber(input) {
  const text = normalize(input);
  const sectionMatch =
    text.match(/(?:§|section|sec\.?|tit\.)\s*([0-9][0-9a-z.()-]*)/i) ||
    text.match(/\b([0-9]+(?:\.[0-9]+)?(?:\([a-z0-9]+\))*)\b/i);

  return sectionMatch?.[1] ? sectionMatch[1].replace(/\s+/g, "") : "";
}

function findDocument(input) {
  const qNorm = normalize(input);

  const exact = CITATION_ALIAS_INDEX.get(qNorm);
  if (exact) return exact;

  for (const [alias, doc] of CITATION_ALIAS_INDEX.entries()) {
    if (qNorm.includes(alias)) return doc;
  }

  return null;
}

export function resolveCitation(input) {
  const query = String(input || "").trim();
  if (!query) {
    return { found: false, kind: "empty", query };
  }

  const document = findDocument(query);
  if (!document) {
    return {
      found: false,
      kind: "unresolved",
      query,
      message: `Citation '${query}' is not in the current Tome corpus.`,
    };
  }

  const sectionNumber = parseSectionNumber(query);
  const section = sectionNumber
    ? (document.sections || []).find(
        (entry) => normalize(entry.number) === normalize(sectionNumber)
      ) || null
    : null;

  if (sectionNumber && !section) {
    return {
      found: true,
      kind: "document",
      query,
      document,
      canonicalId: document.id,
      canonicalLabel: document.shortName,
      message: `Resolved '${query}' to ${document.shortName}, but section ${sectionNumber} is not available in corpus text.`,
    };
  }

  if (section) {
    return {
      found: true,
      kind: "section",
      query,
      document,
      section,
      canonicalId: document.id,
      canonicalLabel: `${document.shortName} § ${section.number}`,
    };
  }

  return {
    found: true,
    kind: "document",
    query,
    document,
    canonicalId: document.id,
    canonicalLabel: document.shortName,
  };
}

export function getCitationAliasIndex() {
  return CITATION_ALIAS_INDEX;
}
