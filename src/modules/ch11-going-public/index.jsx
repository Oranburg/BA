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
  MatterFileCarryover,
} from "../../components/course/ContinuityPanels";
import ModuleBreadcrumb from "../../components/course/ModuleBreadcrumb";
import ChapterHero from "../../components/course/ChapterHero";
import chapterImage from "../../assets/chapters/ch11.jpg";

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
      { value: "marketing", label: "Competitive Intelligence" },
      { value: "materiality", label: "Material Misstatements" },
      { value: "formatting", label: "Formatting Errors" },
      { value: "projections", label: "Revenue Projections" },
    ],
    correct: "materiality",
    explanation:
      "Under Securities Act section 11, the registration statement must be free of untrue statements of material fact and material omissions. 'Material misstatements' is the legal term of art — it captures both affirmative lies and misleading omissions.",
  },
  {
    id: "v2",
    options: [
      { value: "", label: "..." },
      { value: "section11", label: "Section 11 Liability" },
      { value: "section12", label: "Section 12(a)(1) Liability" },
      { value: "breach", label: "Breach of Fiduciary Duty" },
      { value: "fraud", label: "Common Law Fraud" },
    ],
    correct: "section11",
    explanation:
      "Section 11 imposes strict liability on the issuer for defective registration statements — no proof of intent or reliance is required. Section 12(a)(1) covers unregistered sales, and common law fraud requires scienter. Section 11 is the primary enforcement mechanism for registration statement accuracy.",
  },
  {
    id: "v3",
    options: [
      { value: "", label: "..." },
      { value: "privacy", label: "Remaining a Private Company" },
      { value: "partitioning", label: "Asset Partitioning at Scale" },
      { value: "compliance", label: "Regulatory Compliance" },
      { value: "valuation", label: "Accurate Valuation" },
    ],
    correct: "partitioning",
    explanation:
      "The IPO extends the asset partition to public capital markets. Disclosure enables this: investors can only price securities accurately when they have complete information. Without truthful disclosure, public markets cannot function, and the company cannot access the scaled asset partitioning that an IPO provides.",
  },
  {
    id: "v4",
    options: [
      { value: "", label: "..." },
      { value: "fair", label: "Fair Value" },
      { value: "inflated", label: "Inflated Value" },
      { value: "discounted", label: "Discounted Value" },
      { value: "book", label: "Book Value" },
    ],
    correct: "fair",
    explanation:
      "Full disclosure enables the market to price the securities at fair value — reflecting both the company's strengths and its known risks (like the stress fracture). An inflated valuation built on concealed risks would collapse when the truth emerges, destroying shareholder value.",
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
  wrongFlagCount: 0,
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
        <p className="font-ui text-sm text-sprawl-teal text-right">{score}%</p>
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

  const wrongFlagCount = state.wrongFlagCount || 0;

  const handleCardAction = useCallback(
    (card, action) => {
      if (flaggedCards[card.id] || verifiedCards[card.id]) return; // already reviewed

      if (action === "flag") {
        const next = { ...flaggedCards, [card.id]: true };
        const updates = { flaggedCards: next };
        // Track wrong flags (flagging a safe card, or verifying a problem card)
        if (card.type === "safe") {
          updates.wrongFlagCount = (state.wrongFlagCount || 0) + 1;
        }
        patch(updates);
        // If all flaggable items found, advance to synthesis
        const newCorrectFlags = DISCLOSURE_CARDS.filter(
          (c) => c.type !== "safe" && next[c.id]
        ).length;
        if (newCorrectFlags >= FLAGGABLE_COUNT) {
          patch({ phase: Math.max(state.phase, 1) });
        }
      } else {
        const updates = { verifiedCards: { ...verifiedCards, [card.id]: true } };
        // Track wrong verifications (verifying a card that has a problem)
        if (card.type !== "safe") {
          updates.wrongFlagCount = (state.wrongFlagCount || 0) + 1;
        }
        patch(updates);
      }
    },
    [flaggedCards, verifiedCards, patch, state.phase, state.wrongFlagCount]
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
      <ChapterHero src={chapterImage} alt="IPO operations floor with market data screens and disclosure review" />
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
      <p className="font-ui text-sm text-gray-500">
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
      {/* DOCTRINE PRIMER: Securities Act ss 11 Framework               */}
      {/* ============================================================ */}

      <section className="border border-sprawl-light-blue/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded bg-sprawl-light-blue flex items-center justify-center text-sprawl-deep-blue font-headline text-xs">
            00
          </div>
          <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white">
            What You Need to Know: Section 11 Liability
          </h2>
        </div>

        <p className="font-body text-sm text-gray-600 dark:text-gray-300 mb-4">
          Before reviewing the prospectus, understand the legal framework that governs what must
          be disclosed and who bears liability when the disclosure fails.
        </p>

        <div className="space-y-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <p className="font-headline text-sm uppercase text-sprawl-yellow mb-2">
              1. Who Is Liable?
            </p>
            <p className="font-body text-sm text-gray-700 dark:text-gray-300">
              Section 11 creates a wide net of liability. The <strong>issuer</strong> (the company itself)
              faces strict liability — no intent or negligence need be shown. <strong>Directors</strong> who
              signed the registration statement are liable unless they can prove a "due diligence" defense
              (that they reasonably investigated and believed the statements were true).{" "}
              <strong>Underwriters</strong> who participated in the offering face the same due diligence
              standard. The issuer has no due diligence defense — if the statement is defective, the
              issuer is liable, period.
            </p>
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <p className="font-headline text-sm uppercase text-sprawl-yellow mb-2">
              2. What Triggers Liability?
            </p>
            <p className="font-body text-sm text-gray-700 dark:text-gray-300">
              Liability is triggered when a registration statement (including the prospectus) contains
              an <strong>untrue statement of a material fact</strong> or <strong>omits a material fact
              necessary to make the statements not misleading</strong>. This covers both lies and
              silence — if you know something important and leave it out, that omission is just as
              actionable as an affirmative misstatement.
            </p>
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <p className="font-headline text-sm uppercase text-sprawl-yellow mb-2">
              3. The Materiality Standard (TSC Industries v. Northway)
            </p>
            <p className="font-body text-sm text-gray-700 dark:text-gray-300">
              Not every error triggers liability — only <strong>material</strong> ones. The Supreme Court
              defined materiality in TSC Industries: information is material if there is a{" "}
              <strong>substantial likelihood that a reasonable investor would consider it important</strong>{" "}
              in making an investment decision. The question is not whether the investor would have
              changed their decision, but whether the fact would have been significant to their
              deliberation. When scrubbing the prospectus below, apply this standard: would a
              reasonable investor want to know this?
            </p>
          </div>
        </div>
      </section>

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
                <p className="font-body text-sm text-gray-400 leading-relaxed">
                  Strict liability for issuers if a registration statement contains an untrue
                  statement of <strong className="text-gray-200">material fact</strong> or omits a
                  material fact necessary to make the statements not misleading.
                </p>
              </div>
              <div>
                <p className="font-ui text-[10px] uppercase tracking-widest text-sprawl-yellow mb-1">
                  Materiality Standard
                </p>
                <p className="font-body text-sm text-gray-400 leading-relaxed">
                  Information is material if there is a{" "}
                  <strong className="text-gray-200">substantial likelihood</strong> that a reasonable
                  investor would consider it important in making an investment decision.
                </p>
              </div>
              <div className="border border-white/10 rounded p-3 bg-black/30">
                <p className="font-body text-sm italic text-sprawl-light-blue">
                  "The Securities Act creates a mandatory disclosure regime: you may sell securities
                  to the public, but only if you tell the truth. Section 11 enforces this with
                  near-absolute liability for the issuer."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Hint for struggling students */}
        {wrongFlagCount >= 3 && correctFlags < FLAGGABLE_COUNT && (
          <div className="border border-sprawl-yellow/40 rounded-lg p-4 mb-4 bg-sprawl-yellow/5">
            <p className="font-headline text-xs uppercase text-sprawl-yellow mb-1">Hint</p>
            <p className="font-body text-sm text-gray-700 dark:text-gray-300">
              Look for facts that a <strong>reasonable investor</strong> would consider important
              when making an investment decision. Ask yourself: does this disclosure accurately
              represent the risks? Is anything being hidden that could change an investor{"'"}s
              assessment of the company{"'"}s value?
            </p>
          </div>
        )}

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
              "By reviewing the prospectus to identify{" "}
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
              , Zeeva satisfies the registration statement requirements. Concealing the
              stress fracture would have exposed ConstructEdge to{" "}
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
              . Proper disclosure enables public markets to function, which in turn allows the
              company to achieve{" "}
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
              through the IPO. The offering will proceed at a valuation of{" "}
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

          {/* Per-blank explanations shown after submission */}
          {state.synthesisSubmitted && (
            <div className="space-y-2 mb-4">
              {SYNTHESIS_BLANKS.map((blank) => {
                const answer = (state.synthesisAnswers || {})[blank.id];
                const isCorrect = answer === blank.correct;
                return (
                  <div
                    key={blank.id}
                    className={`rounded p-3 border text-sm ${
                      isCorrect
                        ? "border-green-500/20 bg-green-500/5"
                        : "border-sprawl-bright-red/20 bg-sprawl-bright-red/5"
                    }`}
                  >
                    <p className="font-ui text-xs uppercase mb-1">
                      <span className={isCorrect ? "text-green-400" : "text-sprawl-bright-red"}>
                        {isCorrect ? "Correct" : `Incorrect — answer: ${blank.options.find((o) => o.value === blank.correct)?.label}`}
                      </span>
                    </p>
                    <p className="font-body text-sm text-gray-400">{blank.explanation}</p>
                  </div>
                );
              })}
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
                syncModuleCompletion({ moduleId: "ch11-going-public", chapterNum: 11, chapterTitle: "Going Public", scores: { flagScore: state.flagScore, synthesisCorrect: state.synthesisChecked }, counselNotes: state.counselNote });
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
