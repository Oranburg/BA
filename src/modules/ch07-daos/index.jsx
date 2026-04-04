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
import ChapterHero from "../../components/course/ChapterHero";
import chapterImage from "../../assets/chapters/ch07.jpg";

/* ------------------------------------------------------------------ */
/*  DATA: Formation Decision Tree                                      */
/* ------------------------------------------------------------------ */

const WRAPPER_OPTIONS = [
  {
    id: "none",
    label: "Unincorporated (Raw Code)",
    consequence: "personal",
    explanation:
      "Without a legal wrapper, the DAO is classified as a general partnership under RUPA ss 202. Tokenholders face joint and several liability. Per Sarcuni v. bZx DAO, courts will treat governance token holders as general partners regardless of the technology used.",
  },
  {
    id: "llc",
    label: "LLC Wrapper (Wyoming / Statutory DAO)",
    consequence: "shielded",
    explanation:
      "A legal wrapper (e.g., Wyoming DAO LLC under Wyo. Stat. ss 17-31) creates entity status and traps liability at the DAO level. Members are shielded from personal liability. The wrapper reintroduces centralization through a required registered agent and legal representative.",
  },
];

/* ------------------------------------------------------------------ */
/*  DATA: Governance Action Classification                             */
/* ------------------------------------------------------------------ */

const GOVERNANCE_ACTIONS = [
  {
    id: "vote-treasury",
    action: "Tokenholder votes to spend treasury funds on hiring a developer",
    createsLiability: true,
    explanation:
      "Under Sarcuni, governance voting on treasury expenditures is evidence of 'carrying on as co-owners.' This creates agency — the tokenholder is exercising control over business operations, satisfying RUPA ss 202(a).",
  },
  {
    id: "passive-hold",
    action: "Tokenholder holds governance tokens but never votes on any proposal",
    createsLiability: false,
    explanation:
      "Passive holding alone may not constitute 'carrying on' a business. However, courts have not yet drawn a clear line. The Sarcuni court focused on governance rights, not exercise. Holding tokens with governance power may still create exposure.",
  },
  {
    id: "vote-distribute",
    action: "Tokenholder votes to distribute treasury assets to all token holders",
    createsLiability: true,
    explanation:
      "Voting to distribute treasury assets is functionally identical to authorizing corporate dividends (Sarcuni para. 10). This is direct evidence of profit-sharing and co-ownership — the core elements of partnership formation under RUPA ss 202(c)(3).",
  },
  {
    id: "deploy-contract",
    action: "Developer deploys a smart contract that autonomously executes trades",
    createsLiability: true,
    explanation:
      "The developer who writes and deploys code is an identifiable human at the 'intersection of the blockchain and the corporeal world' (Rodrigues). Courts can reach developers even when on-chain operations are automated. The code is the developer's agent.",
  },
  {
    id: "vote-policy",
    action: "Tokenholder votes to change the DAO's stated mission and goals",
    createsLiability: true,
    explanation:
      "Changing organizational goals and policies is a governance act that demonstrates co-ownership and control over business direction. Per Sarcuni, this is the type of governance power that makes tokenholders partners in an unregistered DAO.",
  },
  {
    id: "buy-secondary",
    action: "Investor buys tokens on a secondary market purely for price speculation",
    createsLiability: false,
    explanation:
      "A purely speculative purchase without governance participation is closer to a passive investment. However, if the token carries governance rights, the holder may still be exposed. The line between investor and partner remains doctrinally unsettled.",
  },
];

/* ------------------------------------------------------------------ */
/*  DATA: Verdict Builder                                              */
/* ------------------------------------------------------------------ */

const VERDICT_BLANKS = [
  {
    id: "v1",
    prompt: "The tort claim must be...",
    options: [
      { value: "", label: "..." },
      { value: "dismissed", label: "Dismissed" },
      { value: "attributed", label: "Attributed" },
    ],
    correct: "attributed",
  },
  {
    id: "v2",
    prompt: "Because the DAO lacked a...",
    options: [
      { value: "", label: "..." },
      { value: "wrapper", label: "Legal Wrapper (Entity Status)" },
      { value: "cpu", label: "Faster CPU" },
    ],
    correct: "wrapper",
  },
  {
    id: "v3",
    prompt: "The association is treated as a...",
    options: [
      { value: "", label: "..." },
      { value: "corporation", label: "Corporation" },
      { value: "partnership", label: "General Partnership" },
    ],
    correct: "partnership",
  },
  {
    id: "v4",
    prompt: "The bot's actions are attributed...",
    options: [
      { value: "", label: "..." },
      { value: "personally", label: "Personally to the Founders" },
      { value: "only", label: "Only to the Code" },
    ],
    correct: "personally",
  },
];

