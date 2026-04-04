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
import chapterImage from "../../assets/chapters/ch05.jpg";

/* ------------------------------------------------------------------ */
/*  DATA: OA Configuration Options                                     */
/* ------------------------------------------------------------------ */

const OA_CHOICES = {
  mgmt: {
    label: "Management Structure",
    options: [
      {
        id: "member",
        label: "Member-Managed",
        subtitle: "Partnership Style (Default under ULLCA § 407)",
        stats: { zeevaControl: 50, sammyAuthority: 50, flexibility: 20 },
      },
      {
        id: "manager",
        label: "Manager-Managed",
        subtitle: "Corporate Style — Sammy as designated manager",
        stats: { zeevaControl: 20, sammyAuthority: 80, flexibility: 30 },
      },
    ],
  },
  duty: {
    label: "Fiduciary Standards",
    options: [
      {
        id: "strict",
        label: "Strict Duties",
        subtitle: "Full Loyalty / Care (ULLCA § 409 default)",
        stats: { zeevaControl: 0, sammyAuthority: 0, flexibility: 0 },
      },
      {
        id: "modified",
        label: "Modified Duties",
        subtitle: "Contractual waivers permitted (ULLCA § 110)",
        stats: { zeevaControl: 0, sammyAuthority: 0, flexibility: 40 },
      },
    ],
  },
  econ: {
    label: "Economic Allocation",
    options: [
      {
        id: "equal",
        label: "Equal Share",
        subtitle: "50/50 Split (default for per-capita allocation)",
        stats: { zeevaControl: 0, sammyAuthority: 0, flexibility: 0 },
      },
      {
        id: "pro-rata",
        label: "Pro Rata",
        subtitle: "By capital contribution — Zeeva gets more",
        stats: { zeevaControl: 10, sammyAuthority: -10, flexibility: 10 },
      },
    ],
  },
};

/* ------------------------------------------------------------------ */
/*  DATA: Verdict Builder                                              */
/* ------------------------------------------------------------------ */

