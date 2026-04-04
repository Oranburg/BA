import { CHAPTER_ROUTES, DOCUMENTS, DOCUMENT_BY_SLUG, getTomePath, loadSections, loadAllSections } from "./corpus";
import { APP_ROUTES, HASH_TARGETS } from "../routing/routes";
import { resolveCitation } from "./citationRegistry";

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

/**
 * Build SECTION_INDEX from currently loaded sections.
 * Called each time sections are loaded for a document.
 */
function buildSectionIndex() {
  const rows = [];
  DOCUMENTS.forEach((doc) => {
    (doc.sections || []).forEach((section, idx) => {
      rows.push({
        doc,
        section,
        idx,
        key: `${doc.shortName} § ${section.number}`,
        sectionNorm: normalize(section.number),
        conceptsNorm: (section.concepts || []).map((c) => normalize(c)),
      });
    });
  });
  return rows;
}

/** Mutable section index -- rebuilds when sections are loaded. */
let SECTION_INDEX = buildSectionIndex();

/** Rebuild the section index after new sections are loaded. */
export function rebuildIndex() {
  SECTION_INDEX = buildSectionIndex();
}

/** Load all sections and rebuild index (for full-text search). */
export async function loadAllAndRebuild() {
  await loadAllSections();
  rebuildIndex();
}

/** Load sections for a specific document and rebuild the index. */
export async function loadDocSections(doc) {
  await loadSections(doc);
  rebuildIndex();
  return doc;
}

export function getSectionIndex() {
  return SECTION_INDEX;
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

  const citation = resolveCitation(query);
  if (citation.found && citation.kind === "section") {
    return {
      type: "section",
      feedback: `Citation resolved to ${citation.document.shortName} § ${citation.section.number}.`,
      result: { doc: citation.document, section: citation.section },
    };
  }

  const documents = DOCUMENTS.filter((doc) => {
    const hay = [doc.shortName, doc.title, ...(doc.aliases || [])].join(" ");
    return normalize(hay).includes(qNorm);
  }).slice(0, 10);

  // Split query into individual terms for multi-word matching
  const queryTerms = qNorm.split(/\s+/).filter((t) => t.length > 1);

  // Score and rank all matching sections
  const scored = SECTION_INDEX.map(({ doc, section, idx, key, sectionNorm, conceptsNorm }) => {
    let score = 0;
    let relevance = "";
    const titleNorm = normalize(section.title);
    const textNorm = normalize(section.text);

    // Exact section number match (highest priority)
    if (sectionNorm === qNorm) {
      score += 100;
      relevance = "Exact section match";
    }

    // Section title contains full query
    if (titleNorm.includes(qNorm)) {
      score += 50;
      relevance = relevance || "Title match";
    }

    // Concept tag match (strong signal — these are curated)
    const conceptHits = conceptsNorm.filter((c) => c.includes(qNorm) || qNorm.includes(c)).length;
    if (conceptHits > 0) {
      score += 30 * conceptHits;
      relevance = relevance || "Concept match";
    }

    // Individual term matching for multi-word queries
    if (queryTerms.length > 1) {
      const titleTermHits = queryTerms.filter((t) => titleNorm.includes(t)).length;
      const conceptTermHits = queryTerms.filter((t) => conceptsNorm.some((c) => c.includes(t))).length;
      const textTermHits = queryTerms.filter((t) => textNorm.includes(t)).length;
      score += titleTermHits * 15;
      score += conceptTermHits * 12;
      score += textTermHits * 3;
      if (score > 0 && !relevance) {
        relevance = titleTermHits > 0 ? "Title match" : conceptTermHits > 0 ? "Concept match" : "Text match";
      }
    }

    // Full-text contains full query phrase
    if (score === 0 && textNorm.includes(qNorm)) {
      score += 10;
      relevance = "Phrase found in text";
    }

    // Single-term text match (weakest)
    if (score === 0 && queryTerms.length === 1 && textNorm.includes(qNorm)) {
      score += 5;
      relevance = "Text match";
    }

    return score > 0 ? { doc, section, idx, key, score, relevance, emphasized: false } : null;
  }).filter(Boolean);

  // Sort by score descending, take top 15
  scored.sort((a, b) => b.score - a.score);
  const sections = scored.slice(0, 15);
  if (sections.length > 0) sections[0].emphasized = true;

  // Separate concept matches (deduplicated from sections)
  const sectionKeys = new Set(sections.map((s) => s.key));
  const concepts = scored
    .filter((s) => !sectionKeys.has(s.key) && s.relevance === "Concept match")
    .slice(0, 10);

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
    { label: doc.shortName, to: `${APP_ROUTES.tomeHome}/${doc.slug}` },
    { label: section.article || "Section", to: `${APP_ROUTES.tomeHome}/${doc.slug}` },
    { label: `§ ${section.number}`, to: getTomePath(doc, section) },
  ];
}

export function buildChapterLink(ch) {
  return CHAPTER_ROUTES[ch] || `${APP_ROUTES.home}#${HASH_TARGETS.problems}`;
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
