export const COVERAGE_BADGES = {
  FULL_TEXT: "Full text",
  EXCERPTED: "Excerpted",
  KEY_SECTIONS: "Key sections only",
  SUMMARY_ONLY: "Summary only",
  NOT_AVAILABLE: "Not yet available",
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
    coverage: COVERAGE_BADGES.KEY_SECTIONS,
    chapters: [2, 3, 8, 9, 15],
    hierarchyType: "uniform",
    sections: [
      {
        number: "202",
        title: "Formation of Partnership",
        article: "Article 2",
        text:
          "Except as otherwise provided in subsection (b), the association of two or more persons to carry on as co-owners a business for profit forms a partnership, whether or not the persons intend to form a partnership.",
        concepts: ["formation", "partnership"],
      },
      {
        number: "301",
        title: "Partner as Agent",
        article: "Article 3",
        text:
          "Each partner is an agent of the partnership for the purpose of its business. An act of a partner for apparently carrying on in the ordinary course binds the partnership unless the partner lacked authority and the third party had notice.",
        concepts: ["agency", "authority", "partner"],
        crossRefs: [{ target: "RUPA § 601" }, { target: "ULLCA § 301" }, { target: "R3A § 2.03" }],
        chapterUse: [2, 3, 8],
      },
      {
        number: "306",
        title: "Partner's Liability",
        article: "Article 3",
        text:
          "All partners are liable jointly and severally for all debts, obligations, and other liabilities of the partnership unless otherwise agreed by the claimant or provided by law.",
        concepts: ["liability", "risk"],
      },
      {
        number: "401",
        title: "Partner's Rights and Duties",
        article: "Article 4",
        text:
          "Each partner is deemed to have an account that is credited and charged in accordance with this section, and has equal rights in management and conduct of the partnership business.",
        concepts: ["governance", "duties"],
      },
      {
        number: "404",
        title: "General Standards of Partner's Conduct",
        article: "Article 4",
        text:
          "The only fiduciary duties a partner owes are the duty of loyalty and the duty of care as set forth in this section, plus the obligation of good faith and fair dealing.",
        concepts: ["fiduciary duty", "loyalty", "care"],
      },
      {
        number: "801",
        title: "Events Causing Dissolution",
        article: "Article 8",
        text:
          "A partnership is dissolved, and its business must be wound up, upon occurrence of specified triggering events, including certain partner actions and judicial dissolution.",
        concepts: ["dissolution"],
      },
    ],
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
    coverage: COVERAGE_BADGES.KEY_SECTIONS,
    chapters: [5, 8, 9, 15],
    hierarchyType: "uniform",
    sections: [
      {
        number: "301",
        title: "No Agency Power of Member",
        article: "Article 3",
        text:
          "A member is not an agent of a limited liability company solely by reason of being a member.",
        concepts: ["agency", "llc"],
        chapterUse: [5, 8],
      },
      {
        number: "304",
        title: "Liability of Members and Managers",
        article: "Article 3",
        text:
          "A debt, obligation, or other liability of a limited liability company is solely that of the company, and members or managers are not personally liable solely by reason of status.",
        concepts: ["liability", "risk"],
      },
      {
        number: "401",
        title: "Becoming Member",
        article: "Article 4",
        text: "A person becomes a member as provided in the operating agreement, by consent, or as otherwise provided in this act.",
        concepts: ["membership", "formation"],
      },
      {
        number: "409",
        title: "Standards of Conduct",
        article: "Article 4",
        text:
          "In a member-managed company, duties of loyalty and care apply, together with contractual good faith and fair dealing, subject to operating agreement constraints.",
        concepts: ["fiduciary duty", "llc governance"],
        chapterUse: [5, 9],
      },
      {
        number: "701",
        title: "Events Causing Dissolution",
        article: "Article 7",
        text: "A limited liability company is dissolved upon specified events including those in the operating agreement and judicially ordered dissolution.",
        concepts: ["dissolution"],
      },
    ],
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
    coverage: COVERAGE_BADGES.KEY_SECTIONS,
    chapters: [4, 9, 11, 13, 15],
    hierarchyType: "uniform",
    sections: [
      {
        number: "4.01",
        title: "Corporate Name",
        article: "Chapter 4",
        text: "A corporate name must satisfy naming requirements and be distinguishable on records of the filing office.",
        concepts: ["corporate name"],
      },
      {
        number: "6.22",
        title: "Liability of Shareholders",
        article: "Chapter 6",
        text: "Unless otherwise provided, a shareholder is not personally liable for acts or debts of the corporation.",
        concepts: ["liability", "shareholders"],
      },
      {
        number: "8.30",
        title: "Standards of Conduct for Directors",
        article: "Chapter 8",
        text:
          "Each director must act in good faith, in a manner reasonably believed to be in the best interests of the corporation, and with due care.",
        concepts: ["director standards", "fiduciary duty"],
        chapterUse: [9, 13],
      },
      {
        number: "8.40",
        title: "Standards of Conduct for Officers",
        article: "Chapter 8",
        text:
          "An officer must act in good faith, with care a person in like position would exercise, and in a manner reasonably believed to be in the corporation's best interests.",
        concepts: ["officers", "fiduciary duty"],
      },
    ],
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
    sections: [
      { number: "13.01", title: "Distributions Prohibited", article: "Chapter 13", text: "A nonprofit may not make distributions except as authorized by law.", concepts: ["nondistribution"] },
      { number: "14.09", title: "Disposition of Assets", article: "Chapter 14", text: "On dissolution, assets are distributed according to governing law and charitable purpose constraints.", concepts: ["dissolution", "nonprofit"] },
    ],
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
    sections: [
      {
        number: "102(b)(7)",
        title: "Exculpation Provision",
        article: "Subchapter 1",
        text:
          "A certificate may include a provision eliminating or limiting director personal liability for monetary damages for breach of fiduciary duty, subject to statutory exceptions.",
        concepts: ["exculpation", "fiduciary duty"],
      },
      {
        number: "141(a)",
        title: "Board of Directors; Powers",
        article: "Subchapter 4",
        text:
          "The business and affairs of every corporation organized under this chapter shall be managed by or under the direction of a board of directors, except as otherwise provided.",
        concepts: ["board powers", "governance"],
        chapterUse: [11, 13],
      },
    ],
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
    sections: [
      { number: "1.01", title: "Agency Defined", article: "Chapter 1", text: "Agency is the fiduciary relationship arising when a principal manifests assent that an agent act on the principal's behalf and subject to control, and the agent consents.", concepts: ["agency", "control"], chapterUse: [2] },
      { number: "2.01", title: "Actual Authority", article: "Chapter 2", text: "An agent acts with actual authority when the agent reasonably believes, based on the principal's manifestations, that the principal wishes the act.", concepts: ["actual authority"], chapterUse: [2] },
      { number: "2.03", title: "Apparent Authority", article: "Chapter 2", text: "Apparent authority is power to affect a principal's legal relations when a third party reasonably believes authority exists and that belief is traceable to the principal's manifestations.", concepts: ["apparent authority"], chapterUse: [2] },
      { number: "7.07", title: "Employee Acting Within Scope of Employment", article: "Chapter 7", text: "An employer is subject to vicarious liability for a tort committed by an employee acting within the scope of employment.", concepts: ["vicarious liability", "respondeat superior"], chapterUse: [2] },
    ],
  },
  {
    id: "r2t",
    shortName: "R2T",
    slug: "r2t",
    title: "Restatement (Second) of Trusts",
    aliases: ["Restatement Second Trusts", "RST 2d Trusts"],
    version: "Second",
    versionInUse: "Restatement Second Trusts",
    lastVerified: "2026-04-03",
    coverage: COVERAGE_BADGES.NOT_AVAILABLE,
    chapters: [],
    hierarchyType: "restatement",
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
    sections: [
      {
        number: "1",
        title: "Short Title",
        article: "Title 1",
        text: "This Act may be cited as the Guiding and Establishing National Innovation for U.S. Stablecoins Act or the GENIUS Act.",
        concepts: ["stablecoin", "federal statute"],
      },
      {
        number: "2",
        title: "Definitions",
        article: "Title 1",
        text: "Defines key terms including payment stablecoin, permitted payment stablecoin issuer, and related federal/state regulator terms.",
        concepts: ["definitions", "stablecoin"],
      },
      {
        number: "3",
        title: "Issuance and Treatment of Payment Stablecoins",
        article: "Title 1",
        text: "Limits who may issue payment stablecoins and sets requirements for lawful offer/sale in the United States.",
        concepts: ["issuance", "compliance"],
      },
    ],
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
    sections: [
      { number: "501(c)(3)", title: "Charitable and Related Exemption", article: "Title 26", text: "Organizations organized and operated exclusively for exempt purposes may qualify for federal income tax exemption under specified conditions.", concepts: ["nonprofit", "tax", "exemption"], chapterUse: [6] },
      { number: "401", title: "Qualified Pension, Profit-Sharing, and Stock Bonus Plans", article: "Title 26", text: "Defines requirements for qualified retirement plans under the Internal Revenue Code.", concepts: ["retirement", "tax"], chapterUse: [] },
    ],
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
    sections: [
      { number: "1.501(c)(3)-1", title: "Organizational and Operational Tests", article: "Treasury Regulations", text: "Provides requirements for exemption including organizational and operational tests for charitable organizations.", concepts: ["organizational test", "operational test"] },
    ],
  },
  {
    id: "r2d-contracts",
    shortName: "R2d Contracts",
    slug: "r2d-contracts",
    title: "Restatement (Second) of Contracts",
    aliases: ["Restatement Second Contracts"],
    version: "Second",
    versionInUse: "Partial references",
    lastVerified: "2026-04-03",
    coverage: COVERAGE_BADGES.NOT_AVAILABLE,
    chapters: [],
    hierarchyType: "restatement",
    sections: [],
  },
  {
    id: "irs-pubs",
    shortName: "IRS Publications",
    slug: "irs-publications",
    title: "IRS Publications (selected)",
    aliases: ["IRS Pub"],
    version: "Various",
    versionInUse: "References only",
    lastVerified: "2026-04-03",
    coverage: COVERAGE_BADGES.NOT_AVAILABLE,
    chapters: [6],
    hierarchyType: "federal",
    sections: [],
  },
  {
    id: "van-loon-filings",
    shortName: "Van Loon filings",
    slug: "van-loon-filings",
    title: "Van Loon litigation filings",
    aliases: ["Van Loon"],
    version: "Case filings",
    versionInUse: "References only",
    lastVerified: "2026-04-03",
    coverage: COVERAGE_BADGES.NOT_AVAILABLE,
    chapters: [],
    hierarchyType: "case",
    sections: [],
  },
];

