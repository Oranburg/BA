import { CHAPTER_ROUTES, DOCUMENTS, DOCUMENT_BY_SLUG, getTomePath } from "./corpus";

function normalize(text = "") {
  return text.toLowerCase().replace(/[.,]/g, " ").replace(/\s+/g, " ").trim();
}

function stripSectionPrefixes(text = "") {
  return normalize(text)
    .replace(/^section\s+/i, "")
    .replace(/^sec\.?\s+/i, "")
    .replace(/^§\s*/i, "")
    .trim();
}

export const ALIAS_INDEX = (() => {
  const index = new Map();
  DOCUMENTS.forEach((doc) => {
    [doc.shortName, doc.title, ...(doc.aliases || [])].forEach((alias) => {
      index.set(normalize(alias), doc);
    });
  });
  return index;
})();

export const SECTION_INDEX = (() => {
  const rows = [];
  DOCUMENTS.forEach((doc) => {
    (doc.sections || []).forEach((section, idx) => {
      rows.push({
        doc,
        section,
        idx,
        key: `${doc.shortName} § ${section.number}`,
        sectionNorm: normalize(section.number),
      });
    });
  });
  return rows;
})();

function parseCitation(input) {
  const text = normalize(input);
  const docMatch = DOCUMENTS.find((doc) => {
    const keys = [doc.shortName, doc.title, ...(doc.aliases || [])].map(normalize);
    return keys.some((k) => text.includes(k));
  });

  const secMatch = text.match(/(?:§|section|sec\.?|tit\.)\s*([0-9][0-9a-z.()-]*)/i) || text.match(/\b([0-9]+(?:\.[0-9]+)?(?:\([a-z0-9]+\))*)\b/i);
  const sectionNumber = secMatch?.[1] ? secMatch[1].replace(/\s+/g, "") : "";

  if (docMatch && sectionNumber) {
    return { doc: docMatch, sectionNumber, confidence: "high" };
  }

  if (text.includes("del. code") && text.includes("tit. 8") && sectionNumber) {
    return { doc: DOCUMENTS.find((d) => d.shortName === "DGCL"), sectionNumber, confidence: "high" };
  }

  if (text.includes("26 u.s.c") && text.includes("501(c)(3)")) {
    return { doc: DOCUMENTS.find((d) => d.shortName === "IRC 501(c)(3)"), sectionNumber: "501(c)(3)", confidence: "high" };
  }

  if (docMatch) {
    return { doc: docMatch, sectionNumber: "", confidence: "medium" };
  }

  return null;
}

export function getDocBySlug(slug) {
  return DOCUMENT_BY_SLUG[slug] || null;
}

export function getSectionBySlug(doc, sectionSlug) {
  if (!doc || !sectionSlug) return null;
  return (doc.sections || []).find((s) => `section-${normalize(s.number).replace(/[^a-z0-9]+/g, "-")}` === sectionSlug) || null;
}

