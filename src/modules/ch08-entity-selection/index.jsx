import { useMemo } from "react";
import CitationChip from "../../tome/CitationChip";
import { useTome } from "../../tome/useTome";
import { downloadTextFile, useModuleProgress, syncModuleCompletion } from "../../learning/progress";
import { MODULE_FLOW } from "../../course/lifecycle";
import { updateMatterFile } from "../../course/matterFile";
import { summarizeModuleHeadline } from "../../course/coherence";
import {
  ConstructEdgeDossier,
  FourProblemsMarker,
  LifecycleHandoff,
  MatterFileCarryover,
} from "../../components/course/ContinuityPanels";
import ModuleBreadcrumb from "../../components/course/ModuleBreadcrumb";
import ChapterHero from "../../components/course/ChapterHero";
import chapterImage from "../../assets/chapters/ch08.jpg";

const ENTITY_OPTIONS = [
  {
    id: "partnership",
    label: "General Partnership",
    defaultScores: { attribution: 3, governance: 2, risk: 1, partitioning: 1 },
    strengths: "Fast formation and flexible operations.",
    warning: "Owners bear unlimited personal liability by default.",
  },
  {
    id: "llc",
    label: "Manager-Managed LLC",
    defaultScores: { attribution: 3, governance: 4, risk: 4, partitioning: 4 },
    strengths: "Contractual flexibility plus strong liability shielding.",
    warning: "Poorly drafted operating agreements create governance deadlocks.",
  },
  {
    id: "c-corp",
    label: "Delaware C Corporation",
    defaultScores: { attribution: 4, governance: 4, risk: 4, partitioning: 5 },
    strengths: "Investor familiarity, centralized authority, continuity.",
    warning: "Formal process and fiduciary risk intensify as financing grows.",
  },
  {
    id: "hybrid",
    label: "Dual Structure (C Corp + Nonprofit Affiliate)",
    defaultScores: { attribution: 2, governance: 3, risk: 3, partitioning: 5 },
    strengths: "Can separate mission programs from commercial arm.",
    warning: "Inter-entity conflicts, transfer pricing, and governance overlap risks.",
  },
];

const COUNSEL_PROMPTS = [
  "Who will be able to bind the enterprise in customer and platform contracts?",
  "Which governance rights must be hard-coded now versus left to future financing rounds?",
  "If the company fails, who is exposed personally and what assets are protected?",
  "What facts would make a court disregard your intended asset partitions?",
];

const FACT_BRANCHES = [
  {
    id: "founder-split",
    label: "Founders now split 50/50 and disagree on product roadmap",
    bestEntity: "llc",
    explanation:
      "A manager-managed LLC with deadlock and transfer provisions can stabilize control while preserving flexibility.",
  },
  {
    id: "vc-term-sheet",
    label: "Lead VC requires preferred stock and board seats within 60 days",
    bestEntity: "c-corp",
    explanation:
      "A Delaware C Corp supports preferred stock architecture and investor governance rights most cleanly.",
  },
  {
    id: "reg-risk",
    label: "High product-liability and data-security exposure appears",
    bestEntity: "c-corp",
    explanation:
      "Strong entity partitioning and board-level risk governance become critical under elevated downside exposure.",
  },
  {
    id: "mission-grant",
    label: "The team also wins public-interest grants with use restrictions",
    bestEntity: "hybrid",
    explanation:
      "A separate mission affiliate may isolate restricted-purpose funding and reduce commingling risk.",
  },
];


function buildEntitySelectionExportText({ selected, recommendedEntityLabel, score, branchChoices, counselRecommendation }) {
  const lines = [
    "ENTITY SELECTION COUNSEL SHEET",
    "",
    "Client: ConstructEdge (Zeeva + Sammy)",
    "Module: Chapter 08 Entity Selection",
    "",
    `Chosen baseline entity: ${selected?.label || "Not selected"}`,
    `Branch-adjusted recommendation: ${recommendedEntityLabel || "Not determined"}`,
    "",
    "Four Problems profile:",
    `Attribution: ${score?.attribution ?? "-"}`,
    `Governance: ${score?.governance ?? "-"}`,
    `Risk allocation: ${score?.risk ?? "-"}`,
    `Asset partitioning: ${score?.partitioning ?? "-"}`,
    "",
    "Facts that change the answer:",
    FACT_BRANCHES.map((b) => `- ${b.label}: ${(branchChoices || {})[b.id] ? "Selected" : "Not selected"}`).join("\n"),
    "",
    "Counsel recommendation:",
    counselRecommendation || "No recommendation drafted.",
    "",
    "What opposing counsel will argue:",
    "- Form cannot cure sloppy governance process or conflicted approvals.",
    "- Asset shielding fails when funds and decision rights are commingled.",
    "- Investor disclosures and authority design must match reality, not labels.",
  ];
  return lines.join("\n");
}

