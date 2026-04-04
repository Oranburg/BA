import { readLearningStore, writeLearningStore } from "../learning/progress";

const MATTER_FILE_KEY = "matterFile";

const EMPTY_FILE = {
  timeline: [],
  summary: {
    entityForm: "Not selected",
    controlPosture: "Founder-controlled startup",
    boardDynamics: "Board process not yet recorded",
    financingPosture: "Early operating phase",
    strategicPressure: "No strategic contest yet",
    transactionContext: "No active transaction",
    residualClaimantPosture: "Equity",
  },
};

function mergeSummary(summary = {}, moduleId, patch = {}) {
  const next = { ...summary, ...patch };

  if (moduleId === "ch01-why-law") {
    next.controlPosture = patch.controlPosture || summary.controlPosture || "Four Problems framework established";
  }

  if (moduleId === "ch03-partnership") {
    next.entityForm = patch.entityForm || summary.entityForm || "Accidental general partnership";
    next.controlPosture = patch.controlPosture || summary.controlPosture || "Equal partner authority under RUPA";
  }

  if (moduleId === "ch04-corporations-tech") {
    next.entityForm = patch.entityForm || summary.entityForm || "Corporation (entity shield active)";
    next.controlPosture = patch.controlPosture || summary.controlPosture || "Founder-controlled corporation — partitioning established";
  }

  if (moduleId === "ch05-llcs") {
    next.entityForm = patch.entityForm || summary.entityForm || "LLC (governance hybrid)";
    next.controlPosture = patch.controlPosture || summary.controlPosture || "OA-defined authority allocation";
  }

  if (moduleId === "ch06-nonprofits") {
    next.entityForm = patch.entityForm || summary.entityForm || "Nonprofit Corp (nondistribution constraint active)";
    next.controlPosture = patch.controlPosture || summary.controlPosture || "Mission-locked governance — no founder distributions permitted";
  }

  if (moduleId === "ch07-daos") {
    next.entityForm = patch.entityForm || summary.entityForm || "DAO (unincorporated — partnership default)";
    next.controlPosture = patch.controlPosture || summary.controlPosture || "Token-weighted governance — attribution risk";
  }

  if (moduleId === "ch02-agency") {
    next.controlPosture = patch.controlPosture || summary.controlPosture || "Agency authority actively tested";
  }

  if (moduleId === "ch08-entity-selection") {
    next.entityForm = patch.entityForm || summary.entityForm || "Entity form in flux";
  }

  if (moduleId === "ch09-fiduciary-duties") {
    next.boardDynamics = patch.boardDynamics || summary.boardDynamics || "Board process under stress";
  }

  if (moduleId === "ch12-shareholder-franchise") {
    next.strategicPressure = patch.strategicPressure || summary.strategicPressure || "Stockholder control contest active";
  }

  if (moduleId === "ch13-m-and-a") {
    next.transactionContext = patch.transactionContext || summary.transactionContext || "Active strategic transaction pressure";
  }

  if (moduleId === "ch10-staying-private") {
    next.financingPosture = patch.financingPosture || summary.financingPosture || "Series A negotiated; preference stack active";
    next.controlPosture = patch.controlPosture || summary.controlPosture || "Investor board seats negotiated";
  }

  if (moduleId === "ch11-going-public") {
    next.financingPosture = patch.financingPosture || summary.financingPosture || "Post-IPO public company";
    next.controlPosture = patch.controlPosture || summary.controlPosture || "Public shareholders added; disclosure regime active";
  }

  if (moduleId === "ch14-piercing-the-veil") {
    next.entityForm = patch.entityForm || summary.entityForm || "Corporation — subsidiary veil pierced";
    next.strategicPressure = patch.strategicPressure || summary.strategicPressure || "Veil-piercing exposure — personal liability risk";
  }

  if (moduleId === "ch15-capital-structure") {
    next.financingPosture = patch.financingPosture || summary.financingPosture || "Distress-phase financing posture";
    next.residualClaimantPosture =
      patch.residualClaimantPosture || summary.residualClaimantPosture || "Residual claimant contested";
  }

  if (moduleId === "ch16-conclusion") {
    next.transactionContext = patch.transactionContext || summary.transactionContext || "Lifecycle synthesis complete";
  }

  return next;
}

export function getMatterFile() {
  const store = readLearningStore();
  return store[MATTER_FILE_KEY] || EMPTY_FILE;
}

export function updateMatterFile(moduleId, entry = {}, summaryPatch = {}) {
  const store = readLearningStore();
  const current = store[MATTER_FILE_KEY] || EMPTY_FILE;

  const nextTimeline = [
    ...current.timeline.filter((item) => item.moduleId !== moduleId),
    {
      moduleId,
      timestamp: new Date().toISOString(),
      ...entry,
    },
  ];

  const nextMatterFile = {
    timeline: nextTimeline,
    summary: mergeSummary(current.summary, moduleId, summaryPatch),
  };

  writeLearningStore({
    ...store,
    [MATTER_FILE_KEY]: nextMatterFile,
  });

  return nextMatterFile;
}
