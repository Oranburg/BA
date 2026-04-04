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
import chapterImage from "../../assets/chapters/ch14.jpg";

/* ------------------------------------------------------------------ */
/*  DATA: Evidence Fragments for the Veil-Piercing Wall                */
/* ------------------------------------------------------------------ */

const EVIDENCE_FRAGMENTS = [
  {
    id: "commingle",
    title: "Commingled Accounts",
    description:
      "Sammy used ConstructEdge Sub-7's operating account to pay personal expenses — synth-ale subscription, tactical gear, and rent on his private residence.",
    prong: "prong1",
    prongLabel: "Prong 1 — Unity of Interest",
    explanation:
      "Commingling personal and corporate funds is a classic indicator that the corporation lacks a separate identity from its owners. See Sea-Land v. Pepper Source (factors: commingling of funds or assets).",
  },
  {
    id: "undercap",
    title: "Undercapitalization",
    description:
      "Sub-7 was launched with only 100 credits in equity despite 50M credits in known hazardous risk exposure from its construction operations in Sector 7.",
    prong: "prong1",
    prongLabel: "Prong 1 — Unity of Interest",
    explanation:
      "Gross undercapitalization — forming a subsidiary with trivial equity relative to foreseeable liabilities — suggests the entity was never intended to function independently. Cf. Radaszewski (insurance as alternative to capitalization).",
  },
  {
    id: "formalities",
    title: "Zero Corporate Formalities",
    description:
      "Zeeva never recorded minutes, held board meetings, or maintained separate books for Sub-7. It exists only as a data-entry in the ConstructEdge system.",
    prong: "prong1",
    prongLabel: "Prong 1 — Unity of Interest",
    explanation:
      "Failure to maintain adequate corporate records or comply with corporate formalities is one of the four Van Dorn factors. Without separate governance, the entity has no independent 'mind, will, or existence.'",
  },
  {
    id: "domination",
    title: "Total Domination",
    description:
      "All Sub-7 contracts were signed by Zeeva in her personal capacity using her own biometric hash. Sub-7 had no employees, no independent officers, and no separate office.",
    prong: "prong1",
    prongLabel: "Prong 1 — Unity of Interest",
    explanation:
      "When the parent or individual exercises complete domination so the subsidiary has 'no separate mind, will or existence of its own,' the first prong is satisfied. See Walkovszky (conducting business in individual capacity).",
  },
  {
    id: "siphoning",
    title: "Asset Siphoning",
    description:
      "ConstructEdge transferred Sub-7's most profitable contracts to a new entity — Sub-8 — days before the Sector 7 environmental claims were filed, leaving Sub-7 judgment-proof.",
    prong: "prong2",
    prongLabel: "Prong 2 — Injustice",
    explanation:
      "Transferring assets to avoid known liabilities is the kind of 'wrong beyond inability to collect' that satisfies the injustice prong. An intentional scheme to squirrel assets into a liability-free entity while heaping liabilities on an asset-free entity. Sea-Land (on remand).",
  },
  {
    id: "enrichment",
    title: "Unjust Enrichment",
    description:
      "Zeeva and Sammy personally collected 2M credits in 'management fees' from Sub-7 while the Sector 7 residents' environmental claims went unpaid. Sub-7's account balance: 50 credits.",
    prong: "both",
    prongLabel: "Both Prongs",
    explanation:
      "Personal enrichment through the corporate form while creditors go unpaid satisfies both prongs: it shows the entity served personal rather than corporate ends (unity), and allowing owners to retain those funds while victims are uncompensated would sanction injustice. Sea-Land (on remand): 'Marchese was enriched unjustly by his intentional manipulation and diversion of funds.'",
  },
];

/* ------------------------------------------------------------------ */
/*  DATA: Prong Classification Answers                                 */
/* ------------------------------------------------------------------ */

const PRONG_OPTIONS = [
  { value: "", label: "Select..." },
  { value: "prong1", label: "Prong 1 — Unity of Interest" },
  { value: "prong2", label: "Prong 2 — Injustice" },
  { value: "both", label: "Both Prongs" },
];

/* ------------------------------------------------------------------ */
/*  DATA: Verdict Builder Blanks                                       */
/* ------------------------------------------------------------------ */