export function resolveQuery(input) {
  const query = (input || "").trim();
  if (!query) return { type: "empty", documents: [], sections: [], concepts: [] };

  const qNorm = normalize(query);
  const aliasDoc = ALIAS_INDEX.get(qNorm) || null;
  const bareSection = stripSectionPrefixes(query);
  const isSectionOnly = /^([0-9]+(?:\.[0-9]+)?(?:\([a-z0-9]+\))*)$/i.test(bareSection);

  if (aliasDoc) {
    return {
      type: "doc",
      feedback: `You searched for '${query}' — showing ${aliasDoc.shortName}`,
      document: aliasDoc,
      documents: [aliasDoc],
      sections: (aliasDoc.sections || []).slice(0, 7).map((section) => ({
        doc: aliasDoc,
        section,
        relevance: "Alias match",
      })),
      concepts: [],
    };
  }

  if (isSectionOnly) {
    const matches = SECTION_INDEX.filter((row) => row.sectionNorm === normalize(bareSection)).slice(0, 7);
    if (matches.length > 1) {
      return {
        type: "disambiguation",
        feedback: `Section ${bareSection} appears in multiple documents.`,
        matches: matches.map((row, rank) => ({
          ...row,
          emphasized: rank === 0,
          preview: row.section.text.split(" ").slice(0, 26).join(" "),
        })),
      };
    }
    if (matches.length === 1) {
      return {
        type: "section",
        feedback: `Exact section match for § ${bareSection}.`,
        result: matches[0],
      };
    }
  }

  const citation = parseCitation(query);
  if (citation?.doc && citation.sectionNumber) {
    const section = (citation.doc.sections || []).find((s) => normalize(s.number) === normalize(citation.sectionNumber));
    if (section) {
      return {
        type: "section",
        feedback: `Citation resolved to ${citation.doc.shortName} § ${section.number}.`,
        result: { doc: citation.doc, section },
      };
    }
  }

  const documents = DOCUMENTS.filter((doc) => {
    const hay = [doc.shortName, doc.title, ...(doc.aliases || [])].join(" ");
    return normalize(hay).includes(qNorm);
  }).slice(0, 7);

  const sections = SECTION_INDEX.filter(({ doc, section }) => {
    const hay = `${doc.shortName} ${doc.title} ${section.number} ${section.title} ${(section.concepts || []).join(" ")} ${section.text}`;
    return normalize(hay).includes(qNorm);
  })
    .slice(0, 7)
    .map((row, i) => ({
      ...row,
      relevance:
        normalize(row.section.number) === qNorm
          ? "Exact section match"
          : normalize(row.section.title).includes(qNorm)
          ? "Section title match"
          : normalize(row.section.text).includes(qNorm)
          ? "Phrase found in text"
          : "Related concept",
      emphasized: i === 0,
    }));

  const concepts = SECTION_INDEX.filter(({ section }) => (section.concepts || []).some((c) => normalize(c).includes(qNorm) || qNorm.includes(normalize(c))))
    .slice(0, 7)
    .map((row) => ({ ...row, relevance: "Related concept" }));

  if (documents.length === 0 && sections.length === 0 && concepts.length === 0) {
    return {
      type: "not-in-corpus",
      message: `Not in the corpus. '${query}' is not currently available in the Tome.`,
    };
  }

  return {
    type: "search",
    documents,
    sections,
    concepts,
  };
}

export function findSection(shortName, sectionNumber) {
  const doc = DOCUMENTS.find((d) => normalize(d.shortName) === normalize(shortName));
  if (!doc) return null;
  const section = (doc.sections || []).find((s) => normalize(s.number) === normalize(sectionNumber));
  if (!section) return null;
  return { doc, section };
}

export function coverageAnswer(query) {
  const q = (query || "").trim();
  if (!q) return null;
  const res = resolveQuery(q);

  let doc = null;
  if (res.type === "doc") doc = res.document;
  if (res.type === "section") doc = res.result.doc;
  if (!doc && res.documents?.length) doc = res.documents[0];

  if (!doc) {
    return `Not in the corpus. This document is not currently available in the Tome.`;
  }

  const chapterText = (doc.chapters || []).length ? `Cited in: ${doc.chapters.map((c) => `Ch. ${c}`).join(", ")}.` : "Not yet cited in chapters.";
  return `Yes. ${doc.coverage}. Version in use: ${doc.versionInUse}. Added/verified ${doc.lastVerified}. ${chapterText}`;
}

export function getPrevNext(doc, section) {
  if (!doc || !section) return { prev: null, next: null };
  const list = doc.sections || [];
  const idx = list.findIndex((s) => s.number === section.number);
  return {
    prev: idx > 0 ? list[idx - 1] : null,
    next: idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null,
  };
}

export function getBreadcrumbs(doc, section) {
  if (!doc || !section) return [];
  return [
    { label: doc.shortName, to: `/tome/${doc.slug}` },
    { label: section.article || "Section", to: `/tome/${doc.slug}` },
    { label: `§ ${section.number}`, to: getTomePath(doc, section) },
  ];
}

export function buildChapterLink(ch) {
  return CHAPTER_ROUTES[ch] || "/";
}

export function getReverseCitations(targetShort, targetSection) {
  const target = `${targetShort} § ${targetSection}`;
  const cites = [];
  SECTION_INDEX.forEach(({ doc, section }) => {
    const refs = section.crossRefs || [];
    refs.forEach((ref) => {
      if (normalize(ref.target) === normalize(target)) {
        cites.push({ doc, section, label: ref.label || "Cross-reference" });
      }
    });

    const hay = `${section.text} ${section.title}`;
    if (normalize(hay).includes(normalize(target))) {
      cites.push({ doc, section, label: "Text citation" });
    }
  });
  return cites;
}
