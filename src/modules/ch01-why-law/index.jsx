import { useMemo, useCallback } from "react";
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
} from "../../components/course/ContinuityPanels";
import ModuleBreadcrumb from "../../components/course/ModuleBreadcrumb";
import ChapterHero from "../../components/course/ChapterHero";
import chapterImage from "../../assets/chapters/ch01.jpg";

/* ------------------------------------------------------------------ */
/*  DATA: The Four Problems of the Firm                                */
/* ------------------------------------------------------------------ */

const FOUR_PROBLEMS = [
  {
    id: "attribution",
    label: "Attribution",
    icon: "\u{1F517}",
    summary:
      "Connecting human action to the artificial firm. A firm cannot act on its own — it requires human agents whose acts bind the entity.",
    domain: "Restatement (Third) of Agency",
    doctrines: ["Actual Authority", "Apparent Authority", "Ratification"],
    constructEdgeExample:
      "When Zeeva signs a platform contract, does that act bind the entity she and Sammy are forming? Under what conditions?",
  },
  {
    id: "governance",
    label: "Governance",
    icon: "\u2699\uFE0F",
    summary:
      "Determining who decides. As ownership separates from control, the law must allocate decision rights and impose fiduciary duties to prevent shirking and self-dealing.",
    domain: "Corporate Law (MBCA / DGCL)",
    doctrines: ["Duty of Care", "Duty of Loyalty", "Business Judgment Rule"],
    constructEdgeExample:
      "If Zeeva wants to pivot the product and Sammy disagrees, whose decision controls? What rules constrain whoever holds that power?",
  },
  {
    id: "risk",
    label: "Risk Allocation",
    icon: "\u26A0\uFE0F",
    summary:
      "Deciding who pays when things fail. Entity law offers limited liability, shifting enterprise risk from owners to creditors and encouraging investment.",
    domain: "Statutory Entity Law (RULLCA / MBCA)",
    doctrines: ["Limited Liability", "Joint & Several Liability", "Veil Piercing"],
    constructEdgeExample:
      "If a ConstructEdge delivery drone injures someone, are Zeeva and Sammy personally liable? The answer depends entirely on entity form.",
  },
  {
    id: "partitioning",
    label: "Asset Partitioning",
    icon: "\u{1F4E6}",
    summary:
      "Protecting assets in both directions. Entity shielding protects firm assets from owners' personal creditors; limited liability protects owners from firm debts.",
    domain: "Creditors' Rights & Veil Piercing",
    doctrines: ["Entity Shielding", "Defensive Partitioning", "Capital Lock-In"],
    constructEdgeExample:
      "If Sammy has personal debts, can his creditors seize ConstructEdge assets? Partitioning doctrine determines the boundary.",
  },
];

/* ------------------------------------------------------------------ */
/*  DATA: Classification scenarios                                     */
/* ------------------------------------------------------------------ */

