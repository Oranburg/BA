import { APP_ROUTES } from "../routing/routes";

export const COVERAGE_BADGES = {
  FULL_TEXT: "Full text",
  EXCERPTED: "Excerpted",
  KEY_SECTIONS: "Key sections only",
  SUMMARY_ONLY: "Summary only",
  NOT_AVAILABLE: "Not yet available",
};

export const DOCUMENT_CATEGORIES = {
  UNIFORM_ACTS: "Uniform Acts",
  STATE_CODES: "State Codes",
  FEDERAL: "Federal",
  RESTATEMENTS: "Restatements",
  CASES: "Cases",
  SCHOLARSHIP: "Scholarship",
};

export const DOCUMENTS = [
  {
    id: "rupa",
    shortName: "RUPA",
    slug: "rupa",
    title: "Revised Uniform Partnership Act (1997, as amended)",
    aliases: [
      "Revised UPA",
      "UPA 1997",
      "RUPA 1997",
      "UPA97",
      "Uniform Partnership Act",
      "partnership act",
      "revised partnership act",
    ],
    version: "1997 (amended 2013)",
    versionInUse: "RUPA 1997/2013",
    lastVerified: "2026-04-03",
    coverage: COVERAGE_BADGES.FULL_TEXT,
    chapters: [2, 3, 8, 9, 15],
    hierarchyType: "uniform",
    category: DOCUMENT_CATEGORIES.UNIFORM_ACTS,
    sectionsFile: "rupa-sections.json",
    sections: [],
  },
  {
    id: "upa",
    shortName: "UPA",
    slug: "upa",
    title: "Uniform Partnership Act (1914)",
    aliases: ["Original UPA", "UPA 1914", "Old UPA", "1914 UPA"],
    version: "1914",
    versionInUse: "Historical baseline",
    lastVerified: "2026-04-03",
    coverage: COVERAGE_BADGES.SUMMARY_ONLY,
    chapters: [3],
    hierarchyType: "uniform",
    category: DOCUMENT_CATEGORIES.UNIFORM_ACTS,
    sectionsFile: null,
    sections: [],
  },
  {
    id: "ullca",
    shortName: "ULLCA",
    slug: "ullca",
    title: "Uniform Limited Liability Company Act (2006)",
    aliases: ["RULLCA", "Revised ULLCA", "Uniform LLC Act", "Revised Uniform LLC Act", "LLC Act"],
    version: "2006 (amended 2013)",
    versionInUse: "ULLCA 2006/2013",
    lastVerified: "2026-04-03",
    coverage: COVERAGE_BADGES.FULL_TEXT,
    chapters: [5, 8, 9, 15],
    hierarchyType: "uniform",
    category: DOCUMENT_CATEGORIES.UNIFORM_ACTS,
    sectionsFile: "ullca-sections.json",
    sections: [],
  },
  {
    id: "mbca",
    shortName: "MBCA",
    slug: "mbca",
    title: "Model Business Corporation Act (current)",
    aliases: ["Model BCA", "ABA Model Act", "Model Business Corp Act", "Model Corp Act"],
    version: "2025 black-letter snapshot",
    versionInUse: "MBCA current model text",
    lastVerified: "2026-04-03",
    coverage: COVERAGE_BADGES.FULL_TEXT,
    chapters: [4, 9, 11, 13, 15],
    hierarchyType: "uniform",
    category: DOCUMENT_CATEGORIES.UNIFORM_ACTS,
    sectionsFile: "mbca-sections.json",
    sections: [],
  },
  {
    id: "mnca",
    shortName: "MNCA",
    slug: "mnca",
    title: "Model Nonprofit Corporation Act",
    aliases: ["Model Nonprofit Act", "Nonprofit Corp Act"],
    version: "Model",
    versionInUse: "MNCA model text",
    lastVerified: "2026-04-03",
    coverage: COVERAGE_BADGES.KEY_SECTIONS,
    chapters: [6],
    hierarchyType: "uniform",
    category: DOCUMENT_CATEGORIES.UNIFORM_ACTS,
    sectionsFile: "mnca-sections.json",
    sections: [],
  },
  {
    id: "dgcl",
    shortName: "DGCL",
    slug: "dgcl",
    title: "Delaware General Corporation Law",
    aliases: ["Delaware Corp Law", "Title 8", "Del. Code tit. 8", "Delaware corporate statute"],
    version: "Delaware Code title 8",
    versionInUse: "Current DGCL snapshot",
    lastVerified: "2026-04-03",
    coverage: COVERAGE_BADGES.KEY_SECTIONS,
    chapters: [4, 11, 12, 13],
    hierarchyType: "state-code",
    category: DOCUMENT_CATEGORIES.STATE_CODES,
    sectionsFile: "dgcl-sections.json",
    sections: [],
  },
  {
    id: "dllca",
    shortName: "DLLCA",
    slug: "dllca",
    title: "Delaware Limited Liability Company Act",
    aliases: ["Delaware LLC Act", "Del. Code tit. 6", "Title 6", "Delaware LLC statute"],
    version: "Delaware Code title 6",
    versionInUse: "Current DLLCA snapshot",
    lastVerified: "2026-04-03",
    coverage: COVERAGE_BADGES.SUMMARY_ONLY,
    chapters: [5],
    hierarchyType: "state-code",
    category: DOCUMENT_CATEGORIES.STATE_CODES,
    sectionsFile: null,
    sections: [],
  },
  {
    id: "r3a",
    shortName: "R3A",
    slug: "r3a",
    title: "Restatement (Third) of Agency",
    aliases: ["Restatement Third Agency", "RST 3d Agency", "Third Restatement of Agency", "R3d Agency", "RSA"],
    version: "Third",
    versionInUse: "Restatement Third",
    lastVerified: "2026-04-03",
    coverage: COVERAGE_BADGES.KEY_SECTIONS,
    chapters: [2, 7],
    hierarchyType: "restatement",
    category: DOCUMENT_CATEGORIES.RESTATEMENTS,
    sectionsFile: "r3a-sections.json",
    sections: [],
  },
  {
    id: "genius-act",
    shortName: "GENIUS Act",
    slug: "genius-act",
    title: "Guiding and Establishing National Innovation for U.S. Stablecoins Act",
    aliases: ["GENIUS", "Stablecoin Act", "PLAW-119-27", "119th Congress stablecoin", "federal stablecoin law", "PLAW-119"],
    version: "Public Law 119-27",
    versionInUse: "USLM text",
    lastVerified: "2026-04-03",
    coverage: COVERAGE_BADGES.FULL_TEXT,
    chapters: [7, 10],
    hierarchyType: "federal",
    category: DOCUMENT_CATEGORIES.FEDERAL,
    sectionsFile: "genius-act-sections.json",
    sections: [],
  },
  {
    id: "securities-act-1933",
    shortName: "Securities Act",
    slug: "securities-act-1933",
    title: "Securities Act of 1933",
    aliases: ["1933 Act", "'33 Act", "SA 1933", "Federal Securities Act"],
    version: "15 U.S.C. §§ 77a-77aa",
    versionInUse: "Current statutory text",
    lastVerified: "2026-04-03",
    coverage: COVERAGE_BADGES.KEY_SECTIONS,
    chapters: [10, 11],
    hierarchyType: "federal",
    category: DOCUMENT_CATEGORIES.FEDERAL,
    sectionsFile: "securities-act-sections.json",
    sections: [],
  },
  {
    id: "exchange-act-1934",
    shortName: "Exchange Act",
    slug: "exchange-act-1934",
    title: "Securities Exchange Act of 1934",
    aliases: ["1934 Act", "'34 Act", "SEA", "Securities Exchange Act"],
    version: "15 U.S.C. §§ 78a-78qq",
    versionInUse: "Current statutory text",
    lastVerified: "2026-04-03",
    coverage: COVERAGE_BADGES.KEY_SECTIONS,
    chapters: [10, 11, 12],
    hierarchyType: "federal",
    category: DOCUMENT_CATEGORIES.FEDERAL,
    sectionsFile: "exchange-act-sections.json",
    sections: [],
  },
  {
    id: "irc-501c3",
    shortName: "IRC 501(c)(3)",
    slug: "irc-501c3",
    title: "Internal Revenue Code § 501(c)(3)",
    aliases: ["501c3", "tax exemption", "nonprofit exemption", "charitable exemption", "26 U.S.C. § 501(c)(3)"],
    version: "26 U.S.C.",
    versionInUse: "Current subsection",
    lastVerified: "2026-04-03",
    coverage: COVERAGE_BADGES.KEY_SECTIONS,
    chapters: [6],
    hierarchyType: "federal",
    category: DOCUMENT_CATEGORIES.FEDERAL,
    sectionsFile: "irc-sections.json",
    sections: [],
  },
  {
    id: "treasury-reg",
    shortName: "Treas. Reg.",
    slug: "treasury-reg",
    title: "Treasury Regulation § 1.501(c)(3)-1",
    aliases: ["501c3 regs", "organizational test", "treasury nonprofit reg"],
    version: "26 C.F.R.",
    versionInUse: "§1.501(c)(3)-1",
    lastVerified: "2026-04-03",
    coverage: COVERAGE_BADGES.KEY_SECTIONS,
    chapters: [6],
    hierarchyType: "federal",
    category: DOCUMENT_CATEGORIES.FEDERAL,
    sectionsFile: null,
    sections: [
      { number: "1.501(c)(3)-1", title: "Organizational and Operational Tests", article: "Treasury Regulations", text: "Provides requirements for exemption including organizational and operational tests for charitable organizations.", concepts: ["organizational test", "operational test"] },
    ],
  },
  {
    id: "gheewalla",
    shortName: "Gheewalla",
    slug: "gheewalla",
    title: "North American Catholic Educational Programming Foundation v. Gheewalla",
    aliases: ["North American Catholic v. Gheewalla", "NACEPF v. Gheewalla", "930 A.2d 92"],
    version: "930 A.2d 92 (Del. 2007)",
    versionInUse: "Delaware Supreme Court holding",
    lastVerified: "2026-04-03",
    coverage: COVERAGE_BADGES.EXCERPTED,
    chapters: [15],
    hierarchyType: "case",
    category: DOCUMENT_CATEGORIES.CASES,
    sectionsFile: null,
    sections: [
      {
        number: "holding",
        title: "Creditor Claims and Insolvency",
        article: "Holding",
        text:
          "When a corporation is insolvent, creditors gain standing to pursue derivative fiduciary-duty claims on behalf of the corporation, but creditors do not have direct fiduciary-duty claims against directors.",
        concepts: ["insolvency", "creditor standing", "fiduciary duties"],
        chapterUse: [15],
      },
    ],
  },
  {
    id: "cases",
    shortName: "Cases",
    slug: "cases",
    title: "Major Delaware Cases",
    aliases: [
      "Delaware cases",
      "case law",
      "Delaware Supreme Court",
      "Chancery Court",
      "Weinberger", "Revlon", "Unocal", "Corwin", "Lyondell",
      "Air Products", "Magnetar", "Match Group", "Van Gorkom",
      "Meinhard", "Blasius", "Paramount", "Omnicare",
    ],
    version: "Key holdings collection",
    versionInUse: "23 major Delaware cases",
    lastVerified: "2026-04-04",
    coverage: COVERAGE_BADGES.EXCERPTED,
    chapters: [9, 13, 15],
    hierarchyType: "case",
    category: DOCUMENT_CATEGORIES.CASES,
    sectionsFile: "cases-sections.json",
    sections: [],
  },
  {
    id: "bacg-textbook",
    shortName: "BACG",
    slug: "bacg-textbook",
    title: "Business Associations: A Casebook on the Law of the Firm",
    aliases: [
      "BACG",
      "Business Associations casebook",
      "BA textbook",
      "Law of the Firm",
    ],
    version: "Current edition",
    versionInUse: "Doctrinal extracts",
    lastVerified: "2026-04-03",
    coverage: COVERAGE_BADGES.KEY_SECTIONS,
    chapters: [1, 2, 3, 4, 5, 6, 11, 14],
    hierarchyType: "scholarship",
    category: DOCUMENT_CATEGORIES.SCHOLARSHIP,
    sectionsFile: "scholarship-sections.json",
    sections: [],
  },
];

