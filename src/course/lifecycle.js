export const BUILT_MODULES = [
  "ch01-why-law",
  "ch02-agency",
  "ch03-partnership",
  "ch05-llcs",
  "ch07-daos",
  "ch08-entity-selection",
  "ch09-fiduciary-duties",
  "ch10-staying-private",
  "ch11-going-public",
  "ch12-shareholder-franchise",
  "ch13-m-and-a",
  "ch15-capital-structure",
  "ch16-conclusion",
];

export const MODULE_FLOW = {
  "ch01-why-law": {
    title: "Why Law",
    route: "/ch01-why-law",
    next: "ch02-agency",
    bridge:
      "With the Four Problems framework in hand, the next step is understanding how human agents bind the firm — the Attribution problem in action.",
    dominantProblems: ["Attribution", "Governance", "Risk allocation", "Asset partitioning"],
    secondaryProblems: [],
    shiftFromPrior: "Entry point: all four problems introduced together as the course framework.",
  },
  "ch02-agency": {
    title: "Agency",
    route: "/ch02-agency",
    next: "ch03-partnership",
    bridge:
      "Once authority is established, the next question is what happens when two agents become co-owners — partnership formation and its consequences.",
    dominantProblems: ["Attribution"],
    secondaryProblems: ["Risk allocation", "Governance"],
    shiftFromPrior: "Shift from framework overview to attribution focus: the firm is still just people acting through agents.",
  },
  "ch03-partnership": {
    title: "Partnership",
    route: "/ch03-partnership",
    next: "ch05-llcs",
    bridge:
      "Partnership exposes unlimited personal liability. The LLC offers a hybrid solution — corporate liability protection with partnership-type contractual freedom.",
    dominantProblems: ["Risk allocation"],
    secondaryProblems: ["Attribution", "Governance"],
    shiftFromPrior: "Shift from attribution to risk: co-ownership triggers joint and several liability, making risk allocation the dominant concern.",
  },
  "ch05-llcs": {
    title: "LLCs",
    route: "/ch05-llcs",
    next: "ch07-daos",
    bridge:
      "The LLC demonstrated contractual freedom within a legal entity. DAOs test what happens when there is no entity at all — and the attribution problem returns with full force.",
    dominantProblems: ["Governance"],
    secondaryProblems: ["Risk allocation", "Asset partitioning"],
    shiftFromPrior: "Shift from risk to governance: the LLC's contractual freedom makes governance design — not liability exposure — the dominant concern.",
  },
  "ch07-daos": {
    title: "DAOs",
    route: "/ch07-daos",
    next: "ch08-entity-selection",
    bridge:
      "DAOs expose the limits of code-as-law. The next step is choosing an entity form that properly addresses all four problems — attribution, governance, risk, and partitioning.",
    dominantProblems: ["Attribution"],
    secondaryProblems: ["Governance", "Risk allocation"],
    shiftFromPrior: "Shift from governance to attribution: without a legal wrapper, code cannot be a legal person — the attribution problem from Chapter 02 resurfaces at scale.",
  },
  "ch08-entity-selection": {
    title: "Entity Selection",
    route: "/ch08-entity-selection",
    next: "ch09-fiduciary-duties",
    bridge:
      "After selecting structure, control rights and board architecture determine who can steer the company and on what terms.",
    dominantProblems: ["Asset partitioning", "Risk allocation"],
    secondaryProblems: ["Governance", "Attribution"],
    shiftFromPrior:
      "Shift from attribution to partitioning/risk: legal form now allocates downside and defines protected asset pools.",
  },
  "ch09-fiduciary-duties": {
    title: "Fiduciary Duties",
    route: "/ch09-fiduciary-duties",
    next: "ch10-staying-private",
    bridge:
      "As investors gain leverage, franchise mechanics become the tool for disciplining or replacing incumbent control.",
    dominantProblems: ["Governance"],
    secondaryProblems: ["Risk allocation", "Attribution"],
    shiftFromPrior:
      "Shift from structural design to process discipline: governance quality and conflict controls now drive legal outcomes.",
  },
  "ch10-staying-private": {
    title: "Staying Private",
    route: "/ch10-staying-private",
    next: "ch11-going-public",
    bridge:
      "With the preference stack negotiated, ConstructEdge must now cross the public threshold — where mandatory disclosure becomes the price of scaling the asset partition.",
    dominantProblems: ["Risk allocation"],
    secondaryProblems: ["Governance", "Asset partitioning"],
    shiftFromPrior:
      "Shift from board-level fiduciary process to capital-stack risk: preferred stock rights determine who actually gets paid.",
  },
  "ch11-going-public": {
    title: "Going Public",
    route: "/ch11-going-public",
    next: "ch12-shareholder-franchise",
    bridge:
      "After surviving the IPO disclosure gauntlet, public shareholders now hold voting power — and the franchise becomes the mechanism for disciplining or replacing incumbent control.",
    dominantProblems: ["Asset partitioning"],
    secondaryProblems: ["Risk allocation", "Governance"],
    shiftFromPrior:
      "Shift from private capital risk to public disclosure: the asset partition scales only if the truth-in-securities mandate is met.",
  },
  "ch12-shareholder-franchise": {
    title: "Shareholder Franchise",
    route: "/ch12-shareholder-franchise",
    next: "ch13-m-and-a",
    bridge:
      "When control contests escalate, strategic alternatives and sale-process pressure force directors into takeover doctrine.",
    dominantProblems: ["Governance", "Attribution"],
    secondaryProblems: ["Risk allocation"],
    shiftFromPrior:
      "Shift from board process to control contest: voting and disclosure mechanics test who truly controls direction.",
  },
  "ch13-m-and-a": {
    title: "M&A",
    route: "/ch13-m-and-a",
    next: "ch15-capital-structure",
    bridge:
      "Deal outcomes and defensive tactics reshape leverage, runway, and downside allocation—bringing creditors to the center.",
    dominantProblems: ["Governance", "Risk allocation"],
    secondaryProblems: ["Asset partitioning"],
    shiftFromPrior:
      "Shift from franchise conflict to transaction scrutiny: sale process quality and control transfers define doctrine.",
  },
  "ch15-capital-structure": {
    title: "Capital Structure",
    route: "/ch15-capital-structure",
    next: "ch16-conclusion",
    bridge:
      "Distress closes the loop: solvency posture determines who holds practical control and what options remain legally defensible.",
    dominantProblems: ["Risk allocation"],
    secondaryProblems: ["Governance", "Asset partitioning"],
    shiftFromPrior:
      "Shift from strategic transaction to residual-claimant reality: capital stack pressure reframes governance choices.",
  },
  "ch16-conclusion": {
    title: "Conclusion",
    route: "/ch16-conclusion",
    next: null,
    bridge:
      "The lifecycle is complete. The firm stands as a legal technology — an artificial person built from statutes and contracts to solve the Four Problems of human coordination for profit.",
    dominantProblems: ["Attribution", "Governance", "Risk allocation", "Asset partitioning"],
    secondaryProblems: [],
    shiftFromPrior:
      "Final synthesis: all four problems converge as the student evaluates the full lifecycle of the firm from formation to public status.",
  },
};

export function getNextBuiltModule(moduleId) {
  const entry = MODULE_FLOW[moduleId];
  if (!entry?.next) return null;
  return MODULE_FLOW[entry.next] || null;
}

export function getRecommendedNextModule(lastVisitedModuleId, completedMap = {}) {
  if (lastVisitedModuleId && MODULE_FLOW[lastVisitedModuleId]?.next) {
    const candidate = MODULE_FLOW[lastVisitedModuleId].next;
    if (!completedMap[candidate]) return MODULE_FLOW[candidate];
  }

  for (const id of BUILT_MODULES) {
    if (!completedMap[id]) return MODULE_FLOW[id];
  }

  return MODULE_FLOW[BUILT_MODULES[BUILT_MODULES.length - 1]];
}
