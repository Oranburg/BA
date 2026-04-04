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
import chapterImage from "../../assets/chapters/ch04.jpg";

/* ------------------------------------------------------------------ */
/*  DATA: Creditor Classification Exercise                             */
/* ------------------------------------------------------------------ */

const CREDITORS = [
  {
    id: "c1",
    label: "Sammy's Landlord (Personal Lease)",
    type: "personal",
    explanation:
      "Sammy's landlord is a personal creditor. Entity shielding (affirmative partitioning) blocks this creditor from reaching ConstructEdge's assets.",
  },
  {
    id: "c2",
    label: "Steel Supplier (Entity Contract)",
    type: "business",
    explanation:
      "The steel supplier contracted with ConstructEdge directly. This is a business creditor. Limited liability (defensive partitioning) blocks this creditor from reaching Zeeva's or Sammy's personal assets.",
  },
  {
    id: "c3",
    label: "Zeeva's Student Loan Servicer",
    type: "personal",
    explanation:
      "Zeeva's student debt is a personal obligation. Entity shielding protects ConstructEdge's assets from this creditor.",
  },
  {
    id: "c4",
    label: "Cloud Infrastructure Provider (Entity SaaS Contract)",
    type: "business",
    explanation:
      "The cloud provider contracted with ConstructEdge Corp. Limited liability shields the founders' personal assets from this entity-level obligation.",
  },
  {
    id: "c5",
    label: "Sammy's Ex-Partner (Alimony Judgment)",
    type: "personal",
    explanation:
      "Alimony is a personal obligation of Sammy. Entity shielding prevents this creditor from seizing ConstructEdge's corporate assets.",
  },
  {
    id: "c6",
    label: "Injured Pedestrian (Tort — Entity Delivery Drone)",
    type: "business",
    explanation:
      "The tort arose from ConstructEdge's operations. This is a business creditor — limited liability shields the owners' personal assets (unless the veil is pierced).",
  },
];

/* ------------------------------------------------------------------ */
/*  DATA: Veil-Piercing Factor Analysis                                */
/* ------------------------------------------------------------------ */

const VEIL_FACTORS = [
  {
    id: "f1",
    label: "Commingling of Funds",
    description:
      "Sammy uses the ConstructEdge Corp bank account to pay personal expenses, including rent and alimony. No separation between personal and entity funds.",
    present: true,
  },
  {
    id: "f2",
    label: "Undercapitalization",
    description:
      "ConstructEdge was formed with only 500 credits of equity capital despite planning a multi-million credit construction project. All other funding came as personal loans from Zeeva.",
    present: true,
  },
  {
    id: "f3",
    label: "Failure to Observe Corporate Formalities",
    description:
      "ConstructEdge has never held a board meeting, has no corporate minutes, and has never issued formal stock certificates. Decisions are made by text message.",
    present: true,
  },
  {
    id: "f4",
    label: "Adequate Insurance Coverage",
    description:
      "ConstructEdge carries $10 million in general liability insurance and $5 million in professional liability coverage, well above statutory minimums.",
    present: false,
  },
  {
    id: "f5",
    label: "Alter Ego / Domination",
    description:
      "Sammy treats ConstructEdge as indistinguishable from himself — signing contracts interchangeably in his personal and corporate capacity, using the entity's credit line for personal purchases.",
    present: true,
  },
  {
    id: "f6",
    label: "Fraud or Injustice",
    description:
      "Sammy diverted ConstructEdge funds to a personal side project, leaving the entity unable to pay the steel supplier's $2M invoice. The supplier had no way to learn of this diversion before extending credit.",
    present: true,
  },
];

/* ------------------------------------------------------------------ */
/*  DATA: Verdict Builder                                              */
/* ------------------------------------------------------------------ */