/* ---------- Lazy-loading infrastructure ---------- */

const _loadedDocs = new Set();
const _loadingPromises = new Map();

const SECTION_LOADERS = {
  "rupa-sections.json": () => import("../data/tome/rupa-sections.json"),
  "ullca-sections.json": () => import("../data/tome/ullca-sections.json"),
  "dgcl-sections.json": () => import("../data/tome/dgcl-sections.json"),
  "mbca-sections.json": () => import("../data/tome/mbca-sections.json"),
  "r3a-sections.json": () => import("../data/tome/r3a-sections.json"),
  "mnca-sections.json": () => import("../data/tome/mnca-sections.json"),
  "securities-act-sections.json": () => import("../data/tome/securities-act-sections.json"),
  "exchange-act-sections.json": () => import("../data/tome/exchange-act-sections.json"),
  "genius-act-sections.json": () => import("../data/tome/genius-act-sections.json"),
  "irc-sections.json": () => import("../data/tome/irc-sections.json"),
  "scholarship-sections.json": () => import("../data/tome/scholarship-sections.json"),
  "cases-sections.json": () => import("../data/tome/cases-sections.json"),
};

/**
 * Lazily load section data for a single document.
 * Returns the document (with .sections populated) or null.
 * Safe to call repeatedly -- cached after first load.
 */
