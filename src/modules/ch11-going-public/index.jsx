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
/*  DATA: Prospectus Disclosure Cards                                  */
/* ------------------------------------------------------------------ */

const DISCLOSURE_CARDS = [
  {
    id: "use-of-proceeds",
    section: "Use of Proceeds",
    text: "Proceeds will be used to scale the Sector 7 Sky-Tower and upgrade foundational haptic interfaces.",
    type: "safe",
    explanation:
      "This disclosure is straightforward and accurate. It describes the intended use of IPO proceeds without misstatement or material omission.",
  },
  {
    id: "risk-factors",
    section: "Risk Factors",
    text: "Management believes current structures are stable. [Omission: Recent telemetry shows a 12% stress fracture in the primary load-bearing shard.]",
    type: "omission",
    explanation:
      "This is a material omission under Securities Act ss 11. A reasonable investor would consider a 12% structural stress fracture highly important. Omitting known engineering risks from the risk factors section creates strict liability for the issuer.",
  },
  {
    id: "financial-data",
    section: "Financial Data",
    text: "Projected revenues for 2078: 50,000,000 CR. [Fact: Zeeva's internal AI actually predicts a 40% chance of total project insolvency.]",
    type: "misstatement",
    explanation:
      "This is a material misstatement. Publishing revenue projections while concealing a 40% insolvency probability is an untrue statement of material fact. Under ss 11, the issuer faces strict liability; officers and directors face liability unless they can prove due diligence.",
  },
  {
    id: "management",
    section: "Management",
    text: "The firm is led by Zeeva (Structural Architect) and Sammy (Strategic Fixer).",
    type: "safe",
    explanation:
      "This is a factual management disclosure. It accurately identifies the leadership team without misstatement or omission of material facts.",
  },
];

const FLAGGABLE_COUNT = DISCLOSURE_CARDS.filter((c) => c.type !== "safe").length;

/* ------------------------------------------------------------------ */
/*  DATA: Synthesis Blanks                                             */
/* ------------------------------------------------------------------ */

const SYNTHESIS_BLANKS = [
  {
    id: "v1",
    options: [
      { value: "", label: "..." },
      { value: "marketing", label: "Marketing Hype" },
      { value: "materiality", label: "Material Misstatements" },
    ],
    correct: "materiality",
  },
  {
    id: "v2",
    options: [
      { value: "", label: "..." },
      { value: "section11", label: "Section 11 Liability" },
      { value: "bonus", label: "A Founder Bonus" },
    ],
    correct: "section11",
  },
  {
    id: "v3",
    options: [
      { value: "", label: "..." },
      { value: "privacy", label: "Staying Private" },
      { value: "partitioning", label: "Asset Partitioning (Scaling)" },
    ],
    correct: "partitioning",
  },
  {
    id: "v4",
    options: [
      { value: "", label: "..." },
      { value: "fair", label: "Fair Value" },
      { value: "inflated", label: "Inflated Value" },
    ],
    correct: "fair",
  },
];

/* ------------------------------------------------------------------ */
/*  Export builder                                                     */
/* ------------------------------------------------------------------ */

function buildExportText({ flaggedCards, verifiedCards, synthesisAnswers, synthesisSubmitted, synthesisCorrect, counselNote }) {
  const lines = [
    "DISCLOSURE SCRUBBER ANALYSIS -- COUNSEL SHEET",
    "",
    "Client: ConstructEdge (Zeeva + Sammy)",
    "Module: Chapter 11 -- Going Public",
    "",
    "=== Disclosure Review ===",
    `Cards flagged: ${Object.keys(flaggedCards || {}).length}`,
    `Cards verified: ${Object.keys(verifiedCards || {}).length}`,
    ...DISCLOSURE_CARDS.map((c) => {
      const status = flaggedCards?.[c.id] ? "FLAGGED" : verifiedCards?.[c.id] ? "VERIFIED" : "UNREVIEWED";
      return `  [${status}] ${c.section}: ${c.type === "safe" ? "Clean" : c.type.toUpperCase()}`;
    }),
    "",
    "=== Synthesis ===",
    `Submitted: ${synthesisSubmitted ? "Yes" : "No"}`,
    `Correct: ${synthesisCorrect ? "Yes" : "No"}`,
    ...SYNTHESIS_BLANKS.map((b) => `  ${b.id}: ${synthesisAnswers?.[b.id] || "unanswered"} (correct: ${b.correct})`),
    "",
    "=== Counsel Note ===",
    counselNote || "No counsel note drafted.",
    "",
    "=== Key Takeaways ===",
    "- Securities Act ss 11 imposes strict liability on issuers for material misstatements/omissions",
    "- Materiality: substantial likelihood a reasonable investor would consider it important",
    "- Officers/directors have due diligence defense; issuer does not",
    "- Full disclosure enables fair valuation and legitimate asset partitioning at scale",
  ];
  return lines.join("\n");
}

