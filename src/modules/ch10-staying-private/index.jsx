import { useMemo, useCallback } from "react";
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

/* ------------------------------------------------------------------ */
/*  DATA: Term Sheets                                                  */
/* ------------------------------------------------------------------ */

const TERM_SHEETS = {
  alpha: {
    id: "alpha",
    label: "Offer Alpha: The Clean Term",
    investment: 5_000_000,
    valuation: 15_000_000,
    preferenceMultiple: 1,
    participating: false,
    founderStake: 66,
    investorStake: 34,
    summary: "1x Non-Participating Preferred",
    color: "sprawl-yellow",
  },
  beta: {
    id: "beta",
    label: "Offer Beta: The Vulture Claw",
    investment: 5_000_000,
    valuation: 25_000_000,
    preferenceMultiple: 2,
    participating: true,
    founderStake: 80,
    investorStake: 20,
    summary: "2x Participating Preferred",
    color: "sprawl-bright-red",
  },
};

const EXIT_SCENARIOS = [
  { label: "Low Exit (7M)", value: 7 },
  { label: "Mid Exit (15M)", value: 15 },
  { label: "High Exit (50M)", value: 50 },
];

/* ------------------------------------------------------------------ */
/*  DATA: Synthesis Blanks                                             */
/* ------------------------------------------------------------------ */

const SYNTHESIS_BLANKS = [
  {
    id: "v1",
    prompt: "a high ___",
    options: [
      { value: "", label: "..." },
      { value: "valuation", label: "Valuation" },
      { value: "preference", label: "Preference" },
    ],
    correct: "valuation",
  },
  {
    id: "v2",
    prompt: "accepts ___ terms",
    options: [
      { value: "", label: "..." },
      { value: "participation", label: "Participating Preferred" },
      { value: "common", label: "Common Stock" },
    ],
    correct: "participation",
  },
  {
    id: "v3",
    prompt: "shifts the ___",
    options: [
      { value: "", label: "..." },
      { value: "governance", label: "Governance" },
      { value: "risk", label: "Downside Risk" },
    ],
    correct: "risk",
  },
  {
    id: "v4",
    prompt: "leaving Zeeva with ___",
    options: [
      { value: "", label: "..." },
      { value: "zero", label: "Zero proceeds" },
      { value: "millions", label: "Unlimited millions" },
    ],
    correct: "zero",
  },
];

/* ------------------------------------------------------------------ */
/*  Waterfall calculator                                               */
/* ------------------------------------------------------------------ */

function computeWaterfall(termId, exitM) {
  const term = TERM_SHEETS[termId];
  const investmentM = term.investment / 1_000_000;
  let investorPayout = 0;
  let founderPayout = 0;

  if (termId === "alpha") {
    // 1x Non-participating: greater of 1x or pro-rata (34%)
    const proRata = exitM * (term.investorStake / 100);
    investorPayout = Math.max(investmentM, proRata);
    if (investorPayout > exitM) investorPayout = exitM;
    founderPayout = Math.max(0, exitM - investorPayout);
  } else {
    // 2x Participating: 2x preference + pro-rata (20%) of remainder
    const preference = investmentM * term.preferenceMultiple;
    investorPayout = Math.min(exitM, preference);
    const remainder = Math.max(0, exitM - investorPayout);
    const participation = remainder * (term.investorStake / 100);
    investorPayout += participation;
    founderPayout = Math.max(0, exitM - investorPayout);
  }

  return {
    investorPayout: Math.round(investorPayout * 10) / 10,
    founderPayout: Math.round(founderPayout * 10) / 10,
    totalExit: exitM,
  };
}

/* ------------------------------------------------------------------ */
/*  Export builder                                                     */
/* ------------------------------------------------------------------ */