const VERDICT_BLANKS = [
  {
    id: "v1",
    prompt: "The corporation's essential legal innovation is...",
    options: [
      { value: "", label: "..." },
      { value: "management", label: "Centralized Management" },
      { value: "partitioning", label: "Asset Partitioning" },
    ],
    correct: "partitioning",
  },
  {
    id: "v2",
    prompt: "Protecting entity assets from owners' personal creditors is called...",
    options: [
      { value: "", label: "..." },
      { value: "shielding", label: "Entity Shielding (Affirmative)" },
      { value: "liability", label: "Limited Liability (Defensive)" },
    ],
    correct: "shielding",
  },
  {
    id: "v3",
    prompt: "Protecting owners' personal assets from entity creditors is called...",
    options: [
      { value: "", label: "..." },
      { value: "shielding", label: "Entity Shielding (Affirmative)" },
      { value: "liability", label: "Limited Liability (Defensive)" },
    ],
    correct: "liability",
  },
  {
    id: "v4",
    prompt: "To pierce the corporate veil, a court must find...",
    options: [
      { value: "", label: "..." },
      { value: "twoProng", label: "Unity of Interest + Injustice" },
      { value: "oneProng", label: "Undercapitalization Alone" },
    ],
    correct: "twoProng",
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function computeCreditorScore(answers) {
  let correct = 0;
  for (const c of CREDITORS) {
    if (answers[c.id] === c.type) correct++;
  }
  return correct;
}

function computeVeilScore(answers) {
  let correct = 0;
  for (const f of VEIL_FACTORS) {
    if (answers[f.id] === f.present) correct++;
  }
  return correct;
}

/* ------------------------------------------------------------------ */
/*  Export builder                                                     */
/* ------------------------------------------------------------------ */

function buildExportText({ creditorAnswers, veilAnswers, verdictAnswers, verdictSubmitted, verdictCorrect, counselNote }) {
  const creditorScore = computeCreditorScore(creditorAnswers || {});
  const veilScore = computeVeilScore(veilAnswers || {});
  const lines = [
    "CORPORATE ASSET PARTITIONING ANALYSIS — COUNSEL SHEET",
    "",
    "Client: ConstructEdge Corp (Zeeva + Sammy)",
    "Module: Chapter 04 — Corporations & Tech (The Entity Shield)",
    "",
    "=== Creditor Classification ===",
    `Score: ${creditorScore} / ${CREDITORS.length}`,
    ...CREDITORS.map(
      (c) =>
        `  ${c.label}: classified as ${(creditorAnswers || {})[c.id] || "unanswered"} (correct: ${c.type})`
    ),
    "",
    "=== Veil-Piercing Factor Analysis ===",
    `Score: ${veilScore} / ${VEIL_FACTORS.length}`,
    ...VEIL_FACTORS.map(
      (f) =>
        `  ${f.label}: student said ${(veilAnswers || {})[f.id] === true ? "present" : (veilAnswers || {})[f.id] === false ? "absent" : "unanswered"} (correct: ${f.present ? "present" : "absent"})`
    ),
    "",
    "=== Verdict Builder ===",
    `Verdict submitted: ${verdictSubmitted ? "Yes" : "No"}`,
    `Verdict correct: ${verdictCorrect ? "Yes" : "No"}`,
    ...VERDICT_BLANKS.map(
      (b) =>
        `  ${b.prompt} ${(verdictAnswers || {})[b.id] || "unanswered"} (correct: ${b.correct})`
    ),
    "",
    "=== Counsel Note ===",
    counselNote || "No counsel note drafted.",
    "",
    "=== Key Takeaways ===",
    "- The corporation is an artificial legal person created by statute (DGCL § 102, MBCA § 6.22)",
    "- Asset partitioning has two directions: defensive (limited liability) and affirmative (entity shielding)",
    "- Veil-piercing requires the Van Dorn two-prong test: unity of interest + injustice",
    "- Key factors: commingling, undercapitalization, failure of formalities, alter ego, fraud",
    "- An unsatisfied judgment alone is NOT sufficient to pierce (Sea-Land v. Pepper Source)",
    "- Insurance may satisfy capitalization concerns (Radaszewski v. Telecom)",
  ];
  return lines.join("\n");
}

/* ------------------------------------------------------------------ */
/*  Component State                                                    */
/* ------------------------------------------------------------------ */

const INITIAL_STATE = {
  phase: 0, // 0 = doctrine primer, 1 = creditor classification, 2 = veil-piercing, 3 = verdict, 4 = counsel
  creditorAnswers: {},
  creditorSubmitted: false,
  creditorScore: 0,
  veilAnswers: {},
  veilSubmitted: false,
  veilScore: 0,
  verdictAnswers: {},
  verdictSubmitted: false,
  verdictCorrect: false,
  counselNote: "",
  completed: false,
};

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function Ch04CorporationsTech() {
  const { openTome } = useTome();
  const { state, patch, markCompleted } = useModuleProgress("ch04-corporations-tech", INITIAL_STATE);
  const flow = MODULE_FLOW["ch04-corporations-tech"];

  const creditorAnswers = useMemo(() => state.creditorAnswers || {}, [state.creditorAnswers]);
  const veilAnswers = useMemo(() => state.veilAnswers || {}, [state.veilAnswers]);
  const verdictAnswers = useMemo(() => state.verdictAnswers || {}, [state.verdictAnswers]);

  const creditorScore = useMemo(() => computeCreditorScore(creditorAnswers), [creditorAnswers]);
  const veilScore = useMemo(() => computeVeilScore(veilAnswers), [veilAnswers]);

  const handleCreditorChoice = useCallback(
    (creditorId, value) => {
      if (state.creditorSubmitted) return;
      patch({ creditorAnswers: { ...creditorAnswers, [creditorId]: value } });
    },
    [creditorAnswers, patch, state.creditorSubmitted]
  );

  const submitCreditors = useCallback(() => {
    const score = computeCreditorScore(creditorAnswers);
    patch({ creditorSubmitted: true, creditorScore: score });
    if (score >= 4) {
      patch({ phase: Math.max(state.phase, 2) });
    }
  }, [creditorAnswers, patch, state.phase]);

  const handleVeilChoice = useCallback(
    (factorId, value) => {
      if (state.veilSubmitted) return;
      patch({ veilAnswers: { ...veilAnswers, [factorId]: value } });
    },
    [veilAnswers, patch, state.veilSubmitted]
  );

  const submitVeil = useCallback(() => {
    const score = computeVeilScore(veilAnswers);
    patch({ veilSubmitted: true, veilScore: score });
    if (score >= 4) {
      patch({ phase: Math.max(state.phase, 3) });
    }
  }, [veilAnswers, patch, state.phase]);

  const handleVerdictChange = useCallback(
    (blankId, value) => {
      patch({ verdictAnswers: { ...verdictAnswers, [blankId]: value } });
    },
    [patch, verdictAnswers]
  );

  const submitVerdict = useCallback(() => {
    const allCorrect = VERDICT_BLANKS.every((b) => verdictAnswers[b.id] === b.correct);
    patch({ verdictSubmitted: true, verdictCorrect: allCorrect });
    if (allCorrect) {
      patch({ phase: 4 });
    }
  }, [patch, verdictAnswers]);

  const allCreditorsFilled = CREDITORS.every((c) => creditorAnswers[c.id]);
  const allVeilFilled = VEIL_FACTORS.every((f) => veilAnswers[f.id] !== undefined);
  const allVerdictFilled = VERDICT_BLANKS.every((b) => verdictAnswers[b.id]);

  const exportText = useMemo(
    () =>
      buildExportText({
        creditorAnswers,
        veilAnswers,
        verdictAnswers,
        verdictSubmitted: state.verdictSubmitted,
        verdictCorrect: state.verdictCorrect,
        counselNote: state.counselNote,
      }),
    [creditorAnswers, veilAnswers, verdictAnswers, state.verdictSubmitted, state.verdictCorrect, state.counselNote]
  );

  const counselValid = (state.counselNote || "").trim().length >= 20;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-6">
      <ModuleBreadcrumb chapterNum="04" title="Corporations & Tech" />
      <ChapterHero src={chapterImage} alt="Corporate entity shield partition visualized across ConstructEdge asset pools" />
      <p className="font-ui text-xs text-sprawl-yellow/60 uppercase tracking-widest">
        Chapter 04 · Corporations &amp; Tech
      </p>
      <h1 className="font-headline text-4xl uppercase tracking-tight text-gray-900 dark:text-white">
        The Entity Shield
      </h1>
      <p className="font-body text-gray-700 dark:text-gray-300">
        The partnership left Zeeva and Sammy exposed to unlimited personal liability. Incorporating
        ConstructEdge as a corporation introduces the most powerful legal technology for scaling:
        <strong> asset partitioning</strong>. The corporation creates a legal wall between the
        entity&apos;s assets and the owners&apos; personal assets — but that wall is not absolute.
        Courts can pierce the corporate veil when the boundary dissolves through abuse.
      </p>
      <p className="font-ui text-xs text-gray-500">
        Why this chapter matters now: partnership from Chapter 03 demonstrated unlimited liability.
        The corporation solves that problem through two directions of partitioning — but introduces
        the risk of veil-piercing when founders ignore corporate separateness.
      </p>

      <div className="flex flex-wrap gap-2 items-center">
        <CitationChip citation="DGCL § 102" />
        <CitationChip citation="MBCA § 6.22" />
        <button
          onClick={() => openTome({ query: "DGCL § 102" })}
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
        moduleId="ch04-corporations-tech"
        factsOverride={{
          entityForm: "Corporation (newly incorporated under DGCL)",
          controlPosture: "Founder-controlled — Zeeva and Sammy as sole shareholders and directors",
          boardDynamics: "Two-person board; no outside directors yet",
        }}
      />

      <MatterFileCarryover
        title="Matter File Carryover (Partnership -> Corporation)"
        references={["ch01-why-law", "ch02-agency", "ch03-partnership"]}
      />

      {/* ============================================================ */}
      {/* PHASE 0: Doctrine Primer — What a Corporation IS              */}
      {/* ============================================================ */}

      <section className="border border-sprawl-yellow/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded bg-sprawl-bright-red flex items-center justify-center text-white font-headline text-xs">
            01
          </div>
          <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white">
            Doctrine Primer: The Corporation as Legal Technology
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-sprawl-deep-blue/60 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
              <p className="font-headline text-sm uppercase text-sprawl-yellow mb-2">
                What Is a Corporation?
              </p>
              <p className="font-body text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                A corporation is an <strong>artificial entity</strong> — invisible, intangible, existing
                only in contemplation of law. (<em>Dartmouth College v. Woodward</em>, 17 U.S. 518 (1819)).
                It can own property, enter contracts, sue and be sued, and persist beyond any individual
                owner&apos;s life. Its essential innovation is not management, but{" "}
                <strong>asset partitioning</strong>.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-sprawl-deep-blue/60 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
              <p className="font-headline text-sm uppercase text-sprawl-yellow mb-2">
                Why Incorporate?
              </p>
              <ul className="list-disc list-inside font-body text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>Aggregate capital under uniform terms</li>
                <li>Create a separate legal person with perpetual existence</li>
                <li>Shield owners from entity-level debts (limited liability)</li>
                <li>Shield entity assets from owners&apos; personal creditors (entity shielding)</li>
                <li>Enable transferability of ownership interests</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <div className="border border-sprawl-light-blue/30 rounded-lg p-5 bg-sprawl-deep-blue/80">
              <p className="font-headline text-sm uppercase text-sprawl-light-blue mb-3">
                Two Directions of Partitioning
              </p>
              <div className="space-y-4">
                <div className="border border-sprawl-light-blue/20 rounded p-3">
                  <p className="font-ui text-xs uppercase tracking-widest text-sprawl-light-blue mb-1">
                    Defensive Partitioning (Limited Liability)
                  </p>
                  <p className="font-body text-xs text-gray-400 leading-relaxed">
                    Protects <strong className="text-gray-200">owners&apos; personal assets</strong> from
                    the entity&apos;s creditors. If ConstructEdge Corp is sued, Zeeva&apos;s personal
                    savings and Sammy&apos;s apartment are shielded.
                  </p>
                </div>
                <div className="border border-sprawl-yellow/20 rounded p-3">
                  <p className="font-ui text-xs uppercase tracking-widest text-sprawl-yellow mb-1">
                    Affirmative Partitioning (Entity Shielding)
                  </p>
                  <p className="font-body text-xs text-gray-400 leading-relaxed">
                    Protects <strong className="text-gray-200">entity assets</strong> from the
                    owners&apos; personal creditors. If Sammy owes alimony, that creditor cannot seize
                    ConstructEdge&apos;s corporate bank account or intellectual property.
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-white/10 rounded p-4 bg-black/30">
              <p className="font-body text-xs italic text-sprawl-light-blue leading-relaxed">
                &quot;The corporate owner/employee, a natural person, is distinct from the corporation
                itself, a legally different entity with different rights and responsibilities due to its
                different legal status.&quot;
              </p>
              <p className="font-ui text-[10px] text-gray-500 mt-2">
                — Cedric Kushner Promotions v. King, 533 U.S. 158 (2001)
              </p>
            </div>
          </div>
        </div>

        {state.phase === 0 && (
          <button
            onClick={() => patch({ phase: 1 })}
            className="px-5 py-2 bg-sprawl-yellow text-sprawl-deep-blue font-headline uppercase text-xs rounded hover:bg-sprawl-yellow/80"
          >
            Proceed to Creditor Classification
          </button>
        )}
      </section>

      {/* ============================================================ */}
      {/* PHASE 1: Creditor Classification Exercise                     */}
      {/* ============================================================ */}

      {state.phase >= 1 && (
        <section className="border border-sprawl-teal/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded bg-sprawl-teal flex items-center justify-center text-sprawl-deep-blue font-headline text-xs">
              02
            </div>
            <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white">
              Creditor Classification: Who Reaches What?
            </h2>
          </div>

          <p className="font-body text-sm text-gray-600 dark:text-gray-300 mb-4">
            ConstructEdge has incorporated. Classify each creditor as a{" "}
            <strong>personal creditor</strong> (of Zeeva or Sammy individually) or a{" "}
            <strong>business creditor</strong> (of ConstructEdge Corp). This determines which
            partition — entity shielding or limited liability — blocks their claim.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {/* Personal Domain */}
            <div className="border border-sprawl-light-blue/30 rounded-lg p-4 bg-sprawl-deep-blue/20">
              <p className="font-headline text-xs uppercase text-center text-sprawl-light-blue mb-2">
                Personal Domain (Zeeva &amp; Sammy)
              </p>
              <p className="font-ui text-[10px] text-center text-gray-500 mb-3">
                Entity shielding blocks these creditors from entity assets
              </p>
              <div className="flex flex-wrap gap-2 min-h-[40px]">
                {CREDITORS.filter((c) => creditorAnswers[c.id] === "personal").map((c) => (
                  <span
                    key={c.id}
                    className="px-2 py-1 rounded bg-sprawl-light-blue/20 border border-sprawl-light-blue/40 font-ui text-xs text-sprawl-light-blue"
                  >
                    {c.label.split("(")[0].trim()}
                  </span>
                ))}
              </div>
            </div>

            {/* Entity Domain */}
            <div className="border border-sprawl-yellow/30 rounded-lg p-4 bg-sprawl-deep-blue/20">
              <p className="font-headline text-xs uppercase text-center text-sprawl-yellow mb-2">
                Entity Domain (ConstructEdge Corp)
              </p>
              <p className="font-ui text-[10px] text-center text-gray-500 mb-3">
                Limited liability blocks these creditors from personal assets
              </p>
              <div className="flex flex-wrap gap-2 min-h-[40px]">
                {CREDITORS.filter((c) => creditorAnswers[c.id] === "business").map((c) => (
                  <span
                    key={c.id}
                    className="px-2 py-1 rounded bg-sprawl-yellow/20 border border-sprawl-yellow/40 font-ui text-xs text-sprawl-yellow"
                  >
                    {c.label.split("(")[0].trim()}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            {CREDITORS.map((c) => {
              const chosen = creditorAnswers[c.id];
              const isCorrect = state.creditorSubmitted && chosen === c.type;
              const isWrong = state.creditorSubmitted && chosen && chosen !== c.type;
              return (
                <div
                  key={c.id}
                  className={`border rounded-lg p-3 transition-all ${
                    isCorrect
                      ? "border-green-500/40 bg-green-500/5"
                      : isWrong
                        ? "border-sprawl-bright-red/40 bg-sprawl-bright-red/5"
                        : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-ui text-sm text-gray-800 dark:text-gray-200">{c.label}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCreditorChoice(c.id, "personal")}
                        disabled={state.creditorSubmitted}
                        className={`px-3 py-1 rounded font-ui text-xs transition-all ${
                          chosen === "personal"
                            ? "bg-sprawl-light-blue text-sprawl-deep-blue font-bold"
                            : "border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-sprawl-light-blue"
                        } ${state.creditorSubmitted ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
                      >
                        Personal Creditor
                      </button>
                      <button
                        onClick={() => handleCreditorChoice(c.id, "business")}
                        disabled={state.creditorSubmitted}
                        className={`px-3 py-1 rounded font-ui text-xs transition-all ${
                          chosen === "business"
                            ? "bg-sprawl-yellow text-sprawl-deep-blue font-bold"
                            : "border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-sprawl-yellow"
                        } ${state.creditorSubmitted ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
                      >
                        Business Creditor
                      </button>
                    </div>
                  </div>
                  {state.creditorSubmitted && (
                    <p className={`font-body text-xs mt-2 ${isCorrect ? "text-green-600 dark:text-green-400" : "text-sprawl-bright-red"}`}>
                      {c.explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {state.creditorSubmitted && (
            <div
              className={`rounded-lg p-4 mb-4 border ${
                creditorScore >= 4
                  ? "border-green-500/30 bg-green-500/10"
                  : "border-sprawl-bright-red/30 bg-sprawl-bright-red/10"
              }`}
            >
              <p className="font-headline text-sm uppercase mb-1">
                {creditorScore >= 4 ? "Partition Confirmed" : "Classification Incomplete"}
              </p>
              <p className="font-body text-sm text-gray-700 dark:text-gray-300">
                {creditorScore >= 4
                  ? `You correctly classified ${creditorScore}/${CREDITORS.length} creditors. The two-way partition is clear: entity shielding keeps personal creditors away from corporate assets, while limited liability keeps business creditors away from personal assets.`
                  : `You scored ${creditorScore}/${CREDITORS.length}. Remember: personal creditors are blocked by entity shielding (affirmative partitioning), while business creditors are blocked by limited liability (defensive partitioning). Review the explanations and proceed.`}
              </p>
            </div>
          )}

          {!state.creditorSubmitted && (
            <button
              disabled={!allCreditorsFilled}
              onClick={submitCreditors}
              className="px-5 py-2 bg-sprawl-bright-red text-white font-headline uppercase text-xs rounded hover:bg-sprawl-bright-red/80 disabled:opacity-40"
            >
              Submit Classification
            </button>
          )}

          {state.creditorSubmitted && creditorScore < 4 && (
            <button
              onClick={() => patch({ creditorSubmitted: false, creditorAnswers: {} })}
              className="px-5 py-2 bg-sprawl-yellow text-sprawl-deep-blue font-headline uppercase text-xs rounded hover:bg-sprawl-yellow/80"
            >
              Reset and Try Again
            </button>
          )}
        </section>
      )}

      {/* ============================================================ */}
      {/* PHASE 2: Veil-Piercing Factor Analysis                        */}
      {/* ============================================================ */}

      {state.phase >= 2 && (
        <section className="border border-sprawl-bright-red/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded bg-sprawl-bright-red flex items-center justify-center text-white font-headline text-xs">
              03
            </div>
            <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white">
              Veil-Piercing: When the Shield Fails
            </h2>
          </div>

          <p className="font-body text-sm text-gray-600 dark:text-gray-300 mb-2">
            Asset partitioning is not absolute. Courts pierce the corporate veil when the boundary
            between owner and entity dissolves. The <strong>Van Dorn two-prong test</strong> requires:
          </p>
          <ol className="list-decimal list-inside font-body text-sm text-gray-700 dark:text-gray-300 mb-4 space-y-1">
            <li>
              <strong>Unity of interest and ownership</strong> — the corporation has no separate identity
              from its owner (commingling, failure of formalities, undercapitalization, alter ego)
            </li>
            <li>
              <strong>Injustice prong</strong> — respecting the corporate form would sanction a fraud
              or promote injustice beyond mere inability to collect a judgment
            </li>
          </ol>
          <p className="font-ui text-xs text-gray-500 mb-4">
            Source: <em>Sea-Land Services v. Pepper Source</em>, 941 F.2d 519 (7th Cir. 1991) — applying
            the Van Dorn test to Marchese&apos;s interchangeable corporate shells.
          </p>

          <p className="font-body text-sm text-gray-600 dark:text-gray-300 mb-4">
            Review the following factual indicators about ConstructEdge. For each, determine whether
            the factor is <strong>present</strong> (weighing toward piercing) or{" "}
            <strong>absent</strong> (weighing against piercing).
          </p>

          <div className="space-y-3 mb-4">
            {VEIL_FACTORS.map((f) => {
              const chosen = veilAnswers[f.id];
              const isCorrect = state.veilSubmitted && chosen === f.present;
              const isWrong = state.veilSubmitted && chosen !== undefined && chosen !== f.present;
              return (
                <div
                  key={f.id}
                  className={`border rounded-lg p-4 transition-all ${
                    isCorrect
                      ? "border-green-500/40 bg-green-500/5"
                      : isWrong
                        ? "border-sprawl-bright-red/40 bg-sprawl-bright-red/5"
                        : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <p className="font-headline text-sm uppercase text-gray-800 dark:text-gray-200 mb-1">
                    {f.label}
                  </p>
                  <p className="font-body text-xs text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                    {f.description}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleVeilChoice(f.id, true)}
                      disabled={state.veilSubmitted}
                      className={`px-3 py-1 rounded font-ui text-xs transition-all ${
                        chosen === true
                          ? "bg-sprawl-bright-red text-white font-bold"
                          : "border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-sprawl-bright-red"
                      } ${state.veilSubmitted ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
                    >
                      Present (Weighs Toward Piercing)
                    </button>
                    <button
                      onClick={() => handleVeilChoice(f.id, false)}
                      disabled={state.veilSubmitted}
                      className={`px-3 py-1 rounded font-ui text-xs transition-all ${
                        chosen === false
                          ? "bg-green-600 text-white font-bold"
                          : "border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-green-500"
                      } ${state.veilSubmitted ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
                    >
                      Absent (Weighs Against Piercing)
                    </button>
                  </div>
                  {state.veilSubmitted && isWrong && (
                    <p className="font-body text-xs mt-2 text-sprawl-bright-red">
                      Incorrect. This factor is {f.present ? "present" : "absent"} on these facts.
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {state.veilSubmitted && (
            <div
              className={`rounded-lg p-4 mb-4 border ${
                veilScore >= 4
                  ? "border-green-500/30 bg-green-500/10"
                  : "border-sprawl-bright-red/30 bg-sprawl-bright-red/10"
              }`}
            >
              <p className="font-headline text-sm uppercase mb-1">
                {veilScore >= 4 ? "Veil Analysis Complete" : "Analysis Needs Revision"}
              </p>
              <p className="font-body text-sm text-gray-700 dark:text-gray-300">
                {veilScore >= 4
                  ? `You correctly identified ${veilScore}/${VEIL_FACTORS.length} factors. On these facts, ConstructEdge shows clear unity of interest — commingling, undercapitalization, no formalities, and alter ego behavior. The adequate insurance factor is the only one weighing against piercing. With fund diversion causing creditor harm, the injustice prong is also likely satisfied.`
                  : `You identified ${veilScore}/${VEIL_FACTORS.length} factors correctly. Remember: adequate insurance may cure undercapitalization concerns (Radaszewski v. Telecom), but commingling and alter ego conduct establish unity of interest regardless of insurance. Review and proceed.`}
              </p>
            </div>
          )}

          {!state.veilSubmitted && (
            <button
              disabled={!allVeilFilled}
              onClick={submitVeil}
              className="px-5 py-2 bg-sprawl-bright-red text-white font-headline uppercase text-xs rounded hover:bg-sprawl-bright-red/80 disabled:opacity-40"
            >
              Submit Veil Analysis
            </button>
          )}

          {state.veilSubmitted && veilScore < 4 && (
            <button
              onClick={() => patch({ veilSubmitted: false, veilAnswers: {} })}
              className="px-5 py-2 bg-sprawl-yellow text-sprawl-deep-blue font-headline uppercase text-xs rounded hover:bg-sprawl-yellow/80"
            >
              Reset and Try Again
            </button>
          )}
        </section>
      )}

      {/* ============================================================ */}
      {/* PHASE 3: Verdict Builder                                      */}
      {/* ============================================================ */}

      {state.phase >= 3 && (
        <section className="border border-sprawl-teal/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded bg-sprawl-teal flex items-center justify-center text-sprawl-deep-blue font-headline text-xs">
              04
            </div>
            <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white">
              Verdict Builder: The Entity Shield
            </h2>
          </div>

          <p className="font-body text-sm text-gray-600 dark:text-gray-300 mb-4">
            Complete the legal holding. Your creditor classifications and veil-piercing analysis
            feed into the doctrinal synthesis.
          </p>

          <div className="bg-gray-50 dark:bg-sprawl-deep-blue/60 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-4">
            <p className="font-body text-lg md:text-xl leading-loose text-gray-700 dark:text-gray-300 italic">
              &quot;{VERDICT_BLANKS[0].prompt}{" "}
              <select
                value={verdictAnswers.v1 || ""}
                onChange={(e) => handleVerdictChange("v1", e.target.value)}
                disabled={state.verdictSubmitted && state.verdictCorrect}
                className="bg-transparent border-b-2 border-sprawl-yellow outline-none px-1 text-gray-900 dark:text-white not-italic text-sm font-headline uppercase"
              >
                {VERDICT_BLANKS[0].options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              . {VERDICT_BLANKS[1].prompt}{" "}
              <select
                value={verdictAnswers.v2 || ""}
                onChange={(e) => handleVerdictChange("v2", e.target.value)}
                disabled={state.verdictSubmitted && state.verdictCorrect}
                className="bg-transparent border-b-2 border-sprawl-yellow outline-none px-1 text-gray-900 dark:text-white not-italic text-sm font-headline uppercase"
              >
                {VERDICT_BLANKS[1].options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              . {VERDICT_BLANKS[2].prompt}{" "}
              <select
                value={verdictAnswers.v3 || ""}
                onChange={(e) => handleVerdictChange("v3", e.target.value)}
                disabled={state.verdictSubmitted && state.verdictCorrect}
                className="bg-transparent border-b-2 border-sprawl-yellow outline-none px-1 text-gray-900 dark:text-white not-italic text-sm font-headline uppercase"
              >
                {VERDICT_BLANKS[2].options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              . {VERDICT_BLANKS[3].prompt}{" "}
              <select
                value={verdictAnswers.v4 || ""}
                onChange={(e) => handleVerdictChange("v4", e.target.value)}
                disabled={state.verdictSubmitted && state.verdictCorrect}
                className="bg-transparent border-b-2 border-sprawl-yellow outline-none px-1 text-gray-900 dark:text-white not-italic text-sm font-headline uppercase"
              >
                {VERDICT_BLANKS[3].options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              .&quot;
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
                {state.verdictCorrect ? "Entity Shield Deployed" : "Logic Loop"}
              </p>
              <p className="font-body text-sm text-gray-700 dark:text-gray-300">
                {state.verdictCorrect
                  ? "Correct. The corporation's essential innovation is asset partitioning — two-directional protection that creates entity shielding (affirmative) and limited liability (defensive). But this shield is not impervious: the Van Dorn two-prong test (unity of interest + injustice) allows courts to pierce when the boundary dissolves."
                  : "Review your answers. Remember: entity shielding is affirmative partitioning (protects entity from owners' creditors). Limited liability is defensive partitioning (protects owners from entity creditors). Piercing requires both prongs — unity of interest alone is not enough (Sea-Land v. Pepper Source)."}
              </p>
            </div>
          )}

          {!state.verdictSubmitted && (
            <button
              disabled={!allVerdictFilled}
              onClick={submitVerdict}
              className="px-5 py-2 bg-sprawl-bright-red text-white font-headline uppercase text-xs rounded hover:bg-sprawl-bright-red/80 disabled:opacity-40"
            >
              Submit Verdict
            </button>
          )}

          {state.verdictSubmitted && !state.verdictCorrect && (
            <button
              onClick={() => patch({ verdictSubmitted: false })}
              className="px-5 py-2 bg-sprawl-yellow text-sprawl-deep-blue font-headline uppercase text-xs rounded hover:bg-sprawl-yellow/80"
            >
              Revise and Resubmit
            </button>
          )}
        </section>
      )}

      {/* ============================================================ */}
      {/* PHASE 4: Counsel Note + Export                                */}
      {/* ============================================================ */}

      {state.phase >= 4 && (
        <section className="border border-sprawl-yellow/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded bg-sprawl-light-blue flex items-center justify-center text-sprawl-deep-blue font-headline text-xs">
              05
            </div>
            <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white">
              Counsel Note
            </h2>
          </div>

          <p className="font-body text-sm text-gray-600 dark:text-gray-300 mb-4">
            Draft a recommendation to ConstructEdge&apos;s file explaining the corporate
            partitioning structure, the veil-piercing risks you identified, and what corrective
            measures the founders should take.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
              <p className="font-ui text-xs uppercase tracking-wider text-gray-500 mb-2">
                Consider addressing
              </p>
              <ul className="list-disc list-inside font-body text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>How does incorporation solve the partnership&apos;s unlimited liability exposure?</li>
                <li>Which veil-piercing factors are present and how should ConstructEdge cure them?</li>
                <li>Should Sammy stop commingling personal and corporate funds?</li>
                <li>What corporate formalities must be observed going forward?</li>
              </ul>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
              <p className="font-ui text-xs uppercase tracking-wider text-gray-500 mb-2">
                Key doctrinal points
              </p>
              <ul className="list-disc list-inside font-body text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>Walkovszky v. Carlton — undercapitalization alone may not suffice for piercing</li>
                <li>Sea-Land v. Pepper Source — the two-prong Van Dorn test</li>
                <li>Radaszewski v. Telecom — insurance may cure capitalization concerns</li>
                <li>An unsatisfied judgment alone does not &quot;promote injustice&quot;</li>
              </ul>
            </div>
          </div>

          <textarea
            value={state.counselNote || ""}
            onChange={(e) => patch({ counselNote: e.target.value })}
            placeholder="Draft your counsel recommendation: explain how ConstructEdge's corporate partition works, identify veil-piercing risks, and recommend corrective measures (min. 20 characters)..."
            className="w-full min-h-36 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-sprawl-deep-blue/70 p-3 font-body text-sm text-gray-800 dark:text-gray-200"
          />

          {!counselValid && (state.counselNote || "").length > 0 && (
            <p className="font-ui text-xs text-sprawl-bright-red mt-1">
              Counsel note must be at least 20 characters.
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              disabled={!state.verdictCorrect || !counselValid}
              onClick={() => {
                markCompleted();
                syncModuleCompletion({ moduleId: "ch04-corporations-tech", chapterNum: 4, chapterTitle: "Corporations", scores: { creditorScore: state.creditorScore, piercingFactors: state.piercingFactors }, counselNotes: state.counselNote });
                updateMatterFile(
                  "ch04-corporations-tech",
                  summarizeModuleHeadline("ch04-corporations-tech", {
                    creditorScore,
                    totalCreditors: CREDITORS.length,
                    veilScore,
                    totalFactors: VEIL_FACTORS.length,
                    verdictCorrect: state.verdictCorrect,
                    counselNote: state.counselNote,
                  }),
                  {
                    entityForm: "Corporation (incorporated under DGCL — entity shield active)",
                    controlPosture: "Founder-controlled corporation — veil-piercing risks identified",
                  }
                );
                downloadTextFile(
                  "constructedge-corporate-partitioning-counsel-sheet.txt",
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

      <LifecycleHandoff moduleId="ch04-corporations-tech" bridge={flow.bridge} />
    </div>
  );
}
