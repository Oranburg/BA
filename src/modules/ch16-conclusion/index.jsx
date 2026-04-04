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
import chapterImage from "../../assets/chapters/ch16.jpg";

/* ------------------------------------------------------------------ */
/*  DATA: Four Problems — Solution Selection                           */
/* ------------------------------------------------------------------ */

const FOUR_PROBLEMS = [
  {
    id: "attribution",
    label: "The Problem of Attribution",
    color: "sprawl-yellow",
    options: [
      {
        id: "control",
        label: "The Control Test",
        desc: "Solving Respondeat Superior via agency status and the master-servant framework.",
        score: 60,
      },
      {
        id: "wrapper",
        label: "The Legal Wrapper",
        desc: "Using statutory entity status to attribute acts to the firm rather than individuals.",
        score: 95,
      },
    ],
  },
  {
    id: "governance",
    label: "The Problem of Governance",
    color: "sprawl-teal",
    options: [
      {
        id: "fiduciary",
        label: "The Fiduciary Shield",
        desc: "Cleansing conflicts via the Business Judgment Rule and DGCL ss 144 safe harbors.",
        score: 80,
      },
      {
        id: "franchise",
        label: "The Shareholder Franchise",
        desc: "Managing control via proxy, voting power, and the Blasius compelling justification test.",
        score: 90,
      },
    ],
  },
  {
    id: "risk",
    label: "The Problem of Risk",
    color: "sprawl-bright-red",
    options: [
      {
        id: "ll",
        label: "Limited Liability",
        desc: "Shifting enterprise failure risk to creditors through the corporate shield.",
        score: 95,
      },
      {
        id: "pref",
        label: "Liquidation Preference",
        desc: "Shifting downside risk via preferred stock stacks and waterfall mechanics.",
        score: 70,
      },
    ],
  },
  {
    id: "partitioning",
    label: "The Problem of Partitioning",
    color: "sprawl-light-blue",
    options: [
      {
        id: "shield",
        label: "Entity Shielding",
        desc: "Protecting firm assets from owner creditors through strong-form entity partitioning.",
        score: 65,
      },
      {
        id: "ipo",
        label: "Public Disclosure (IPO)",
        desc: "Scaling the partition via securities laws and mandatory disclosure regimes.",
        score: 95,
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  DATA: Final Declaration Blanks                                     */
/* ------------------------------------------------------------------ */

const DECLARATION_BLANKS = [
  {
    id: "v1",
    options: [
      { value: "", label: "..." },
      { value: "chaos", label: "A series of accidents" },
      { value: "technology", label: "A legal technology" },
    ],
    correct: "technology",
  },
  {
    id: "v2",
    options: [
      { value: "", label: "..." },
      { value: "handshake", label: "Partnership Handshake" },
      { value: "blockchain", label: "Pure Code" },
    ],
    correct: "handshake",
  },
  {
    id: "v3",
    options: [
      { value: "", label: "..." },
      { value: "monolith", label: "Corporate Monolith" },
      { value: "void", label: "Statutory Void" },
    ],
    correct: "monolith",
  },
  {
    id: "v4",
    options: [
      { value: "", label: "..." },
      { value: "marketing", label: "Marketing and HR" },
      { value: "problems", label: "The Four Problems of the Firm" },
    ],
    correct: "problems",
  },
];

/* ------------------------------------------------------------------ */
/*  Export builder                                                     */
/* ------------------------------------------------------------------ */

function buildExportText({ selections, declarationAnswers, declarationSubmitted, declarationCorrect, reflectionNote }) {
  const lines = [
    "LIFECYCLE SYNTHESIS -- FINAL COUNSEL SHEET",
    "",
    "Client: ConstructEdge (Zeeva + Sammy)",
    "Module: Chapter 16 -- Conclusion",
    "",
    "=== Four Problems Synthesis ===",
    ...FOUR_PROBLEMS.map((p) => {
      const sel = selections?.[p.id];
      const opt = p.options.find((o) => o.id === sel);
      return `  ${p.label}: ${opt ? opt.label : "Not selected"}`;
    }),
    "",
    "=== Final Declaration ===",
    `Submitted: ${declarationSubmitted ? "Yes" : "No"}`,
    `Correct: ${declarationCorrect ? "Yes" : "No"}`,
    ...DECLARATION_BLANKS.map((b) => `  ${b.id}: ${declarationAnswers?.[b.id] || "unanswered"} (correct: ${b.correct})`),
    "",
    "=== Reflection Note ===",
    reflectionNote || "No reflection drafted.",
    "",
    "=== Course Takeaways ===",
    "- Business associations are legal technologies for coordinating human action",
    "- The Four Problems (Attribution, Governance, Risk, Partitioning) recur at every stage",
    "- Entity form, fiduciary duties, capital structure, and disclosure are interconnected tools",
    "- Law provides the architectural foundation; business strategy fills the rooms",
  ];
  return lines.join("\n");
}

/* ------------------------------------------------------------------ */
/*  Component State                                                    */
/* ------------------------------------------------------------------ */

const INITIAL_STATE = {
  phase: 0, // 0 = problem selection, 1 = declaration, 2 = reflection
  selections: {},
  declarationAnswers: {},
  declarationSubmitted: false,
  declarationCorrect: false,
  reflectionNote: "",
  completed: false,
};

/* ------------------------------------------------------------------ */
/*  Firm Integrity Display (CSS-based radar alternative)               */
/* ------------------------------------------------------------------ */

function FirmIntegrityDisplay({ selections }) {
  const scores = FOUR_PROBLEMS.map((p) => {
    const sel = selections?.[p.id];
    const opt = p.options.find((o) => o.id === sel);
    return { label: p.label.replace("The Problem of ", ""), score: opt?.score || 20, color: p.color };
  });

  const avgScore = Math.round(scores.reduce((a, s) => a + s.score, 0) / scores.length);
  const allSelected = FOUR_PROBLEMS.every((p) => selections?.[p.id]);

  return (
    <div className="border border-gray-700 rounded-lg p-6 bg-black/30">
      <div className="flex justify-between items-center mb-4">
        <p className="font-headline text-sm uppercase text-sprawl-yellow">Firm Integrity HUD</p>
        <p className="font-ui text-sm text-gray-400">
          Synthesis Score: <span className="text-white font-bold">{avgScore}%</span>
        </p>
      </div>

      <div className="space-y-3">
        {scores.map((s) => (
          <div key={s.label}>
            <div className="flex justify-between mb-1">
              <p className={`font-ui text-xs uppercase text-${s.color}`}>{s.label}</p>
              <p className="font-ui text-sm text-gray-400">{s.score}%</p>
            </div>
            <div className="h-4 rounded bg-gray-800 overflow-hidden border border-gray-700">
              <div
                className={`h-full bg-${s.color} transition-all duration-700 rounded`}
                style={{ width: `${s.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-center">
        <p className="font-body text-sm text-gray-400">
          {allSelected
            ? "Synthesis analysis complete. The firm has successfully matured through all four lifecycle bottlenecks."
            : "Select solutions above to visualize the legal integrity of the firm."}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function Ch16Conclusion() {
  const { openTome } = useTome();
  const { state, patch, markCompleted } = useModuleProgress("ch16-conclusion", INITIAL_STATE);
  const flow = MODULE_FLOW["ch16-conclusion"];

  const selections = useMemo(() => state.selections || {}, [state.selections]);
  const allProblemsSelected = FOUR_PROBLEMS.every((p) => selections[p.id]);

  const handleSolutionSelect = useCallback(
    (problemId, optionId) => {
      const next = { ...selections, [problemId]: optionId };
      patch({ selections: next });
      // Auto-advance to declaration when all four selected
      const allDone = FOUR_PROBLEMS.every((p) => next[p.id]);
      if (allDone) {
        patch({ phase: Math.max(state.phase, 1) });
      }
    },
    [selections, patch, state.phase]
  );

  const handleDeclarationChange = useCallback(
    (id, value) => {
      patch({ declarationAnswers: { ...(state.declarationAnswers || {}), [id]: value } });
    },
    [patch, state.declarationAnswers]
  );

  const submitDeclaration = useCallback(() => {
    const answers = state.declarationAnswers || {};
    const allCorrect = DECLARATION_BLANKS.every((b) => answers[b.id] === b.correct);
    patch({ declarationSubmitted: true, declarationCorrect: allCorrect });
    if (allCorrect) {
      patch({ phase: 2 });
    }
  }, [patch, state.declarationAnswers]);

  const allDeclarationFilled = DECLARATION_BLANKS.every((b) => (state.declarationAnswers || {})[b.id]);

  const exportText = useMemo(
    () =>
      buildExportText({
        selections,
        declarationAnswers: state.declarationAnswers || {},
        declarationSubmitted: state.declarationSubmitted,
        declarationCorrect: state.declarationCorrect,
        reflectionNote: state.reflectionNote,
      }),
    [selections, state.declarationAnswers, state.declarationSubmitted, state.declarationCorrect, state.reflectionNote]
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-6">
      <ModuleBreadcrumb chapterNum="16" title="Conclusion" />
      <ChapterHero src={chapterImage} alt="Zeeva overlooking New Boston skyline — Synthesis and the Mature Enterprise" />
      <p className="font-ui text-xs text-sprawl-yellow/60 uppercase tracking-widest">
        Chapter 16 · Conclusion
      </p>
      <h1 className="font-headline text-4xl uppercase tracking-tight text-gray-900 dark:text-white">
        Lifecycle Synthesis
      </h1>
      <p className="font-body text-gray-700 dark:text-gray-300">
        Zeeva looks down from the Sector 7 Sky-Tower. The partnership handshake, the entity
        selection, the board process, the IPO disclosure — it was all part of the same
        architectural blueprint. Now synthesize the legal technologies you have deployed across
        the Four Problems and declare your final understanding of the firm as a legal technology.
      </p>
      <p className="font-ui text-sm text-gray-500">
        This is the final module. Every chapter has built toward this synthesis: the firm is an
        artificial person constructed from statutes and contracts to solve the four recurring
        problems of human coordination for profit.
      </p>

      <div className="flex flex-wrap gap-2 items-center">
        <CitationChip citation="DGCL § 141(a)" />
        <CitationChip citation="RUPA § 202" />
        <CitationChip citation="Securities Act § 11" />
        <button
          onClick={() => openTome({ query: "DGCL § 141" })}
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
        moduleId="ch16-conclusion"
        factsOverride={{
          entityForm: "Public Delaware C-Corp (full lifecycle)",
          controlPosture: "Public company with board, investor, and shareholder constituencies",
          boardDynamics: "Full fiduciary framework active; enhanced scrutiny tested",
          financingPosture: "Post-IPO; public markets and creditor relationships",
          strategicPressure: "M&A pressure resolved; operational phase",
          transactionContext: "Lifecycle complete: formation through public status",
          residualClaimantPosture: "Equity and debt constituencies balanced",
        }}
      />

      <MatterFileCarryover
        title="Matter File Carryover (Full Lifecycle)"
        references={[
          "ch01-why-law", "ch02-agency", "ch03-partnership",
          "ch08-entity-selection", "ch09-fiduciary-duties",
          "ch10-staying-private", "ch11-going-public",
          "ch12-shareholder-franchise", "ch13-m-and-a", "ch15-capital-structure",
        ]}
      />

      {/* ============================================================ */}
      {/* PHASE 0: Four Problems Selection                              */}
      {/* ============================================================ */}

      <section className="border border-sprawl-yellow/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded bg-sprawl-bright-red flex items-center justify-center text-white font-headline text-xs">
            01
          </div>
          <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white">
            Reviewing the Four Problems
          </h2>
        </div>

        <p className="font-body text-sm text-gray-600 dark:text-gray-300 mb-4">
          Synthesize the legal solutions deployed throughout ConstructEdge's journey. For each of
          the Four Problems, select the legal technology you would recommend as the optimal
          solution based on everything you have learned.
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {FOUR_PROBLEMS.map((problem) => (
            <div key={problem.id} className="space-y-2">
              <h5 className={`font-headline text-xs uppercase text-${problem.color}`}>
                {problem.label}
              </h5>
              {problem.options.map((opt) => {
                const isSelected = selections[problem.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSolutionSelect(problem.id, opt.id)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      isSelected
                        ? `border-sprawl-yellow bg-sprawl-yellow/5 shadow-[0_0_15px_rgba(255,214,92,0.1)]`
                        : "border-gray-200 dark:border-gray-700 hover:border-sprawl-yellow/40"
                    }`}
                  >
                    <p className={`font-body text-sm font-semibold ${isSelected ? "text-white" : "text-gray-300"}`}>
                      {opt.label}
                    </p>
                    <p className="font-ui text-[10px] text-gray-400 mt-1">{opt.desc}</p>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Firm Integrity Display */}
        <FirmIntegrityDisplay selections={selections} />

        {allProblemsSelected && state.phase === 0 && (
          <button
            onClick={() => patch({ phase: 1 })}
            className="mt-4 px-5 py-2 bg-sprawl-yellow text-sprawl-deep-blue font-headline uppercase text-xs rounded hover:bg-sprawl-yellow/80"
          >
            All problems addressed — proceed to final declaration
          </button>
        )}
      </section>

      {/* ============================================================ */}
      {/* PHASE 1: Final Declaration                                    */}
      {/* ============================================================ */}

      {state.phase >= 1 && (
        <section className="border border-sprawl-teal/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded bg-sprawl-teal flex items-center justify-center text-sprawl-deep-blue font-headline text-xs">
              02
            </div>
            <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white">
              The Final Ledger
            </h2>
          </div>

          <div className="bg-gray-50 dark:bg-sprawl-deep-blue/60 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-4">
            <p className="font-body text-lg md:text-xl leading-loose text-gray-700 dark:text-gray-300 italic">
              "Looking back at the journey from the garage to the High Towers, I realize that a
              business association is simply{" "}
              <select
                value={(state.declarationAnswers || {}).v1 || ""}
                onChange={(e) => handleDeclarationChange("v1", e.target.value)}
                disabled={state.declarationSubmitted && state.declarationCorrect}
                className="bg-transparent border-b-2 border-sprawl-yellow outline-none px-1 text-gray-900 dark:text-white not-italic text-sm font-headline uppercase"
              >
                {DECLARATION_BLANKS[0].options.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>{" "}
              built to coordinate human action. Whether using a{" "}
              <select
                value={(state.declarationAnswers || {}).v2 || ""}
                onChange={(e) => handleDeclarationChange("v2", e.target.value)}
                disabled={state.declarationSubmitted && state.declarationCorrect}
                className="bg-transparent border-b-2 border-sprawl-yellow outline-none px-1 text-gray-900 dark:text-white not-italic text-sm font-headline uppercase"
              >
                {DECLARATION_BLANKS[1].options.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>{" "}
              or a{" "}
              <select
                value={(state.declarationAnswers || {}).v3 || ""}
                onChange={(e) => handleDeclarationChange("v3", e.target.value)}
                disabled={state.declarationSubmitted && state.declarationCorrect}
                className="bg-transparent border-b-2 border-sprawl-yellow outline-none px-1 text-gray-900 dark:text-white not-italic text-sm font-headline uppercase"
              >
                {DECLARATION_BLANKS[2].options.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              , the goal remains the same: to solve the problems of{" "}
              <select
                value={(state.declarationAnswers || {}).v4 || ""}
                onChange={(e) => handleDeclarationChange("v4", e.target.value)}
                disabled={state.declarationSubmitted && state.declarationCorrect}
                className="bg-transparent border-b-2 border-sprawl-yellow outline-none px-1 text-gray-900 dark:text-white not-italic text-sm font-headline uppercase"
              >
                {DECLARATION_BLANKS[3].options.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              . The architecture holds because the law provides the foundation."
            </p>
          </div>

          {state.declarationSubmitted && (
            <div
              className={`rounded-lg p-4 mb-4 border ${
                state.declarationCorrect
                  ? "border-green-500/30 bg-green-500/10"
                  : "border-sprawl-bright-red/30 bg-sprawl-bright-red/10"
              }`}
            >
              <p className="font-headline text-sm uppercase mb-1">
                {state.declarationCorrect ? "Lifecycle Complete" : "Analysis Error"}
              </p>
              <p className="font-body text-sm text-gray-700 dark:text-gray-300">
                {state.declarationCorrect
                  ? "Zeeva and Sammy have reached the pinnacle of the firm. You have successfully navigated 16 chapters of Business Associations, applying the law as a coordinative technology from the garage to the boardroom. The architectural blueprints are secured."
                  : "The archive identifies a logic loop in your final synthesis. Business law is the technology of coordination. Re-read the declaration and consider how each entity form solves the Four Problems."}
              </p>
            </div>
          )}

          {!state.declarationSubmitted && (
            <button
              disabled={!allDeclarationFilled}
              onClick={submitDeclaration}
              className="px-5 py-2 bg-sprawl-bright-red text-white font-headline uppercase text-xs rounded hover:bg-sprawl-bright-red/80 disabled:opacity-40"
            >
              Upload Final Synthesis to Archive
            </button>
          )}

          {state.declarationSubmitted && !state.declarationCorrect && (
            <button
              onClick={() => patch({ declarationSubmitted: false })}
              className="px-5 py-2 bg-sprawl-yellow text-sprawl-deep-blue font-headline uppercase text-xs rounded hover:bg-sprawl-yellow/80"
            >
              Revise and resubmit
            </button>
          )}
        </section>
      )}

      {/* ============================================================ */}
      {/* PHASE 2: Final Reflection + Export                           */}
      {/* ============================================================ */}

      {state.phase >= 2 && (
        <section className="border border-sprawl-yellow/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded bg-sprawl-light-blue flex items-center justify-center text-sprawl-deep-blue font-headline text-xs">
              03
            </div>
            <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white">
              Final Reflection
            </h2>
          </div>

          <p className="font-body text-sm text-gray-600 dark:text-gray-300 mb-4">
            Write a final reflection on the course. What did you learn about the firm as a legal
            technology? How do the Four Problems connect across entity forms and lifecycle stages?
          </p>

          <div className="border border-gray-200 dark:border-gray-700 rounded p-3 mb-4">
            <p className="font-ui text-xs uppercase tracking-wider text-gray-500 mb-2">
              The journey in review
            </p>
            <ul className="list-disc list-inside font-body text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li>Ch 01-03: From agency authority to accidental partnership to unlimited liability</li>
              <li>Ch 08-09: Entity selection and fiduciary duty architecture</li>
              <li>Ch 10-11: Venture capital preference stacks and IPO disclosure regimes</li>
              <li>Ch 12-13: Shareholder franchise contests and M&A enhanced scrutiny</li>
              <li>Ch 15: Capital structure distress and creditor priority</li>
              <li>Ch 16: The firm as a legal technology for solving the Four Problems</li>
            </ul>
          </div>

          <textarea
            value={state.reflectionNote || ""}
            onChange={(e) => patch({ reflectionNote: e.target.value })}
            placeholder="Write your final reflection: What is the firm? How do the Four Problems recur across every stage of the lifecycle? What surprised you?"
            className="w-full min-h-36 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-sprawl-deep-blue/70 p-3 font-body text-sm text-gray-800 dark:text-gray-200"
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              disabled={!state.declarationCorrect}
              onClick={() => {
                markCompleted();
                syncModuleCompletion({ moduleId: "ch16-conclusion", chapterNum: 16, chapterTitle: "Conclusion", scores: { selections: state.selections, synthesisCorrect: state.synthesisChecked }, counselNotes: state.reflectionNote });
                updateMatterFile(
                  "ch16-conclusion",
                  summarizeModuleHeadline("ch16-conclusion", {
                    selectionsComplete: allProblemsSelected,
                    declarationCorrect: state.declarationCorrect,
                    reflectionNote: state.reflectionNote,
                  }),
                  {
                    transactionContext: "Lifecycle synthesis complete",
                  }
                );
                downloadTextFile(
                  "constructedge-lifecycle-synthesis-final-sheet.txt",
                  exportText
                );
              }}
              className="px-5 py-2 bg-sprawl-yellow text-sprawl-deep-blue font-headline uppercase text-xs rounded hover:bg-sprawl-yellow/80 disabled:opacity-40"
            >
              Complete Course + Export Final Synthesis
            </button>
          </div>
        </section>
      )}

      <LifecycleHandoff moduleId="ch16-conclusion" bridge={flow.bridge} />
    </div>
  );
}
