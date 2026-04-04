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
import ChapterHero from "../../components/course/ChapterHero";
import chapterImage from "../../assets/chapters/ch09.jpg";

const BOARD_PACKET_ITEMS = [
  {
    id: "packet-financials",
    label: "Current runway, covenant headroom, and downside liquidity model",
    required: true,
    why: "Boards cannot evaluate alternatives without baseline capital condition and liquidity constraints.",
  },
  {
    id: "packet-conflicts",
    label: "Director/officer conflict disclosures and side-letter benefits",
    required: true,
    why: "Conflict visibility determines committee design and review standard risk.",
  },
  {
    id: "packet-fairness",
    label: "Independent valuation/fairness perspective",
    required: true,
    why: "Independent valuation supports informed process and proportionality judgments.",
  },
  {
    id: "packet-mission",
    label: "Narrative mission impact deck only (no financial appendices)",
    required: false,
    why: "Useful context, but standing alone it cannot satisfy duty-of-care process rigor.",
  },
];

const PROCESS_OPTIONS = [
  {
    id: "proc-fast",
    title: "Approve insider-led recap today",
    risk: "high",
    summary: "Fast but conflict-heavy and thin process record.",
    reviewRisk: "Likely enhanced scrutiny or entire fairness pressure if controller dynamics appear.",
  },
  {
    id: "proc-committee",
    title: "Form independent special committee and run two-week process",
    risk: "low",
    summary: "Slower but best record on loyalty and care.",
    reviewRisk: "Improves process integrity and defensibility under scrutiny.",
  },
  {
    id: "proc-market-check",
    title: "Open limited market check before choosing recap path",
    risk: "medium",
    summary: "Improves alternatives record but may leak strategy and weaken negotiation leverage.",
    reviewRisk: "Stronger than unilateral action, weaker if conflicts remain unmanaged.",
  },
];

const CONFLICT_FACTS = [
  {
    id: "conf-vc-liqpref",
    label: "Lead VC director gets unique liquidation preference step-up in proposed deal",
    correct: "conflicted",
  },
  {
    id: "conf-founder-roll",
    label: "Founder receives same rollover terms as all common stockholders",
    correct: "not-conflicted",
  },
  {
    id: "conf-cfo-bonus",
    label: "CFO receives transaction bonus only if specific bidder wins",
    correct: "conflicted",
  },
  {
    id: "conf-independent-advisor",
    label: "Independent advisor compensation is fixed regardless of transaction outcome",
    correct: "not-conflicted",
  },
];


function buildFiduciaryExportText({ packetChecks, conflictClassifications, selectedProcess, counselMemo }) {
  const lines = [
    "BOARD PROCESS MEMO — CONSTRUCTEDGE",
    "",
    "Module: Chapter 09 Fiduciary Duties",
    "",
    "Board packet completeness:",
    BOARD_PACKET_ITEMS.map((item) => `- ${item.label}: ${packetChecks?.[item.id] ? "Included" : "Missing"}`).join("\n"),
    "",
    "Conflict map:",
    CONFLICT_FACTS.map((fact) => `- ${fact.label}: ${conflictClassifications?.[fact.id] || "Unclassified"}`).join("\n"),
    "",
    "Selected process path:",
    selectedProcess?.title || "Not selected",
    `Review-standard risk: ${selectedProcess?.reviewRisk || "N/A"}`,
    "",
    "Counsel recommendation:",
    counselMemo || "No memo drafted.",
    "",
    "What opposing counsel will argue:",
    "- Missing packet items show uninformed process (care exposure).",
    "- Unmanaged conflicts taint decision-making (loyalty exposure).",
    "- Process shortcuts imply outcome-driven governance, not board-level deliberation.",
  ];
  return lines.join("\n");
}

const INITIAL_STATE = {
  packetChecks: {},
  conflictClassifications: {},
  processChoice: "",
  counselMemo: "",
  completed: false,
};

