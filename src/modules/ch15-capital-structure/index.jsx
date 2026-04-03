import { useMemo } from "react";
import CitationChip from "../../tome/CitationChip";
import { useTome } from "../../tome/useTome";
import { downloadTextFile, useModuleProgress } from "../../learning/progress";
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

const SOLVENCY_STATES = [
  {
    id: "solvent",
    title: "Solvent",
    residualClaimant: "Equity",
    boardFocus: "Long-term value optimization with covenant discipline",
  },
  {
    id: "zone",
    title: "Near Insolvency (Distress Zone)",
    residualClaimant: "Shifting / contested",
    boardFocus: "Downside protection, runway preservation, process documentation",
  },
  {
    id: "insolvent",
    title: "Insolvent",
    residualClaimant: "Creditors effectively control downside",
    boardFocus: "Value-preserving options, fraudulent transfer and preference sensitivity",
  },
];

const BOARD_OPTIONS = [
  {
    id: "bridge-insider",
    text: "Take insider bridge at punitive terms with immediate dilution to common",
    solventRisk: "medium",
    zoneRisk: "high",
    insolventRisk: "high",
  },
  {
    id: "amend-covenants",
    text: "Negotiate covenant reset with existing lender and milestone reporting",
    solventRisk: "low",
    zoneRisk: "medium",
    insolventRisk: "medium",
  },
  {
    id: "asset-sale",
    text: "Run expedited asset sale to strategic buyer and preserve going-concern core",
    solventRisk: "medium",
    zoneRisk: "medium",
    insolventRisk: "low",
  },
  {
    id: "dividend",
    text: "Issue founder dividend to maintain morale signaling",
    solventRisk: "high",
    zoneRisk: "high",
    insolventRisk: "critical",
  },
];

const INITIAL_STATE = {
  solvencyState: "",
  selectedActions: {},
  standingNotes: "",
  boardRecommendation: "",
  completed: false,
};

function actionRisk(action, solvencyState) {
  if (!action || !solvencyState) return "unknown";
  if (solvencyState === "solvent") return action.solventRisk;
  if (solvencyState === "zone") return action.zoneRisk;
  return action.insolventRisk;
}

function buildDistressExportText({ selectedSolvency, selectedRiskProfile, standingNotes, boardRecommendation }) {
  const lines = [
    "DISTRESS ANALYSIS SHEET — CONSTRUCTEDGE",
    "",
    "Module: Chapter 15 Capital Structure",
    "",
    `Selected solvency state: ${selectedSolvency?.title || "Not selected"}`,
    `Residual claimant posture: ${selectedSolvency?.residualClaimant || "N/A"}`,
    `Board focus: ${selectedSolvency?.boardFocus || "N/A"}`,
    "",
    "Selected board actions and risk:",
    selectedRiskProfile.length
      ? selectedRiskProfile.map((r) => `- ${r.text} => ${r.risk}`).join("\n")
      : "No actions selected.",
    "",
    "Standing and leverage notes:",
    standingNotes || "Not drafted",
    "",
    "Board recommendation:",
    boardRecommendation || "Not drafted",
    "",
    "Why this is hard:",
    "Capital structure can shift practical control before formal governance rights move. Process and solvency framing determine litigation posture.",
  ];
  return lines.join("\n");
}

