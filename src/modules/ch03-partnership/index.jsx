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
import chapterImage from "../../assets/chapters/ch03.jpg";

/* ------------------------------------------------------------------ */
/*  DATA: The Napkin Shard — Redline Spotter                           */
/* ------------------------------------------------------------------ */

const NAPKIN_SEGMENTS = [
  { id: "intro", text: "\"Look, Zeeva. I'm in. Let's ", clickable: false },
  {
    id: "coowners",
    text: "carry on as co-owners",
    clickable: true,
    isTrigger: true,
    triggerLabel: "Co-Ownership (RUPA ss 202(a))",
    explanation:
      "RUPA ss 202(a) defines a partnership as 'the association of two or more persons to carry on as co-owners a business for profit.' Sammy's explicit agreement to operate as co-owners satisfies the first element.",
  },
  {
    id: "mid1",
    text: " of this street-architect operation. We'll combine our resources\u2014your blueprints, my fixers. No more freelance one-offs. Every credit we make from Sector 7, we ",
    clickable: false,
  },
  {
    id: "profits",
    text: "split the net profits",
    clickable: true,
    isTrigger: true,
    triggerLabel: "Profit Sharing (RUPA ss 202(c)(3))",
    explanation:
      "Under RUPA ss 202(c)(3), a person who receives a share of the profits of a business is presumed to be a partner. A 50/50 net profit split is powerful evidence of partnership formation.",
  },
  { id: "mid2", text: " exactly 50/50. It's a ", clickable: false },
  {
    id: "gooddeal",
    text: "good deal",
    clickable: true,
    isTrigger: false,
    explanation:
      "This phrase describes the perceived quality of the arrangement but is not a legal element of partnership formation under RUPA ss 202. Subjective characterizations do not create partnerships.",
  },
  { id: "mid3", text: " for both of us, ", clickable: false },
  {
    id: "friends",
    text: "as friends",
    clickable: true,
    isTrigger: false,
    explanation:
      "Friendship is irrelevant to partnership formation. Under RUPA ss 202(a), partnership forms 'whether or not the persons intend to form a partnership.' The label the parties use does not control the legal outcome.",
  },
  { id: "end", text: ".\"", clickable: false },
];

const TRIGGER_COUNT = NAPKIN_SEGMENTS.filter((s) => s.isTrigger).length;

/* ------------------------------------------------------------------ */
/*  DATA: Verdict Builder                                              */
/* ------------------------------------------------------------------ */

const VERDICT_BLANKS = [
  {
    id: "intent",
    prompt: "Zeeva and Sammy intended to be...",
    options: [
      { value: "", label: "..." },
      { value: "friends", label: "Friends" },
      { value: "freelancers", label: "Solo Freelancers" },
    ],
    correct: "freelancers",
  },
  {
    id: "sharing",
    prompt: "Their agreement to share...",
    options: [
      { value: "", label: "..." },
      { value: "drinks", label: "Synthetic Drinks" },
      { value: "profits", label: "Net Profits" },
    ],
    correct: "profits",
  },
  {
    id: "operating",
    prompt: "And operate as...",
    options: [
      { value: "", label: "..." },
      { value: "coworkers", label: "Coworkers" },
      { value: "co-owners", label: "Co-owners of a business" },
    ],
    correct: "co-owners",
  },
  {
    id: "forms",
    prompt: "Forms a...",
    options: [
      { value: "", label: "..." },
      { value: "partnership", label: "General Partnership" },
      { value: "corporation", label: "Corporation" },
    ],
    correct: "partnership",
  },
  {
    id: "intentrule",
    prompt: "Intent is...",
    options: [
      { value: "", label: "..." },
      { value: "irrelevant", label: "Irrelevant" },
      { value: "mandatory", label: "Mandatory" },
    ],
    correct: "irrelevant",
  },
];

/* ------------------------------------------------------------------ */
/*  DATA: Liability consequence scenarios                              */
/* ------------------------------------------------------------------ */