const VERDICT_BLANKS = [
  {
    id: "v1",
    prompt: "The LLC leverages the...",
    options: [
      { value: "", label: "..." },
      { value: "rigidity", label: "Rigidity" },
      { value: "freedom", label: "Contractual Freedom" },
    ],
    correct: "freedom",
  },
  {
    id: "v2",
    prompt: "Under ULLCA, the primary governance document is the...",
    options: [
      { value: "", label: "..." },
      { value: "oa", label: "Operating Agreement" },
      { value: "charter", label: "Charter" },
    ],
    correct: "oa",
  },
  {
    id: "v3",
    prompt: "The OA is the primary source of...",
    options: [
      { value: "", label: "..." },
      { value: "debt", label: "Debt" },
      { value: "governance", label: "Governance" },
    ],
    correct: "governance",
  },
  {
    id: "v4",
    prompt: "Making the LLC a true...",
    options: [
      { value: "", label: "..." },
      { value: "hybrid", label: "Hybrid" },
      { value: "monolith", label: "Monolith" },
    ],
    correct: "hybrid",
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function computeStats(oaConfig) {
  let zeevaControl = 50;
  let sammyAuthority = 50;
  let flexibility = 20;

  for (const category of Object.keys(OA_CHOICES)) {
    const chosen = oaConfig[category];
    const opt = OA_CHOICES[category].options.find((o) => o.id === chosen);
    if (opt) {
      zeevaControl += opt.stats.zeevaControl;
      sammyAuthority += opt.stats.sammyAuthority;
      flexibility += opt.stats.flexibility;
    }
  }
  return {
    zeevaControl: Math.max(0, Math.min(100, zeevaControl)),
    sammyAuthority: Math.max(0, Math.min(100, sammyAuthority)),
    flexibility: Math.max(0, Math.min(100, flexibility)),
  };
}

function mgmtLabel(val) {
  return val === "manager" ? "Manager-managed" : "Member-managed";
}

function dutyLabel(val) {
  return val === "modified" ? "Modified" : "Strict";
}

function econLabel(val) {
  return val === "pro-rata" ? "Pro Rata" : "Equal";
}

/* ------------------------------------------------------------------ */
/*  Export builder                                                     */
/* ------------------------------------------------------------------ */

function buildExportText({ oaConfig, verdictAnswers, verdictSubmitted, verdictCorrect, counselNote }) {
  const stats = computeStats(oaConfig);
  const lines = [
    "LLC GOVERNANCE ANALYSIS — COUNSEL SHEET",
    "",
    "Client: ConstructEdge (Zeeva + Sammy)",
    "Module: Chapter 05 — LLCs (The Governance Hybrid)",
    "",
    "=== OA Configuration ===",
    `Management: ${mgmtLabel(oaConfig.mgmt)}`,
    `Fiduciary Standards: ${dutyLabel(oaConfig.duty)}`,
    `Economic Allocation: ${econLabel(oaConfig.econ)}`,
    "",
    "=== Governance Matrix ===",
    `Zeeva (Member Control): ${stats.zeevaControl}%`,
    `Sammy (Agency Authority): ${stats.sammyAuthority}%`,
    `Contractual Flexibility: ${stats.flexibility}%`,
    "",
    "=== Verdict Builder ===",
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
    "- The Operating Agreement is the LLC's constitutional document (ULLCA § 110)",
    "- LLCs are member-managed by default (ULLCA § 407 / ULLCA § 301)",
    "- Fiduciary duties can be modified or restricted by OA (ULLCA § 110(d))",
    "- The LLC is a hybrid: partnership flexibility + corporate liability shield",
    "- Freedom of contract is the LLC's defining feature (ULLCA § 409)",
  ];
  return lines.join("\n");
}

/* ------------------------------------------------------------------ */
/*  Component State                                                    */
/* ------------------------------------------------------------------ */

const INITIAL_STATE = {
  phase: 0, // 0 = OA config, 1 = governance matrix review, 2 = verdict, 3 = counsel
  oaConfig: { mgmt: "member", duty: "strict", econ: "equal" },
  oaLocked: false,
  verdictAnswers: {},
  verdictSubmitted: false,
  verdictCorrect: false,
  counselNote: "",
  completed: false,
};

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function Ch05LLCs() {
  const { openTome } = useTome();
  const { state, patch, markCompleted } = useModuleProgress("ch05-llcs", INITIAL_STATE);
  const flow = MODULE_FLOW["ch05-llcs"];

  const oaConfig = state.oaConfig || INITIAL_STATE.oaConfig;
  const stats = useMemo(() => computeStats(oaConfig), [oaConfig]);

  const handleChoice = useCallback(
    (category, value) => {
      if (state.oaLocked) return;
      patch({ oaConfig: { ...oaConfig, [category]: value } });
    },
    [oaConfig, patch, state.oaLocked]
  );

  const lockOA = useCallback(() => {
    patch({ oaLocked: true, phase: 1 });
  }, [patch]);

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

  const exportText = useMemo(
    () =>
      buildExportText({
        oaConfig,
        verdictAnswers: state.verdictAnswers || {},
        verdictSubmitted: state.verdictSubmitted,
        verdictCorrect: state.verdictCorrect,
        counselNote: state.counselNote,
      }),
    [oaConfig, state.verdictAnswers, state.verdictSubmitted, state.verdictCorrect, state.counselNote]
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-6">
      <ModuleBreadcrumb chapterNum="05" title="LLCs" />
      <ChapterHero src={chapterImage} alt="Operating agreement review with Class B voting pathways on holographic display" />
      <p className="font-ui text-xs text-sprawl-yellow/60 uppercase tracking-widest">
        Chapter 05 · Limited Liability Companies
      </p>
      <h1 className="font-headline text-4xl uppercase tracking-tight text-gray-900 dark:text-white">
        The Governance Hybrid
      </h1>
      <p className="font-body text-gray-700 dark:text-gray-300">
        The partnership exposed Zeeva and Sammy to unlimited personal liability. Now they want
        structure — but not the rigid board mechanics of a corporation. The LLC offers a third way:
        corporate-type liability protection with partnership-type contractual freedom. Your task is to
        configure their Operating Agreement and understand how the LLC&apos;s governance flexibility
        creates both opportunity and risk.
      </p>
      <p className="font-ui text-xs text-gray-500">
        Why this chapter matters now: the partnership from Chapter 03 demonstrated the danger of
        default rules. The LLC lets founders write their own rules — but contractual freedom means
        every gap in the OA becomes a litigation risk.
      </p>

      <div className="flex flex-wrap gap-2 items-center">
        <CitationChip citation="ULLCA § 301" />
        <CitationChip citation="ULLCA § 409" />
        <CitationChip citation="ULLCA § 110" />
        <button
          onClick={() => openTome({ query: "ULLCA § 110" })}
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
        moduleId="ch05-llcs"
        factsOverride={{
          entityForm: "LLC (under configuration)",
          controlPosture: `${mgmtLabel(oaConfig.mgmt)} — OA defines authority allocation`,
          boardDynamics: "No board — members/managers govern per OA terms",
        }}
      />

      <MatterFileCarryover
        title="Matter File Carryover (Partnership -> LLCs)"
        references={["ch01-why-law", "ch02-agency", "ch03-partnership"]}
      />

      {/* ============================================================ */}
      {/* PHASE 0: OA Terminal — Configure the Operating Agreement      */}
      {/* ============================================================ */}

      <section className="border border-sprawl-yellow/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded bg-sprawl-bright-red flex items-center justify-center text-white font-headline text-xs">
            01
          </div>
          <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white">
            The OA Terminal: Configure the Operating Agreement
          </h2>
        </div>

        <p className="font-body text-sm text-gray-600 dark:text-gray-300 mb-4">
          Make three foundational governance choices. Each shifts the balance of power between Zeeva
          (member/architect) and Sammy (fixer/operator). The governance matrix will update in
          real-time.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {Object.entries(OA_CHOICES).map(([category, data]) => (
            <div key={category} className="space-y-3">
              <h5 className="font-headline text-xs text-gray-500 text-center uppercase tracking-wider">
                {data.label}
              </h5>
              {data.options.map((opt) => {
                const isSelected = oaConfig[category] === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleChoice(category, opt.id)}
                    disabled={state.oaLocked}
                    className={`w-full p-4 rounded-lg text-center border transition-all ${
                      isSelected
                        ? "border-sprawl-yellow bg-sprawl-yellow/5 shadow-[0_0_15px_rgba(255,214,92,0.1)]"
                        : "border-gray-200 dark:border-gray-700 bg-white/5 hover:border-sprawl-bright-blue"
                    } ${state.oaLocked ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <p className="font-ui text-sm font-bold text-gray-800 dark:text-gray-200">
                      {opt.label}
                    </p>
                    <p className="font-ui text-[10px] text-gray-400 mt-1">{opt.subtitle}</p>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Governance Matrix */}
        <div className="bg-gray-50 dark:bg-sprawl-deep-blue/60 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h4 className="font-headline text-lg uppercase text-sprawl-yellow mb-4">
            Governance Matrix
          </h4>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between font-ui text-xs mb-1">
                <span className="text-gray-600 dark:text-gray-300">Zeeva (Member Control)</span>
                <span className="text-sprawl-yellow font-bold">{stats.zeevaControl}%</span>
              </div>
              <div className="h-1 rounded bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div
                  className="h-full bg-sprawl-yellow transition-all duration-500"
                  style={{ width: `${stats.zeevaControl}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between font-ui text-xs mb-1">
                <span className="text-gray-600 dark:text-gray-300">
                  Sammy (Agency Authority)
                </span>
                <span className="text-sprawl-bright-blue font-bold">{stats.sammyAuthority}%</span>
              </div>
              <div className="h-1 rounded bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div
                  className="h-full bg-sprawl-bright-blue transition-all duration-500"
                  style={{ width: `${stats.sammyAuthority}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between font-ui text-xs mb-1">
                <span className="text-gray-600 dark:text-gray-300">Contractual Flexibility</span>
                <span className="text-sprawl-teal font-bold">{stats.flexibility}%</span>
              </div>
              <div className="h-1 rounded bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div
                  className="h-full bg-sprawl-teal transition-all duration-500"
                  style={{ width: `${stats.flexibility}%` }}
                />
              </div>
            </div>
          </div>

          {/* Trade-off summary */}
          <div className="mt-4 grid md:grid-cols-3 gap-3">
            <div className="border border-sprawl-yellow/20 rounded p-3">
              <p className="font-ui text-[10px] uppercase tracking-wider text-sprawl-yellow mb-1">
                Control
              </p>
              <p className="font-body text-xs text-gray-600 dark:text-gray-400">
                {oaConfig.mgmt === "manager"
                  ? "Sammy as designated manager holds day-to-day authority. Zeeva retains oversight through the OA."
                  : "Both members share equal management authority. Every decision requires consensus or majority."}
              </p>
            </div>
            <div className="border border-sprawl-yellow/20 rounded p-3">
              <p className="font-ui text-[10px] uppercase tracking-wider text-sprawl-yellow mb-1">
                Authority
              </p>
              <p className="font-body text-xs text-gray-600 dark:text-gray-400">
                {oaConfig.duty === "modified"
                  ? "Modified duties give Sammy more operating room but weaken Zeeva's ability to challenge self-interested transactions."
                  : "Strict fiduciary duties apply. Self-dealing requires entire fairness analysis (cf. Gatz v. Auriga)."}
              </p>
            </div>
            <div className="border border-sprawl-yellow/20 rounded p-3">
              <p className="font-ui text-[10px] uppercase tracking-wider text-sprawl-yellow mb-1">
                Flexibility
              </p>
              <p className="font-body text-xs text-gray-600 dark:text-gray-400">
                {oaConfig.econ === "pro-rata"
                  ? "Pro-rata allocation ties economic rights to capital contribution, giving Zeeva more economic leverage."
                  : "Equal allocation mirrors partnership default. Simple but may not reflect actual contributions."}
              </p>
            </div>
          </div>
        </div>

        {!state.oaLocked && (
          <button
            onClick={lockOA}
            className="mt-4 px-5 py-2 bg-sprawl-yellow text-sprawl-deep-blue font-headline uppercase text-xs rounded hover:bg-sprawl-yellow/80"
          >
            Lock OA Configuration — Proceed to Review
          </button>
        )}
      </section>

      {/* ============================================================ */}
      {/* PHASE 1: Governance Matrix Review + Tome sidebar             */}
      {/* ============================================================ */}

      {state.phase >= 1 && (
        <section className="border border-sprawl-teal/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded bg-sprawl-teal flex items-center justify-center text-sprawl-deep-blue font-headline text-xs">
              02
            </div>
            <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white">
              Governance Review: OA as Constitution
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-4">
              <div className="bg-gray-50 dark:bg-sprawl-deep-blue/60 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <p className="font-body text-lg leading-relaxed text-gray-700 dark:text-gray-300 italic">
                  &quot;By selecting a{" "}
                  <span className="text-sprawl-yellow font-bold not-italic">
                    {mgmtLabel(oaConfig.mgmt)}
                  </span>{" "}
                  structure with{" "}
                  <span className="text-sprawl-yellow font-bold not-italic">
                    {dutyLabel(oaConfig.duty)}
                  </span>{" "}
                  fiduciary standards and{" "}
                  <span className="text-sprawl-yellow font-bold not-italic">
                    {econLabel(oaConfig.econ)}
                  </span>{" "}
                  economic allocation, ConstructEdge has exercised the LLC&apos;s core feature:
                  contractual freedom to define governance without the formality of a corporate board.&quot;
                </p>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded p-4">
                <p className="font-headline text-sm uppercase text-gray-800 dark:text-gray-200 mb-2">
                  Your OA Configuration Summary
                </p>
                <div className="grid grid-cols-3 gap-3 font-ui text-xs">
                  <div>
                    <p className="text-gray-500 uppercase">Management</p>
                    <p className="text-gray-800 dark:text-gray-200 font-bold">
                      {mgmtLabel(oaConfig.mgmt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 uppercase">Duties</p>
                    <p className="text-gray-800 dark:text-gray-200 font-bold">
                      {dutyLabel(oaConfig.duty)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 uppercase">Allocation</p>
                    <p className="text-gray-800 dark:text-gray-200 font-bold">
                      {econLabel(oaConfig.econ)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tome of Law sidebar */}
            <div className="border border-sprawl-yellow/30 rounded-lg p-4 bg-sprawl-deep-blue/80">
              <p className="font-headline text-sm uppercase text-sprawl-yellow mb-3">
                Tome of Law
              </p>
              <div className="space-y-4">
                <div>
                  <p className="font-ui text-[10px] uppercase tracking-widest text-sprawl-light-blue mb-1">
                    ULLCA ss 407 (Management)
                  </p>
                  <p className="font-body text-xs text-gray-400 leading-relaxed">
                    LLCs are{" "}
                    <strong className="text-gray-200">member-managed</strong> by default unless
                    the operating agreement specifically provides for a manager-managed structure.
                  </p>
                </div>
                <div>
                  <p className="font-ui text-[10px] uppercase tracking-widest text-sprawl-light-blue mb-1">
                    ULLCA ss 110 (Operating Agreement)
                  </p>
                  <p className="font-body text-xs text-gray-400 leading-relaxed">
                    The{" "}
                    <strong className="text-gray-200">Operating Agreement</strong> governs
                    relations among members and the company. It is the core of the LLC&apos;s
                    contractual freedom.
                  </p>
                </div>
                <div>
                  <p className="font-ui text-[10px] uppercase tracking-widest text-sprawl-light-blue mb-1">
                    ULLCA ss 409 (Fiduciary Duties)
                  </p>
                  <p className="font-body text-xs text-gray-400 leading-relaxed">
                    Members and managers owe duties of{" "}
                    <strong className="text-gray-200">loyalty and care</strong>. The OA may
                    restrict or eliminate these duties, but may not eliminate the implied covenant
                    of good faith and fair dealing.
                  </p>
                </div>
                <div className="border border-white/10 rounded p-3 bg-black/30">
                  <p className="font-body text-xs italic text-sprawl-light-blue">
                    &quot;The LLC is the dominant vehicle for closely held ventures because it
                    combines corporate-type limited liability with partnership-type flexibility
                    and the contractual freedom to define governance by private ordering.&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>

          {state.phase === 1 && (
            <button
              onClick={() => patch({ phase: 2 })}
              className="mt-4 px-5 py-2 bg-sprawl-yellow text-sprawl-deep-blue font-headline uppercase text-xs rounded hover:bg-sprawl-yellow/80"
            >
              Proceed to Verdict Builder
            </button>
          )}
        </section>
      )}

      {/* ============================================================ */}
      {/* PHASE 2: Verdict Builder                                     */}
      {/* ============================================================ */}

      {state.phase >= 2 && (
        <section className="border border-sprawl-teal/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded bg-sprawl-teal flex items-center justify-center text-sprawl-deep-blue font-headline text-xs">
              03
            </div>
            <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white">
              Finalize Agreement: Verdict Builder
            </h2>
          </div>

          <p className="font-body text-sm text-gray-600 dark:text-gray-300 mb-4">
            Complete the legal holding. Your choices in the OA Terminal shaped the governance
            structure — now articulate the doctrinal principle that makes LLCs distinctive.
          </p>

          <div className="bg-gray-50 dark:bg-sprawl-deep-blue/60 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-4">
            <p className="font-body text-lg md:text-xl leading-loose text-gray-700 dark:text-gray-300 italic">
              &quot;By selecting a{" "}
              <span className="text-sprawl-yellow font-bold not-italic">
                {mgmtLabel(oaConfig.mgmt)}
              </span>{" "}
              structure and{" "}
              <span className="text-sprawl-yellow font-bold not-italic">
                {dutyLabel(oaConfig.duty)}
              </span>{" "}
              fiduciary standards, Zeeva and Sammy have leveraged the{" "}
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
              of the LLC. Under ULLCA, this{" "}
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
              </select>{" "}
              serves as the primary source of{" "}
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
              </select>
              , proving that the LLC is a true{" "}
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
              between partnership flexibility and corporate shielding.&quot;
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
                {state.verdictCorrect ? "OA Deployed" : "Logic Loop"}
              </p>
              <p className="font-body text-sm text-gray-700 dark:text-gray-300">
                {state.verdictCorrect
                  ? "Correct. You have utilized the contractual freedom of the LLC. By drafting a custom Operating Agreement, you have balanced the governance flexibility Zeeva needed with the liability shield of the entity. The LLC combines partnership-type private ordering with corporate-type limited liability — the governance hybrid."
                  : "The analysis detects a flaw in your understanding of the LLC. Remember: the LLC is a contractual hybrid where the Operating Agreement is the primary source of governance. Contractual freedom, not rigidity, is its defining feature."}
              </p>
            </div>
          )}

          {!state.verdictSubmitted && (
            <button
              disabled={!allVerdictFilled}
              onClick={submitVerdict}
              className="px-5 py-2 bg-sprawl-bright-red text-white font-headline uppercase text-xs rounded hover:bg-sprawl-bright-red/80 disabled:opacity-40"
            >
              Sign and Deploy OA
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
            Draft a note to ConstructEdge&apos;s file explaining the LLC governance structure chosen,
            how contractual freedom was exercised, and what risks remain.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
              <p className="font-ui text-xs uppercase tracking-wider text-gray-500 mb-2">
                Consider addressing
              </p>
              <ul className="list-disc list-inside font-body text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>Why did the founders choose an LLC over a partnership or corporation?</li>
                <li>How does the OA allocate management authority (ULLCA ss 407)?</li>
                <li>What fiduciary duties apply and can they be modified (ULLCA ss 409)?</li>
                <li>What governance gaps remain in the OA that could trigger disputes?</li>
              </ul>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
              <p className="font-ui text-xs uppercase tracking-wider text-gray-500 mb-2">
                Key doctrinal points
              </p>
              <ul className="list-disc list-inside font-body text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>OA primacy: Elf Atochem — the OA binds the LLC even if it did not sign</li>
                <li>Entire fairness: Gatz v. Auriga — contractual language can impose fiduciary standards</li>
                <li>Implied covenant of good faith survives even duty waivers</li>
                <li>Dissolution risk when members deadlock without OA tie-breaker</li>
              </ul>
            </div>
          </div>

          <textarea
            value={state.counselNote || ""}
            onChange={(e) => patch({ counselNote: e.target.value })}
            placeholder="Draft your counsel note: explain the LLC governance structure, the OA choices made, and any remaining risks for ConstructEdge..."
            className="w-full min-h-36 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-sprawl-deep-blue/70 p-3 font-body text-sm text-gray-800 dark:text-gray-200"
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              disabled={!state.verdictCorrect}
              onClick={() => {
                markCompleted();
                syncModuleCompletion({ moduleId: "ch05-llcs", chapterNum: 5, chapterTitle: "LLCs", scores: { management: state.management, duties: state.duties, allocation: state.allocation }, counselNotes: state.counselNote });
                updateMatterFile(
                  "ch05-llcs",
                  summarizeModuleHeadline("ch05-llcs", {
                    oaConfig,
                    verdictCorrect: state.verdictCorrect,
                    counselNote: state.counselNote,
                  }),
                  {
                    entityForm: `LLC (${mgmtLabel(oaConfig.mgmt)}, ${dutyLabel(oaConfig.duty)} duties)`,
                    controlPosture: `${mgmtLabel(oaConfig.mgmt)} — OA governs authority allocation (ULLCA ss 407)`,
                  }
                );
                downloadTextFile(
                  "constructedge-llc-governance-counsel-sheet.txt",
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

      <LifecycleHandoff moduleId="ch05-llcs" bridge={flow.bridge} />
    </div>
  );
}