function buildExportText({ selectedTerm, exitValue, synthesisAnswers, synthesisSubmitted, synthesisCorrect, counselNote }) {
  const wf = selectedTerm ? computeWaterfall(selectedTerm, exitValue || 15) : null;
  const lines = [
    "PREFERENCE STACK ANALYSIS -- COUNSEL SHEET",
    "",
    "Client: ConstructEdge (Zeeva + Sammy)",
    "Module: Chapter 10 -- Staying Private",
    "",
    "=== Term Sheet Selection ===",
    `Selected: ${selectedTerm ? TERM_SHEETS[selectedTerm].label : "None"}`,
    `Exit scenario: ${exitValue || 15}M`,
    wf ? `Investor payout: ${wf.investorPayout}M | Founder payout: ${wf.founderPayout}M` : "",
    "",
    "=== Synthesis ===",
    `Submitted: ${synthesisSubmitted ? "Yes" : "No"}`,
    `Correct: ${synthesisCorrect ? "Yes" : "No"}`,
    ...SYNTHESIS_BLANKS.map((b) => `  ${b.prompt} ${synthesisAnswers?.[b.id] || "unanswered"} (correct: ${b.correct})`),
    "",
    "=== Counsel Note ===",
    counselNote || "No counsel note drafted.",
    "",
    "=== Key Takeaways ===",
    "- High valuation can be a trap when combined with aggressive preference stacks",
    "- Participating preferred = double dip: preference + pro-rata share",
    "- Non-participating preferred: investor chooses greater of preference or conversion",
    "- DGCL ss 151 authorizes boards to create classes of stock with varying rights",
  ];
  return lines.join("\n");
}

/* ------------------------------------------------------------------ */
/*  Component State                                                    */
/* ------------------------------------------------------------------ */

const INITIAL_STATE = {
  phase: 0, // 0 = term select, 1 = waterfall, 2 = synthesis, 3 = counsel
  selectedTerm: null,
  exitValue: 15,
  synthesisAnswers: {},
  synthesisSubmitted: false,
  synthesisCorrect: false,
  counselNote: "",
  completed: false,
};

/* ------------------------------------------------------------------ */
/*  CSS Bar Chart Component                                            */
/* ------------------------------------------------------------------ */