const SCENARIOS = [
  {
    id: "s1",
    text: "Zeeva signs a supply contract with a hardware vendor, purportedly on behalf of ConstructEdge, even though the company hasn't formally authorized the deal.",
    correctProblem: "attribution",
    explanation:
      "This is an Attribution problem. The question is whether Zeeva's act binds the firm. Agency doctrine (actual vs. apparent authority) determines whether the vendor can hold ConstructEdge to the contract.",
    legalHook: "Restatement (Third) of Agency ss 2.01, 2.03",
  },
  {
    id: "s2",
    text: "Sammy proposes investing company funds in a side project that benefits his family. Zeeva objects but Sammy controls the bank account.",
    correctProblem: "governance",
    explanation:
      "This is a Governance problem. The issue is decision-making authority and self-dealing. Fiduciary duties (especially loyalty) constrain insiders who divert firm resources for personal benefit.",
    legalHook: "Duty of Loyalty; cf. Guth v. Loft",
  },
  {
    id: "s3",
    text: "ConstructEdge's prototype causes property damage at a client site. The client sues both the company and the founders personally.",
    correctProblem: "risk",
    explanation:
      "This is a Risk Allocation problem. Whether the founders face personal liability depends on whether the entity provides limited liability and whether any exception (e.g., veil piercing) applies.",
    legalHook: "Limited Liability; Veil Piercing Doctrine",
  },
  {
    id: "s4",
    text: "A bank that loaned money to Sammy personally tries to seize ConstructEdge's warehouse inventory to satisfy the debt.",
    correctProblem: "partitioning",
    explanation:
      "This is an Asset Partitioning problem. Entity shielding protects firm assets from personal creditors of the owners. Without proper partitioning, the boundary between personal and firm assets blurs.",
    legalHook: "Entity Shielding; Capital Lock-In",
  },
  {
    id: "s5",
    text: "An employee tells a supplier 'I'm authorized to place orders up to $50,000' — but no one at ConstructEdge ever gave that authority explicitly.",
    correctProblem: "attribution",
    explanation:
      "Attribution again. The supplier may claim apparent authority if ConstructEdge created the reasonable appearance that the employee could bind the firm. The firm's prior conduct matters.",
    legalHook: "Apparent Authority; Restatement (Third) of Agency ss 2.03",
  },
  {
    id: "s6",
    text: "Zeeva and Sammy deadlock 50/50 on whether to accept a buyout offer. No tiebreaker mechanism exists in their agreement.",
    correctProblem: "governance",
    explanation:
      "Governance. Deadlock is a classic governance failure. The law provides default rules (e.g., equal management rights under RUPA ss 401(f)), but without a tiebreaker, the firm is paralyzed.",
    legalHook: "RUPA ss 401(f); Governance Deadlock",
  },
  {
    id: "s7",
    text: "ConstructEdge is insolvent. Creditors argue the founders commingled personal and business funds, so the corporate form should be disregarded.",
    correctProblem: "partitioning",
    explanation:
      "Partitioning and Risk overlap, but the core issue is whether the asset boundary was maintained. Veil piercing attacks the partition itself — if the owners treated firm assets as personal, the shield dissolves.",
    legalHook: "Veil Piercing; Alter Ego Doctrine",
  },
  {
    id: "s8",
    text: "ConstructEdge takes on venture debt. The lender wants personal guarantees from both founders in case the company cannot repay.",
    correctProblem: "risk",
    explanation:
      "Risk Allocation. Personal guarantees undo limited liability for the guaranteed debt. The founders must weigh whether the financing benefit justifies the personal exposure.",
    legalHook: "Personal Guarantees; Risk Shifting",
  },
];

/* ------------------------------------------------------------------ */
/*  DATA: Synthesis prompts                                            */
/* ------------------------------------------------------------------ */

const SYNTHESIS_PROMPTS = [
  "Which of the Four Problems is most acute for ConstructEdge right now, and why?",
  "How does entity selection (Chapter 08) connect to all four problems simultaneously?",
  "If you could address only one problem through legal structure, which would create the most value for ConstructEdge's founders?",
];

/* ------------------------------------------------------------------ */
/*  Export builder                                                     */
/* ------------------------------------------------------------------ */

function buildExportText({ scenarioAnswers, synthesisNote, scenarios }) {
  const correct = scenarios.filter((s) => scenarioAnswers[s.id] === s.correctProblem).length;
  const lines = [
    "FOUR PROBLEMS DIAGNOSTIC — COUNSEL SHEET",
    "",
    "Client: ConstructEdge (Zeeva + Sammy)",
    "Module: Chapter 01 — Why Law",
    "",
    `Scenarios classified correctly: ${correct} / ${scenarios.length}`,
    "",
    "--- Scenario Detail ---",
    ...scenarios.map((s, i) => {
      const answer = scenarioAnswers[s.id];
      const isCorrect = answer === s.correctProblem;
      return [
        `${i + 1}. ${s.text}`,
        `   Your answer: ${answer || "unanswered"} ${isCorrect ? "(correct)" : `(correct: ${s.correctProblem})`}`,
        `   ${s.explanation}`,
        "",
      ].join("\n");
    }),
    "--- Synthesis ---",
    synthesisNote || "No synthesis drafted.",
    "",
    "--- Framework Reference ---",
    "Attribution: Who can bind the firm?",
    "Governance: Who decides, and under what constraints?",
    "Risk Allocation: Who pays when things fail?",
    "Asset Partitioning: Are firm and personal assets properly separated?",
  ];
  return lines.join("\n");
}

/* ------------------------------------------------------------------ */
/*  Component State                                                    */
/* ------------------------------------------------------------------ */