/* ------------------------------------------------------------------ */
/*  Export builder                                                     */
/* ------------------------------------------------------------------ */

function buildExportText({ wrapperChoice, classifications, verdictAnswers, verdictSubmitted, verdictCorrect, counselNote }) {
  const correctClassifications = GOVERNANCE_ACTIONS.filter(
    (a) => classifications?.[a.id] === a.createsLiability
  ).length;

  const lines = [
    "DAO ATTRIBUTION ANALYSIS — COUNSEL SHEET",
    "",
    "Client: ConstructEdge (Zeeva + Sammy)",
    "Module: Chapter 07 — DAOs (Code as Law)",
    "",
    "=== Legal Wrapper Analysis ===",
    `Wrapper status: ${wrapperChoice === "llc" ? "LLC Wrapper (shielded)" : "Unincorporated (personal liability)"}`,
    "",
    "=== Governance Action Classification ===",
    `Correctly classified: ${correctClassifications} / ${GOVERNANCE_ACTIONS.length}`,
    ...GOVERNANCE_ACTIONS.map((a) => {
      const userAnswer = classifications?.[a.id];
      const correct = a.createsLiability;
      const mark = userAnswer === correct ? "CORRECT" : userAnswer !== undefined ? "INCORRECT" : "UNANSWERED";
      return `  [${mark}] ${a.action} — ${correct ? "Creates liability" : "Does not create liability"}`;
    }),
    "",
    "=== Final Verdict ===",
    `Verdict submitted: ${verdictSubmitted ? "Yes" : "No"}`,
    `Verdict correct: ${verdictCorrect ? "Yes" : "No"}`,
    ...VERDICT_BLANKS.map(
      (b) => `  ${b.prompt} ${verdictAnswers?.[b.id] || "unanswered"} (correct: ${b.correct})`
    ),
    "",
    "=== Counsel Note ===",
    counselNote || "No counsel note drafted.",
    "",
    "=== Key Takeaways ===",
    "- Unregistered DAOs default to general partnership (RUPA ss 202 / Sarcuni v. bZx DAO)",
    "- Tokenholder governance votes can create agency and partnership liability",
    "- Legal wrappers (Wyoming DAO LLC, Wyo. Stat. ss 17-31) provide entity shielding",
    "- Smart contracts do not eliminate the need for legal personality",
    "- Developers are reachable at the blockchain-corporeal intersection (Rodrigues)",
  ];
  return lines.join("\n");
}

/* ------------------------------------------------------------------ */
/*  Component State                                                    */
/* ------------------------------------------------------------------ */