export async function loadSections(doc) {
  if (!doc) return null;
  if (_loadedDocs.has(doc.id)) return doc;
  if (!doc.sectionsFile) {
    _loadedDocs.add(doc.id);
    return doc;
  }

  if (_loadingPromises.has(doc.id)) {
    return _loadingPromises.get(doc.id);
  }

  const loader = SECTION_LOADERS[doc.sectionsFile];
  if (!loader) {
    _loadedDocs.add(doc.id);
    return doc;
  }

  const promise = loader().then((mod) => {
    const data = mod.default || mod;
    doc.sections = Array.isArray(data) ? data : [];
    _loadedDocs.add(doc.id);
    _loadingPromises.delete(doc.id);
    return doc;
  });

  _loadingPromises.set(doc.id, promise);
  return promise;
}

/** Load ALL section JSON files at once (for full-text search). */
export async function loadAllSections() {
  const promises = DOCUMENTS.filter((d) => d.sectionsFile && !_loadedDocs.has(d.id)).map((d) => loadSections(d));
  await Promise.all(promises);
  return DOCUMENTS;
}

/** Check if a document's sections have already been loaded. */
export function isSectionsLoaded(doc) {
  return _loadedDocs.has(doc?.id);
}

/* ---------- Static look-ups and helpers ---------- */