const INITIAL_STATE = {
  phase: 0, // 0 = explore, 1 = classify, 2 = synthesize
  activeProblem: "attribution",
  scenarioAnswers: {},
  scenarioRevealed: {},
  synthesisNote: "",
  completed: false,
};

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function Ch01WhyLaw() {
  const { openTome } = useTome();
  const { state, patch, markCompleted } = useModuleProgress("ch01-why-law", INITIAL_STATE);
  const flow = MODULE_FLOW["ch01-why-law"];

  const correctCount = useMemo(
    () => SCENARIOS.filter((s) => state.scenarioAnswers?.[s.id] === s.correctProblem).length,
    [state.scenarioAnswers]
  );

  const allAnswered = useMemo(
    () => SCENARIOS.every((s) => state.scenarioAnswers?.[s.id]),
    [state.scenarioAnswers]
  );

  const canAdvanceToSynthesize = allAnswered;

  const handleAnswer = useCallback(
    (scenarioId, problemId) => {
      patch({
        scenarioAnswers: { ...(state.scenarioAnswers || {}), [scenarioId]: problemId },
      });
    },
    [patch, state.scenarioAnswers]
  );

  const revealScenario = useCallback(
    (scenarioId) => {
      patch({
        scenarioRevealed: { ...(state.scenarioRevealed || {}), [scenarioId]: true },
      });
    },
    [patch, state.scenarioRevealed]
  );

  const exportText = useMemo(
    () =>
      buildExportText({
        scenarioAnswers: state.scenarioAnswers || {},
        activeProblem: state.activeProblem,
        synthesisNote: state.synthesisNote,
        scenarios: SCENARIOS,
      }),
    [state.scenarioAnswers, state.activeProblem, state.synthesisNote]
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-6">
      <ModuleBreadcrumb chapterNum="01" title="Why Law" />
      <ChapterHero src={chapterImage} alt="Zeeva and Sammy reviewing formation documents at a holographic table in New Boston" />
      <p className="font-ui text-xs text-sprawl-yellow/60 uppercase tracking-widest">
        Chapter 01 · Introduction to the Firm
      </p>
      <h1 className="font-headline text-4xl uppercase tracking-tight text-gray-900 dark:text-white">
        The Four Problems Diagnostic
      </h1>
      <p className="font-body text-gray-700 dark:text-gray-300">
        Every business association — from a handshake partnership to a multinational corporation —
        exists to solve coordination challenges. Before choosing any legal structure, a lawyer must
        diagnose which of the <strong>Four Problems</strong> are most acute. This module teaches you
        to classify real-world business disputes into the framework that organizes the entire course.
      </p>
      <p className="font-ui text-xs text-gray-500">
        This is the first module. The Four Problems framework will recur in every chapter that follows.
      </p>

      <div className="flex flex-wrap gap-2 items-center">
        <CitationChip citation="Restatement (Third) of Agency" />
        <CitationChip citation="RUPA § 202" />
        <CitationChip citation="DGCL § 141(a)" />
        <button
          onClick={() => openTome({ query: "Four Problems of the Firm" })}
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
        moduleId="ch01-why-law"
        factsOverride={{
          entityForm: "Not yet formed — founders still exploring",
          controlPosture: "Zeeva and Sammy are co-equal; no governance structure exists yet",
          boardDynamics: "No board; informal decision-making only",
        }}
      />

      {/* ============================================================ */}
      {/* PHASE 0: Explore the Four Problems                            */}
      {/* ============================================================ */}

      <section className="border border-sprawl-yellow/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
        <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white mb-2">
          Step 1: Learn the Four Problems
        </h2>
        <p className="font-ui text-sm text-gray-600 dark:text-gray-300 mb-4">
          Click each problem to understand what it covers, its legal domain, and how it applies to
          ConstructEdge. You need to internalize all four before classifying scenarios.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {FOUR_PROBLEMS.map((p) => (
            <button
              key={p.id}
              onClick={() => patch({ activeProblem: p.id })}
              className={`text-left border rounded-lg p-3 transition-all ${
                state.activeProblem === p.id
                  ? "border-sprawl-yellow bg-sprawl-yellow/10 shadow-md"
                  : "border-gray-200 dark:border-gray-700 hover:border-sprawl-yellow/50"
              }`}
            >
              <span className="text-2xl block mb-1">{p.icon}</span>
              <p className="font-headline uppercase text-sm text-gray-900 dark:text-white">
                {p.label}
              </p>
            </button>
          ))}
        </div>

        {/* Detail card for selected problem */}
        {(() => {
          const active = FOUR_PROBLEMS.find((p) => p.id === state.activeProblem);
          if (!active) return null;
          return (
            <div className="border-l-4 border-sprawl-bright-red rounded-lg p-5 bg-gray-50 dark:bg-sprawl-deep-blue/60">
              <h3 className="font-headline text-lg uppercase text-gray-900 dark:text-white mb-2">
                {active.icon} {active.label}
              </h3>
              <p className="font-body text-sm text-gray-700 dark:text-gray-300 mb-3">
                {active.summary}
              </p>

              <div className="grid md:grid-cols-2 gap-3 mb-3">
                <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
                  <p className="font-ui text-xs uppercase tracking-wider text-sprawl-teal mb-1">
                    Primary Legal Domain
                  </p>
                  <p className="font-body text-sm text-gray-700 dark:text-gray-300">
                    {active.domain}
                  </p>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
                  <p className="font-ui text-xs uppercase tracking-wider text-sprawl-teal mb-1">
                    Key Doctrines
                  </p>
                  <p className="font-body text-sm text-gray-700 dark:text-gray-300">
                    {active.doctrines.join(" · ")}
                  </p>
                </div>
              </div>

              <div className="border border-sprawl-yellow/30 rounded p-3 bg-sprawl-yellow/5">
                <p className="font-ui text-xs uppercase tracking-wider text-sprawl-yellow mb-1">
                  ConstructEdge Application
                </p>
                <p className="font-body text-sm text-gray-700 dark:text-gray-300 italic">
                  {active.constructEdgeExample}
                </p>
              </div>
            </div>
          );
        })()}

        {state.phase === 0 && (
          <button
            onClick={() => patch({ phase: 1 })}
            className="mt-4 px-5 py-2 bg-sprawl-yellow text-sprawl-deep-blue font-headline uppercase text-xs rounded hover:bg-sprawl-yellow/80"
          >
            I understand the framework — begin classification
          </button>
        )}
      </section>

      {/* ============================================================ */}
      {/* PHASE 1: Classify scenarios                                   */}
      {/* ============================================================ */}

      {state.phase >= 1 && (
        <section className="border border-sprawl-teal/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
          <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white mb-2">
            Step 2: Classify the Scenarios
          </h2>
          <p className="font-ui text-sm text-gray-600 dark:text-gray-300 mb-2">
            For each scenario below, identify which of the Four Problems is <strong>most directly</strong> at
            issue. After choosing, reveal the analysis to see if your diagnosis was correct and why.
          </p>
          <p className="font-ui text-xs text-sprawl-teal mb-4">
            Score: {correctCount} / {SCENARIOS.length} correct
          </p>

          <div className="space-y-4">
            {SCENARIOS.map((scenario, idx) => {
              const answer = state.scenarioAnswers?.[scenario.id];
              const revealed = state.scenarioRevealed?.[scenario.id];
              const isCorrect = answer === scenario.correctProblem;

              return (
                <div
                  key={scenario.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <p className="font-ui text-xs text-sprawl-yellow/60 uppercase mb-1">
                    Scenario {idx + 1}
                  </p>
                  <p className="font-body text-sm text-gray-800 dark:text-gray-200 mb-3">
                    {scenario.text}
                  </p>

                  {/* Answer buttons */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {FOUR_PROBLEMS.map((p) => {
                      const isSelected = answer === p.id;
                      let btnClass =
                        "border rounded px-3 py-1.5 font-ui text-xs uppercase transition-all ";

                      if (revealed && isSelected && isCorrect) {
                        btnClass += "border-green-500 bg-green-500/20 text-green-300";
                      } else if (revealed && isSelected && !isCorrect) {
                        btnClass += "border-sprawl-bright-red bg-sprawl-bright-red/20 text-sprawl-bright-red";
                      } else if (revealed && p.id === scenario.correctProblem) {
                        btnClass += "border-green-500/60 bg-green-500/10 text-green-400";
                      } else if (isSelected) {
                        btnClass += "border-sprawl-yellow bg-sprawl-yellow/10 text-sprawl-yellow";
                      } else {
                        btnClass +=
                          "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-sprawl-yellow/50";
                      }

                      return (
                        <button
                          key={p.id}
                          onClick={() => handleAnswer(scenario.id, p.id)}
                          disabled={revealed}
                          className={btnClass}
                        >
                          {p.icon} {p.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Reveal button */}
                  {answer && !revealed && (
                    <button
                      onClick={() => revealScenario(scenario.id)}
                      className="font-ui text-xs text-sprawl-teal underline hover:text-sprawl-teal/80"
                    >
                      Check my answer
                    </button>
                  )}

                  {/* Revealed analysis */}
                  {revealed && (
                    <div
                      className={`mt-2 rounded p-3 text-sm ${
                        isCorrect
                          ? "bg-green-500/10 border border-green-500/30"
                          : "bg-sprawl-bright-red/10 border border-sprawl-bright-red/30"
                      }`}
                    >
                      <p className="font-headline text-xs uppercase mb-1">
                        {isCorrect ? "Correct" : "Not quite"}
                      </p>
                      <p className="font-body text-gray-700 dark:text-gray-300">
                        {scenario.explanation}
                      </p>
                      <p className="font-ui text-xs text-gray-500 mt-1">
                        Legal hook: {scenario.legalHook}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {canAdvanceToSynthesize && state.phase === 1 && (
            <button
              onClick={() => patch({ phase: 2 })}
              className="mt-4 px-5 py-2 bg-sprawl-yellow text-sprawl-deep-blue font-headline uppercase text-xs rounded hover:bg-sprawl-yellow/80"
            >
              Proceed to synthesis
            </button>
          )}
        </section>
      )}

      {/* ============================================================ */}
      {/* PHASE 2: Synthesis + Export                                   */}
      {/* ============================================================ */}

      {state.phase >= 2 && (
        <section className="border border-sprawl-yellow/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
          <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white mb-2">
            Step 3: Counsel Synthesis
          </h2>
          <p className="font-ui text-sm text-gray-600 dark:text-gray-300 mb-4">
            Now that you can classify the Four Problems, draft a brief synthesis. Your note should
            address ConstructEdge's situation and identify which problems demand attention first.
          </p>

          <div className="border border-gray-200 dark:border-gray-700 rounded p-3 mb-4">
            <p className="font-ui text-xs uppercase tracking-wider text-gray-500 mb-2">
              Counsel prompts
            </p>
            <ul className="list-disc list-inside font-body text-sm text-gray-700 dark:text-gray-300 space-y-1">
              {SYNTHESIS_PROMPTS.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          </div>

          <div className="grid md:grid-cols-4 gap-3 mb-4">
            {FOUR_PROBLEMS.map((p) => (
              <div
                key={p.id}
                className="border border-sprawl-teal/30 rounded p-3 text-center"
              >
                <p className="text-lg mb-1">{p.icon}</p>
                <p className="font-ui text-xs uppercase text-gray-500">{p.label}</p>
                <p className="font-headline text-xl text-sprawl-teal">
                  {SCENARIOS.filter(
                    (s) => s.correctProblem === p.id && state.scenarioAnswers?.[s.id] === p.id
                  ).length}
                  /{SCENARIOS.filter((s) => s.correctProblem === p.id).length}
                </p>
              </div>
            ))}
          </div>

          <textarea
            value={state.synthesisNote || ""}
            onChange={(e) => patch({ synthesisNote: e.target.value })}
            placeholder="Draft your Four Problems synthesis: which problem is most acute for ConstructEdge right now, and what legal tools should counsel prioritize as the venture takes shape?"
            className="w-full min-h-36 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-sprawl-deep-blue/70 p-3 font-body text-sm text-gray-800 dark:text-gray-200"
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              disabled={!allAnswered}
              onClick={() => {
                markCompleted();
                syncModuleCompletion({ moduleId: "ch01-why-law", chapterNum: 1, chapterTitle: "Why Law", scores: { scenarioScore: state.scenarioAnswers ? Object.keys(state.scenarioAnswers).length : 0 }, counselNotes: state.synthesisNote });
                updateMatterFile(
                  "ch01-why-law",
                  summarizeModuleHeadline("ch01-why-law", {
                    correctCount,
                    totalCount: SCENARIOS.length,
                    synthesisNote: state.synthesisNote,
                  }),
                  {
                    controlPosture:
                      "Four Problems framework established; no entity form yet selected",
                  }
                );
                downloadTextFile(
                  "constructedge-four-problems-diagnostic.txt",
                  exportText
                );
              }}
              className="px-5 py-2 bg-sprawl-yellow text-sprawl-deep-blue font-headline uppercase text-xs rounded hover:bg-sprawl-yellow/80 disabled:opacity-40"
            >
              Complete Module + Export Diagnostic
            </button>
          </div>
        </section>
      )}

      <LifecycleHandoff moduleId="ch01-why-law" bridge={flow.bridge} />
    </div>
  );
}