export const PREBUILT_COMPARISONS = [
  {
    id: "duties-rupa-ullca-dgcl",
    title: "Partner / Member / Director Duty Architecture",
    sections: ["RUPA § 404", "ULLCA § 409", "DGCL § 102(b)(7)"],
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
    caseName: "National Biscuit Co. v. Stroud",
    rule: "Individual partners generally may bind the partnership in ordinary course despite internal disagreement.",
    statutes: ["RUPA § 301"],
    chapters: [3],
  },
];

export const CHAPTER_ROUTES = {
  2: "/ch02-agency",
  3: "/",
  5: "/",
  6: "/",
  7: "/",
  8: "/",
  9: "/",
  10: "/",
  11: "/",
  12: "/",
  13: "/ch13-m-and-a",
  15: "/",
};

export const DOCUMENT_BY_ID = Object.fromEntries(DOCUMENTS.map((d) => [d.id, d]));
export const DOCUMENT_BY_SLUG = Object.fromEntries(DOCUMENTS.map((d) => [d.slug, d]));

export function getSectionSlug(sectionNumber) {
  return `section-${sectionNumber.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

export function getTomePath(doc, section) {
  if (!doc) return "/tome";
  if (!section) return `/tome/${doc.slug}`;
  const article = section.article || "title";
  const articleSlug = article.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `/tome/${doc.slug}/${articleSlug}/${getSectionSlug(section.number)}`;
}