export const PREBUILT_COMPARISONS = [
  {
    id: "duties-rupa-ullca-dgcl",
    title: "Partner / Member / Director Duty Architecture",
    sections: ["RUPA § 409", "ULLCA § 409", "DGCL § 102(b)(7)"],
    note:
      "RUPA and ULLCA articulate affirmative fiduciary standards, while DGCL §102(b)(7) focuses on limiting monetary exposure. Comparing these reveals how duty design differs from liability design.",
  },
  {
    id: "agency-rupa-ullca-mbca",
    title: "Entity Agency Baselines",
    sections: ["RUPA § 301", "ULLCA § 301", "MBCA § 8.40"],
    note:
      "RUPA starts with partner agency power; ULLCA rejects member agency by default; MBCA routes operational agency through officers. This contrast explains modern entity choice tradeoffs.",
  },
  {
    id: "dissolution-rupa-ullca",
    title: "Dissolution Triggers",
    sections: ["RUPA § 801", "ULLCA § 701"],
    note:
      "Both statutes enumerate trigger events, but differ in internal governance assumptions and continuity defaults. Side-by-side reading highlights where contractual planning matters most.",
  },
  {
    id: "director-standards",
    title: "Board Standards and Power",
    sections: ["MBCA § 8.30", "DGCL § 141(a)"],
    note:
      "MBCA centers explicit conduct standards, while DGCL §141(a) allocates managerial authority to the board. Together they frame Delaware doctrine in takeover and duty litigation.",
  },
  {
    id: "nonprofit-tax",
    title: "Nonprofit Mission and Tax Constraint",
    sections: ["IRC § 501(c)(3)", "MNCA § 13.01", "MNCA § 14.09"],
    note:
      "Tax exemption and nonprofit law converge on nondistribution and mission lock. This comparison clarifies how dissolution and asset use rules protect charitable purpose.",
  },
  {
    id: "liability-shield",
    title: "Owner Liability Shield Comparison",
    sections: ["RUPA § 306", "ULLCA § 304", "MBCA § 6.22"],
    note:
      "These provisions map the liability spectrum from partnership exposure to LLC/corporate shielding. They are core to entity selection and creditor risk allocation.",
  },
];

