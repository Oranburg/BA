export function summarizeModuleHeadline(moduleId, state = {}) {
  if (moduleId === "ch02-agency") {
    return {
      headline: `Agency analysis: control ${state.controlScore ?? "-"}, authority ${state.authScore ?? "-"}`,
      note: state.counselNotes || "No counsel notes captured.",
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

  if (moduleId === "ch15-capital-structure") {
    return {
      headline: `Distress posture: ${state.solvencyStateLabel || "Not selected"}`,
      note: state.boardRecommendation || "No distress recommendation drafted.",
    };
  }

  return { headline: "Saved module output", note: "" };
}
