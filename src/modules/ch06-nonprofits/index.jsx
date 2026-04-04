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
import chapterImage from "../../assets/chapters/ch06.jpg";

/* ------------------------------------------------------------------ */
/*  DATA: Capital Allocation Exercise                                   */
/* ------------------------------------------------------------------ */

const EXPENDITURES = [
  {
    id: "e1",
    label: "Staff salaries for program coordinators",
    correct: "mission",
    explanation:
      "Reasonable compensation for staff performing charitable work is a permissible mission-aligned expenditure under IRC \u00A7 501(c)(3).",
  },
  {
    id: "e2",
    label: "Founder bonus paid from annual surplus",
    correct: "private",
    explanation:
      "Distributing surplus to founders violates the nondistribution constraint. This is classic private inurement prohibited by IRC \u00A7 501(c)(3) and MNCA \u00A7 13.01.",
  },
  {
    id: "e3",
    label: "Expansion of the Uplift Initiative into Sector 7",
    correct: "mission",
    explanation:
      "Program expansion directly serves the charitable mission. Reinvesting surplus into mission-aligned activities is exactly what the nondistribution constraint requires.",
  },
  {
    id: "e4",
    label: "Luxury office renovation for the board of directors",
    correct: "private",
    explanation:
      "Lavish expenditures benefiting insiders constitute private benefit. Treasury Reg \u00A7 1.501(c)(3)-1 requires that no part of net earnings inure to the benefit of private individuals.",
  },
  {
    id: "e5",
    label: "Technology upgrades for blueprint distribution systems",
    correct: "mission",
    explanation:
      "Infrastructure supporting the charitable mission is a permissible expenditure. Operational costs that advance the exempt purpose satisfy the operational test.",
  },
];

/* ------------------------------------------------------------------ */
/*  DATA: Verdict Builder                                              */
/* ------------------------------------------------------------------ */