const INITIAL_STATE = {
  phase: 0,
  selectedEntity: "",
  issueChecks: {},
  branchChoices: {},
  counselRecommendation: "",
  completed: false,
};

function scoreEntity(entity, issueChecks) {
  if (!entity) return null;
  const base = ENTITY_OPTIONS.find((e) => e.id === entity)?.defaultScores;
  if (!base) return null;

  const adjust = { ...base };
  if (issueChecks.investorPressure) adjust.governance += entity === "c-corp" ? 1 : -1;
  if (issueChecks.founderDeadlock) adjust.governance += entity === "llc" ? 1 : 0;
  if (issueChecks.highTortExposure) adjust.risk += ["c-corp", "llc"].includes(entity) ? 1 : -2;
  if (issueChecks.crossEntityFlows) adjust.partitioning += entity === "hybrid" ? 1 : -1;
  return adjust;
}

export default function Ch08EntitySelection() {
  const { openTome } = useTome();
  const { state, patch, markCompleted } = useModuleProgress("ch08-entity-selection", INITIAL_STATE);
  const flow = MODULE_FLOW["ch08-entity-selection"];

  const selected = ENTITY_OPTIONS.find((e) => e.id === state.selectedEntity);
  const score = useMemo(
    () => scoreEntity(state.selectedEntity, state.issueChecks || {}),
    [state.selectedEntity, state.issueChecks]
  );

  const recommendedEntity = useMemo(() => {
    const branchEntries = Object.entries(state.branchChoices || {}).filter(([, value]) => value);
    if (!branchEntries.length) return state.selectedEntity;

    const tally = branchEntries.reduce((acc, [branchId]) => {
      const best = FACT_BRANCHES.find((b) => b.id === branchId)?.bestEntity;
      if (best) acc[best] = (acc[best] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(tally).sort((a, b) => b[1] - a[1])[0]?.[0] || state.selectedEntity;
  }, [state.branchChoices, state.selectedEntity]);

  const memoText = buildEntitySelectionExportText({
    selected,
    recommendedEntityLabel: ENTITY_OPTIONS.find((e) => e.id === recommendedEntity)?.label,
    score,
    branchChoices: state.branchChoices,
    counselRecommendation: state.counselRecommendation,
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-6">
      <ModuleBreadcrumb chapterNum="08" title="Entity Selection" />
      <ChapterHero src={chapterImage} alt="Strategic planning session comparing entity structures at a conference table" />
      <p className="font-ui text-xs text-sprawl-yellow/60 uppercase tracking-widest">Chapter 08 · Entity Selection</p>
      <h1 className="font-headline text-4xl uppercase tracking-tight text-gray-900 dark:text-white">ConstructEdge Formation Studio</h1>
      <p className="font-body text-gray-700 dark:text-gray-300">
        Counsel Zeeva and Sammy on selecting an entity that survives founder conflict, investor pressure,
        and downside risk while preserving mission.
      </p>
      <p className="font-ui text-sm text-gray-500">
        Why this chapter matters now: authority and contracting exposure from agency become durable only once legal form allocates control and downside.
      </p>

      <div className="flex flex-wrap gap-2 items-center">
        <CitationChip citation="RUPA § 202" />
        <CitationChip citation="DLLCA § 18-1101" />
        <CitationChip citation="DGCL § 141(a)" />
        <button
          onClick={() => openTome({ query: "DGCL § 141(a)" })}
          className="rounded border border-sprawl-yellow/40 px-2 py-1 font-ui text-xs text-sprawl-yellow hover:bg-sprawl-yellow/10"
        >
          Open source law
        </button>
      </div>

      <FourProblemsMarker
        dominant={flow.dominantProblems}
        secondary={flow.secondaryProblems}
        shift={flow.shiftFromPrior}
      />
      <ConstructEdgeDossier
        moduleId="ch08-entity-selection"
        factsOverride={{
          entityForm: selected?.label || "Entity not yet selected",
          controlPosture: "Founder-driven formation with incoming investor term-sheet pressure",
          boardDynamics: "Board architecture not yet fixed; governance rights being designed",
        }}
      />
      <MatterFileCarryover
        title="Matter File Carryover (Agency → Entity)"
        references={["ch02-agency"]}
      />

      <section className="border border-sprawl-light-blue/30 rounded-lg p-4 bg-sprawl-deep-blue/5 dark:bg-sprawl-deep-blue/30">
        <h2 className="font-headline text-lg uppercase text-gray-900 dark:text-white mb-3">
          The Four Problems of Business Law
        </h2>
        <p className="font-body text-sm text-gray-600 dark:text-gray-300 mb-3">
          Every entity structure is evaluated against four recurring legal problems. Understand these before selecting a form.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
            <p className="font-headline text-sm text-sprawl-yellow uppercase">Attribution</p>
            <p className="font-body text-sm text-gray-600 dark:text-gray-400 mt-1">
              Who has authority to act on behalf of the enterprise, and when do those acts bind the entity and its owners?
            </p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
            <p className="font-headline text-sm text-sprawl-yellow uppercase">Governance</p>
            <p className="font-body text-sm text-gray-600 dark:text-gray-400 mt-1">
              How are decisions made, who holds voting or veto power, and what happens when decision-makers disagree?
            </p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
            <p className="font-headline text-sm text-sprawl-yellow uppercase">Risk Allocation</p>
            <p className="font-body text-sm text-gray-600 dark:text-gray-400 mt-1">
              Who bears the financial downside when things go wrong -- the entity, its owners personally, or both?
            </p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
            <p className="font-headline text-sm text-sprawl-yellow uppercase">Asset Partitioning</p>
            <p className="font-body text-sm text-gray-600 dark:text-gray-400 mt-1">
              Are business assets legally separated from personal assets, and will courts respect that boundary?
            </p>
          </div>
        </div>
      </section>

      <section className="border border-sprawl-yellow/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
        <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white mb-2">Four Problems First</h2>
        <p className="font-ui text-sm text-gray-600 dark:text-gray-300 mb-4">
          Start with the legal problem, then choose structure. Check what is active in this fact pattern.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            ["investorPressure", "Governance pressure from term-sheet control rights"],
            ["founderDeadlock", "Attribution/governance instability between founders"],
            ["highTortExposure", "Risk allocation stress from product and tort exposure"],
            ["crossEntityFlows", "Asset partitioning stress from shared contracts and funds"],
          ].map(([id, label]) => (
            <label key={id} className="flex items-start gap-2 border border-gray-200 dark:border-gray-700 rounded p-3">
              <input
                type="checkbox"
                checked={!!state.issueChecks?.[id]}
                onChange={(e) =>
                  patch({ issueChecks: { ...(state.issueChecks || {}), [id]: e.target.checked } })
                }
                className="mt-1"
              />
              <span className="font-body text-sm text-gray-700 dark:text-gray-300">{label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="border border-sprawl-yellow/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
        <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white mb-2">Choose Initial Entity</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {ENTITY_OPTIONS.map((entity) => (
            <button
              key={entity.id}
              onClick={() => patch({ selectedEntity: entity.id })}
              className={`text-left border rounded p-4 transition-all ${
                state.selectedEntity === entity.id
                  ? "border-sprawl-yellow bg-sprawl-yellow/10"
                  : "border-gray-200 dark:border-gray-700 hover:border-sprawl-yellow/50"
              }`}
            >
              <p className="font-headline uppercase text-sm text-gray-900 dark:text-white">{entity.label}</p>
              <p className="font-body text-sm text-gray-600 dark:text-gray-300 mt-1">{entity.strengths}</p>
              <p className="font-ui text-sm text-sprawl-bright-red mt-2">Watchout: {entity.warning}</p>
            </button>
          ))}
        </div>
      </section>

      {selected && score && (
        <section className="border border-sprawl-teal/40 rounded-lg p-4 bg-sprawl-teal/5">
          <h2 className="font-headline text-lg uppercase text-sprawl-teal mb-2">Problem Fit Scorecard</h2>
          <p className="font-body text-sm text-gray-600 dark:text-gray-300 mb-3">
            Higher scores indicate better problem-fit for this entity type. Scores adjust dynamically
            based on the issue checks you selected above. A score of 4-5 means the entity handles
            that problem well; 1-2 signals a structural weakness worth addressing in your recommendation.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(score).map(([key, value]) => (
              <div key={key} className="border border-sprawl-teal/40 rounded p-3 text-center">
                <p className="font-ui text-xs uppercase text-gray-500 dark:text-gray-300">{key}</p>
                <p className="font-headline text-2xl text-sprawl-teal">{value}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="border border-sprawl-yellow/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
        <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white mb-2">Change-One-Fact Branches</h2>
        <p className="font-ui text-sm text-gray-500 mb-3">Select all facts that are true now; watch recommendation drift.</p>
        <div className="space-y-3">
          {FACT_BRANCHES.map((branch) => (
            <label key={branch.id} className="flex items-start gap-2 border border-gray-200 dark:border-gray-700 rounded p-3">
              <input
                type="checkbox"
                checked={!!state.branchChoices?.[branch.id]}
                onChange={(e) =>
                  patch({ branchChoices: { ...(state.branchChoices || {}), [branch.id]: e.target.checked } })
                }
                className="mt-1"
              />
              <span>
                <span className="font-body text-sm text-gray-700 dark:text-gray-300">{branch.label}</span>
                {!!state.branchChoices?.[branch.id] && (
                  <span className="block mt-1 font-ui text-sm text-sprawl-teal">{branch.explanation}</span>
                )}
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="border border-sprawl-yellow/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
        <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white mb-2">Counsel Recommendation</h2>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
            <p className="font-ui text-xs uppercase tracking-wider text-gray-500 mb-2">What matters legally here?</p>
            <ul className="list-disc list-inside font-body text-sm text-gray-700 dark:text-gray-300 space-y-1">
              {COUNSEL_PROMPTS.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
            <p className="font-ui text-xs uppercase tracking-wider text-gray-500 mb-2">Current branch-adjusted recommendation</p>
            <p className="font-headline text-lg text-sprawl-yellow uppercase">
              {ENTITY_OPTIONS.find((e) => e.id === recommendedEntity)?.label || "Select facts to generate"}
            </p>
            <p className="font-ui text-sm text-gray-500 mt-2">
              Why this is hard: governance flexibility and investor-readiness often conflict with mission and liability priorities.
            </p>
          </div>
        </div>

        <textarea
          value={state.counselRecommendation || ""}
          onChange={(e) => patch({ counselRecommendation: e.target.value })}
          placeholder="Draft your board-facing recommendation: structure, key provisions, what to document, and what to revisit after financing."
          className="w-full min-h-36 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-sprawl-deep-blue/70 p-3 font-body text-sm text-gray-800 dark:text-gray-200"
        />

        <div className="mt-4 flex flex-wrap gap-3">
          {state.selectedEntity && (state.counselRecommendation || "").trim().length < 20 && (
            <p className="font-ui text-sm text-sprawl-bright-red mb-2">
              Please draft a counsel recommendation of at least 20 characters before completing the module.
            </p>
          )}

          <button
            disabled={!state.selectedEntity || (state.counselRecommendation || "").trim().length < 20}
            onClick={() => {
              markCompleted();
              syncModuleCompletion({ moduleId: "ch08-entity-selection", chapterNum: 8, chapterTitle: "Entity Selection", scores: { selectedEntity: state.selectedEntity }, counselNotes: state.counselRecommendation });
              const entityLabel = ENTITY_OPTIONS.find((e) => e.id === recommendedEntity)?.label || "Undetermined";
              updateMatterFile(
                "ch08-entity-selection",
                summarizeModuleHeadline("ch08-entity-selection", {
                  recommendedEntityLabel: entityLabel,
                  counselRecommendation: state.counselRecommendation,
                }),
                {
                  entityForm: entityLabel,
                  controlPosture: "Control rights now mapped to chosen entity structure",
                  financingPosture: "Preparing for financing with structure-dependent governance terms",
                }
              );
              downloadTextFile("constructedge-entity-selection-counsel-sheet.txt", memoText);
            }}
            className="px-5 py-2 bg-sprawl-yellow text-sprawl-deep-blue font-headline uppercase text-xs rounded hover:bg-sprawl-yellow/80 disabled:opacity-40"
          >
            Complete Module + Export Counsel Sheet
          </button>
        </div>
      </section>

      <LifecycleHandoff moduleId="ch08-entity-selection" bridge={flow.bridge} />
    </div>
  );
}