export const CASE_LAW_INDEX = [
  {
    caseName: "Meinhard v. Salmon",
    rule: "Joint venturers owe punctilio-level loyalty in opportunity allocation.",
    statutes: ["RUPA § 404"],
    chapters: [9],
  },
  {
    caseName: "Summers v. Dooley",
    rule: "Majority rule in ordinary partnership decisions can constrain unilateral partner actions.",
    statutes: ["RUPA § 401"],
    chapters: [3],
  },
  {
    caseName: "Smith v. Van Gorkom",
    rule: "Board process failures can rebut deference and trigger liability risk.",
    statutes: ["DGCL § 141(a)", "MBCA § 8.30"],
    chapters: [9, 13],
  },
  {
    caseName: "Weinberger v. UOP",
    rule: "Entire fairness requires fair dealing and fair price in conflicted transactions.",
    statutes: ["DGCL § 141(a)"],
    chapters: [13],
  },
  {
    caseName: "Revlon v. MacAndrews & Forbes",
    rule: "When sale becomes inevitable, the board must maximize shareholder value.",
    statutes: ["DGCL § 141", "DGCL § 102(b)(7)"],
    chapters: [13],
  },
  {
    caseName: "Unocal v. Mesa Petroleum",
    rule: "Defensive measures must be reasonable in relation to the threat posed.",
    statutes: ["DGCL § 141(a)"],
    chapters: [13],
  },
  {
    caseName: "Corwin v. KKR Financial Holdings",
    rule: "A fully informed, uncoerced vote of disinterested stockholders invokes business judgment review.",
    statutes: ["DGCL § 102(b)(7)", "DGCL § 251"],
    chapters: [13],
  },
  {
    caseName: "Lyondell Chemical v. Ryan",
    rule: "Only knowing dereliction of duty constitutes bad faith under Revlon.",
    statutes: ["DGCL § 102(b)(7)", "DGCL § 141(a)"],
    chapters: [13],
  },
  {
    caseName: "Air Products v. Airgas",
    rule: "A board acting in good faith may maintain a poison pill to block an inadequate offer.",
    statutes: ["DGCL § 141(a)"],
    chapters: [13],
  },
  {
    caseName: "Dell v. Magnetar",
    rule: "Deal price from a fair process is strong evidence of fair value in appraisal.",
    statutes: ["DGCL § 262"],
    chapters: [13, 15],
  },
  {
    caseName: "In re Match Group",
    rule: "Both a special committee and a majority-of-the-minority vote are required for business judgment review under MFW.",
    statutes: ["DGCL § 141(a)"],
    chapters: [13],
  },
  {
    caseName: "National Biscuit Co. v. Stroud",
    rule: "Individual partners generally may bind the partnership in ordinary course despite internal disagreement.",
    statutes: ["RUPA § 301"],
    chapters: [3],
  },
  {
    caseName: "North American Catholic v. Gheewalla",
    rule: "In insolvency, creditors may sue derivatively but cannot assert direct fiduciary-duty claims against directors.",
    statutes: ["DGCL § 141(a)"],
    chapters: [15],
  },
];

export const CHAPTER_ROUTES = {
  2: APP_ROUTES.ch02Agency,
  8: APP_ROUTES.ch08EntitySelection,
  9: APP_ROUTES.ch09FiduciaryDuties,
  12: APP_ROUTES.ch12ShareholderFranchise,
  13: APP_ROUTES.ch13MA,
  15: APP_ROUTES.ch15CapitalStructure,
};

export const DOCUMENT_BY_ID = Object.fromEntries(DOCUMENTS.map((d) => [d.id, d]));
export const DOCUMENT_BY_SLUG = Object.fromEntries(DOCUMENTS.map((d) => [d.slug, d]));

export function toSlugToken(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function getSectionSlug(sectionNumber) {
  return `section-${toSlugToken(sectionNumber)}`;
}

export function getTomePath(doc, section) {
  if (!doc) return APP_ROUTES.tomeHome;
  if (!section) return `${APP_ROUTES.tomeHome}/${doc.slug}`;
  const article = section.article || "title";
  const articleSlug = toSlugToken(article);
  return `${APP_ROUTES.tomeHome}/${doc.slug}/${articleSlug}/${getSectionSlug(section.number)}`;
}