const LIABILITY_SCENARIOS = [
  {
    id: "contract-bind",
    label: "Sammy signs a lease for warehouse space on behalf of ConstructEdge",
    problem: "Attribution + Risk",
    rupaSection: "RUPA ss 301",
    explanation:
      "Under RUPA ss 301, each partner is an agent of the partnership for carrying on business in the ordinary course. Sammy's lease binds the partnership and, because it is a general partnership, Zeeva is personally liable for the obligation too.",
  },
  {
    id: "tort-exposure",
    label: "A ConstructEdge delivery causes property damage to a third party",
    problem: "Risk Allocation",
    rupaSection: "RUPA ss 306",
    explanation:
      "Under RUPA ss 306(a), all partners are jointly and severally liable for partnership obligations, including torts. Both Zeeva and Sammy face unlimited personal liability for damages caused in the course of partnership business.",
  },
  {
    id: "secret-deal",
    label: "Sammy secretly takes a side contract using partnership resources",
    problem: "Governance + Loyalty",
    rupaSection: "RUPA ss 404",
    explanation:
      "RUPA ss 404(b)(1) imposes a duty of loyalty requiring partners to account for benefits derived from partnership business. Sammy must disgorge profits from the side deal to the partnership.",
  },
];

/* ------------------------------------------------------------------ */
/*  Export builder                                                     */
/* ------------------------------------------------------------------ */

function buildExportText({ triggersFound, verdictAnswers, verdictSubmitted, verdictCorrect, liabilityChecked, counselNote }) {
  const lines = [
    "PARTNERSHIP FORMATION ANALYSIS — COUNSEL SHEET",
    "",
    "Client: ConstructEdge (Zeeva + Sammy)",
    "Module: Chapter 03 — Partnership",
    "",
    "=== Redline Spotter ===",
    `RUPA triggers identified: ${triggersFound.length} / ${TRIGGER_COUNT}`,
    ...triggersFound.map((id) => {
      const seg = NAPKIN_SEGMENTS.find((s) => s.id === id);
      return `  - "${seg?.text}": ${seg?.triggerLabel}`;
    }),
    "",
    "=== Verdict Builder ===",
    `Verdict submitted: ${verdictSubmitted ? "Yes" : "No"}`,
    `Verdict correct: ${verdictCorrect ? "Yes" : "No"}`,
    ...VERDICT_BLANKS.map((b) => `  ${b.prompt} ${verdictAnswers?.[b.id] || "unanswered"} (correct: ${b.correct})`),
    "",
    "=== Liability Consequences ===",
    ...LIABILITY_SCENARIOS.map((s) => `  [${liabilityChecked?.[s.id] ? "X" : " "}] ${s.label} — ${s.rupaSection}`),
    "",
    "=== Counsel Note ===",
    counselNote || "No counsel note drafted.",
    "",
    "=== Key Takeaways ===",
    "- Partnership forms by conduct, not by intent (RUPA ss 202)",
    "- Profit sharing creates a presumption of partnership (RUPA ss 202(c)(3))",
    "- Each partner is an agent who can bind the partnership (RUPA ss 301)",
    "- All partners face joint and several liability (RUPA ss 306)",
    "- Fiduciary duties constrain self-dealing (RUPA ss 404)",
  ];
  return lines.join("\n");
}

/* ------------------------------------------------------------------ */
/*  Component State                                                    */
/* ------------------------------------------------------------------ */