export default function Ch15CapitalStructure() {
  const { openTome } = useTome();
  const { state, patch, markCompleted } = useModuleProgress("ch15-capital-structure", INITIAL_STATE);
  const flow = MODULE_FLOW["ch15-capital-structure"];

  const selectedSolvency = SOLVENCY_STATES.find((s) => s.id === state.solvencyState);

  const selectedRiskProfile = useMemo(
    () =>
      BOARD_OPTIONS.filter((o) => state.selectedActions?.[o.id]).map((o) => ({
        id: o.id,
        text: o.text,
        risk: actionRisk(o, state.solvencyState),
      })),
    [state.selectedActions, state.solvencyState]
  );

  const exportText = buildDistressExportText({
    selectedSolvency,
    selectedRiskProfile,
    standingNotes: state.standingNotes,
    boardRecommendation: state.boardRecommendation,
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-6">
      <ModuleBreadcrumb chapterNum="15" title="Capital Structure" />
      <p className="font-ui text-xs text-sprawl-yellow/60 uppercase tracking-widest">Chapter 15 · Capital Structure</p>
      <h1 className="font-headline text-4xl uppercase tracking-tight text-gray-900 dark:text-white">Distress Governance Lab</h1>
      <p className="font-body text-gray-700 dark:text-gray-300">
        ConstructEdge has covenant pressure, shrinking runway, and investor conflict. Diagnose how
        solvency posture changes legal leverage and board obligations.
      </p>
      <p className="font-ui text-xs text-gray-500">
        What changed since M&A: transaction choices now compress into balance-sheet reality, so residual-claimant shifts and creditor leverage drive governance choices.
      </p>

      <div className="flex flex-wrap gap-2">
        <CitationChip citation="DGCL § 102(b)(7)" />
        <CitationChip citation="DGCL § 170" />
        <CitationChip citation="North American Catholic v. Gheewalla" />
        <button
          onClick={() => openTome({ query: "Gheewalla" })}
          className="rounded border border-sprawl-yellow/40 px-2 py-1 font-ui text-xs text-sprawl-yellow hover:bg-sprawl-yellow/10"
        >
          Open in Tome
        </button>
      </div>

      <FourProblemsMarker
        dominant={flow.dominantProblems}
        secondary={flow.secondaryProblems}
        shift={flow.shiftFromPrior}
      />
      <ConstructEdgeDossier
        moduleId="ch15-capital-structure"
        factsOverride={{
          financingPosture: "Runway and covenant headroom define practical control",
          residualClaimantPosture: selectedSolvency?.residualClaimant || "Not yet assessed",
        }}
      />
      <MatterFileCarryover
        title="Matter File Carryover (M&A + Franchise + Board Process)"
        references={["ch13-m-and-a", "ch12-shareholder-franchise", "ch09-fiduciary-duties"]}
      />

      <section className="border border-sprawl-yellow/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
        <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white mb-2">Choose solvency posture</h2>
        <div className="grid md:grid-cols-3 gap-3">
          {SOLVENCY_STATES.map((s) => (
            <button
              key={s.id}
              onClick={() => patch({ solvencyState: s.id })}
              className={`text-left border rounded p-3 ${
                state.solvencyState === s.id
                  ? "border-sprawl-yellow bg-sprawl-yellow/10"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <p className="font-headline text-sm uppercase text-gray-900 dark:text-white">{s.title}</p>
              <p className="font-ui text-xs text-gray-500 mt-1">Residual claimant: {s.residualClaimant}</p>
              <p className="font-body text-sm text-gray-700 dark:text-gray-300 mt-2">{s.boardFocus}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="border border-sprawl-yellow/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
        <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white mb-2">Board action analyzer</h2>
        <p className="font-ui text-xs text-gray-500 mb-3">Select actions under current solvency assumptions.</p>
        <div className="space-y-2">
          {BOARD_OPTIONS.map((option) => {
            const checked = !!state.selectedActions?.[option.id];
            const risk = actionRisk(option, state.solvencyState);
            return (
              <label key={option.id} className="flex items-start gap-2 border border-gray-200 dark:border-gray-700 rounded p-3">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) =>
                    patch({ selectedActions: { ...(state.selectedActions || {}), [option.id]: e.target.checked } })
                  }
                  className="mt-1"
                />
                <span>
                  <span className="font-body text-sm text-gray-700 dark:text-gray-300">{option.text}</span>
                  <span className="block font-ui text-xs mt-1 text-sprawl-bright-red">Current-state risk: {risk}</span>
                </span>
              </label>
            );
          })}
        </div>
      </section>

      <section className="border border-sprawl-yellow/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
        <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white mb-2">Standing and leverage map</h2>
        <div className="grid md:grid-cols-2 gap-4 mb-3">
          <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
            <p className="font-ui text-xs uppercase tracking-wider text-gray-500 mb-2">What opposing counsel will argue</p>
            <ul className="font-body text-sm list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
              <li>Board favored insiders over enterprise value preservation</li>
              <li>Transfers during distress were not reasonably equivalent</li>
              <li>Disclosures hid true covenant and liquidity posture</li>
            </ul>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
            <p className="font-ui text-xs uppercase tracking-wider text-gray-500 mb-2">Facts that change the answer</p>
            <ul className="font-body text-sm list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
              <li>Exact covenant default triggers and cure periods</li>
              <li>Whether new money is truly third-party and market tested</li>
              <li>Whether board ran alternatives before dilutive insider deal</li>
            </ul>
          </div>
        </div>
        <textarea
          value={state.standingNotes || ""}
          onChange={(e) => patch({ standingNotes: e.target.value })}
          placeholder="Who has standing now? Who has practical control leverage? What changes if insolvency hardens?"
          className="w-full min-h-24 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-sprawl-deep-blue/70 p-3 font-body text-sm"
        />
      </section>

      <section className="border border-sprawl-yellow/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
        <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white mb-2">Final board recommendation</h2>
        <textarea
          value={state.boardRecommendation || ""}
          onChange={(e) => patch({ boardRecommendation: e.target.value })}
          placeholder="Draft recommendation: immediate steps, advisor process, financing path, and risk controls."
          className="w-full min-h-32 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-sprawl-deep-blue/70 p-3 font-body text-sm"
        />
        <div className="mt-4">
          <button
            disabled={!state.solvencyState}
            onClick={() => {
              markCompleted();
              updateMatterFile(
                "ch15-capital-structure",
                summarizeModuleHeadline("ch15-capital-structure", {
                  solvencyStateLabel: selectedSolvency?.title || "Not selected",
                  boardRecommendation: state.boardRecommendation,
                }),
                {
                  financingPosture: selectedSolvency?.title || "Unclear solvency posture",
                  residualClaimantPosture: selectedSolvency?.residualClaimant || "Residual claimant contested",
                }
              );
              downloadTextFile("constructedge-distress-analysis-sheet.txt", exportText);
            }}
            className="px-5 py-2 bg-sprawl-yellow text-sprawl-deep-blue font-headline uppercase text-xs rounded hover:bg-sprawl-yellow/80 disabled:opacity-40"
          >
            Complete Module + Export Distress Sheet
          </button>
        </div>
      </section>

      <LifecycleHandoff moduleId="ch15-capital-structure" bridge={flow.bridge} />
    </div>
  );
}