function WaterfallBar({ label, investor, founder, maxVal }) {
  const invPct = maxVal > 0 ? (investor / maxVal) * 100 : 0;
  const fdrPct = maxVal > 0 ? (founder / maxVal) * 100 : 0;
  return (
    <div className="space-y-1">
      <p className="font-ui text-xs text-gray-400 uppercase">{label}</p>
      <div className="flex h-8 rounded overflow-hidden bg-gray-800 border border-gray-700">
        <div
          className="bg-sprawl-bright-red flex items-center justify-center text-[10px] font-ui text-white transition-all duration-500"
          style={{ width: `${invPct}%`, minWidth: invPct > 0 ? "2rem" : 0 }}
        >
          {investor > 0 ? `${investor}M` : ""}
        </div>
        <div
          className="bg-sprawl-teal flex items-center justify-center text-[10px] font-ui text-sprawl-deep-blue transition-all duration-500"
          style={{ width: `${fdrPct}%`, minWidth: fdrPct > 0 ? "2rem" : 0 }}
        >
          {founder > 0 ? `${founder}M` : ""}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function Ch10StayingPrivate() {
  const { openTome } = useTome();
  const { state, patch, markCompleted } = useModuleProgress("ch10-staying-private", INITIAL_STATE);
  const flow = MODULE_FLOW["ch10-staying-private"];

  const selectedTerm = state.selectedTerm;
  const exitValue = state.exitValue || 15;

  const waterfalls = useMemo(() => {
    if (!selectedTerm) return [];
    return EXIT_SCENARIOS.map((s) => ({
      ...s,
      ...computeWaterfall(selectedTerm, s.value),
    }));
  }, [selectedTerm]);

  const currentWaterfall = useMemo(() => {
    if (!selectedTerm) return null;
    return computeWaterfall(selectedTerm, exitValue);
  }, [selectedTerm, exitValue]);

  const maxExit = Math.max(...EXIT_SCENARIOS.map((s) => s.value));

  const handleTermSelect = useCallback(
    (termId) => {
      patch({ selectedTerm: termId, phase: Math.max(state.phase, 1) });
    },
    [patch, state.phase]
  );

  const handleSynthesisChange = useCallback(
    (id, value) => {
      patch({ synthesisAnswers: { ...(state.synthesisAnswers || {}), [id]: value } });
    },
    [patch, state.synthesisAnswers]
  );

  const submitSynthesis = useCallback(() => {
    const allCorrect = SYNTHESIS_BLANKS.every(
      (b) => (state.synthesisAnswers || {})[b.id] === b.correct
    );
    patch({ synthesisSubmitted: true, synthesisCorrect: allCorrect });
    if (allCorrect) {
      patch({ phase: 3 });
    }
  }, [patch, state.synthesisAnswers]);

  const allSynthesisFilled = SYNTHESIS_BLANKS.every((b) => (state.synthesisAnswers || {})[b.id]);

  const exportText = useMemo(
    () =>
      buildExportText({
        selectedTerm,
        exitValue,
        synthesisAnswers: state.synthesisAnswers || {},
        synthesisSubmitted: state.synthesisSubmitted,
        synthesisCorrect: state.synthesisCorrect,
        counselNote: state.counselNote,
      }),
    [selectedTerm, exitValue, state.synthesisAnswers, state.synthesisSubmitted, state.synthesisCorrect, state.counselNote]
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-6">
      <ModuleBreadcrumb chapterNum="10" title="Staying Private" />
      <p className="font-ui text-xs text-sprawl-yellow/60 uppercase tracking-widest">
        Chapter 10 · Staying Private
      </p>
      <h1 className="font-headline text-4xl uppercase tracking-tight text-gray-900 dark:text-white">
        The Preference Stack
      </h1>
      <p className="font-body text-gray-700 dark:text-gray-300">
        ConstructEdge needs 5,000,000 credits to scale the Sky-Tower. Two VC firms are circling
        with radically different term sheets. The headline valuation looks attractive on one, but
        the preference stack buried inside could leave Zeeva with nothing in a mediocre exit.
        Analyze both offers, visualize the exit waterfall, and learn why valuation alone is a trap.
      </p>
      <p className="font-ui text-xs text-gray-500">
        Why this chapter matters now: after selecting an entity form and establishing board process,
        the next risk frontier is the capital stack itself — preferred stock rights determine who
        actually gets paid when the company exits.
      </p>

      <div className="flex flex-wrap gap-2 items-center">
        <CitationChip citation="DGCL § 151" />
        <button
          onClick={() => openTome({ query: "DGCL § 151" })}
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
        moduleId="ch10-staying-private"
        factsOverride={{
          entityForm: "Delaware C-Corp (post entity-selection)",
          controlPosture: "Founder-controlled; board seats at stake in Series A",
          financingPosture: "Pre-revenue, seeking $5M Series A",
        }}
      />

      <MatterFileCarryover
        title="Matter File Carryover (Fiduciary Duties -> Staying Private)"
        references={["ch08-entity-selection", "ch09-fiduciary-duties"]}
      />

      {/* ============================================================ */}
      {/* PHASE 0-1: Term Sheet Selection                               */}
      {/* ============================================================ */}

      <section className="border border-sprawl-yellow/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded bg-sprawl-bright-red flex items-center justify-center text-white font-headline text-xs">
            01
          </div>
          <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white">
            Negotiation: Select Term Sheet
          </h2>
        </div>

        <p className="font-body text-sm text-gray-600 dark:text-gray-300 mb-4">
          Review the two competing offers. Your choice will define how the Problem of Risk is
          distributed during an exit event. Pay close attention to the preference structure, not
          just the headline valuation.
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {Object.values(TERM_SHEETS).map((term) => {
            const isSelected = selectedTerm === term.id;
            return (
              <button
                key={term.id}
                onClick={() => handleTermSelect(term.id)}
                className={`text-left p-5 rounded-lg border transition-all ${
                  isSelected
                    ? `border-${term.color}/60 bg-${term.color}/5 shadow-[0_0_15px_rgba(255,214,92,0.15)]`
                    : "border-gray-200 dark:border-gray-700 hover:border-sprawl-yellow/40"
                }`}
              >
                <h5 className={`font-headline text-sm uppercase mb-3 ${isSelected ? `text-${term.color}` : "text-gray-300"}`}>
                  {term.label}
                </h5>
                <ul className="font-ui text-xs space-y-2 text-gray-400">
                  <li className="flex justify-between">
                    <span>Investment:</span>
                    <span className="text-white">{(term.investment / 1_000_000).toFixed(0)}M CR</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Pre-Money Valuation:</span>
                    <span className="text-white">{(term.valuation / 1_000_000).toFixed(0)}M CR</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Preference:</span>
                    <span className="text-white">{term.summary}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Founders' Stake:</span>
                    <span className="text-sprawl-teal">{term.founderStake}%</span>
                  </li>
                </ul>
                {isSelected && (
                  <div className="mt-3 text-center">
                    <span className="font-ui text-[10px] uppercase tracking-widest text-sprawl-yellow bg-sprawl-yellow/10 px-2 py-0.5 rounded">
                      Selected
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Tome sidebar */}
        <div className="border border-sprawl-yellow/30 rounded-lg p-4 bg-sprawl-deep-blue/80">
          <p className="font-headline text-sm uppercase text-sprawl-yellow mb-3">Capital HUD</p>
          <div className="space-y-4">
            <div>
              <p className="font-ui text-[10px] uppercase tracking-widest text-sprawl-light-blue mb-1">
                Liquidation Preference
              </p>
              <p className="font-body text-xs text-gray-400 leading-relaxed">
                The right of preferred shareholders to be paid a fixed amount (usually 1x original
                investment) before any payment is made to common shareholders.
              </p>
            </div>
            <div>
              <p className="font-ui text-[10px] uppercase tracking-widest text-sprawl-yellow mb-1">
                Participation Rights ("Double Dipping")
              </p>
              <p className="font-body text-xs text-gray-400 leading-relaxed">
                The right to receive the liquidation preference AND then share pro-rata in the
                remaining proceeds with common stock. Dramatically increases investor take at the
                expense of founders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* PHASE 1: Exit Waterfall Visualization                        */}
      {/* ============================================================ */}

      {state.phase >= 1 && selectedTerm && (
        <section className="border border-sprawl-yellow/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded bg-sprawl-yellow flex items-center justify-center text-sprawl-deep-blue font-headline text-xs">
              02
            </div>
            <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white">
              Exit Proceeds Waterfall
            </h2>
          </div>

          <p className="font-body text-sm text-gray-600 dark:text-gray-300 mb-4">
            See how {TERM_SHEETS[selectedTerm].label} plays out at different exit values. The red
            bars show investor proceeds; teal bars show founder (common stock) proceeds.
          </p>

          <div className="grid md:grid-cols-3 gap-4 mb-4">
            {EXIT_SCENARIOS.map((s) => (
              <button
                key={s.value}
                onClick={() => patch({ exitValue: s.value })}
                className={`px-3 py-2 rounded border text-xs font-ui uppercase transition-all ${
                  exitValue === s.value
                    ? "border-sprawl-yellow bg-sprawl-yellow/10 text-sprawl-yellow"
                    : "border-gray-600 text-gray-400 hover:border-gray-400"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* CSS bar charts for each exit scenario */}
          <div className="space-y-3 mb-4">
            {waterfalls.map((wf) => (
              <WaterfallBar
                key={wf.value}
                label={wf.label}
                investor={wf.investorPayout}
                founder={wf.founderPayout}
                maxVal={maxExit}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-sprawl-bright-red" />
              <span className="font-ui text-xs text-gray-400">Investor Payout</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-sprawl-teal" />
              <span className="font-ui text-xs text-gray-400">Founder Payout (Common)</span>
            </div>
          </div>

          {/* Current scenario detail */}
          {currentWaterfall && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-sprawl-bright-red/30 rounded p-4 bg-black/30 text-center">
                <p className="font-ui text-[10px] text-gray-500 uppercase mb-1">Investor Takes</p>
                <p className="font-headline text-2xl text-sprawl-bright-red">
                  {currentWaterfall.investorPayout}M CR
                </p>
              </div>
              <div className="border border-sprawl-teal/30 rounded p-4 bg-black/30 text-center">
                <p className="font-ui text-[10px] text-gray-500 uppercase mb-1">Zeeva's Payout</p>
                <p className="font-headline text-2xl text-sprawl-teal">
                  {currentWaterfall.founderPayout}M CR
                </p>
              </div>
            </div>
          )}

          {state.phase === 1 && (
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
      {/* PHASE 2: Synthesis                                            */}
      {/* ============================================================ */}

      {state.phase >= 2 && (
        <section className="border border-sprawl-teal/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded bg-sprawl-teal flex items-center justify-center text-sprawl-deep-blue font-headline text-xs">
              03
            </div>
            <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white">
              Series A Data-Dump
            </h2>
          </div>

          <div className="bg-gray-50 dark:bg-sprawl-deep-blue/60 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-4">
            <p className="font-body text-lg md:text-xl leading-loose text-gray-700 dark:text-gray-300 italic">
              "In the 'Staying Private' phase, {" "}
              <select
                value={(state.synthesisAnswers || {}).v1 || ""}
                onChange={(e) => handleSynthesisChange("v1", e.target.value)}
                disabled={state.synthesisSubmitted && state.synthesisCorrect}
                className="bg-transparent border-b-2 border-sprawl-yellow outline-none px-1 text-gray-900 dark:text-white not-italic text-sm font-headline uppercase"
              >
                {SYNTHESIS_BLANKS[0].options.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>{" "}
              can be a trap for founders. If a startup accepts{" "}
              <select
                value={(state.synthesisAnswers || {}).v2 || ""}
                onChange={(e) => handleSynthesisChange("v2", e.target.value)}
                disabled={state.synthesisSubmitted && state.synthesisCorrect}
                className="bg-transparent border-b-2 border-sprawl-yellow outline-none px-1 text-gray-900 dark:text-white not-italic text-sm font-headline uppercase"
              >
                {SYNTHESIS_BLANKS[1].options.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>{" "}
              terms, the investors effectively 'double-dip' during an exit. This shifts the{" "}
              <select
                value={(state.synthesisAnswers || {}).v3 || ""}
                onChange={(e) => handleSynthesisChange("v3", e.target.value)}
                disabled={state.synthesisSubmitted && state.synthesisCorrect}
                className="bg-transparent border-b-2 border-sprawl-yellow outline-none px-1 text-gray-900 dark:text-white not-italic text-sm font-headline uppercase"
              >
                {SYNTHESIS_BLANKS[2].options.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>{" "}
              onto the common shareholders, potentially leaving Zeeva with{" "}
              <select
                value={(state.synthesisAnswers || {}).v4 || ""}
                onChange={(e) => handleSynthesisChange("v4", e.target.value)}
                disabled={state.synthesisSubmitted && state.synthesisCorrect}
                className="bg-transparent border-b-2 border-sprawl-yellow outline-none px-1 text-gray-900 dark:text-white not-italic text-sm font-headline uppercase"
              >
                {SYNTHESIS_BLANKS[3].options.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>{" "}
              in a low-exit scenario."
            </p>
          </div>

          {state.synthesisSubmitted && (
            <div
              className={`rounded-lg p-4 mb-4 border ${
                state.synthesisCorrect
                  ? "border-green-500/30 bg-green-500/10"
                  : "border-sprawl-bright-red/30 bg-sprawl-bright-red/10"
              }`}
            >
              <p className="font-headline text-sm uppercase mb-1">
                {state.synthesisCorrect ? "Ledger Updated" : "Analytic Glitch"}
              </p>
              <p className="font-body text-sm text-gray-700 dark:text-gray-300">
                {state.synthesisCorrect
                  ? "Correct. Chapter 10 highlights that 'Valuation' is often a vanity metric. If the Preference Stack (Liquidation Preference and Participation) is too high, the founders bear all the 'Risk' of a mediocre exit. Zeeva has learned that clean terms are often better than a high valuation."
                  : "Re-examine how Participating Preferred stock interacts with the common stock payout. A high valuation paired with aggressive preferences can leave founders with nothing."}
              </p>
            </div>
          )}

          {!state.synthesisSubmitted && (
            <button
              disabled={!allSynthesisFilled}
              onClick={submitSynthesis}
              className="px-5 py-2 bg-sprawl-bright-red text-white font-headline uppercase text-xs rounded hover:bg-sprawl-bright-red/80 disabled:opacity-40"
            >
              Finalize Series A Ledger
            </button>
          )}

          {state.synthesisSubmitted && !state.synthesisCorrect && (
            <button
              onClick={() => patch({ synthesisSubmitted: false })}
              className="px-5 py-2 bg-sprawl-yellow text-sprawl-deep-blue font-headline uppercase text-xs rounded hover:bg-sprawl-yellow/80"
            >
              Revise and resubmit
            </button>
          )}
        </section>
      )}

      {/* ============================================================ */}
      {/* PHASE 3: Counsel Note + Export                               */}
      {/* ============================================================ */}

      {state.phase >= 3 && (
        <section className="border border-sprawl-yellow/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded bg-sprawl-light-blue flex items-center justify-center text-sprawl-deep-blue font-headline text-xs">
              04
            </div>
            <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white">
              Counsel Note
            </h2>
          </div>

          <p className="font-body text-sm text-gray-600 dark:text-gray-300 mb-4">
            Draft a note to ConstructEdge's file analyzing the term sheet options, the preference
            stack risks, and your recommendation for the founders.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
              <p className="font-ui text-xs uppercase tracking-wider text-gray-500 mb-2">
                Consider addressing
              </p>
              <ul className="list-disc list-inside font-body text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>Why is a high pre-money valuation potentially misleading?</li>
                <li>How does participating preferred differ from non-participating?</li>
                <li>At what exit value does each offer become better for founders?</li>
                <li>What board seats or control provisions accompany the capital?</li>
              </ul>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
              <p className="font-ui text-xs uppercase tracking-wider text-gray-500 mb-2">
                Key legal authority
              </p>
              <ul className="list-disc list-inside font-body text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>DGCL ss 151: Board authority to create stock classes and series</li>
                <li>Liquidation preference mechanics and "waterfall" priority</li>
                <li>The valuation trap: headline vs. effective economics</li>
                <li>Protective provisions limiting founder autonomy</li>
              </ul>
            </div>
          </div>

          <textarea
            value={state.counselNote || ""}
            onChange={(e) => patch({ counselNote: e.target.value })}
            placeholder="Draft your counsel note: analyze the preference stack, compare the two offers, and recommend a negotiation strategy for Zeeva..."
            className="w-full min-h-36 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-sprawl-deep-blue/70 p-3 font-body text-sm text-gray-800 dark:text-gray-200"
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              disabled={!state.synthesisCorrect}
              onClick={() => {
                markCompleted();
                updateMatterFile(
                  "ch10-staying-private",
                  summarizeModuleHeadline("ch10-staying-private", {
                    selectedTerm,
                    synthesisCorrect: state.synthesisCorrect,
                    counselNote: state.counselNote,
                  }),
                  {
                    financingPosture: `Series A: ${selectedTerm ? TERM_SHEETS[selectedTerm].summary : "pending"}`,
                    controlPosture: "Investor board seats negotiated; founder control diluted",
                  }
                );
                downloadTextFile(
                  "constructedge-preference-stack-counsel-sheet.txt",
                  exportText
                );
              }}
              className="px-5 py-2 bg-sprawl-yellow text-sprawl-deep-blue font-headline uppercase text-xs rounded hover:bg-sprawl-yellow/80 disabled:opacity-40"
            >
              Complete Module + Export Counsel Sheet
            </button>
          </div>
        </section>
      )}

      <LifecycleHandoff moduleId="ch10-staying-private" bridge={flow.bridge} />
    </div>
  );
}
