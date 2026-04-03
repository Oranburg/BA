export const BUILT_MODULES = [
  "ch02-agency",
  "ch08-entity-selection",
  "ch09-fiduciary-duties",
  "ch12-shareholder-franchise",
  "ch13-m-and-a",
  "ch15-capital-structure",
];

export const MODULE_FLOW = {
  "ch02-agency": {
    title: "Agency",
    route: "/ch02-agency",
    next: "ch08-entity-selection",
    bridge:
      "Once authority is established, counsel must decide which entity should hold contracts and absorb liability.",
    dominantProblems: ["Attribution"],
    secondaryProblems: ["Risk allocation", "Governance"],
    shiftFromPrior: "Entry point: attribution is primary because the firm is still just people acting through agents.",
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
    next: "ch12-shareholder-franchise",
    bridge:
      "As investors gain leverage, franchise mechanics become the tool for disciplining or replacing incumbent control.",
    dominantProblems: ["Governance"],
    secondaryProblems: ["Risk allocation", "Attribution"],
    shiftFromPrior:
      "Shift from structural design to process discipline: governance quality and conflict controls now drive legal outcomes.",
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
    next: null,
    bridge:
      "Distress closes the loop: solvency posture determines who holds practical control and what options remain legally defensible.",
    dominantProblems: ["Risk allocation"],
    secondaryProblems: ["Governance", "Asset partitioning"],
    shiftFromPrior:
      "Shift from strategic transaction to residual-claimant reality: capital stack pressure reframes governance choices.",
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