const INITIAL_STATE = {
  phase: 0, // 0 = attribution console, 1 = governance classification, 2 = verdict, 3 = counsel
  wrapperChoice: "none",
  classifications: {},
  classificationSubmitted: false,
  verdictAnswers: {},
  verdictSubmitted: false,
  verdictCorrect: false,
  counselNote: "",
  completed: false,
};

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function Ch07DAOs() {
  const { openTome } = useTome();
  const { state, patch, markCompleted } = useModuleProgress("ch07-daos", INITIAL_STATE);
  const flow = MODULE_FLOW["ch07-daos"];

  const wrapperChoice = state.wrapperChoice || "none";
  const classifications = useMemo(() => state.classifications || {}, [state.classifications]);
  const isShielded = wrapperChoice === "llc";

  const allClassified = GOVERNANCE_ACTIONS.every((a) => classifications[a.id] !== undefined);
  const correctCount = GOVERNANCE_ACTIONS.filter(
    (a) => classifications[a.id] === a.createsLiability
  ).length;

  const handleClassify = useCallback(
    (actionId, value) => {
      if (state.classificationSubmitted) return;
      patch({ classifications: { ...classifications, [actionId]: value } });
    },
    [classifications, patch, state.classificationSubmitted]
  );

  const submitClassifications = useCallback(() => {
    patch({ classificationSubmitted: true });
    if (correctCount >= 4) {
      patch({ phase: 2 });
    }
  }, [patch, correctCount]);

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
    // Verdict requires unincorporated wrapper to demonstrate the attribution problem
    const wrapperCorrect = wrapperChoice === "none";
    const fullyCorrect = allCorrect && wrapperCorrect;
    patch({ verdictSubmitted: true, verdictCorrect: fullyCorrect });
    if (fullyCorrect) {
      patch({ phase: 3 });
    }
  }, [patch, state.verdictAnswers, wrapperChoice]);

  const allVerdictFilled = VERDICT_BLANKS.every((b) => (state.verdictAnswers || {})[b.id]);

  const exportText = useMemo(
    () =>
      buildExportText({
        wrapperChoice,
        classifications,
        verdictAnswers: state.verdictAnswers || {},
        verdictSubmitted: state.verdictSubmitted,
        verdictCorrect: state.verdictCorrect,
        counselNote: state.counselNote,
      }),
    [wrapperChoice, classifications, state.verdictAnswers, state.verdictSubmitted, state.verdictCorrect, state.counselNote]
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-6">
      <ModuleBreadcrumb chapterNum="07" title="DAOs" />
      <ChapterHero src={chapterImage} alt="Zeeva reviewing DAO mesh topology and token-holder liability mapping" />
      <p className="font-ui text-xs text-sprawl-yellow/60 uppercase tracking-widest">
        Chapter 07 · Decentralized Autonomous Organizations
      </p>
      <h1 className="font-headline text-4xl uppercase tracking-tight text-gray-900 dark:text-white">
        Code as Law
      </h1>
      <p className="font-body text-gray-700 dark:text-gray-300">
        ConstructEdge deploys a Structure-Bot DAO to automate building inspections in Sector 7. The
        bot mistakenly dismantles a resident&apos;s balcony, causing 20,000 credits in damages. The
        resident sues. But who is liable — the code, the DAO, or the founders? When there is no
        charter, no board, and no legal entity, courts must decide: is this a new kind of
        organization, or just an old partnership dressed in code?
      </p>
      <p className="font-ui text-xs text-gray-500">
        Why this chapter matters now: the LLC from Chapter 05 demonstrated contractual freedom within
        a legal entity. DAOs test what happens when there is no entity at all — and the attribution
        problem from Chapter 02 returns with full force.
      </p>

      <div className="flex flex-wrap gap-2 items-center">
        <CitationChip citation="RUPA § 202" />
        <CitationChip citation="Wyo. Stat. § 17-31" />
        <CitationChip citation="Sarcuni v. bZx DAO" />
        <button
          onClick={() => openTome({ query: "RUPA § 202" })}
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
        moduleId="ch07-daos"
        factsOverride={{
          entityForm: `DAO (${isShielded ? "LLC wrapper active" : "unincorporated — partnership default"})`,
          controlPosture: "Token-weighted governance — no board, no officers",
          boardDynamics: "Smart contract execution — proposals voted on-chain",
        }}
      />

      <MatterFileCarryover
        title="Matter File Carryover (LLCs -> DAOs)"
        references={["ch01-why-law", "ch02-agency", "ch03-partnership", "ch05-llcs"]}
      />

      {/* ============================================================ */}
      {/* PHASE 0: Attribution Console                                  */}
      {/* ============================================================ */}

      <section className="border border-sprawl-yellow/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded bg-sprawl-bright-red flex items-center justify-center text-white font-headline text-xs">
            01
          </div>
          <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white">
            The Attribution Console
          </h2>
        </div>

        <p className="font-body text-sm text-gray-600 dark:text-gray-300 mb-4">
          Review the Structure-Bot DAO configuration. Determine whether the bot&apos;s tort (property
          damage) is attributed to an entity or flows through to the founders personally.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Code Review */}
          <div className="border border-sprawl-bright-blue/40 rounded-lg p-4 bg-sprawl-deep-blue/30">
            <p className="font-headline text-xs text-gray-400 uppercase mb-3">
              Step 1: Inspect Smart Contract
            </p>
            <div className="bg-black/50 rounded p-4 border-l-3 border-sprawl-bright-blue font-mono text-sm text-green-400 leading-relaxed">
              <code>
                function executeRepair(targetId) {"{"}<br />
                &nbsp;&nbsp;if (target.integrity &lt; 20) {"{"}<br />
                &nbsp;&nbsp;&nbsp;&nbsp;deploy_dismantle_unit();<br />
                &nbsp;&nbsp;{"}"}<br />
                {"}"}<br />
                <span className="text-sprawl-bright-red">// WARNING: Biometric check missing.</span>
              </code>
            </div>
          </div>

          {/* Legal Wrapper Toggle */}
          <div className="border border-sprawl-bright-blue/40 rounded-lg p-4 bg-sprawl-deep-blue/30">
            <p className="font-headline text-xs text-gray-400 uppercase mb-3">
              Step 2: Legal Wrapper Status
            </p>
            <div className="space-y-3">
              {WRAPPER_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-3 cursor-pointer p-3 rounded border transition-all ${
                    wrapperChoice === opt.id
                      ? "border-sprawl-yellow bg-sprawl-yellow/5"
                      : "border-gray-700 bg-white/5 hover:border-gray-500"
                  }`}
                >
                  <input
                    type="radio"
                    name="wrapper"
                    value={opt.id}
                    checked={wrapperChoice === opt.id}
                    onChange={() => patch({ wrapperChoice: opt.id })}
                    className="accent-sprawl-yellow"
                  />
                  <span className="font-ui text-sm text-gray-800 dark:text-gray-200">
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Attribution Flow Visualization */}
        <div className="bg-gray-50 dark:bg-sprawl-deep-blue/60 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h4 className="font-headline text-lg uppercase text-sprawl-yellow mb-6 text-center">
            Liability Attribution Flow
          </h4>

          <div className="flex items-center justify-between max-w-3xl mx-auto mb-6">
            {/* Bot Node */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full border-2 border-sprawl-bright-red flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(178,31,44,0.3)]">
                <span role="img" aria-label="robot">&#x1F916;</span>
              </div>
              <span className="font-ui text-[10px] uppercase font-bold text-gray-400">
                Structure-Bot
              </span>
            </div>

            {/* Line 1 — always active */}
            <div className="flex-1 h-0.5 bg-sprawl-yellow mx-2 shadow-[0_0_10px_rgba(255,214,92,0.3)]" />

            {/* DAO Node */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full border-2 border-sprawl-yellow flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(255,214,92,0.3)]">
                <span role="img" aria-label="cloud">&#x2601;</span>
              </div>
              <span className="font-ui text-[10px] uppercase font-bold text-gray-400">
                DAO Entity
              </span>
            </div>

            {/* Line 2 — active only when unshielded */}
            <div
              className={`flex-1 h-0.5 mx-2 transition-all duration-500 ${
                isShielded
                  ? "bg-gray-600"
                  : "bg-sprawl-yellow shadow-[0_0_10px_rgba(255,214,92,0.3)]"
              }`}
            />

            {/* Founders Node */}
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-16 h-16 rounded-full border-2 flex items-center justify-center text-2xl transition-all duration-500 ${
                  isShielded
                    ? "border-gray-600 opacity-40"
                    : "border-sprawl-yellow shadow-[0_0_15px_rgba(255,214,92,0.3)]"
                }`}
              >
                <span role="img" aria-label="founders">&#x1F465;</span>
              </div>
              <span className="font-ui text-[10px] uppercase font-bold text-gray-400">
                Founders (Z & S)
              </span>
            </div>
          </div>

          {/* Attribution summary */}
          <div
            className={`p-4 rounded border text-center transition-all duration-500 ${
              isShielded
                ? "border-sprawl-teal/40 bg-sprawl-teal/10"
                : "border-sprawl-bright-red/40 bg-sprawl-bright-red/10"
            }`}
          >
            {isShielded ? (
              <p className="font-ui text-sm">
                <span className="font-bold text-sprawl-teal uppercase">
                  Attribution: Entity Shield Active.
                </span>
                <br />
                <span className="text-gray-600 dark:text-gray-400">
                  The LLC wrapper traps liability at the DAO level. Founders are shielded.
                </span>
              </p>
            ) : (
              <p className="font-ui text-sm">
                <span className="font-bold text-sprawl-bright-red uppercase">
                  Attribution: Direct Personal Liability.
                </span>
                <br />
                <span className="text-gray-600 dark:text-gray-400">
                  In the absence of a legal wrapper, the DAO is an unincorporated partnership
                  (Sarcuni v. bZx DAO; RUPA ss 202).
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Tome sidebar */}
        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <div className="md:col-span-2">
            <p className="font-body text-sm text-gray-600 dark:text-gray-300">
              Toggle the legal wrapper to see how entity status changes the attribution flow. Without
              registration, courts apply the partnership default — every tokenholder with governance
              power is a potential general partner.
            </p>
          </div>
          <div className="border border-sprawl-yellow/30 rounded-lg p-4 bg-sprawl-deep-blue/80">
            <p className="font-headline text-sm uppercase text-sprawl-yellow mb-3">
              Attribution HUD
            </p>
            <div className="space-y-3">
              <div>
                <p className="font-ui text-[10px] uppercase tracking-widest text-sprawl-light-blue mb-1">
                  The Attribution Problem
                </p>
                <p className="font-body text-xs text-gray-400 leading-relaxed">
                  Can a decentralized protocol be a &quot;legal person&quot;? Without formal
                  registration, law treats DAOs as{" "}
                  <strong className="text-gray-200">unincorporated associations</strong>.
                </p>
              </div>
              <div>
                <p className="font-ui text-[10px] uppercase tracking-widest text-sprawl-yellow mb-1">
                  RUPA ss 202 Default
                </p>
                <p className="font-body text-xs text-gray-400 leading-relaxed">
                  If two or more persons associate for profit without a formal charter, they are a{" "}
                  <strong className="text-gray-200">General Partnership</strong>, regardless of
                  the technology used.
                </p>
              </div>
            </div>
          </div>
        </div>

        {state.phase === 0 && (
          <button
            onClick={() => patch({ phase: 1 })}
            className="mt-4 px-5 py-2 bg-sprawl-yellow text-sprawl-deep-blue font-headline uppercase text-xs rounded hover:bg-sprawl-yellow/80"
          >
            Proceed to Governance Classification
          </button>
        )}
      </section>

      {/* ============================================================ */}
      {/* PHASE 1: Governance Action Classification                     */}
      {/* ============================================================ */}

      {state.phase >= 1 && (
        <section className="border border-sprawl-teal/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded bg-sprawl-teal flex items-center justify-center text-sprawl-deep-blue font-headline text-xs">
              02
            </div>
            <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white">
              Governance Action Classification
            </h2>
          </div>

          <p className="font-body text-sm text-gray-600 dark:text-gray-300 mb-4">
            For each governance action, determine: does this create liability for the tokenholder
            under Sarcuni / RUPA ss 202? Classify each action as creating or not creating personal
            liability in an unregistered DAO.
          </p>

          <div className="space-y-4">
            {GOVERNANCE_ACTIONS.map((action) => {
              const userChoice = classifications[action.id];
              const isSubmitted = state.classificationSubmitted;
              const isCorrect = userChoice === action.createsLiability;

              return (
                <div
                  key={action.id}
                  className={`border rounded-lg p-4 transition-all ${
                    isSubmitted
                      ? isCorrect
                        ? "border-green-500/30 bg-green-500/5"
                        : "border-sprawl-bright-red/30 bg-sprawl-bright-red/5"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <p className="font-body text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                    {action.action}
                  </p>

                  <div className="flex gap-3 mb-2">
                    <button
                      onClick={() => handleClassify(action.id, true)}
                      disabled={isSubmitted}
                      className={`px-4 py-1.5 rounded font-ui text-xs uppercase transition-all ${
                        userChoice === true
                          ? "bg-sprawl-bright-red text-white"
                          : "border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-sprawl-bright-red"
                      } ${isSubmitted ? "cursor-not-allowed" : ""}`}
                    >
                      Creates Liability
                    </button>
                    <button
                      onClick={() => handleClassify(action.id, false)}
                      disabled={isSubmitted}
                      className={`px-4 py-1.5 rounded font-ui text-xs uppercase transition-all ${
                        userChoice === false
                          ? "bg-sprawl-teal text-sprawl-deep-blue"
                          : "border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-sprawl-teal"
                      } ${isSubmitted ? "cursor-not-allowed" : ""}`}
                    >
                      No Liability
                    </button>
                  </div>

                  {isSubmitted && (
                    <div className="mt-2">
                      <p
                        className={`font-headline text-xs uppercase mb-1 ${
                          isCorrect ? "text-green-400" : "text-sprawl-bright-red"
                        }`}
                      >
                        {isCorrect ? "Correct" : "Incorrect"}
                      </p>
                      <p className="font-body text-xs text-gray-600 dark:text-gray-400">
                        {action.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!state.classificationSubmitted && (
            <button
              disabled={!allClassified}
              onClick={submitClassifications}
              className="mt-4 px-5 py-2 bg-sprawl-bright-red text-white font-headline uppercase text-xs rounded hover:bg-sprawl-bright-red/80 disabled:opacity-40"
            >
              Submit Classifications
            </button>
          )}

          {state.classificationSubmitted && (
            <div
              className={`mt-4 rounded-lg p-4 border ${
                correctCount >= 4
                  ? "border-green-500/30 bg-green-500/10"
                  : "border-sprawl-bright-red/30 bg-sprawl-bright-red/10"
              }`}
            >
              <p className="font-headline text-sm uppercase mb-1">
                Classification Result: {correctCount} / {GOVERNANCE_ACTIONS.length} correct
              </p>
              <p className="font-body text-sm text-gray-700 dark:text-gray-300">
                {correctCount >= 4
                  ? "Strong analysis. You have demonstrated understanding of when governance actions create agency and partnership liability in a DAO context. The key insight: participation in governance — not merely holding tokens — is what creates the attribution link."
                  : "Review the Sarcuni holding and RUPA ss 202 more carefully. The court focused on governance rights and control over business operations as the test for partnership status."}
              </p>
            </div>
          )}

          {state.classificationSubmitted && correctCount < 4 && (
            <button
              onClick={() =>
                patch({ classificationSubmitted: false, classifications: {} })
              }
              className="mt-2 px-5 py-2 bg-sprawl-yellow text-sprawl-deep-blue font-headline uppercase text-xs rounded hover:bg-sprawl-yellow/80"
            >
              Retry Classification
            </button>
          )}
        </section>
      )}

      {/* ============================================================ */}
      {/* PHASE 2: Final Verdict                                       */}
      {/* ============================================================ */}

      {state.phase >= 2 && (
        <section className="border border-sprawl-teal/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded bg-sprawl-teal flex items-center justify-center text-sprawl-deep-blue font-headline text-xs">
              03
            </div>
            <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white">
              Final Verdict
            </h2>
          </div>

          <p className="font-body text-sm text-gray-600 dark:text-gray-300 mb-2">
            Complete the legal holding on the Structure-Bot incident. To see the attribution problem
            in its raw form, ensure the wrapper is set to{" "}
            <strong>Unincorporated</strong> above.
          </p>

          <div className="bg-gray-50 dark:bg-sprawl-deep-blue/60 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-4">
            <p className="font-body text-lg md:text-xl leading-loose text-gray-700 dark:text-gray-300 italic">
              &quot;The resident&apos;s claim for damages must be{" "}
              <select
                value={(state.verdictAnswers || {}).v1 || ""}
                onChange={(e) => handleVerdictChange("v1", e.target.value)}
                disabled={state.verdictSubmitted && state.verdictCorrect}
                className="bg-transparent border-b-2 border-sprawl-yellow outline-none px-1 text-gray-900 dark:text-white not-italic text-sm font-headline uppercase"
              >
                {VERDICT_BLANKS[0].options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>{" "}
              beyond the code. Because the DAO lacked a{" "}
              <select
                value={(state.verdictAnswers || {}).v2 || ""}
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
              , the Council views the association as a{" "}
              <select
                value={(state.verdictAnswers || {}).v3 || ""}
                onChange={(e) => handleVerdictChange("v3", e.target.value)}
                disabled={state.verdictSubmitted && state.verdictCorrect}
                className="bg-transparent border-b-2 border-sprawl-yellow outline-none px-1 text-gray-900 dark:text-white not-italic text-sm font-headline uppercase"
              >
                {VERDICT_BLANKS[2].options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>{" "}
              under RUPA. Consequently, the bot&apos;s actions are attributed{" "}
              <select
                value={(state.verdictAnswers || {}).v4 || ""}
                onChange={(e) => handleVerdictChange("v4", e.target.value)}
                disabled={state.verdictSubmitted && state.verdictCorrect}
                className="bg-transparent border-b-2 border-sprawl-yellow outline-none px-1 text-gray-900 dark:text-white not-italic text-sm font-headline uppercase"
              >
                {VERDICT_BLANKS[3].options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>{" "}
              under the doctrine of Respondeat Superior.&quot;
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
                {state.verdictCorrect ? "Verdict Accepted" : "Logic Error"}
              </p>
              <p className="font-body text-sm text-gray-700 dark:text-gray-300">
                {state.verdictCorrect
                  ? "Correct. 'Code is not Law' in the eyes of the Council. Without a statutory wrapper, a DAO is simply a group of people acting for profit — making it a general partnership under RUPA ss 202. Because the bot is an agent of the partnership, Zeeva and Sammy are personally liable for its structural errors under Respondeat Superior."
                  : wrapperChoice !== "none"
                  ? "Your verdict selections may be correct, but you currently have the LLC wrapper active. To see the attribution problem in its raw form, switch to Unincorporated status above and resubmit."
                  : "Review the attribution doctrine. The default entity for unincorporated associations acting for profit is always the General Partnership (RUPA ss 202). Code cannot be a legal person — liability flows to the humans behind it."}
              </p>
            </div>
          )}

          {!state.verdictSubmitted && (
            <button
              disabled={!allVerdictFilled}
              onClick={submitVerdict}
              className="px-5 py-2 bg-sprawl-bright-red text-white font-headline uppercase text-xs rounded hover:bg-sprawl-bright-red/80 disabled:opacity-40"
            >
              Commit Final Verdict
            </button>
          )}

          {state.verdictSubmitted && !state.verdictCorrect && (
            <button
              onClick={() => patch({ verdictSubmitted: false })}
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
            Draft a note to ConstructEdge&apos;s file analyzing the DAO attribution risk, the
            consequences of operating without a legal wrapper, and your recommendation for protecting
            the founders going forward.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
              <p className="font-ui text-xs uppercase tracking-wider text-gray-500 mb-2">
                Consider addressing
              </p>
              <ul className="list-disc list-inside font-body text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>Why does an unregistered DAO default to general partnership?</li>
                <li>When does a tokenholder vote create agency under Sarcuni?</li>
                <li>What legal wrapper options exist (Wyoming, Utah, Vermont, Tennessee)?</li>
                <li>What are the trade-offs between decentralization and liability protection?</li>
              </ul>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
              <p className="font-ui text-xs uppercase tracking-wider text-gray-500 mb-2">
                Key doctrinal anchors
              </p>
              <ul className="list-disc list-inside font-body text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>Sarcuni v. bZx DAO — tokenholders as general partners</li>
                <li>RUPA ss 202 — partnership default for profit associations</li>
                <li>Rodrigues — no legal intervention point on pure blockchain</li>
                <li>Wyo. Stat. ss 17-31 — DAO LLC wrapper (member or algorithmic management)</li>
              </ul>
            </div>
          </div>

          <textarea
            value={state.counselNote || ""}
            onChange={(e) => patch({ counselNote: e.target.value })}
            placeholder="Draft your counsel note: analyze the DAO attribution problem, the risks of operating without a legal wrapper, and your recommendation for ConstructEdge..."
            className="w-full min-h-36 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-sprawl-deep-blue/70 p-3 font-body text-sm text-gray-800 dark:text-gray-200"
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              disabled={!state.verdictCorrect}
              onClick={() => {
                markCompleted();
                updateMatterFile(
                  "ch07-daos",
                  summarizeModuleHeadline("ch07-daos", {
                    verdictCorrect: state.verdictCorrect,
                    classificationScore: correctCount,
                    totalActions: GOVERNANCE_ACTIONS.length,
                    wrapperChoice,
                    counselNote: state.counselNote,
                  }),
                  {
                    entityForm: "DAO (unincorporated — partnership default under Sarcuni)",
                    controlPosture: "Token-weighted governance — attribution flows to founders without legal wrapper",
                  }
                );
                downloadTextFile(
                  "constructedge-dao-attribution-counsel-sheet.txt",
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

      <LifecycleHandoff moduleId="ch07-daos" bridge={flow.bridge} />
    </div>
  );
}