const VERDICT_BLANKS = [
  {
    id: "v1",
    prompt: "The nondistribution constraint solves the problem of...",
    options: [
      { value: "", label: "..." },
      { value: "scaling", label: "Scaling" },
      { value: "trust", label: "Contract Failure (Trust)" },
    ],
    correct: "trust",
  },
  {
    id: "v2",
    prompt: "To qualify, the entity must adopt the...",
    options: [
      { value: "", label: "..." },
      { value: "constraint", label: "Nondistribution Constraint" },
      { value: "dividend", label: "Dividend Mandate" },
    ],
    correct: "constraint",
  },
  {
    id: "v3",
    prompt: "The entity may still generate a...",
    options: [
      { value: "", label: "..." },
      { value: "loss", label: "Loss" },
      { value: "surplus", label: "Profit (Surplus)" },
    ],
    correct: "surplus",
  },
  {
    id: "v4",
    prompt: "But those funds must be retained for...",
    options: [
      { value: "", label: "..." },
      { value: "founders", label: "Zeeva & Sammy" },
      { value: "mission", label: "The Entity's Mission" },
    ],
    correct: "mission",
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function entityLabel(type) {
  return type === "nonprofit" ? "Nonprofit Corp" : "For-Profit Corp";
}

function computeFlows(entityType, constraintActive) {
  if (entityType === "nonprofit" && constraintActive) {
    return { program: 100000, founders: 0, trustLevel: "secure" };
  }
  return { program: 50000, founders: 50000, trustLevel: "critical" };
}

/* ------------------------------------------------------------------ */
/*  Export builder                                                     */
/* ------------------------------------------------------------------ */

function buildExportText({
  entityType,
  constraintActive,
  classifications,
  classificationScore,
  verdictAnswers,
  verdictSubmitted,
  verdictCorrect,
  counselNote,
}) {
  const flows = computeFlows(entityType, constraintActive);
  const lines = [
    "NONPROFIT GOVERNANCE ANALYSIS \u2014 COUNSEL SHEET",
    "",
    "Client: ConstructEdge Uplift Initiative (Zeeva + Sammy)",
    "Module: Chapter 06 \u2014 Nonprofits (The Nondistribution Constraint)",
    "",
    "=== Entity Configuration ===",
    `Entity Type: ${entityLabel(entityType)}`,
    `Nondistribution Constraint: ${constraintActive ? "ACTIVE" : "INACTIVE"}`,
    `Programs Allocation: $${flows.program.toLocaleString()}`,
    `Founder Distributions: $${flows.founders.toLocaleString()}`,
    `Donor Trust Level: ${flows.trustLevel === "secure" ? "SECURE" : "CRITICAL FAILURE"}`,
    "",
    "=== Capital Allocation Exercise ===",
    `Score: ${classificationScore} / ${EXPENDITURES.length}`,
    ...EXPENDITURES.map(
      (e) =>
        `  ${e.label}: ${classifications?.[e.id] || "unclassified"} (correct: ${e.correct === "mission" ? "Mission-Aligned" : "Private Benefit"})`
    ),
    "",
    "=== Verdict Builder ===",
    `Verdict submitted: ${verdictSubmitted ? "Yes" : "No"}`,
    `Verdict correct: ${verdictCorrect ? "Yes" : "No"}`,
    ...VERDICT_BLANKS.map(
      (b) =>
        `  ${b.prompt} ${verdictAnswers?.[b.id] || "unanswered"} (correct: ${b.correct})`
    ),
    "",
    "=== Counsel Recommendation ===",
    counselNote || "No counsel recommendation drafted.",
    "",
    "=== Key Takeaways ===",
    "- Hansmann's nondistribution constraint: nonprofits cannot distribute surplus to controllers",
    "- The constraint solves contract failure: donors trust funds go to mission, not insiders",
    "- IRC \u00A7 501(c)(3): tax exemption requires exclusive charitable purpose",
    "- MNCA \u00A7 13.01: distributions to members/directors prohibited",
    "- Treasury Reg \u00A7 1.501(c)(3)-1: organizational and operational tests",
    "- Private inurement and private benefit are distinct but related prohibitions",
  ];
  return lines.join("\n");
}

/* ------------------------------------------------------------------ */
/*  Component State                                                    */
/* ------------------------------------------------------------------ */

const INITIAL_STATE = {
  phase: 0, // 0 = doctrine + constraint toggle, 1 = capital allocation, 2 = verdict, 3 = counsel
  entityType: "forprofit",
  constraintActive: false,
  constraintLocked: false,
  classifications: {},
  classificationLocked: false,
  classificationScore: 0,
  verdictAnswers: {},
  verdictSubmitted: false,
  verdictCorrect: false,
  counselNote: "",
  completed: false,
};

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function Ch06Nonprofits() {
  const { openTome } = useTome();
  const { state, patch, markCompleted } = useModuleProgress(
    "ch06-nonprofits",
    INITIAL_STATE
  );
  const flow = MODULE_FLOW["ch06-nonprofits"];

  const entityType = state.entityType || INITIAL_STATE.entityType;
  const constraintActive = state.constraintActive || false;
  const flows = useMemo(
    () => computeFlows(entityType, constraintActive),
    [entityType, constraintActive]
  );

  const classifications = useMemo(() => state.classifications || {}, [state.classifications]);

  const handleEntityToggle = useCallback(
    (type) => {
      if (state.constraintLocked) return;
      patch({ entityType: type });
    },
    [patch, state.constraintLocked]
  );

  const handleConstraintToggle = useCallback(() => {
    if (state.constraintLocked) return;
    patch({ constraintActive: !constraintActive });
  }, [patch, constraintActive, state.constraintLocked]);

  const lockConstraint = useCallback(() => {
    if (entityType !== "nonprofit" || !constraintActive) return;
    patch({ constraintLocked: true, phase: 1 });
  }, [patch, entityType, constraintActive]);

  const handleClassify = useCallback(
    (expenditureId, classification) => {
      if (state.classificationLocked) return;
      patch({
        classifications: { ...classifications, [expenditureId]: classification },
      });
    },
    [patch, classifications, state.classificationLocked]
  );

  const allClassified = EXPENDITURES.every((e) => classifications[e.id]);

  const lockClassifications = useCallback(() => {
    const score = EXPENDITURES.filter(
      (e) => classifications[e.id] === e.correct
    ).length;
    patch({ classificationLocked: true, classificationScore: score, phase: 2 });
  }, [patch, classifications]);

  const handleVerdictChange = useCallback(
    (blankId, value) => {
      patch({
        verdictAnswers: { ...(state.verdictAnswers || {}), [blankId]: value },
      });
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

  const allVerdictFilled = VERDICT_BLANKS.every(
    (b) => (state.verdictAnswers || {})[b.id]
  );

  const counselReady =
    state.verdictCorrect && (state.counselNote || "").length >= 20;

  const exportText = useMemo(
    () =>
      buildExportText({
        entityType,
        constraintActive,
        classifications,
        classificationScore: state.classificationScore,
        verdictAnswers: state.verdictAnswers || {},
        verdictSubmitted: state.verdictSubmitted,
        verdictCorrect: state.verdictCorrect,
        counselNote: state.counselNote,
      }),
    [
      entityType,
      constraintActive,
      classifications,
      state.classificationScore,
      state.verdictAnswers,
      state.verdictSubmitted,
      state.verdictCorrect,
      state.counselNote,
    ]
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-6">
      <ModuleBreadcrumb chapterNum="06" title="Nonprofits" />
      <ChapterHero
        src={chapterImage}
        alt="Nonprofit charter filing with nondistribution constraint seal on holographic ledger"
      />
      <p className="font-ui text-xs text-sprawl-yellow/60 uppercase tracking-widest">
        Chapter 06 &middot; Nonprofits
      </p>
      <h1 className="font-headline text-4xl uppercase tracking-tight text-gray-900 dark:text-white">
        The Nondistribution Constraint
      </h1>
      <p className="font-body text-gray-700 dark:text-gray-300">
        Zeeva wants to donate her Slum-Shield blueprints to the public. Sammy is
        soliciting donations from High Tower philanthropists. But donors face a
        trust problem: how do they know funds will reach the Low Slums instead of
        lining the founders&apos; pockets? The answer is Henry Hansmann&apos;s{" "}
        <strong>nondistribution constraint</strong> &mdash; the defining
        governance technology of nonprofit enterprise. A nonprofit may earn a
        surplus, but it may never distribute that surplus to those who control the
        organization.
      </p>
      <p className="font-ui text-xs text-gray-500">
        Why this chapter matters now: the LLC from Chapter 05 gave founders
        contractual freedom to distribute profits however they chose. The
        nonprofit inverts that premise &mdash; the law prohibits distributions
        entirely, and that prohibition is what makes donors willing to give.
      </p>

      <div className="flex flex-wrap gap-2 items-center">
        <CitationChip citation="IRC &sect; 501(c)(3)" />
        <CitationChip citation="MNCA &sect; 13.01" />
        <button
          onClick={() => openTome({ query: "IRC 501(c)(3)" })}
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
        moduleId="ch06-nonprofits"
        factsOverride={{
          entityForm: `Nonprofit Corp (${constraintActive ? "constraint active" : "constraint inactive"})`,
          controlPosture:
            "Mission-locked governance \u2014 nondistribution constraint bars founder distributions",
          boardDynamics:
            "Nonprofit board \u2014 fiduciary duty runs to the mission, not to equity holders",
        }}
      />

      <MatterFileCarryover
        title="Matter File Carryover (LLCs \u2192 Nonprofits)"
        references={[
          "ch01-why-law",
          "ch02-agency",
          "ch03-partnership",
          "ch05-llcs",
        ]}
      />

      {/* ============================================================ */}
      {/* PHASE 0: Doctrine Primer + Constraint Toggle                  */}
      {/* ============================================================ */}

      <section className="border border-sprawl-yellow/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded bg-sprawl-bright-red flex items-center justify-center text-white font-headline text-xs">
            01
          </div>
          <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white">
            The Constraint HUD: For-Profit vs. Nonprofit
          </h2>
        </div>

        {/* Doctrine Primer */}
        <div className="bg-gray-50 dark:bg-sprawl-deep-blue/60 border border-gray-200 dark:border-gray-700 rounded-lg p-5 mb-6">
          <p className="font-headline text-sm uppercase text-sprawl-yellow mb-3">
            Hansmann&apos;s Nondistribution Constraint
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <p className="font-body text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                A nonprofit is defined not by its inability to earn a profit, but
                by its{" "}
                <strong className="text-sprawl-yellow">
                  prohibition on distributing
                </strong>{" "}
                that profit to those who control the organization. Nonprofits may
                generate surplus &mdash; they simply cannot pay it out as
                dividends, bonuses, or other distributions to members, officers,
                or directors.
              </p>
              <p className="font-body text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                This constraint solves a{" "}
                <strong>contract failure problem</strong>: when patrons (donors,
                grantors, service recipients) cannot easily verify the quality or
                use of services, they trust the nonprofit form because insiders
                have no financial incentive to cut corners.
              </p>
            </div>
            <div className="border border-sprawl-yellow/20 rounded p-4 space-y-3">
              <div>
                <p className="font-ui text-[10px] uppercase tracking-widest text-sprawl-light-blue mb-1">
                  IRC &sect; 501(c)(3)
                </p>
                <p className="font-body text-xs text-gray-400 leading-relaxed">
                  Tax exemption requires organization{" "}
                  <strong className="text-gray-200">
                    exclusively for charitable purposes
                  </strong>
                  . No part of net earnings may inure to the benefit of any
                  private shareholder or individual.
                </p>
              </div>
              <div>
                <p className="font-ui text-[10px] uppercase tracking-widest text-sprawl-light-blue mb-1">
                  MNCA &sect; 13.01
                </p>
                <p className="font-body text-xs text-gray-400 leading-relaxed">
                  Distributions to members, directors, or officers are{" "}
                  <strong className="text-gray-200">prohibited</strong> except as
                  authorized upon dissolution.
                </p>
              </div>
              <div>
                <p className="font-ui text-[10px] uppercase tracking-widest text-sprawl-light-blue mb-1">
                  Treas. Reg. &sect; 1.501(c)(3)-1
                </p>
                <p className="font-body text-xs text-gray-400 leading-relaxed">
                  The <strong className="text-gray-200">organizational test</strong>{" "}
                  (charter must limit purposes) and{" "}
                  <strong className="text-gray-200">operational test</strong>{" "}
                  (activities must further exempt purpose) must both be met.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Toggle */}
        <p className="font-body text-sm text-gray-600 dark:text-gray-300 mb-4">
          Toggle between entity types and activate the nondistribution constraint
          to see how a <strong>$100,000 donation</strong> flows through each
          structure.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Entity Type Selection */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 space-y-3">
            <p className="font-headline text-xs text-gray-500 uppercase tracking-wider">
              Step 1: Select Entity Class
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleEntityToggle("forprofit")}
                disabled={state.constraintLocked}
                className={`flex-1 py-3 rounded font-ui font-bold text-xs uppercase transition-all border ${
                  entityType === "forprofit"
                    ? "border-sprawl-yellow bg-sprawl-yellow/10 text-sprawl-yellow"
                    : "border-gray-300 dark:border-gray-600 text-gray-500 hover:border-sprawl-bright-blue"
                } ${state.constraintLocked ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
              >
                For-Profit Corp
              </button>
              <button
                onClick={() => handleEntityToggle("nonprofit")}
                disabled={state.constraintLocked}
                className={`flex-1 py-3 rounded font-ui font-bold text-xs uppercase transition-all border ${
                  entityType === "nonprofit"
                    ? "border-sprawl-yellow bg-sprawl-yellow/10 text-sprawl-yellow"
                    : "border-gray-300 dark:border-gray-600 text-gray-500 hover:border-sprawl-bright-blue"
                } ${state.constraintLocked ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
              >
                Nonprofit Corp
              </button>
            </div>
          </div>

          {/* Constraint Toggle */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 space-y-3">
            <p className="font-headline text-xs text-gray-500 uppercase tracking-wider">
              Step 2: Nondistribution Valve
            </p>
            <div className="flex items-center justify-between">
              <span className="font-ui text-sm text-gray-700 dark:text-gray-300">
                Block founder distributions?
              </span>
              <button
                onClick={handleConstraintToggle}
                disabled={state.constraintLocked}
                className={`w-14 h-7 rounded-full p-1 transition-all flex items-center ${
                  constraintActive
                    ? "bg-sprawl-bright-blue justify-end"
                    : "bg-gray-300 dark:bg-gray-600 justify-start"
                } ${state.constraintLocked ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <div
                  className={`w-5 h-5 rounded-full transition-all ${
                    constraintActive ? "bg-sprawl-light-blue" : "bg-gray-500"
                  }`}
                />
              </button>
            </div>
            <p
              className={`font-ui text-[10px] uppercase tracking-widest text-center ${
                constraintActive ? "text-sprawl-light-blue" : "text-gray-500"
              }`}
            >
              {constraintActive
                ? "Valve: CLOSED (Nonprofit Compliant)"
                : "Valve: OPEN (Distributions Allowed)"}
            </p>
          </div>
        </div>

        {/* Capital Flow Visualization */}
        <div className="bg-gray-50 dark:bg-sprawl-deep-blue/60 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h4 className="font-headline text-lg uppercase text-sprawl-yellow mb-4">
            Capital Flow: $100,000 Donation
          </h4>

          <div className="space-y-5">
            {/* Programs pipe */}
            <div>
              <div className="flex justify-between font-ui text-xs mb-1">
                <span className="text-gray-600 dark:text-gray-300 uppercase">
                  Mission Programs (Slum-Shield Blueprints)
                </span>
                <span className="text-sprawl-teal font-bold">
                  ${flows.program.toLocaleString()}
                </span>
              </div>
              <div className="h-3 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sprawl-bright-blue to-sprawl-teal rounded-full transition-all duration-700"
                  style={{ width: `${(flows.program / 100000) * 100}%` }}
                />
              </div>
            </div>

            {/* Founders pipe */}
            <div>
              <div className="flex justify-between font-ui text-xs mb-1">
                <span className="text-gray-600 dark:text-gray-300 uppercase">
                  Founder Distributions (Profit)
                </span>
                <span
                  className={`font-bold ${flows.founders > 0 ? "text-sprawl-bright-red" : "text-gray-400"}`}
                >
                  ${flows.founders.toLocaleString()}
                </span>
              </div>
              <div className="h-3 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    flows.founders > 0
                      ? "bg-sprawl-bright-red shadow-[0_0_10px_rgba(178,31,44,0.5)]"
                      : ""
                  }`}
                  style={{ width: `${(flows.founders / 100000) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Trust Indicator */}
          <div
            className={`mt-5 p-4 rounded text-center border ${
              flows.trustLevel === "secure"
                ? "border-sprawl-teal/60 bg-sprawl-teal/10"
                : "border-sprawl-bright-red/60 bg-sprawl-bright-red/10"
            }`}
          >
            <p
              className={`font-ui text-xs font-bold uppercase ${
                flows.trustLevel === "secure"
                  ? "text-sprawl-teal"
                  : "text-sprawl-bright-red"
              }`}
            >
              {flows.trustLevel === "secure"
                ? "Donor Trust: SECURE \u2014 Statutory Compliance (Nondistribution Constraint Active)"
                : "Donor Trust: CRITICAL FAILURE \u2014 Private Inurement Risk"}
            </p>
          </div>

          {/* Explanation cards */}
          <div className="mt-4 grid md:grid-cols-2 gap-3">
            <div className="border border-sprawl-yellow/20 rounded p-3">
              <p className="font-ui text-[10px] uppercase tracking-wider text-sprawl-yellow mb-1">
                For-Profit Mode
              </p>
              <p className="font-body text-xs text-gray-600 dark:text-gray-400">
                Shareholders expect returns. Up to 50% of surplus can be
                distributed as dividends. Donors have no assurance their funds
                will reach the mission.
              </p>
            </div>
            <div className="border border-sprawl-yellow/20 rounded p-3">
              <p className="font-ui text-[10px] uppercase tracking-wider text-sprawl-yellow mb-1">
                Nonprofit Mode
              </p>
              <p className="font-body text-xs text-gray-600 dark:text-gray-400">
                The nondistribution constraint blocks all founder distributions.
                100% of surplus must be reinvested in the mission. This is
                Hansmann&apos;s trust technology.
              </p>
            </div>
          </div>
        </div>

        {!state.constraintLocked && (
          <div className="mt-4">
            {entityType === "nonprofit" && constraintActive ? (
              <button
                onClick={lockConstraint}
                className="px-5 py-2 bg-sprawl-yellow text-sprawl-deep-blue font-headline uppercase text-xs rounded hover:bg-sprawl-yellow/80"
              >
                Lock Constraint &mdash; Proceed to Capital Allocation
              </button>
            ) : (
              <p className="font-ui text-xs text-sprawl-bright-red">
                Select &quot;Nonprofit Corp&quot; and activate the
                nondistribution constraint to proceed.
              </p>
            )}
          </div>
        )}
      </section>

      {/* ============================================================ */}
      {/* PHASE 1: Capital Allocation Exercise                          */}
      {/* ============================================================ */}

      {state.phase >= 1 && (
        <section className="border border-sprawl-teal/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded bg-sprawl-teal flex items-center justify-center text-sprawl-deep-blue font-headline text-xs">
              02
            </div>
            <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white">
              Capital Allocation: Mission vs. Private Benefit
            </h2>
          </div>

          <p className="font-body text-sm text-gray-600 dark:text-gray-300 mb-4">
            The Uplift Initiative has received its first round of donations.
            Classify each proposed expenditure as{" "}
            <strong className="text-sprawl-teal">mission-aligned</strong>{" "}
            (permissible) or{" "}
            <strong className="text-sprawl-bright-red">private benefit</strong>{" "}
            (prohibited under the nondistribution constraint).
          </p>

          <div className="space-y-3 mb-4">
            {EXPENDITURES.map((exp) => {
              const choice = classifications[exp.id];
              const isLocked = state.classificationLocked;
              const isCorrect = choice === exp.correct;
              return (
                <div
                  key={exp.id}
                  className={`border rounded-lg p-4 transition-all ${
                    isLocked
                      ? isCorrect
                        ? "border-green-500/30 bg-green-500/5"
                        : "border-sprawl-bright-red/30 bg-sprawl-bright-red/5"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <p className="font-body text-sm text-gray-800 dark:text-gray-200 flex-1">
                      {exp.label}
                    </p>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleClassify(exp.id, "mission")}
                        disabled={isLocked}
                        className={`px-3 py-1 rounded font-ui text-xs uppercase border transition-all ${
                          choice === "mission"
                            ? "border-sprawl-teal bg-sprawl-teal/10 text-sprawl-teal"
                            : "border-gray-300 dark:border-gray-600 text-gray-500 hover:border-sprawl-teal"
                        } ${isLocked ? "cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        Mission-Aligned
                      </button>
                      <button
                        onClick={() => handleClassify(exp.id, "private")}
                        disabled={isLocked}
                        className={`px-3 py-1 rounded font-ui text-xs uppercase border transition-all ${
                          choice === "private"
                            ? "border-sprawl-bright-red bg-sprawl-bright-red/10 text-sprawl-bright-red"
                            : "border-gray-300 dark:border-gray-600 text-gray-500 hover:border-sprawl-bright-red"
                        } ${isLocked ? "cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        Private Benefit
                      </button>
                    </div>
                  </div>
                  {isLocked && (
                    <p
                      className={`mt-2 font-body text-xs leading-relaxed ${
                        isCorrect
                          ? "text-green-600 dark:text-green-400"
                          : "text-sprawl-bright-red"
                      }`}
                    >
                      {isCorrect ? "\u2713 " : "\u2717 "}
                      {exp.explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {state.classificationLocked && (
            <div
              className={`rounded-lg p-4 mb-4 border ${
                state.classificationScore === EXPENDITURES.length
                  ? "border-green-500/30 bg-green-500/10"
                  : "border-sprawl-yellow/30 bg-sprawl-yellow/10"
              }`}
            >
              <p className="font-headline text-sm uppercase mb-1">
                Classification Score: {state.classificationScore} /{" "}
                {EXPENDITURES.length}
              </p>
              <p className="font-body text-sm text-gray-700 dark:text-gray-300">
                {state.classificationScore === EXPENDITURES.length
                  ? "Perfect. You have correctly identified the boundary between mission-aligned expenditure and prohibited private benefit. The nondistribution constraint is not about banning all spending \u2014 it is about ensuring surplus serves the exempt purpose."
                  : "Review the explanations above. The key distinction: reasonable expenses that advance the charitable mission are permissible. Distributions that benefit insiders at the expense of mission are prohibited."}
              </p>
            </div>
          )}

          {!state.classificationLocked && (
            <button
              disabled={!allClassified}
              onClick={lockClassifications}
              className="px-5 py-2 bg-sprawl-teal text-sprawl-deep-blue font-headline uppercase text-xs rounded hover:bg-sprawl-teal/80 disabled:opacity-40"
            >
              Submit Classifications
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
              Finalize Charter: Verdict Builder
            </h2>
          </div>

          <p className="font-body text-sm text-gray-600 dark:text-gray-300 mb-4">
            Complete the nonprofit charter declaration. Articulate why the
            nondistribution constraint enables trust and why nonprofits receive
            tax exemption.
          </p>

          <div className="bg-gray-50 dark:bg-sprawl-deep-blue/60 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-4">
            <p className="font-body text-lg md:text-xl leading-loose text-gray-700 dark:text-gray-300 italic">
              &quot;To solve the problem of{" "}
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
              </select>
              , the Uplift Initiative must adopt the{" "}
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
              . While the entity may generate a{" "}
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
              , those funds must be retained for{" "}
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
              rather than distributed as dividends.&quot;
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
                {state.verdictCorrect ? "Charter Accepted" : "Logic Error"}
              </p>
              <p className="font-body text-sm text-gray-700 dark:text-gray-300">
                {state.verdictCorrect
                  ? "Correct. By implementing the nondistribution constraint, the Uplift Initiative becomes a valid nonprofit entity. As Hansmann observed, this constraint is what allows donors to trust that their contributions will serve the mission, not the founders. The charter is now sealed."
                  : "The analysis detects a mismatch between your inputs and the nature of nonprofit governance. Re-read the doctrine primer regarding Hansmann\u2019s trust theory: the constraint solves contract failure, the entity may generate surplus, and that surplus must serve the mission."}
              </p>
            </div>
          )}

          {!state.verdictSubmitted && (
            <button
              disabled={!allVerdictFilled}
              onClick={submitVerdict}
              className="px-5 py-2 bg-sprawl-bright-red text-white font-headline uppercase text-xs rounded hover:bg-sprawl-bright-red/80 disabled:opacity-40"
            >
              Deposit Charter to Ledger
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
              Counsel Recommendation
            </h2>
          </div>

          <p className="font-body text-sm text-gray-600 dark:text-gray-300 mb-4">
            Draft a recommendation to the Uplift Initiative board explaining why
            the nondistribution constraint is essential to the entity&apos;s
            governance and how it enables donor trust. Minimum 20 characters.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
              <p className="font-ui text-xs uppercase tracking-wider text-gray-500 mb-2">
                Consider addressing
              </p>
              <ul className="list-disc list-inside font-body text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>
                  Why did the founders choose a nonprofit over an LLC or
                  corporation?
                </li>
                <li>
                  How does the nondistribution constraint protect donor
                  interests?
                </li>
                <li>
                  What expenditures are permissible vs. prohibited under IRC
                  &sect; 501(c)(3)?
                </li>
                <li>
                  What ongoing compliance risks should the board monitor?
                </li>
              </ul>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
              <p className="font-ui text-xs uppercase tracking-wider text-gray-500 mb-2">
                Key doctrinal points
              </p>
              <ul className="list-disc list-inside font-body text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>
                  Hansmann: the constraint solves contract failure where patron
                  monitoring is impractical
                </li>
                <li>
                  Private inurement (IRC &sect; 501(c)(3)) vs. private benefit
                  &mdash; both prohibited
                </li>
                <li>
                  Organizational test + operational test (Treas. Reg. &sect;
                  1.501(c)(3)-1)
                </li>
                <li>
                  MNCA &sect; 13.01: distribution prohibition as structural
                  governance constraint
                </li>
              </ul>
            </div>
          </div>

          <textarea
            value={state.counselNote || ""}
            onChange={(e) => patch({ counselNote: e.target.value })}
            placeholder="Draft your counsel recommendation: explain why the nondistribution constraint is the governance technology that makes this nonprofit viable, how it enables donor trust, and what compliance risks remain..."
            className="w-full min-h-36 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-sprawl-deep-blue/70 p-3 font-body text-sm text-gray-800 dark:text-gray-200"
          />

          {(state.counselNote || "").length > 0 &&
            (state.counselNote || "").length < 20 && (
              <p className="mt-1 font-ui text-xs text-sprawl-bright-red">
                Minimum 20 characters required (
                {(state.counselNote || "").length}/20)
              </p>
            )}

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              disabled={!counselReady}
              onClick={() => {
                markCompleted();
                syncModuleCompletion({ moduleId: "ch06-nonprofits", chapterNum: 6, chapterTitle: "Nonprofits", scores: { classificationScore: state.classificationScore, entityType: state.entityType }, counselNotes: state.counselNote });
                updateMatterFile(
                  "ch06-nonprofits",
                  summarizeModuleHeadline("ch06-nonprofits", {
                    constraintActive,
                    classificationScore: state.classificationScore,
                    totalExpenditures: EXPENDITURES.length,
                    verdictCorrect: state.verdictCorrect,
                    counselNote: state.counselNote,
                  }),
                  {
                    entityForm:
                      "Nonprofit Corp (nondistribution constraint active)",
                    controlPosture:
                      "Mission-locked governance \u2014 no founder distributions permitted",
                  }
                );
                downloadTextFile(
                  "constructedge-nonprofit-governance-counsel-sheet.txt",
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

      <LifecycleHandoff moduleId="ch06-nonprofits" bridge={flow.bridge} />
    </div>
  );
}