/* ------------------------------------------------------------------ */
/*  Component State                                                    */
/* ------------------------------------------------------------------ */

const INITIAL_STATE = {
  phase: 0, // 0 = scrubber, 1 = synthesis, 2 = counsel
  flaggedCards: {},
  verifiedCards: {},
  transparencyScore: 0,
  synthesisAnswers: {},
  synthesisSubmitted: false,
  synthesisCorrect: false,
  counselNote: "",
  completed: false,
};

/* ------------------------------------------------------------------ */
/*  Confidence Tracker (CSS-based)                                     */
/* ------------------------------------------------------------------ */

function ConfidenceTracker({ score, liabilityStatus }) {
  const barWidth = Math.min(100, Math.max(0, score));
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="border border-gray-700 rounded p-3 bg-black/30">
        <p className="font-ui text-[10px] uppercase tracking-widest text-gray-500 mb-2">
          Transparency Score
        </p>
        <div className="h-3 rounded bg-gray-800 overflow-hidden mb-1">
          <div
            className="h-full bg-sprawl-teal transition-all duration-500 rounded"
            style={{ width: `${barWidth}%` }}
          />
        </div>
        <p className="font-ui text-xs text-sprawl-teal text-right">{score}%</p>
      </div>
      <div className="border border-gray-700 rounded p-3 bg-black/30">
        <p className="font-ui text-[10px] uppercase tracking-widest text-gray-500 mb-2">
          Liability Risk
        </p>
        <p className={`font-headline text-lg uppercase ${
          liabilityStatus === "MINIMIZED" ? "text-sprawl-teal" : "text-sprawl-bright-red"
        }`}>
          {liabilityStatus}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function Ch11GoingPublic() {
  const { openTome } = useTome();
  const { state, patch, markCompleted } = useModuleProgress("ch11-going-public", INITIAL_STATE);
  const flow = MODULE_FLOW["ch11-going-public"];

  const flaggedCards = useMemo(() => state.flaggedCards || {}, [state.flaggedCards]);
  const verifiedCards = useMemo(() => state.verifiedCards || {}, [state.verifiedCards]);

  const correctFlags = useMemo(() => {
    return DISCLOSURE_CARDS.filter(
      (c) => c.type !== "safe" && flaggedCards[c.id]
    ).length;
  }, [flaggedCards]);

  const transparencyScore = useMemo(() => {
    return Math.round((correctFlags / FLAGGABLE_COUNT) * 100);
  }, [correctFlags]);

  const liabilityStatus = correctFlags >= FLAGGABLE_COUNT ? "MINIMIZED" : "HIGH";

  const handleCardAction = useCallback(
    (card, action) => {
      if (flaggedCards[card.id] || verifiedCards[card.id]) return; // already reviewed

      if (action === "flag") {
        const next = { ...flaggedCards, [card.id]: true };
        patch({ flaggedCards: next });
        // If all flaggable items found, advance to synthesis
        const newCorrectFlags = DISCLOSURE_CARDS.filter(
          (c) => c.type !== "safe" && next[c.id]
        ).length;
        if (newCorrectFlags >= FLAGGABLE_COUNT) {
          patch({ phase: Math.max(state.phase, 1) });
        }
      } else {
        patch({ verifiedCards: { ...verifiedCards, [card.id]: true } });
      }
    },
    [flaggedCards, verifiedCards, patch, state.phase]
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
      patch({ phase: 2 });
    }
  }, [patch, state.synthesisAnswers]);

  const allSynthesisFilled = SYNTHESIS_BLANKS.every((b) => (state.synthesisAnswers || {})[b.id]);

  const exportText = useMemo(
    () =>
      buildExportText({
        flaggedCards,
        verifiedCards,
        synthesisAnswers: state.synthesisAnswers || {},
        synthesisSubmitted: state.synthesisSubmitted,
        synthesisCorrect: state.synthesisCorrect,
        counselNote: state.counselNote,
      }),
    [flaggedCards, verifiedCards, state.synthesisAnswers, state.synthesisSubmitted, state.synthesisCorrect, state.counselNote]
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-6">
      <ModuleBreadcrumb chapterNum="11" title="Going Public" />
      <p className="font-ui text-xs text-sprawl-yellow/60 uppercase tracking-widest">
        Chapter 11 · Going Public
      </p>
      <h1 className="font-headline text-4xl uppercase tracking-tight text-gray-900 dark:text-white">
        The Disclosure Scrubber
      </h1>
      <p className="font-body text-gray-700 dark:text-gray-300">
        Zeeva is taking ConstructEdge public to fund the Sector 7 expansion. The Securities Act
        requires a full truth-dump in the registration statement. Your job: scrub the draft
        prospectus for material omissions and misstatements before the SEC filing. If Zeeva hides
        the Sky-Tower structural glitch, the IPO becomes a liability trap.
      </p>
      <p className="font-ui text-xs text-gray-500">
        Why this chapter matters now: going public scales the asset partition beyond private investors
        to public markets — but only if disclosure is complete and accurate. Securities Act ss 11
        imposes strict liability on issuers for material defects in registration statements.
      </p>

      <div className="flex flex-wrap gap-2 items-center">
        <CitationChip citation="Securities Act § 11" />
        <button
          onClick={() => openTome({ query: "Securities Act § 11" })}
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
        moduleId="ch11-going-public"
        factsOverride={{
          entityForm: "Delaware C-Corp preparing S-1 filing",
          controlPosture: "Founder + VC board; IPO will add public shareholders",
          financingPosture: "Pre-IPO; transitioning from private to public capital",
          strategicPressure: "Market window pressure to file before sector downturn",
        }}
      />

      <MatterFileCarryover
        title="Matter File Carryover (Staying Private -> Going Public)"
        references={["ch09-fiduciary-duties", "ch10-staying-private"]}
      />

      {/* ============================================================ */}
      {/* PHASE 0: The Disclosure Scrubber                              */}
      {/* ============================================================ */}

      <section className="border border-sprawl-yellow/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded bg-sprawl-bright-red flex items-center justify-center text-white font-headline text-xs">
            01
          </div>
          <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white">
            The Disclosure Scrubber
          </h2>
        </div>

        <p className="font-body text-sm text-gray-600 dark:text-gray-300 mb-4">
          Scrub the draft prospectus for material omissions and misstatements. For each disclosure
          card, decide whether to <strong>flag</strong> it (material problem) or <strong>verify</strong> it
          (accurate disclosure). Correctly flagging all material issues minimizes Section 11 liability.
        </p>

        {/* Tome sidebar */}
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-2 space-y-3">
            {DISCLOSURE_CARDS.map((card) => {
              const isFlagged = flaggedCards[card.id];
              const isVerified = verifiedCards[card.id];
              const isReviewed = isFlagged || isVerified;
              const wrongFlag = isFlagged && card.type === "safe";

              return (
                <div
                  key={card.id}
                  className={`border rounded-lg p-4 transition-all ${
                    isFlagged
                      ? "border-l-4 border-l-sprawl-bright-red border-sprawl-bright-red/30 bg-sprawl-bright-red/5"
                      : isVerified
                      ? "border-l-4 border-l-sprawl-teal border-sprawl-teal/30 bg-sprawl-teal/5"
                      : "border-gray-200 dark:border-gray-700 hover:border-sprawl-yellow/40"
                  }`}
                >
                  <p className={`font-ui text-xs font-bold uppercase mb-1 ${
                    card.type !== "safe" ? "text-sprawl-bright-red" : "text-sprawl-light-blue"
                  }`}>
                    Section: {card.section}
                  </p>
                  <p className="font-body text-sm italic text-gray-300 mb-3">
                    "{card.text}"
                  </p>

                  {!isReviewed && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCardAction(card, "flag")}
                        className="px-3 py-1 border border-sprawl-bright-red/40 text-sprawl-bright-red font-ui text-xs uppercase rounded hover:bg-sprawl-bright-red/10"
                      >
                        Flag Material Issue
                      </button>
                      <button
                        onClick={() => handleCardAction(card, "verify")}
                        className="px-3 py-1 border border-sprawl-teal/40 text-sprawl-teal font-ui text-xs uppercase rounded hover:bg-sprawl-teal/10"
                      >
                        Verify as Accurate
                      </button>
                    </div>
                  )}

                  {isReviewed && (
                    <div className={`mt-2 rounded p-3 ${
                      (isFlagged && card.type !== "safe") || (isVerified && card.type === "safe")
                        ? "border border-green-500/30 bg-green-500/10"
                        : "border border-sprawl-bright-red/30 bg-sprawl-bright-red/10"
                    }`}>
                      <p className="font-headline text-xs uppercase mb-1">
                        {(isFlagged && card.type !== "safe") || (isVerified && card.type === "safe")
                          ? "Correct"
                          : wrongFlag
                          ? "Overflag: This disclosure is accurate"
                          : "Missed: This contains a material defect"}
                      </p>
                      <p className="font-body text-sm text-gray-700 dark:text-gray-300">
                        {card.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Tome sidebar */}
          <div className="border border-sprawl-yellow/30 rounded-lg p-4 bg-sprawl-deep-blue/80">
            <p className="font-headline text-sm uppercase text-sprawl-yellow mb-3">
              Securities HUD
            </p>
            <div className="space-y-4">
              <div>
                <p className="font-ui text-[10px] uppercase tracking-widest text-sprawl-light-blue mb-1">
                  Section 11 Liability
                </p>
                <p className="font-body text-xs text-gray-400 leading-relaxed">
                  Strict liability for issuers if a registration statement contains an untrue
                  statement of <strong className="text-gray-200">material fact</strong> or omits a
                  material fact necessary to make the statements not misleading.
                </p>
              </div>
              <div>
                <p className="font-ui text-[10px] uppercase tracking-widest text-sprawl-yellow mb-1">
                  Materiality Standard
                </p>
                <p className="font-body text-xs text-gray-400 leading-relaxed">
                  Information is material if there is a{" "}
                  <strong className="text-gray-200">substantial likelihood</strong> that a reasonable
                  investor would consider it important in making an investment decision.
                </p>
              </div>
              <div className="border border-white/10 rounded p-3 bg-black/30">
                <p className="font-body text-xs italic text-sprawl-light-blue">
                  "The Securities Act creates a mandatory disclosure regime: you may sell securities
                  to the public, but only if you tell the truth. Section 11 enforces this with
                  near-absolute liability for the issuer."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Confidence tracker */}
        <ConfidenceTracker score={transparencyScore} liabilityStatus={liabilityStatus} />

        {correctFlags >= FLAGGABLE_COUNT && state.phase === 0 && (
          <button
            onClick={() => patch({ phase: 1 })}
            className="mt-4 px-5 py-2 bg-sprawl-yellow text-sprawl-deep-blue font-headline uppercase text-xs rounded hover:bg-sprawl-yellow/80"
          >
            All material issues flagged — proceed to synthesis
          </button>
        )}
      </section>

      {/* ============================================================ */}
      {/* PHASE 1: Synthesis                                            */}
      {/* ============================================================ */}

      {state.phase >= 1 && (
        <section className="border border-sprawl-teal/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded bg-sprawl-teal flex items-center justify-center text-sprawl-deep-blue font-headline text-xs">
              02
            </div>
            <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white">
              SEC Terminal: IPO Finalization
            </h2>
          </div>

          <div className="bg-gray-50 dark:bg-sprawl-deep-blue/60 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-4">
            <p className="font-body text-lg md:text-xl leading-loose text-gray-700 dark:text-gray-300 italic">
              "By scrubbing the prospectus for{" "}
              <select
                value={(state.synthesisAnswers || {}).v1 || ""}
                onChange={(e) => handleSynthesisChange("v1", e.target.value)}
                disabled={state.synthesisSubmitted && state.synthesisCorrect}
                className="bg-transparent border-b-2 border-sprawl-yellow outline-none px-1 text-gray-900 dark:text-white not-italic text-sm font-headline uppercase"
              >
                {SYNTHESIS_BLANKS[0].options.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              , Zeeva ensures the 'Truth in Securities' mandate is met. Failure to disclose the
              stress fracture would have triggered{" "}
              <select
                value={(state.synthesisAnswers || {}).v2 || ""}
                onChange={(e) => handleSynthesisChange("v2", e.target.value)}
                disabled={state.synthesisSubmitted && state.synthesisCorrect}
                className="bg-transparent border-b-2 border-sprawl-yellow outline-none px-1 text-gray-900 dark:text-white not-italic text-sm font-headline uppercase"
              >
                {SYNTHESIS_BLANKS[1].options.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              , destroying the trust necessary for{" "}
              <select
                value={(state.synthesisAnswers || {}).v3 || ""}
                onChange={(e) => handleSynthesisChange("v3", e.target.value)}
                disabled={state.synthesisSubmitted && state.synthesisCorrect}
                className="bg-transparent border-b-2 border-sprawl-yellow outline-none px-1 text-gray-900 dark:text-white not-italic text-sm font-headline uppercase"
              >
                {SYNTHESIS_BLANKS[2].options.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              . The IPO will proceed at a valuation of{" "}
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
              based on full disclosure."
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
                {state.synthesisCorrect ? "IPO Successful" : "SEC Rejection"}
              </p>
              <p className="font-body text-sm text-gray-700 dark:text-gray-300">
                {state.synthesisCorrect
                  ? "Zeeva has crossed the public threshold. By disclosing the load-bearing stress fracture, she avoided Section 11 strict liability. The market now values ConstructEdge based on reality, not a lie. The Sector 7 expansion is funded through legitimate public capital."
                  : "The audit finds inconsistencies in your disclosure theory. Materiality is the key to Section 11 liability. Re-evaluate your final resolution."}
              </p>
            </div>
          )}

          {!state.synthesisSubmitted && (
            <button
              disabled={!allSynthesisFilled}
              onClick={submitSynthesis}
              className="px-5 py-2 bg-sprawl-bright-red text-white font-headline uppercase text-xs rounded hover:bg-sprawl-bright-red/80 disabled:opacity-40"
            >
              Finalize Public Offering
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
      {/* PHASE 2: Counsel Note + Export                               */}
      {/* ============================================================ */}

      {state.phase >= 2 && (
        <section className="border border-sprawl-yellow/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded bg-sprawl-light-blue flex items-center justify-center text-sprawl-deep-blue font-headline text-xs">
              03
            </div>
            <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white">
              Counsel Note
            </h2>
          </div>

          <p className="font-body text-sm text-gray-600 dark:text-gray-300 mb-4">
            Draft a note to ConstructEdge's file analyzing the disclosure obligations, the
            materiality standard, and the consequences of incomplete disclosure under Section 11.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
              <p className="font-ui text-xs uppercase tracking-wider text-gray-500 mb-2">
                Consider addressing
              </p>
              <ul className="list-disc list-inside font-body text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>Why is the stress fracture "material" under the legal standard?</li>
                <li>What is the difference between issuer liability and officer/director liability?</li>
                <li>How does disclosure enable legitimate asset partitioning at scale?</li>
                <li>What internal controls should ConstructEdge implement post-IPO?</li>
              </ul>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
              <p className="font-ui text-xs uppercase tracking-wider text-gray-500 mb-2">
                Key legal authority
              </p>
              <ul className="list-disc list-inside font-body text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>Securities Act ss 11: strict liability for registration statement defects</li>
                <li>TSC Industries v. Northway: materiality = reasonable investor standard</li>
                <li>Due diligence defense (available to directors, not to issuer)</li>
                <li>Section 12(a)(2): liability for prospectus misstatements</li>
              </ul>
            </div>
          </div>

          <textarea
            value={state.counselNote || ""}
            onChange={(e) => patch({ counselNote: e.target.value })}
            placeholder="Draft your counsel note: analyze the disclosure obligations, identify what was material, and recommend disclosure protocols for ConstructEdge's public filing..."
            className="w-full min-h-36 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-sprawl-deep-blue/70 p-3 font-body text-sm text-gray-800 dark:text-gray-200"
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              disabled={!state.synthesisCorrect}
              onClick={() => {
                markCompleted();
                updateMatterFile(
                  "ch11-going-public",
                  summarizeModuleHeadline("ch11-going-public", {
                    flaggedCount: correctFlags,
                    synthesisCorrect: state.synthesisCorrect,
                    counselNote: state.counselNote,
                  }),
                  {
                    financingPosture: "Post-IPO public company; SEC reporting obligations active",
                    controlPosture: "Public shareholders added; Section 11 disclosure regime active",
                  }
                );
                downloadTextFile(
                  "constructedge-disclosure-scrubber-counsel-sheet.txt",
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

      <LifecycleHandoff moduleId="ch11-going-public" bridge={flow.bridge} />
    </div>
  );
}