export default function Ch09FiduciaryDuties() {
  const { openTome } = useTome();
  const { state, patch, markCompleted } = useModuleProgress("ch09-fiduciary-duties", INITIAL_STATE);
  const flow = MODULE_FLOW["ch09-fiduciary-duties"];

  const packetScore = useMemo(
    () =>
      BOARD_PACKET_ITEMS.filter((item) => !!state.packetChecks?.[item.id]).length,
    [state.packetChecks]
  );

  const conflictScore = useMemo(
    () =>
      CONFLICT_FACTS.filter((fact) => state.conflictClassifications?.[fact.id] === fact.correct).length,
    [state.conflictClassifications]
  );

  const selectedProcess = PROCESS_OPTIONS.find((p) => p.id === state.processChoice);

  const output = buildFiduciaryExportText({
    packetChecks: state.packetChecks,
    conflictClassifications: state.conflictClassifications,
    selectedProcess,
    counselMemo: state.counselMemo,
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-6">
      <ModuleBreadcrumb chapterNum="09" title="Fiduciary Duties" />
      <ChapterHero src={chapterImage} alt="Zeeva confronting fiduciary tension in a late-night office meeting" />
      <p className="font-ui text-xs text-sprawl-yellow/60 uppercase tracking-widest">Chapter 09 · Fiduciary Duties</p>
      <h1 className="font-headline text-4xl uppercase tracking-tight text-gray-900 dark:text-white">Board Process Simulator</h1>
      <p className="font-body text-gray-700 dark:text-gray-300">
        ConstructEdge faces a conflicted recap proposal while runway tightens. Build a board process
        record that can survive judicial review.
      </p>
      <p className="font-ui text-xs text-gray-500">
        Facts changed since last chapter: entity form is now set, so fiduciary process quality and conflict handling—not formation choices—drive litigation posture.
      </p>

      <div className="flex flex-wrap gap-2 items-center">
        <CitationChip citation="DGCL § 141(a)" />
        <CitationChip citation="DGCL § 144" />
        <CitationChip citation="Lyondell" />
        <button
          onClick={() => openTome({ query: "DGCL § 144" })}
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
        moduleId="ch09-fiduciary-duties"
        factsOverride={{
          boardDynamics: "Board committee design and conflict surfacing now determine process defensibility",
          strategicPressure: "Investor pressure is intensifying board-level tradeoffs",
        }}
      />
      <MatterFileCarryover
        title="Matter File Carryover (Entity Form → Board Process)"
        references={["ch08-entity-selection", "ch02-agency"]}
      />

      <section className="border border-sprawl-yellow/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
        <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white mb-2">What information must the board have?</h2>
        <p className="font-ui text-xs text-gray-500 mb-3">Choose packet items before selecting a path.</p>
        <div className="space-y-3">
          {BOARD_PACKET_ITEMS.map((item) => (
            <label key={item.id} className="flex items-start gap-2 border border-gray-200 dark:border-gray-700 rounded p-3">
              <input
                type="checkbox"
                checked={!!state.packetChecks?.[item.id]}
                onChange={(e) =>
                  patch({ packetChecks: { ...(state.packetChecks || {}), [item.id]: e.target.checked } })
                }
                className="mt-1"
              />
              <span>
                <span className="font-body text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                <span className="block font-ui text-xs text-gray-500 mt-1">{item.why}</span>
              </span>
            </label>
          ))}
        </div>
        <p className="mt-3 font-ui text-xs text-sprawl-teal">Packet readiness: {packetScore}/{BOARD_PACKET_ITEMS.length}</p>
      </section>

      <section className="border border-sprawl-yellow/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
        <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white mb-2">Conflict analysis</h2>
        <p className="font-ui text-xs text-gray-500 mb-3">Classify each fact as conflicted or not conflicted.</p>
        <div className="space-y-3">
          {CONFLICT_FACTS.map((fact) => (
            <div key={fact.id} className="border border-gray-200 dark:border-gray-700 rounded p-3">
              <p className="font-body text-sm text-gray-700 dark:text-gray-300 mb-2">{fact.label}</p>
              <div className="flex gap-2">
                {["conflicted", "not-conflicted"].map((choice) => (
                  <button
                    key={choice}
                    onClick={() =>
                      patch({
                        conflictClassifications: { ...(state.conflictClassifications || {}), [fact.id]: choice },
                      })
                    }
                    className={`px-3 py-1 rounded border font-ui text-xs ${
                      state.conflictClassifications?.[fact.id] === choice
                        ? "border-sprawl-yellow bg-sprawl-yellow/10"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    {choice === "conflicted" ? "Conflicted" : "Not conflicted"}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 font-ui text-xs text-sprawl-teal">Conflict accuracy: {conflictScore}/{CONFLICT_FACTS.length}</p>
      </section>

      <section className="border border-sprawl-yellow/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
        <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white mb-2">Choose board process</h2>
        <div className="grid md:grid-cols-3 gap-3">
          {PROCESS_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => patch({ processChoice: option.id })}
              className={`text-left border rounded p-3 ${
                state.processChoice === option.id
                  ? "border-sprawl-yellow bg-sprawl-yellow/10"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <p className="font-headline text-sm uppercase text-gray-900 dark:text-white">{option.title}</p>
              <p className="font-body text-sm text-gray-600 dark:text-gray-300 mt-1">{option.summary}</p>
              <p className="font-ui text-xs mt-2 text-sprawl-bright-red">Review risk: {option.reviewRisk}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="border border-sprawl-yellow/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
        <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white mb-2">Counsel recommendation (board memo)</h2>
        <div className="grid md:grid-cols-2 gap-4 mb-3">
          <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
            <p className="font-ui text-xs uppercase tracking-wider text-gray-500 mb-2">What a board should document</p>
            <ul className="font-body text-sm list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
              <li>Alternatives considered and rejected</li>
              <li>Conflict disclosures and recusal decisions</li>
              <li>Advisor inputs and valuation assumptions</li>
              <li>Why chosen path is proportionate to risk</li>
            </ul>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
            <p className="font-ui text-xs uppercase tracking-wider text-gray-500 mb-2">Best plaintiff argument / best defense argument</p>
            <p className="font-ui text-xs text-gray-600 dark:text-gray-300">Plaintiff: process engineered to protect insiders. Defense: independent process, informed deliberation, and documented alternatives.</p>
          </div>
        </div>

        <textarea
          value={state.counselMemo || ""}
          onChange={(e) => patch({ counselMemo: e.target.value })}
          placeholder="Draft recommendation: process steps, committee/advisor structure, documentation, and litigation posture."
          className="w-full min-h-36 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-sprawl-deep-blue/70 p-3 font-body text-sm text-gray-800 dark:text-gray-200"
        />

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => {
              markCompleted();
              const selectedProcessLabel =
                PROCESS_OPTIONS.find((option) => option.id === state.processChoice)?.title || "No process selected";
              updateMatterFile(
                "ch09-fiduciary-duties",
                summarizeModuleHeadline("ch09-fiduciary-duties", {
                  processChoiceLabel: selectedProcessLabel,
                  counselMemo: state.counselMemo,
                }),
                {
                  boardDynamics: selectedProcessLabel,
                  strategicPressure: "Control contest risk now tied to board process record",
                }
              );
              downloadTextFile("constructedge-board-process-memo.txt", output);
            }}
            className="px-5 py-2 bg-sprawl-yellow text-sprawl-deep-blue font-headline uppercase text-xs rounded hover:bg-sprawl-yellow/80"
          >
            Complete Module + Export Board Memo
          </button>
        </div>
      </section>

      <LifecycleHandoff moduleId="ch09-fiduciary-duties" bridge={flow.bridge} />
    </div>
  );
}