const INITIAL_STATE = {
  phase: 0, // 0 = redline, 1 = verdict, 2 = consequences, 3 = counsel
  triggersFound: [],
  decoyClicked: {},
  verdictAnswers: {},
  verdictSubmitted: false,
  verdictCorrect: false,
  liabilityChecked: {},
  counselNote: "",
  completed: false,
};

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function Ch03Partnership() {
  const { openTome } = useTome();
  const { state, patch, markCompleted } = useModuleProgress("ch03-partnership", INITIAL_STATE);
  const flow = MODULE_FLOW["ch03-partnership"];

  const triggersFound = useMemo(() => state.triggersFound || [], [state.triggersFound]);
  const allTriggersFound = triggersFound.length >= TRIGGER_COUNT;

  const handleSegmentClick = useCallback(
    (segment) => {
      if (!segment.clickable) return;

      if (segment.isTrigger) {
        if (!triggersFound.includes(segment.id)) {
          const next = [...triggersFound, segment.id];
          patch({ triggersFound: next });
          // Auto-advance to verdict phase when all triggers found
          if (next.length >= TRIGGER_COUNT) {
            patch({ phase: 1 });
          }
        }
      } else {
        patch({ decoyClicked: { ...(state.decoyClicked || {}), [segment.id]: true } });
      }
    },
    [triggersFound, patch, state.decoyClicked]
  );

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
      patch({ phase: 2 });
    }
  }, [patch, state.verdictAnswers]);

  const allVerdictFilled = VERDICT_BLANKS.every((b) => (state.verdictAnswers || {})[b.id]);

  const exportText = useMemo(
    () =>
      buildExportText({
        triggersFound,
        verdictAnswers: state.verdictAnswers || {},
        verdictSubmitted: state.verdictSubmitted,
        verdictCorrect: state.verdictCorrect,
        liabilityChecked: state.liabilityChecked || {},
        counselNote: state.counselNote,
      }),
    [triggersFound, state.verdictAnswers, state.verdictSubmitted, state.verdictCorrect, state.liabilityChecked, state.counselNote]
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-6">
      <ModuleBreadcrumb chapterNum="03" title="Partnership" />
      <ChapterHero src={chapterImage} alt="Zeeva and Sammy reviewing growth options and capital structure maps" />
      <p className="font-ui text-xs text-sprawl-yellow/60 uppercase tracking-widest">
        Chapter 03 · Partnerships
      </p>
      <h1 className="font-headline text-4xl uppercase tracking-tight text-gray-900 dark:text-white">
        The Partnership Forge
      </h1>
      <p className="font-body text-gray-700 dark:text-gray-300">
        Zeeva's technical vision is hitting a logistics wall. She meets Sammy to negotiate a
        permanent alliance. But in the Sprawl, your words carry weight you might not intend.
        Identify the legal triggers that form an accidental partnership under RUPA ss 202, then
        trace the consequences.
      </p>
      <p className="font-ui text-xs text-gray-500">
        Why this chapter matters now: agency authority from Chapter 02 becomes far more dangerous once
        a partnership exists — every partner can bind the firm, and all partners share unlimited
        personal liability.
      </p>

      <div className="flex flex-wrap gap-2 items-center">
        <CitationChip citation="RUPA § 202" />
        <CitationChip citation="RUPA § 301" />
        <CitationChip citation="RUPA § 306" />
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
        moduleId="ch03-partnership"
        factsOverride={{
          entityForm: "Accidental general partnership (under analysis)",
          controlPosture: "Equal co-ownership; each partner can bind the firm",
          boardDynamics: "No board — partners govern by default equal-vote rule (RUPA ss 401(f))",
        }}
      />

      <MatterFileCarryover
        title="Matter File Carryover (Agency -> Partnership)"
        references={["ch01-why-law", "ch02-agency"]}
      />

      {/* ============================================================ */}
      {/* PHASE 0: Redline Spotter — The Napkin Shard                  */}
      {/* ============================================================ */}

      <section className="border border-sprawl-yellow/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded bg-sprawl-bright-red flex items-center justify-center text-white font-headline text-xs">
            01
          </div>
          <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white">
            Investigation Desk: The Napkin Shard
          </h2>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded p-2 mb-2">
          <p className="font-ui text-[10px] uppercase tracking-widest text-gray-500 mb-1">
            Artifact #03-A: Sammy's words to Zeeva
          </p>
        </div>

        {/* Tome sidebar inline */}
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-2">
            <div className="bg-gray-50 dark:bg-sprawl-deep-blue/60 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <p className="font-body text-xl md:text-2xl leading-relaxed text-gray-800 dark:text-sprawl-light-blue italic select-none">
                {NAPKIN_SEGMENTS.map((seg) => {
                  if (!seg.clickable) {
                    return (
                      <span key={seg.id} className="text-gray-600 dark:text-gray-400">
                        {seg.text}
                      </span>
                    );
                  }

                  const isFound = seg.isTrigger && triggersFound.includes(seg.id);
                  const isDecoyClicked = !seg.isTrigger && state.decoyClicked?.[seg.id];

                  let segClass =
                    "cursor-pointer px-1 py-0.5 rounded transition-all inline-block ";

                  if (isFound) {
                    segClass +=
                      "bg-sprawl-yellow text-sprawl-deep-blue font-bold shadow-[0_0_12px_rgba(255,214,92,0.5)]";
                  } else if (isDecoyClicked) {
                    segClass +=
                      "bg-sprawl-bright-red/20 text-sprawl-bright-red line-through";
                  } else {
                    segClass += "hover:bg-sprawl-yellow/20 text-gray-800 dark:text-gray-200";
                  }

                  return (
                    <span
                      key={seg.id}
                      className={segClass}
                      onClick={() => handleSegmentClick(seg)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") handleSegmentClick(seg);
                      }}
                    >
                      {seg.text}
                    </span>
                  );
                })}
              </p>
            </div>

            <div className="mt-3 flex justify-between items-center">
              <p className="font-ui text-xs text-sprawl-light-blue uppercase">
                Task: Click the phrases that establish a Partnership under RUPA ss 202
              </p>
              <p className="font-ui text-xs text-white">
                Triggers found:{" "}
                <span className="text-sprawl-yellow font-bold">{triggersFound.length}</span> /{" "}
                {TRIGGER_COUNT}
              </p>
            </div>

            {/* Feedback for decoy clicks */}
            {NAPKIN_SEGMENTS.filter((s) => !s.isTrigger && s.clickable && state.decoyClicked?.[s.id]).map(
              (seg) => (
                <div
                  key={seg.id}
                  className="mt-2 border border-sprawl-bright-red/30 bg-sprawl-bright-red/10 rounded p-3"
                >
                  <p className="font-headline text-xs uppercase text-sprawl-bright-red mb-1">
                    Not a trigger: "{seg.text}"
                  </p>
                  <p className="font-body text-sm text-gray-700 dark:text-gray-300">
                    {seg.explanation}
                  </p>
                </div>
              )
            )}

            {/* Feedback for trigger finds */}
            {NAPKIN_SEGMENTS.filter((s) => s.isTrigger && triggersFound.includes(s.id)).map(
              (seg) => (
                <div
                  key={seg.id}
                  className="mt-2 border border-green-500/30 bg-green-500/10 rounded p-3"
                >
                  <p className="font-headline text-xs uppercase text-green-400 mb-1">
                    Trigger identified: {seg.triggerLabel}
                  </p>
                  <p className="font-body text-sm text-gray-700 dark:text-gray-300">
                    {seg.explanation}
                  </p>
                </div>
              )
            )}
          </div>

          {/* Tome of Law sidebar */}
          <div className="border border-sprawl-yellow/30 rounded-lg p-4 bg-sprawl-deep-blue/80">
            <p className="font-headline text-sm uppercase text-sprawl-yellow mb-3">
              Tome of Law
            </p>

            <div className="space-y-4">
              <div>
                <p className="font-ui text-[10px] uppercase tracking-widest text-sprawl-light-blue mb-1">
                  Source Authority: RUPA
                </p>
                <p className="font-headline text-sm text-white">ss 202. Formation of Partnership.</p>
                <p className="font-body text-xs text-gray-400 leading-relaxed mt-1">
                  (a) ...the association of two or more persons to carry on as{" "}
                  <strong className="text-gray-200">co-owners</strong> a business for profit forms a
                  partnership,{" "}
                  <strong className="text-gray-200">
                    whether or not the persons intend to form a partnership.
                  </strong>
                </p>
              </div>

              <div>
                <p className="font-ui text-[10px] uppercase tracking-widest text-sprawl-light-blue mb-1">
                  Key Presumption
                </p>
                <p className="font-headline text-sm text-white">
                  ss 202(c)(3) The Profit Trigger
                </p>
                <p className="font-body text-xs text-gray-400 leading-relaxed mt-1">
                  A person who receives a{" "}
                  <strong className="text-gray-200">share of the profits</strong> of a business is
                  presumed to be a partner in the business...
                </p>
              </div>

              <div className="border border-white/10 rounded p-3 bg-black/30">
                <p className="font-body text-xs italic text-sprawl-light-blue">
                  "The law treats partnerships as the 'default' setting for human cooperation for
                  profit. If you act like owners and share the wins, you are partners — with all the
                  joint and several liability that entails."
                </p>
              </div>
            </div>
          </div>
        </div>

        {allTriggersFound && state.phase === 0 && (
          <button
            onClick={() => patch({ phase: 1 })}
            className="mt-2 px-5 py-2 bg-sprawl-yellow text-sprawl-deep-blue font-headline uppercase text-xs rounded hover:bg-sprawl-yellow/80"
          >
            Triggers locked — proceed to verdict
          </button>
        )}
      </section>

      {/* ============================================================ */}
      {/* PHASE 1: Verdict Builder                                     */}
      {/* ============================================================ */}

      {state.phase >= 1 && (
        <section className="border border-sprawl-teal/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded bg-sprawl-teal flex items-center justify-center text-sprawl-deep-blue font-headline text-xs">
              02
            </div>
            <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white">
              Consolidate Verdict
            </h2>
          </div>

          <p className="font-body text-sm text-gray-600 dark:text-gray-300 mb-4">
            Complete the legal holding by filling in each blank. The statement should reflect what
            RUPA ss 202 actually requires — substance over labels.
          </p>

          <div className="bg-gray-50 dark:bg-sprawl-deep-blue/60 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-4">
            <p className="font-body text-lg md:text-xl leading-loose text-gray-700 dark:text-gray-300 italic">
              "Even though Zeeva and Sammy intended to be{" "}
              <select
                value={(state.verdictAnswers || {}).intent || ""}
                onChange={(e) => handleVerdictChange("intent", e.target.value)}
                disabled={state.verdictSubmitted && state.verdictCorrect}
                className="bg-transparent border-b-2 border-sprawl-yellow outline-none px-1 text-gray-900 dark:text-white not-italic text-sm font-headline uppercase"
              >
                {VERDICT_BLANKS[0].options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              , their agreement to share{" "}
              <select
                value={(state.verdictAnswers || {}).sharing || ""}
                onChange={(e) => handleVerdictChange("sharing", e.target.value)}
                disabled={state.verdictSubmitted && state.verdictCorrect}
                className="bg-transparent border-b-2 border-sprawl-yellow outline-none px-1 text-gray-900 dark:text-white not-italic text-sm font-headline uppercase"
              >
                {VERDICT_BLANKS[1].options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>{" "}
              and operate as{" "}
              <select
                value={(state.verdictAnswers || {}).operating || ""}
                onChange={(e) => handleVerdictChange("operating", e.target.value)}
                disabled={state.verdictSubmitted && state.verdictCorrect}
                className="bg-transparent border-b-2 border-sprawl-yellow outline-none px-1 text-gray-900 dark:text-white not-italic text-sm font-headline uppercase"
              >
                {VERDICT_BLANKS[2].options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>{" "}
              forms a{" "}
              <select
                value={(state.verdictAnswers || {}).forms || ""}
                onChange={(e) => handleVerdictChange("forms", e.target.value)}
                disabled={state.verdictSubmitted && state.verdictCorrect}
                className="bg-transparent border-b-2 border-sprawl-yellow outline-none px-1 text-gray-900 dark:text-white not-italic text-sm font-headline uppercase"
              >
                {VERDICT_BLANKS[3].options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>{" "}
              by default. Intent is{" "}
              <select
                value={(state.verdictAnswers || {}).intentrule || ""}
                onChange={(e) => handleVerdictChange("intentrule", e.target.value)}
                disabled={state.verdictSubmitted && state.verdictCorrect}
                className="bg-transparent border-b-2 border-sprawl-yellow outline-none px-1 text-gray-900 dark:text-white not-italic text-sm font-headline uppercase"
              >
                {VERDICT_BLANKS[4].options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>{" "}
              under RUPA ss 202."
            </p>
          </div>

          {/* Verdict result feedback */}
          {state.verdictSubmitted && (
            <div
              className={`rounded-lg p-4 mb-4 border ${
                state.verdictCorrect
                  ? "border-green-500/30 bg-green-500/10"
                  : "border-sprawl-bright-red/30 bg-sprawl-bright-red/10"
              }`}
            >
              <p className="font-headline text-sm uppercase mb-1">
                {state.verdictCorrect ? "Verdict Confirmed" : "Verdict Rejected"}
              </p>
              <p className="font-body text-sm text-gray-700 dark:text-gray-300">
                {state.verdictCorrect
                  ? "Correct. Under RUPA ss 202, the objective facts of co-ownership and profit-sharing override any subjective intent to remain solo freelancers. Zeeva and Sammy are now partners, and their personal assets are fully exposed to business liabilities."
                  : "Re-read the Tome of Law. The two core elements are (1) carrying on as co-owners of a business and (2) for profit. Intent to form a partnership is irrelevant — conduct controls. Try again."}
              </p>
            </div>
          )}

          {!state.verdictSubmitted && (
            <button
              disabled={!allVerdictFilled}
              onClick={submitVerdict}
              className="px-5 py-2 bg-sprawl-bright-red text-white font-headline uppercase text-xs rounded hover:bg-sprawl-bright-red/80 disabled:opacity-40"
            >
              Upload verdict
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
      {/* PHASE 2: Liability Consequences                              */}
      {/* ============================================================ */}

      {state.phase >= 2 && (
        <section className="border border-sprawl-yellow/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded bg-sprawl-yellow flex items-center justify-center text-sprawl-deep-blue font-headline text-xs">
              03
            </div>
            <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white">
              Trace the Consequences
            </h2>
          </div>

          <p className="font-body text-sm text-gray-600 dark:text-gray-300 mb-2">
            Now that a general partnership exists, every partner is an agent of the partnership
            (RUPA ss 301) and all partners share <strong>joint and several liability</strong> (RUPA ss 306).
            Explore what this means in practice by examining each scenario.
          </p>
          <p className="font-ui text-xs text-gray-500 mb-4">
            Check each scenario after reading the analysis to confirm understanding.
          </p>

          <div className="space-y-4">
            {LIABILITY_SCENARIOS.map((scenario) => {
              const checked = state.liabilityChecked?.[scenario.id];
              return (
                <div
                  key={scenario.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!checked}
                      onChange={(e) =>
                        patch({
                          liabilityChecked: {
                            ...(state.liabilityChecked || {}),
                            [scenario.id]: e.target.checked,
                          },
                        })
                      }
                      className="mt-1"
                    />
                    <div>
                      <p className="font-body text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {scenario.label}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-1 mb-2">
                        <span className="font-ui text-[10px] uppercase tracking-wider text-sprawl-teal bg-sprawl-teal/10 px-2 py-0.5 rounded">
                          {scenario.problem}
                        </span>
                        <span className="font-ui text-[10px] uppercase tracking-wider text-sprawl-yellow bg-sprawl-yellow/10 px-2 py-0.5 rounded">
                          {scenario.rupaSection}
                        </span>
                      </div>
                      <p className="font-body text-sm text-gray-600 dark:text-gray-400">
                        {scenario.explanation}
                      </p>
                    </div>
                  </label>
                </div>
              );
            })}
          </div>

          {state.phase === 2 && (
            <button
              onClick={() => patch({ phase: 3 })}
              className="mt-4 px-5 py-2 bg-sprawl-yellow text-sprawl-deep-blue font-headline uppercase text-xs rounded hover:bg-sprawl-yellow/80"
            >
              Proceed to counsel note
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
            Draft a note to ConstructEdge's file explaining the partnership formation risk, its
            consequences, and what counsel would recommend to protect the founders going forward.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
              <p className="font-ui text-xs uppercase tracking-wider text-gray-500 mb-2">
                Consider addressing
              </p>
              <ul className="list-disc list-inside font-body text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>Why did the partnership form despite no formal agreement?</li>
                <li>What personal liability risks exist under RUPA ss 306?</li>
                <li>Should the founders formalize with a partnership agreement or choose a different entity?</li>
                <li>What governance defaults (RUPA ss 401) apply and are they adequate?</li>
              </ul>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
              <p className="font-ui text-xs uppercase tracking-wider text-gray-500 mb-2">
                What opposing counsel will argue
              </p>
              <ul className="list-disc list-inside font-body text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>They were merely sharing expenses, not owning a business together</li>
                <li>No partnership agreement was ever signed</li>
                <li>Profit sharing was an incentive, not ownership</li>
                <li>Neither party intended to be jointly and severally liable</li>
              </ul>
            </div>
          </div>

          <textarea
            value={state.counselNote || ""}
            onChange={(e) => patch({ counselNote: e.target.value })}
            placeholder="Draft your counsel note: analyze formation, identify risks, and recommend next steps for ConstructEdge's founders..."
            className="w-full min-h-36 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-sprawl-deep-blue/70 p-3 font-body text-sm text-gray-800 dark:text-gray-200"
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              disabled={!state.verdictCorrect}
              onClick={() => {
                markCompleted();
                updateMatterFile(
                  "ch03-partnership",
                  summarizeModuleHeadline("ch03-partnership", {
                    verdictCorrect: state.verdictCorrect,
                    triggersFound: triggersFound.length,
                    counselNote: state.counselNote,
                  }),
                  {
                    entityForm: "Accidental general partnership (RUPA ss 202)",
                    controlPosture:
                      "Equal partner authority — each can bind the firm (RUPA ss 301)",
                  }
                );
                downloadTextFile(
                  "constructedge-partnership-formation-counsel-sheet.txt",
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

      <LifecycleHandoff moduleId="ch03-partnership" bridge={flow.bridge} />
    </div>
  );
}
