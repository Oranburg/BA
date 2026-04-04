export function summarizeModuleHeadline(moduleId, state = {}) {
  if (moduleId === "ch01-why-law") {
    return {
      headline: `Four Problems diagnostic: ${state.correctCount ?? "-"} / ${state.totalCount ?? "-"} classified correctly`,
      note: state.synthesisNote || "No synthesis drafted.",
    };
  }

  if (moduleId === "ch02-agency") {
    return {
      headline: `Agency analysis: control ${state.controlScore ?? "-"}, authority ${state.authScore ?? "-"}`,
      note: state.counselNotes || "No counsel notes captured.",
    };
  }

  if (moduleId === "ch03-partnership") {
    return {
      headline: `Partnership formation: verdict ${state.verdictCorrect ? "confirmed" : "pending"}, ${state.triggersFound ?? 0} triggers found`,
      note: state.counselNote || "No counsel note drafted.",
    };
  }

  if (moduleId === "ch04-corporations-tech") {
    return {
      headline: `Corporate partitioning: ${state.creditorScore ?? "-"} / ${state.totalCreditors ?? "-"} creditors classified, ${state.veilScore ?? "-"} / ${state.totalFactors ?? "-"} veil factors identified`,
      note: state.counselNote || "No counsel note drafted.",
    };
  }

  if (moduleId === "ch05-llcs") {
    const cfg = state.oaConfig || {};
    const mgmt = cfg.mgmt === "manager" ? "Manager-managed" : "Member-managed";
    return {
      headline: `LLC governance: ${mgmt}, verdict ${state.verdictCorrect ? "confirmed" : "pending"}`,
      note: state.counselNote || "No counsel note drafted.",
    };
  }

  if (moduleId === "ch06-nonprofits") {
    return {
      headline: `Nonprofit governance: constraint ${state.constraintActive ? "active" : "inactive"}, ${state.classificationScore ?? "-"} / ${state.totalExpenditures ?? "-"} classified, verdict ${state.verdictCorrect ? "confirmed" : "pending"}`,
      note: state.counselNote || "No counsel recommendation drafted.",
    };
  }

  if (moduleId === "ch07-daos") {
    return {
      headline: `DAO attribution: ${state.classificationScore ?? "-"} / ${state.totalActions ?? "-"} classified, verdict ${state.verdictCorrect ? "confirmed" : "pending"}`,
      note: state.counselNote || "No counsel note drafted.",
    };
  }

  if (moduleId === "ch08-entity-selection") {
    return {
      headline: `Entity recommendation: ${state.recommendedEntityLabel || state.entityForm || "Not selected"}`,
      note: state.counselRecommendation || "No recommendation drafted.",
    };
  }

  if (moduleId === "ch09-fiduciary-duties") {
    return {
      headline: `Board process path: ${state.processChoiceLabel || "Not selected"}`,
      note: state.counselMemo || "No board memo drafted.",
    };
  }

  if (moduleId === "ch12-shareholder-franchise") {
    return {
      headline: `Franchise process: ${state.processChoiceLabel || "Not selected"}`,
      note: state.notes || "No franchise notes drafted.",
    };
  }

  if (moduleId === "ch13-m-and-a") {
    return {
      headline: `M&A scrutiny scores: Unocal ${state.p1Score ?? "-"}, Revlon ${state.revlonScore ?? "-"}`,
      note: state.counselRecommendation || "No M&A recommendation drafted.",
    };
  }

  if (moduleId === "ch10-staying-private") {
    return {
      headline: `Preference stack: ${state.selectedTerm || "Not selected"}, synthesis ${state.synthesisCorrect ? "confirmed" : "pending"}`,
      note: state.counselNote || "No counsel note drafted.",
    };
  }

  if (moduleId === "ch11-going-public") {
    return {
      headline: `Disclosure scrubber: ${state.flaggedCount ?? 0} material issues flagged, synthesis ${state.synthesisCorrect ? "confirmed" : "pending"}`,
      note: state.counselNote || "No counsel note drafted.",
    };
  }

  if (moduleId === "ch14-piercing-the-veil") {
    return {
      headline: `Veil-piercing: ${state.appliedCount ?? "-"} / 6 evidence applied, prong classification ${state.prongScore ?? "-"} / ${state.prongTotal ?? "-"}, verdict ${state.verdictCorrect ? "confirmed" : "pending"}`,
      note: state.counselNote || "No counsel recommendation drafted.",
    };
  }

  if (moduleId === "ch15-capital-structure") {
    return {
      headline: `Distress posture: ${state.solvencyStateLabel || "Not selected"}`,
      note: state.boardRecommendation || "No distress recommendation drafted.",
    };
  }

  if (moduleId === "ch16-conclusion") {
    return {
      headline: `Lifecycle synthesis: ${state.selectionsComplete ? "all problems addressed" : "in progress"}, declaration ${state.declarationCorrect ? "confirmed" : "pending"}`,
      note: state.reflectionNote || "No final reflection drafted.",
    };
  }

  return { headline: "Saved module output", note: "" };
}