const VERDICT_BLANKS = [
  {
    id: "v1",
    prompt: "Adhering to the corporate fiction would sanction...",
    options: [
      { value: "", label: "..." },
      { value: "efficiency", label: "Economic Efficiency" },
      { value: "injustice", label: "Fraud or Injustice" },
    ],
    correct: "injustice",
  },
  {
    id: "v2",
    prompt: "The owners failed to maintain...",
    options: [
      { value: "", label: "..." },
      { value: "records", label: "Corporate Formalities" },
      { value: "friendship", label: "Professional Relationships" },
    ],
    correct: "records",
  },
  {
    id: "v3",
    prompt: "The subsidiary was treated as the owners'...",
    options: [
      { value: "", label: "..." },
      { value: "agent", label: "Independent Agent" },
      { value: "alterego", label: "Alter Ego" },
    ],
    correct: "alterego",
  },
  {
    id: "v4",
    prompt: "The two-prong test requires unity of interest and...",
    options: [
      { value: "", label: "..." },
      { value: "profit", label: "Lost Profit" },
      { value: "inequitable", label: "Inequitable Result" },
    ],
    correct: "inequitable",
  },
  {
    id: "v5",
    prompt: "Therefore, the corporate veil is...",
    options: [
      { value: "", label: "..." },
      { value: "intact", label: "Left Intact" },
      { value: "pierced", label: "Pierced" },
    ],
    correct: "pierced",
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function veilStatus(appliedCount) {
  if (appliedCount === 0) return { label: "Intact", color: "text-sprawl-bright-blue", bg: "border-sprawl-bright-blue", percent: 100 };
  if (appliedCount <= 2) return { label: "Stressed", color: "text-sprawl-yellow", bg: "border-sprawl-yellow", percent: 65 };
  if (appliedCount <= 4) return { label: "Fracturing", color: "text-orange-400", bg: "border-orange-400", percent: 35 };
  return { label: "Pierced", color: "text-sprawl-bright-red", bg: "border-sprawl-bright-red", percent: 0 };
}

function computeProngScore(classifications) {
  let correct = 0;
  let total = EVIDENCE_FRAGMENTS.length;
  for (const frag of EVIDENCE_FRAGMENTS) {
    if (classifications[frag.id] === frag.prong) correct++;
  }
  return { correct, total };
}

/* ------------------------------------------------------------------ */
/*  Export builder                                                     */
/* ------------------------------------------------------------------ */

function buildExportText({ appliedEvidence, prongClassifications, verdictAnswers, verdictCorrect, counselNote }) {
  const prongScore = computeProngScore(prongClassifications || {});
  const lines = [
    "VEIL-PIERCING ANALYSIS — COUNSEL SHEET",
    "",
    "Client: ConstructEdge / Sub-7 Subsidiary",
    "Module: Chapter 14 — Piercing the Veil (The Veil-Piercing Wall)",
    "",
    "=== Evidence Applied to Veil ===",
    `Fragments applied: ${(appliedEvidence || []).length} / ${EVIDENCE_FRAGMENTS.length}`,
    ...(appliedEvidence || []).map((id) => {
      const f = EVIDENCE_FRAGMENTS.find((e) => e.id === id);
      return f ? `  - ${f.title}: ${f.description}` : `  - ${id}`;
    }),
    "",
    "=== Prong Classification ===",
    `Score: ${prongScore.correct} / ${prongScore.total}`,
    ...EVIDENCE_FRAGMENTS.map((f) => {
      const answer = (prongClassifications || {})[f.id] || "unclassified";
      const correct = answer === f.prong ? "CORRECT" : "INCORRECT";
      return `  ${f.title}: ${answer} (expected: ${f.prong}) [${correct}]`;
    }),
    "",
    "=== Verdict Builder ===",
    `Verdict correct: ${verdictCorrect ? "Yes" : "No"}`,
    ...VERDICT_BLANKS.map(
      (b) => `  ${b.prompt} ${(verdictAnswers || {})[b.id] || "unanswered"} (correct: ${b.correct})`
    ),
    "",
    "=== Counsel Recommendation ===",
    counselNote || "No counsel recommendation drafted.",
    "",
    "=== Key Doctrine ===",
    "- Piercing the corporate veil = exception to limited liability (MBCA § 6.22)",
    "- Two-prong test (Van Dorn / Sea-Land): (1) Unity of interest; (2) Injustice",
    "- Walkovszky v. Carlton: undercapitalization alone insufficient under NY standard",
    "- Sea-Land v. Pepper Source: commingling, no formalities, unjust enrichment",
    "- Radaszewski: insurance can substitute for capitalization",
    "- Piercing is an equitable remedy, not an independent cause of action",
  ];
  return lines.join("\n");
}

/* ------------------------------------------------------------------ */
/*  Component State                                                    */
/* ------------------------------------------------------------------ */

const INITIAL_STATE = {
  phase: 0, // 0 = evidence wall, 1 = prong classification, 2 = verdict, 3 = counsel
  appliedEvidence: [],
  explanationOpen: null,
  prongClassifications: {},
  prongSubmitted: false,
  verdictAnswers: {},
  verdictSubmitted: false,
  verdictCorrect: false,
  counselNote: "",
  completed: false,
};

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function Ch14PiercingTheVeil() {
  const { openTome } = useTome();
  const { state, patch, markCompleted } = useModuleProgress("ch14-piercing-the-veil", INITIAL_STATE);
  const flow = MODULE_FLOW["ch14-piercing-the-veil"];

  const appliedEvidence = useMemo(() => state.appliedEvidence || [], [state.appliedEvidence]);
  const prongClassifications = useMemo(() => state.prongClassifications || {}, [state.prongClassifications]);
  const status = useMemo(() => veilStatus(appliedEvidence.length), [appliedEvidence.length]);
  const prongScore = useMemo(() => computeProngScore(prongClassifications), [prongClassifications]);
  const allProngsClassified = EVIDENCE_FRAGMENTS.every((f) => prongClassifications[f.id]);

  const applyEvidence = useCallback(
    (fragId) => {
      if (appliedEvidence.includes(fragId)) return;
      const next = [...appliedEvidence, fragId];
      const updates = { appliedEvidence: next };
      if (next.length === EVIDENCE_FRAGMENTS.length) {
        updates.phase = Math.max(state.phase, 1);
      }
      patch(updates);
    },
    [appliedEvidence, patch, state.phase]
  );

  const classifyProng = useCallback(
    (fragId, value) => {
      patch({ prongClassifications: { ...prongClassifications, [fragId]: value } });
    },
    [prongClassifications, patch]
  );

  const submitProngs = useCallback(() => {
    patch({ prongSubmitted: true, phase: Math.max(state.phase, 2) });
  }, [patch, state.phase]);

  const handleVerdictChange = useCallback(
    (blankId, value) => {
      patch({ verdictAnswers: { ...(state.verdictAnswers || {}), [blankId]: value } });
    },
    [patch, state.verdictAnswers]
  );

  const submitVerdict = useCallback(() => {
    const allCorrect = VERDICT_BLANKS.every(
      (b) => (state.verdictAnswers || {})[b.id] === b.correct
    );
    patch({ verdictSubmitted: true, verdictCorrect: allCorrect });
    if (allCorrect) {
      patch({ phase: 3 });
    }
  }, [patch, state.verdictAnswers]);

  const allVerdictFilled = VERDICT_BLANKS.every((b) => (state.verdictAnswers || {})[b.id]);
  const counselValid = (state.counselNote || "").trim().length >= 20;

  const exportText = useMemo(
    () =>
      buildExportText({
        appliedEvidence,
        prongClassifications,
        verdictAnswers: state.verdictAnswers || {},
        verdictCorrect: state.verdictCorrect,
        counselNote: state.counselNote,
      }),
    [appliedEvidence, prongClassifications, state.verdictAnswers, state.verdictCorrect, state.counselNote]
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-6">
      <ModuleBreadcrumb chapterNum="14" title="Piercing the Veil" />
      <ChapterHero src={chapterImage} alt="Corporate veil fracturing under forensic examination in the Sector 7 district" />
      <p className="font-ui text-sm text-sprawl-yellow/60 uppercase tracking-widest">
        Chapter 14 · Piercing the Corporate Veil
      </p>
      <h1 className="font-headline text-4xl uppercase tracking-tight text-gray-900 dark:text-white">
        The Veil-Piercing Wall
      </h1>
      <p className="font-body text-gray-700 dark:text-gray-300">
        Limited liability is the corporate form&apos;s most powerful feature — and its most
        contested. When owners treat the corporation as their personal instrument, courts may
        &quot;pierce the veil&quot; and impose personal liability. ConstructEdge&apos;s
        subsidiary Sub-7 has collapsed, leaving 100M credits in environmental claims unpaid.
        The Sector 7 residents are coming for Zeeva and Sammy personally. Your task: examine
        the evidence, classify it under the two-prong test, and determine whether the veil
        should be pierced.
      </p>
      <p className="font-ui text-sm text-gray-500">
        Why this chapter matters now: the asset partition that has protected ConstructEdge&apos;s
        founders since formation is under direct attack. If the veil is pierced, every dollar
        of personal wealth is exposed. This is the Partitioning problem at its breaking point.
      </p>

      <div className="flex flex-wrap gap-2 items-center">
        <CitationChip citation="DGCL § 102" />
        <CitationChip citation="MBCA § 6.22" />
        <button
          onClick={() => openTome({ query: "MBCA § 6.22" })}
          className="rounded border border-sprawl-yellow/40 px-2 py-1 font-ui text-sm text-sprawl-yellow hover:bg-sprawl-yellow/10"
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
        moduleId="ch14-piercing-the-veil"
        factsOverride={{
          entityForm: "Corporation — subsidiary Sub-7 under attack",
          controlPosture: "Zeeva/Sammy exercised total domination over Sub-7",
          strategicPressure: "Creditor veil-piercing action — personal liability threatened",
        }}
      />

      <MatterFileCarryover
        title="Matter File Carryover (M&A -> Piercing the Veil)"
        references={["ch08-entity-selection", "ch09-fiduciary-duties", "ch11-going-public", "ch13-m-and-a"]}
      />

      {/* ============================================================ */}
      {/* DOCTRINE PRIMER: Sidebar + Key Cases                         */}
      {/* ============================================================ */}

      <section className="border border-sprawl-yellow/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded bg-sprawl-deep-red flex items-center justify-center text-white font-headline text-xs">
            00
          </div>
          <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white">
            Doctrine Primer: The Two-Prong Test
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="border border-sprawl-yellow/20 rounded-lg p-4 bg-sprawl-deep-blue/80">
            <p className="font-headline text-sm uppercase text-sprawl-yellow mb-3">
              The Van Dorn Two-Prong Test
            </p>
            <div className="space-y-4">
              <div>
                <p className="font-ui text-[10px] uppercase tracking-widest text-sprawl-light-blue mb-1">
                  Prong 1 — Unity of Interest &amp; Ownership
                </p>
                <p className="font-body text-sm text-gray-400 leading-relaxed">
                  The corporation is the <strong className="text-gray-200">alter ego</strong> of
                  its owner — no separate identity exists. Factors: (1) failure to maintain
                  corporate records or formalities; (2) commingling of funds; (3)
                  undercapitalization; (4) treating corporate assets as personal property.
                </p>
              </div>
              <div>
                <p className="font-ui text-[10px] uppercase tracking-widest text-sprawl-light-blue mb-1">
                  Prong 2 — Injustice
                </p>
                <p className="font-body text-sm text-gray-400 leading-relaxed">
                  Adherence to the corporate fiction would <strong className="text-gray-200">sanction
                  a fraud or promote injustice</strong>. An unsatisfied judgment alone is not
                  enough — there must be a &quot;wrong beyond a creditor&apos;s inability to
                  collect.&quot;
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
              <p className="font-ui text-[10px] uppercase tracking-widest text-sprawl-yellow mb-1">
                Walkovszky v. Carlton (N.Y. 1966)
              </p>
              <p className="font-body text-sm text-gray-600 dark:text-gray-400">
                Strict NY standard: deliberate undercapitalization of ten two-cab corporations
                with minimum insurance was insufficient to pierce. The court required allegations
                that the owner was conducting business &quot;in his individual capacity,&quot; not
                merely that assets were insufficient.
              </p>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
              <p className="font-ui text-[10px] uppercase tracking-widest text-sprawl-yellow mb-1">
                Sea-Land v. Pepper Source (7th Cir. 1991/1993)
              </p>
              <p className="font-body text-sm text-gray-600 dark:text-gray-400">
                Applied the Van Dorn two-prong test. Marchese ran five corporations from one
                office, no separate books, personal expenses paid from corporate accounts. Unity
                of interest was &quot;beyond doubt.&quot; On remand: unjust enrichment through
                fund diversion satisfied the injustice prong.
              </p>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
              <p className="font-ui text-[10px] uppercase tracking-widest text-sprawl-yellow mb-1">
                Radaszewski v. Telecom (8th Cir. 1992)
              </p>
              <p className="font-body text-sm text-gray-600 dark:text-gray-400">
                $11M insurance coverage on an undercapitalized subsidiary defeated the
                veil-piercing claim. Insurance can substitute for equity capitalization when
                assessing financial responsibility.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-sprawl-deep-blue/60 border border-gray-200 dark:border-gray-700 rounded p-3">
          <p className="font-ui text-[10px] uppercase tracking-widest text-sprawl-light-blue mb-1">
            MBCA § 6.22(b) — Limited Liability Baseline
          </p>
          <p className="font-body text-sm text-gray-600 dark:text-gray-400 italic">
            &quot;Unless otherwise provided in the articles of incorporation, a shareholder of a
            corporation is not personally liable for the acts or debts of the corporation except
            that the shareholder may become personally liable by reason of the shareholder&apos;s
            own acts or conduct.&quot;
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* PHASE 0: Evidence Wall — Apply Evidence to the Veil           */}
      {/* ============================================================ */}

      <section className="border border-sprawl-bright-red/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded bg-sprawl-bright-red flex items-center justify-center text-white font-headline text-xs">
            01
          </div>
          <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white">
            The Evidence Wall: Breach the Corporate Shield
          </h2>
        </div>

        <p className="font-body text-sm text-gray-600 dark:text-gray-300 mb-4">
          Review each evidence fragment from the ConstructEdge Sub-7 investigation. Click
          &quot;Apply to Veil&quot; to submit each piece against the corporate shield. As
          evidence accumulates, the veil&apos;s integrity degrades. Apply all six fragments to
          proceed.
        </p>

        {/* Veil Status Display */}
        <div className={`border-2 ${status.bg} rounded-xl p-6 mb-6 text-center transition-all duration-500`}>
          <p className="font-ui text-sm uppercase tracking-widest text-gray-500 mb-2">
            Veil Integrity
          </p>
          <p className={`font-headline text-3xl uppercase tracking-wider ${status.color} mb-2`}>
            {status.label}
          </p>
          <div className="max-w-xs mx-auto">
            <div className="h-2 rounded bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div
                className={`h-full transition-all duration-700 ${
                  status.percent > 60
                    ? "bg-sprawl-bright-blue"
                    : status.percent > 30
                    ? "bg-sprawl-yellow"
                    : status.percent > 0
                    ? "bg-orange-400"
                    : "bg-sprawl-bright-red"
                }`}
                style={{ width: `${status.percent}%` }}
              />
            </div>
            <p className="font-ui text-sm text-gray-500 mt-1">
              {appliedEvidence.length} / {EVIDENCE_FRAGMENTS.length} fragments applied
            </p>
          </div>
          {status.label === "Pierced" && (
            <p className="font-body text-sm text-sprawl-bright-red mt-3 italic">
              The corporate shield has shattered. Zeeva and Sammy&apos;s personal assets
              are now exposed to the Sector 7 creditors.
            </p>
          )}
        </div>

        {/* Evidence Fragments */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {EVIDENCE_FRAGMENTS.map((frag) => {
            const isApplied = appliedEvidence.includes(frag.id);
            const showExplanation = state.explanationOpen === frag.id;
            return (
              <div
                key={frag.id}
                className={`rounded-lg border p-4 transition-all ${
                  isApplied
                    ? "border-sprawl-bright-red/40 bg-sprawl-bright-red/5 opacity-75"
                    : "border-sprawl-bright-blue/40 bg-white dark:bg-sprawl-deep-blue/60 hover:border-sprawl-yellow"
                }`}
              >
                <p className="font-headline text-sm uppercase text-gray-800 dark:text-gray-200 mb-1">
                  {frag.title}
                </p>
                <p className="font-body text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {frag.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {!isApplied && (
                    <button
                      onClick={() => applyEvidence(frag.id)}
                      className="px-3 py-1 bg-sprawl-bright-red text-white font-headline uppercase text-sm rounded hover:bg-sprawl-bright-red/80"
                    >
                      Apply to Veil
                    </button>
                  )}
                  {isApplied && (
                    <>
                      <span className="px-3 py-1 border border-sprawl-bright-red/40 text-sprawl-bright-red font-ui text-sm rounded">
                        Applied
                      </span>
                      <button
                        onClick={() =>
                          patch({
                            explanationOpen: showExplanation ? null : frag.id,
                          })
                        }
                        className="px-3 py-1 border border-sprawl-yellow/40 text-sprawl-yellow font-ui text-sm rounded hover:bg-sprawl-yellow/10"
                      >
                        {showExplanation ? "Hide" : "Show"} Explanation
                      </button>
                    </>
                  )}
                </div>

                {isApplied && showExplanation && (
                  <div className="mt-3 border-t border-gray-200 dark:border-gray-700 pt-3">
                    <p className="font-ui text-[10px] uppercase tracking-widest text-sprawl-light-blue mb-1">
                      {frag.prongLabel}
                    </p>
                    <p className="font-body text-sm text-gray-600 dark:text-gray-400 italic">
                      {frag.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {appliedEvidence.length === EVIDENCE_FRAGMENTS.length && state.phase === 0 && (
          <button
            onClick={() => patch({ phase: 1 })}
            className="mt-4 px-5 py-2 bg-sprawl-yellow text-sprawl-deep-blue font-headline uppercase text-sm rounded hover:bg-sprawl-yellow/80"
          >
            Proceed to Prong Classification
          </button>
        )}
      </section>

      {/* ============================================================ */}
      {/* PHASE 1: Prong Classification                                */}
      {/* ============================================================ */}

      {state.phase >= 1 && (
        <section className="border border-sprawl-teal/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded bg-sprawl-teal flex items-center justify-center text-sprawl-deep-blue font-headline text-xs">
              02
            </div>
            <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white">
              Prong Classification: Map Evidence to Doctrine
            </h2>
          </div>

          <p className="font-body text-sm text-gray-600 dark:text-gray-300 mb-4">
            Classify each piece of evidence: does it support Prong 1 (Unity of Interest),
            Prong 2 (Injustice), or both? The Van Dorn test requires both prongs be satisfied
            to pierce the veil.
          </p>

          <div className="space-y-3 mb-4">
            {EVIDENCE_FRAGMENTS.map((frag) => {
              const classification = prongClassifications[frag.id] || "";
              const isCorrect = state.prongSubmitted && classification === frag.prong;
              const isWrong = state.prongSubmitted && classification !== frag.prong;
              return (
                <div
                  key={frag.id}
                  className={`border rounded-lg p-3 ${
                    isCorrect
                      ? "border-green-500/30 bg-green-500/5"
                      : isWrong
                      ? "border-sprawl-bright-red/30 bg-sprawl-bright-red/5"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="flex-1">
                      <p className="font-headline text-sm uppercase text-gray-800 dark:text-gray-200">
                        {frag.title}
                      </p>
                      <p className="font-body text-sm text-gray-500">{frag.description}</p>
                    </div>
                    <select
                      value={classification}
                      onChange={(e) => classifyProng(frag.id, e.target.value)}
                      disabled={state.prongSubmitted}
                      className="bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1 font-ui text-sm text-gray-800 dark:text-gray-200 min-w-[180px]"
                    >
                      {PRONG_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {state.prongSubmitted && isWrong && (
                    <p className="font-ui text-sm text-sprawl-bright-red mt-2">
                      Expected: {frag.prongLabel}. {frag.explanation.split(".")[0]}.
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {state.prongSubmitted && (
            <div
              className={`rounded-lg p-4 mb-4 border ${
                prongScore.correct === prongScore.total
                  ? "border-green-500/30 bg-green-500/10"
                  : "border-sprawl-yellow/30 bg-sprawl-yellow/10"
              }`}
            >
              <p className="font-headline text-sm uppercase mb-1">
                Classification Score: {prongScore.correct} / {prongScore.total}
              </p>
              <p className="font-body text-sm text-gray-700 dark:text-gray-300">
                {prongScore.correct === prongScore.total
                  ? "All evidence correctly classified under the Van Dorn framework. You have demonstrated mastery of the two-prong test."
                  : "Review the corrections above. Remember: most evidence of commingling, undercapitalization, and domination supports Prong 1 (Unity of Interest), while evidence of intentional harm or enrichment supports Prong 2 (Injustice)."}
              </p>
            </div>
          )}

          {!state.prongSubmitted && (
            <button
              disabled={!allProngsClassified}
              onClick={submitProngs}
              className="px-5 py-2 bg-sprawl-teal text-sprawl-deep-blue font-headline uppercase text-sm rounded hover:bg-sprawl-teal/80 disabled:opacity-40"
            >
              Submit Prong Classifications
            </button>
          )}
        </section>
      )}

      {/* ============================================================ */}
      {/* PHASE 2: Verdict Builder                                     */}
      {/* ============================================================ */}

      {state.phase >= 2 && (
        <section className="border border-sprawl-bright-red/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded bg-sprawl-deep-red flex items-center justify-center text-white font-headline text-xs">
              03
            </div>
            <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white">
              Verdict Builder: Draft the Piercing Holding
            </h2>
          </div>

          <p className="font-body text-sm text-gray-600 dark:text-gray-300 mb-4">
            Complete the judicial holding using the correct legal terms. Your evidence
            analysis and prong classification should guide each selection.
          </p>

          <div className="bg-gray-50 dark:bg-sprawl-deep-blue/60 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-4">
            <p className="font-body text-lg md:text-xl leading-loose text-gray-700 dark:text-gray-300 italic">
              &quot;The court finds that adhering to the corporate fiction in this case would
              sanction{" "}
              <select
                value={(state.verdictAnswers || {}).v1 || ""}
                onChange={(e) => handleVerdictChange("v1", e.target.value)}
                disabled={state.verdictSubmitted && state.verdictCorrect}
                className="bg-transparent border-b-2 border-sprawl-yellow outline-none px-1 text-gray-900 dark:text-white not-italic text-sm font-headline uppercase"
              >
                {VERDICT_BLANKS[0].options.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              . Because the owners failed to maintain{" "}
              <select
                value={(state.verdictAnswers || {}).v2 || ""}
                onChange={(e) => handleVerdictChange("v2", e.target.value)}
                disabled={state.verdictSubmitted && state.verdictCorrect}
                className="bg-transparent border-b-2 border-sprawl-yellow outline-none px-1 text-gray-900 dark:text-white not-italic text-sm font-headline uppercase"
              >
                {VERDICT_BLANKS[1].options.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>{" "}
              and treated the subsidiary as their{" "}
              <select
                value={(state.verdictAnswers || {}).v3 || ""}
                onChange={(e) => handleVerdictChange("v3", e.target.value)}
                disabled={state.verdictSubmitted && state.verdictCorrect}
                className="bg-transparent border-b-2 border-sprawl-yellow outline-none px-1 text-gray-900 dark:text-white not-italic text-sm font-headline uppercase"
              >
                {VERDICT_BLANKS[2].options.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              , the{" "}
              <select
                value={(state.verdictAnswers || {}).v4 || ""}
                onChange={(e) => handleVerdictChange("v4", e.target.value)}
                disabled={state.verdictSubmitted && state.verdictCorrect}
                className="bg-transparent border-b-2 border-sprawl-yellow outline-none px-1 text-gray-900 dark:text-white not-italic text-sm font-headline uppercase"
              >
                {VERDICT_BLANKS[3].options.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>{" "}
              demands that the corporate veil be{" "}
              <select
                value={(state.verdictAnswers || {}).v5 || ""}
                onChange={(e) => handleVerdictChange("v5", e.target.value)}
                disabled={state.verdictSubmitted && state.verdictCorrect}
                className="bg-transparent border-b-2 border-sprawl-yellow outline-none px-1 text-gray-900 dark:text-white not-italic text-sm font-headline uppercase"
              >
                {VERDICT_BLANKS[4].options.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              . Zeeva and Sammy are personally liable for the 100M credit debt.&quot;
            </p>
          </div>

          {state.verdictSubmitted && (
            <div
              className={`rounded-lg p-4 mb-4 border ${
                state.verdictCorrect
                  ? "border-green-500/30 bg-green-500/10"
                  : "border-sprawl-bright-red/30 bg-sprawl-bright-red/10"
              }`}
            >
              <p className="font-headline text-sm uppercase mb-1">
                {state.verdictCorrect ? "Verdict Recorded" : "Judicial Error"}
              </p>
              <p className="font-body text-sm text-gray-700 dark:text-gray-300">
                {state.verdictCorrect
                  ? "Correct. The court pierces the veil because both prongs of the Van Dorn test are satisfied: (1) commingling, undercapitalization, zero formalities, and total domination established unity of interest — the subsidiary was Zeeva and Sammy's alter ego; (2) asset siphoning and unjust enrichment establish the kind of 'wrong beyond inability to collect' that makes adherence to the corporate form inequitable."
                  : "The court rejects this holding. Piercing requires both (1) Unity of Interest — the corporation is the alter ego of the owner, and (2) Injustice — adherence to the fiction would promote an inequitable result. Review the Van Dorn framework and try again."}
              </p>
            </div>
          )}

          {!state.verdictSubmitted && (
            <button
              disabled={!allVerdictFilled}
              onClick={submitVerdict}
              className="px-5 py-2 bg-sprawl-bright-red text-white font-headline uppercase text-sm rounded hover:bg-sprawl-bright-red/80 disabled:opacity-40"
            >
              Finalize Court Record
            </button>
          )}

          {state.verdictSubmitted && !state.verdictCorrect && (
            <button
              onClick={() => patch({ verdictSubmitted: false })}
              className="px-5 py-2 bg-sprawl-yellow text-sprawl-deep-blue font-headline uppercase text-sm rounded hover:bg-sprawl-yellow/80"
            >
              Revise and Resubmit
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
              Counsel Recommendation
            </h2>
          </div>

          <p className="font-body text-sm text-gray-600 dark:text-gray-300 mb-4">
            Draft a recommendation to ConstructEdge&apos;s board addressing the veil-piercing
            exposure. What should the firm do differently to protect the corporate partition in
            the future?
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
              <p className="font-ui text-sm uppercase tracking-wider text-gray-500 mb-2">
                Consider addressing
              </p>
              <ul className="list-disc list-inside font-body text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>What specific conduct exposed Zeeva and Sammy to personal liability?</li>
                <li>How should ConstructEdge maintain subsidiary independence going forward?</li>
                <li>Would adequate insurance (per Radaszewski) have changed the outcome?</li>
                <li>What corporate formalities should be maintained for future subsidiaries?</li>
              </ul>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
              <p className="font-ui text-sm uppercase tracking-wider text-gray-500 mb-2">
                Key doctrinal points
              </p>
              <ul className="list-disc list-inside font-body text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>Van Dorn two-prong test: unity of interest + injustice</li>
                <li>Walkovszky: undercapitalization alone is not enough (NY)</li>
                <li>Sea-Land: commingling + unjust enrichment = both prongs met</li>
                <li>Radaszewski: insurance as substitute for capitalization</li>
                <li>MBCA § 6.22: baseline limited liability protection</li>
              </ul>
            </div>
          </div>

          <textarea
            value={state.counselNote || ""}
            onChange={(e) => patch({ counselNote: e.target.value })}
            placeholder="Draft your counsel recommendation (minimum 20 characters): explain what piercing the veil means for ConstructEdge, what went wrong, and how to protect the partition going forward..."
            className="w-full min-h-36 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-sprawl-deep-blue/70 p-3 font-body text-sm text-gray-800 dark:text-gray-200"
          />

          {!counselValid && (state.counselNote || "").length > 0 && (
            <p className="font-ui text-sm text-sprawl-bright-red mt-1">
              Minimum 20 characters required for the counsel recommendation.
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              disabled={!state.verdictCorrect || !counselValid}
              onClick={() => {
                markCompleted();
                syncModuleCompletion({ moduleId: "ch14-piercing-the-veil", chapterNum: 14, chapterTitle: "Piercing the Veil", scores: { evidenceApplied: (state.appliedEvidence || []).length, prongScore: state.prongScore }, counselNotes: state.counselNote });
                updateMatterFile(
                  "ch14-piercing-the-veil",
                  summarizeModuleHeadline("ch14-piercing-the-veil", {
                    appliedCount: appliedEvidence.length,
                    prongScore: prongScore.correct,
                    prongTotal: prongScore.total,
                    verdictCorrect: state.verdictCorrect,
                    counselNote: state.counselNote,
                  }),
                  {
                    entityForm: "Corporation — subsidiary veil pierced, alter ego liability imposed",
                    strategicPressure: "Post-piercing: personal liability exposure; partition remediation needed",
                  }
                );
                downloadTextFile(
                  "constructedge-veil-piercing-counsel-sheet.txt",
                  exportText
                );
              }}
              className="px-5 py-2 bg-sprawl-yellow text-sprawl-deep-blue font-headline uppercase text-sm rounded hover:bg-sprawl-yellow/80 disabled:opacity-40"
            >
              Complete Module + Export Counsel Sheet
            </button>
          </div>
        </section>
      )}

      <LifecycleHandoff moduleId="ch14-piercing-the-veil" bridge={flow.bridge} />
    </div>
  );
}
