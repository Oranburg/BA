import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { APP_ROUTES } from "../../routing/routes";
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
import chapterImage from "../../assets/chapters/ch02.jpg";

// ---------------------------------------------------------------------------
// Agency Activity: "The Neural-Link Handshake — Who Controls the Bot?"
// Chapter 2: Agency Law
// Focus: Attribution → The Control Test (Employee vs. Independent Contractor)
// Statutes: RSA § 1.01, § 2.01, § 7.07 (Restatement Third of Agency)
// Cases: A. Gay Jenson Farms v. Cargill (1981), Humble Oil (1971)
// ---------------------------------------------------------------------------

const SCENARIO_INTRO = `
INCOMING TRANSMISSION — ZEEVA CAPITAL SOLUTIONS, INC.
NightCity Grid Node 3 · 01:22 LOCAL

To: Legal Operations — Attribution Unit
Re: FIXER INCIDENT REPORT · JOB CODE: NL-7749

SITUATION REPORT:

Zeeva hired "Sammy" — a freelance Street Fixer — to negotiate data-shard 
supply contracts with local vendors. Sammy introduced himself to vendors as 
"Authorized Rep of Zeeva Capital." He wore ZCS gear, used a ZCS-branded 
neural-link handshake device, and operated out of ZCS's grid node.

Last week, Sammy signed a binding data-shard contract with VendorCorp for 
§ 450,000. Zeeva says she never authorized that deal. VendorCorp wants 
payment. 

Your job: Determine whether Sammy is an employee or independent contractor — 
and whether Zeeva is liable on the contract under agency law.
`.trim();

// ---------------------------------------------------------------------------
// Phase 1: Control Test — The Scales
// ---------------------------------------------------------------------------

const CONTROL_FACTORS = [
  {
    id: "f1",
    label: "Sammy sets his own hours and works from multiple client grid nodes",
    category: "independent",
    weight: 1,
    explanation: "Control over work schedule and location weighs toward independent contractor status. RSA § 7.07 cmt. f: an employer-employee relationship requires control over the 'manner and means' of work.",
  },
  {
    id: "f2",
    label: "Zeeva provides Sammy with ZCS-branded equipment and a neural-link handshake device",
    category: "employee",
    weight: 2,
    explanation: "Provision of tools and equipment by the principal is a strong indicator of the employment relationship. The principal controls the agent through the tools of work.",
  },
  {
    id: "f3",
    label: "Sammy is paid per-contract (project basis), not a fixed weekly salary",
    category: "independent",
    weight: 1,
    explanation: "Project-based pay is consistent with independent contractor status. A fixed salary indicates employer control over time and method.",
  },
  {
    id: "f4",
    label: "Zeeva assigns Sammy specific vendor targets and approves his negotiation scripts",
    category: "employee",
    weight: 2,
    explanation: "Direct supervision of the method of work — approving negotiation scripts — establishes employer control over the 'manner and means.' This is the core of the control test.",
  },
  {
    id: "f5",
    label: "Sammy works for three other clients simultaneously",
    category: "independent",
    weight: 1,
    explanation: "Working for multiple clients simultaneously is inconsistent with an exclusive employment relationship.",
  },
  {
    id: "f6",
    label: "Zeeva can terminate Sammy 'at will' with no notice",
    category: "employee",
    weight: 2,
    explanation: "At-will termination is a strong indicator of the employment relationship. An independent contractor typically can only be terminated for cause or upon project completion.",
  },
  {
    id: "f7",
    label: "Sammy operates under the 'ZCS Authorized Rep' title on his business card",
    category: "employee",
    weight: 1,
    explanation: "While not a control test factor directly, holding out as an authorized agent creates apparent authority and supports the employment relationship characterization.",
  },
  {
    id: "f8",
    label: "Sammy uses his own sub-contractors for technical work without Zeeva's approval",
    category: "independent",
    weight: 1,
    explanation: "Authority to engage sub-contractors independently is a marker of independent status. An employee typically cannot delegate work without the employer's consent.",
  },
];

// ---------------------------------------------------------------------------
// Phase 2: Authority Type
// ---------------------------------------------------------------------------

const AUTHORITY_QUESTIONS = [
  {
    id: "a1",
    scenario: "Zeeva told Sammy: 'You are authorized to negotiate and sign any data-shard contract up to § 100,000.' Sammy signs a § 90,000 contract.",
    correct: "actual-express",
    options: ["actual-express", "actual-implied", "apparent", "no-authority"],
    explanation: "Actual Express Authority. Zeeva directly and explicitly authorized Sammy to sign contracts up to § 100,000. RSA § 2.01: actual authority arises when the principal expressly manifests consent.",
  },
  {
    id: "a2",
    scenario: "Zeeva authorized Sammy to 'handle all vendor relations.' Sammy signs a standard supply contract — a customary part of vendor relations — without specific approval.",
    correct: "actual-implied",
    options: ["actual-express", "actual-implied", "apparent", "no-authority"],
    explanation: "Actual Implied Authority. Authority to 'handle vendor relations' implies authority to do what is reasonably necessary, including signing standard contracts. RSA § 2.01 cmt. b.",
  },
  {
    id: "a3",
    scenario: "Zeeva never authorized Sammy to commit ZCS. But Sammy wore ZCS gear and handed VendorCorp a ZCS business card. VendorCorp reasonably believed Sammy was authorized.",
    correct: "apparent",
    options: ["actual-express", "actual-implied", "apparent", "no-authority"],
    explanation: "Apparent Authority. Zeeva's conduct (providing ZCS gear and cards) caused VendorCorp to reasonably believe Sammy was authorized. RSA § 2.03: apparent authority arises from the principal's manifestations to the third party.",
  },
  {
    id: "a4",
    scenario: "Sammy had zero authorization. He used a fake ZCS card he made himself. VendorCorp had no prior dealings with ZCS.",
    correct: "no-authority",
    options: ["actual-express", "actual-implied", "apparent", "no-authority"],
    explanation: "No Authority. Without any manifestation from Zeeva to VendorCorp, there can be no apparent authority. Sammy's own representations cannot create authority. RSA § 2.03 cmt. c.",
  },
];

const AUTHORITY_LABELS = {
  "actual-express": "Actual Express",
  "actual-implied": "Actual Implied",
  apparent: "Apparent",
  "no-authority": "No Authority",
};

// ---------------------------------------------------------------------------
// Phase 3: Vicarious Liability — Respondeat Superior
// ---------------------------------------------------------------------------

const RESPONDEAT_SCENARIO = {
  facts: `While conducting a vendor meeting, Sammy's reckless neural-link calibration caused a data 
breach that destroyed § 200,000 of VendorCorp's proprietary data. The breach occurred 
during what Sammy described as a 'quick system check' mid-negotiation.`,
  question: "Is Zeeva vicariously liable under Respondeat Superior for the data breach?",
  choices: [
    {
      id: "rs1",
      text: "YES — If Sammy is an employee and the breach occurred within the scope of his employment (negotiation work), Zeeva is liable. The 'system check' is incidental to the negotiation task.",
      correct: true,
      explanation: "Correct. RSA § 7.07: an employer is liable for an employee's torts committed within the scope of employment. The conduct occurred during the assigned task and was a foreseeable risk of that activity.",
    },
    {
      id: "rs2",
      text: "NO — The 'system check' was a personal deviation unrelated to the negotiation. Sammy went on a 'frolic' — Zeeva is not liable.",
      correct: false,
      explanation: "Incorrect. A 'quick system check' during a meeting is a detour, not a complete abandonment of the employment task. Courts distinguish frolics (major departures) from detours (minor deviations). This is a detour.",
    },
    {
      id: "rs3",
      text: "NO — Zeeva is only liable if Sammy is an employee. If Sammy is an independent contractor, Zeeva has no respondeat superior liability.",
      correct: false,
      explanation: "This is partially correct as a general rule, but it is incomplete. The question asked whether Zeeva IS liable — which requires first resolving the employee/IC analysis from Phase 1. This answer ignores the full analysis.",
    },
  ],
};

// ---------------------------------------------------------------------------
// COMPONENT
// ---------------------------------------------------------------------------

export default function Ch02Agency() {
  const { state: saved, patch, markCompleted } = useModuleProgress("ch02-agency", {
    phase: 0,
    controlAnswers: {},
    controlChecked: false,
    authAnswers: {},
    authChecked: false,
    respAnswer: null,
    respChecked: false,
    counselNotes: "",
    completed: false,
  });

  const [phase, setPhase] = useState(saved.phase ?? 0);
  const { openTome } = useTome();
  const flow = MODULE_FLOW["ch02-agency"];

  // Phase 1: Control Test
  const [controlAnswers, setControlAnswers] = useState(saved.controlAnswers || {});
  const [controlChecked, setControlChecked] = useState(saved.controlChecked || false);

  // Phase 2: Authority
  const [authAnswers, setAuthAnswers] = useState(saved.authAnswers || {});
  const [authChecked, setAuthChecked] = useState(saved.authChecked || false);

  // Phase 3: Respondeat
  const [respAnswer, setRespAnswer] = useState(saved.respAnswer || null);
  const [respChecked, setRespChecked] = useState(saved.respChecked || false);
  const [counselNotes, setCounselNotes] = useState(saved.counselNotes || "");


  useEffect(() => {
    patch({
      phase,
      controlAnswers,
      controlChecked,
      authAnswers,
      authChecked,
      respAnswer,
      respChecked,
      counselNotes,
    });
  }, [phase, controlAnswers, controlChecked, authAnswers, authChecked, respAnswer, respChecked, counselNotes, patch]);

  // Scoring
  const controlScore = Object.entries(controlAnswers).filter(
    ([id, ans]) => {
      const factor = CONTROL_FACTORS.find((f) => f.id === id);
      return factor && ans === factor.category;
    }
  ).length;

  const empScore = CONTROL_FACTORS.filter(
    (f) => controlAnswers[f.id] === "employee"
  ).reduce((sum, f) => sum + f.weight, 0);

  const icScore = CONTROL_FACTORS.filter(
    (f) => controlAnswers[f.id] === "independent"
  ).reduce((sum, f) => sum + f.weight, 0);

  const authScore = Object.entries(authAnswers).filter(
    ([id, ans]) => {
      const q = AUTHORITY_QUESTIONS.find((q) => q.id === id);
      return q && ans === q.correct;
    }
  ).length;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <ModuleBreadcrumb chapterNum="02" title="Agency Law" />
      <ChapterHero src={chapterImage} alt="Agent authorization flow and vendor entity map in a corporate corridor" />
      {/* Header */}
      <p className="font-ui text-xs text-sprawl-yellow/60 uppercase tracking-widest mb-2">
        Chapter 2 · Agency Law
      </p>
      <h1 className="font-headline text-4xl uppercase tracking-tight text-gray-900 dark:text-white mb-1">
        The Neural-Link Handshake
      </h1>
      <p className="font-body text-lg text-sprawl-yellow mb-1">Who Controls the Fixer?</p>
      <p className="font-ui text-xs text-gray-500 mb-2">
        Lifecycle fit: this is the first legal gate—before structure or board design, counsel must determine who can bind ConstructEdge.
      </p>
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <p className="font-ui text-xs text-gray-500 dark:text-gray-400">
          RSA § 1.01, § 2.01, § 7.07 · A. Gay Jenson Farms v. Cargill, 309 N.W.2d 285 (Minn. 1981)
        </p>
        <CitationChip citation="RSA § 2.01" />
        <button
          onClick={() => openTome({ query: "RSA § 2.01" })}
          className="rounded border border-sprawl-yellow/40 px-2 py-1 font-ui text-xs text-sprawl-yellow hover:bg-sprawl-yellow/10"
        >
          Open in Tome
        </button>
      </div>

      <FourProblemsMarker
        dominant={flow.dominantProblems}
        secondary={flow.secondaryProblems}
        shift={flow.shiftFromPrior}
      />
      <ConstructEdgeDossier
        moduleId="ch02-agency"
        factsOverride={{
          controlPosture: "Founder-agent authority is disputed across vendor negotiations",
          strategicPressure: "Early contracting pressure with unclear authority boundaries",
        }}
      />
      <MatterFileCarryover title="Matter File Start" references={[]} />

      {/* Phase 0: Intro */}
      {phase === 0 && (
        <div className="space-y-6">
          <div className="bg-sprawl-deep-blue text-sprawl-teal border border-sprawl-yellow/30 rounded-lg p-6 font-ui text-sm whitespace-pre-wrap leading-relaxed">
            {SCENARIO_INTRO}
          </div>
          <div className="bg-white dark:bg-sprawl-deep-blue/50 border border-gray-200 dark:border-sprawl-yellow/20 rounded-lg p-4">
            <h3 className="font-headline text-sm uppercase tracking-wider text-sprawl-deep-blue dark:text-sprawl-yellow mb-2">
              Learning Objectives
            </h3>
            <ul className="space-y-1 font-body text-sm text-gray-700 dark:text-gray-300 list-disc list-inside">
              <li>Apply the control test to distinguish employees from independent contractors</li>
              <li>Classify authority as actual express, actual implied, apparent, or no authority</li>
              <li>Apply Respondeat Superior to determine vicarious liability for agent torts</li>
              <li>Identify the Restatement (Third) of Agency sections governing each doctrine</li>
            </ul>
          </div>
          <button
            onClick={() => setPhase(1)}
            className="w-full py-3 bg-sprawl-yellow text-sprawl-deep-blue font-headline uppercase tracking-wider text-sm rounded hover:bg-sprawl-yellow/80 transition-all"
          >
            Begin Investigation →
          </button>
        </div>
      )}

      {/* Phase 1: Control Test */}
      {phase === 1 && (
        <div className="space-y-6">
          <div className="border border-sprawl-yellow/40 rounded-lg p-4">
            <p className="font-ui text-xs text-sprawl-yellow uppercase tracking-wider mb-1">Phase 1 of 3</p>
            <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white mb-2">
              The Scales of Control
            </h2>
            <p className="font-body text-sm text-gray-700 dark:text-gray-300 mb-1">
              Under <strong>RSA § 7.07</strong>, a principal is vicariously liable for an employee's
              torts — but not an independent contractor's. The key question:{" "}
              <em>did Zeeva control the manner and means of Sammy's work?</em>
            </p>
            <p className="font-ui text-xs text-gray-500 dark:text-gray-400 italic mb-4">
              Classify each factor as pointing toward EMPLOYEE status or INDEPENDENT CONTRACTOR status.
            </p>

            {/* Visual Scales */}
            {controlChecked && (
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div className="bg-sprawl-teal/10 border border-sprawl-teal/40 rounded p-3 text-center">
                  <p className="font-ui text-xs text-sprawl-teal uppercase mb-1">Employee Weight</p>
                  <p className="font-headline text-3xl text-sprawl-teal">{empScore}</p>
                </div>
                <div className="bg-sprawl-yellow/10 border border-sprawl-yellow/40 rounded p-3 text-center">
                  <p className="font-ui text-xs text-sprawl-yellow uppercase mb-1">Independent Contractor Weight</p>
                  <p className="font-headline text-3xl text-sprawl-yellow">{icScore}</p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {CONTROL_FACTORS.map((factor) => {
                const answer = controlAnswers[factor.id];
                return (
                  <div key={factor.id} className="border border-gray-200 dark:border-gray-700 rounded p-3">
                    <p className="font-body text-sm text-gray-800 dark:text-gray-200 mb-2">{factor.label}</p>
                    <div className="flex gap-2 flex-wrap">
                      {["employee", "independent"].map((val) => {
                        const isSelected = answer === val;
                        const isCorrect = factor.category === val;
                        let cls = "px-3 py-1 rounded font-headline uppercase text-xs border transition-all ";
                        if (controlChecked && isSelected) {
                          cls += isCorrect
                            ? "bg-sprawl-teal text-sprawl-deep-blue border-sprawl-teal"
                            : "bg-sprawl-bright-red text-white border-sprawl-bright-red";
                        } else if (isSelected) {
                          cls += "bg-sprawl-yellow text-sprawl-deep-blue border-sprawl-yellow";
                        } else {
                          cls += "border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-sprawl-yellow";
                        }
                        return (
                          <button
                            key={val}
                            onClick={() =>
                              !controlChecked &&
                              setControlAnswers({ ...controlAnswers, [factor.id]: val })
                            }
                            className={cls}
                          >
                            {val === "employee" ? "👔 Employee" : "🔧 Indep. Contractor"}
                          </button>
                        );
                      })}
                    </div>
                    {controlChecked && (
                      <p className="mt-2 font-ui text-xs text-gray-500 dark:text-gray-400 italic">
                        {factor.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {!controlChecked ? (
              <button
                onClick={() => setControlChecked(true)}
                disabled={Object.keys(controlAnswers).length < CONTROL_FACTORS.length}
                className="mt-4 px-5 py-2 bg-sprawl-yellow text-sprawl-deep-blue font-headline uppercase text-xs rounded hover:bg-sprawl-yellow/80 disabled:opacity-40 transition-all"
              >
                Run Control Test Analysis
              </button>
            ) : (
              <div className="mt-4 space-y-3">
                <div className={`p-3 rounded border font-ui text-sm ${empScore > icScore ? "bg-sprawl-teal/10 border-sprawl-teal text-sprawl-teal" : "bg-sprawl-yellow/10 border-sprawl-yellow text-sprawl-yellow"}`}>
                  {controlScore}/{CONTROL_FACTORS.length} correct classifications ·{" "}
                  {empScore > icScore
                    ? `Employee indicators (${empScore}) outweigh Independent Contractor (${icScore}). Courts look at the totality — Sammy likely qualifies as an employee-agent.`
                    : `Independent Contractor indicators (${icScore}) outweigh Employee (${empScore}). Zeeva may not be vicariously liable.`}
                </div>
                <button
                  onClick={() => setPhase(2)}
                  className="px-5 py-2 bg-sprawl-yellow text-sprawl-deep-blue font-headline uppercase text-xs rounded hover:bg-sprawl-yellow/80 transition-all"
                >
                  Next: Authority Analysis →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Phase 2: Authority */}
      {phase === 2 && (
        <div className="space-y-6">
          <div className="border border-sprawl-yellow/40 rounded-lg p-4">
            <p className="font-ui text-xs text-sprawl-yellow uppercase tracking-wider mb-1">Phase 2 of 3</p>
            <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white mb-2">
              Authority Matrix
            </h2>
            <p className="font-body text-sm text-gray-700 dark:text-gray-300 mb-4">
              For each scenario, classify the type of authority (or lack thereof) that binds — 
              or fails to bind — Zeeva to Sammy's actions.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {Object.entries(AUTHORITY_LABELS).map(([key, label]) => (
                <div key={key} className="text-center p-2 bg-sprawl-deep-blue/20 dark:bg-sprawl-deep-blue/40 border border-sprawl-yellow/10 rounded">
                  <p className="font-ui text-xs text-sprawl-yellow">{label}</p>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {AUTHORITY_QUESTIONS.map((q) => (
                <div key={q.id} className="border border-gray-200 dark:border-gray-700 rounded p-4">
                  <p className="font-body text-sm text-gray-800 dark:text-gray-200 mb-3">{q.scenario}</p>
                  <div className="flex gap-2 flex-wrap">
                    {q.options.map((opt) => {
                      const isSelected = authAnswers[q.id] === opt;
                      const isCorrect = q.correct === opt;
                      let cls = "px-3 py-1 rounded font-ui text-xs border transition-all ";
                      if (authChecked && isSelected) {
                        cls += isCorrect
                          ? "bg-sprawl-teal text-sprawl-deep-blue border-sprawl-teal"
                          : "bg-sprawl-bright-red text-white border-sprawl-bright-red";
                      } else if (isSelected) {
                        cls += "bg-sprawl-yellow text-sprawl-deep-blue border-sprawl-yellow";
                      } else {
                        cls += "border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-sprawl-yellow";
                      }
                      return (
                        <button
                          key={opt}
                          onClick={() => !authChecked && setAuthAnswers({ ...authAnswers, [q.id]: opt })}
                          className={cls}
                        >
                          {AUTHORITY_LABELS[opt]}
                        </button>
                      );
                    })}
                  </div>
                  {authChecked && (
                    <p className="mt-2 font-ui text-xs text-gray-500 dark:text-gray-400 italic">
                      <span className={authAnswers[q.id] === q.correct ? "text-sprawl-teal" : "text-sprawl-bright-red"}>
                        {authAnswers[q.id] === q.correct ? "✓ Correct" : "✗ Incorrect"}
                      </span>{" "}
                      — {q.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
            {!authChecked ? (
              <button
                onClick={() => setAuthChecked(true)}
                disabled={Object.keys(authAnswers).length < AUTHORITY_QUESTIONS.length}
                className="mt-4 px-5 py-2 bg-sprawl-yellow text-sprawl-deep-blue font-headline uppercase text-xs rounded hover:bg-sprawl-yellow/80 disabled:opacity-40 transition-all"
              >
                Check Authority Classifications
              </button>
            ) : (
              <div className="mt-4 space-y-3">
                <div className={`p-3 rounded border font-ui text-sm ${authScore === AUTHORITY_QUESTIONS.length ? "bg-sprawl-teal/10 border-sprawl-teal text-sprawl-teal" : "bg-sprawl-yellow/10 border-sprawl-yellow text-sprawl-yellow"}`}>
                  {authScore}/{AUTHORITY_QUESTIONS.length} correct ·{" "}
                  {authScore === AUTHORITY_QUESTIONS.length ? "Expert authority analysis." : "Review the explanations above — authority type determines Zeeva's liability."}
                </div>
                <button
                  onClick={() => setPhase(3)}
                  className="px-5 py-2 bg-sprawl-yellow text-sprawl-deep-blue font-headline uppercase text-xs rounded hover:bg-sprawl-yellow/80 transition-all"
                >
                  Final Phase: Respondeat Superior →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Phase 3: Respondeat Superior */}
      {phase === 3 && (
        <div className="space-y-6">
          <div className="border border-sprawl-yellow/40 rounded-lg p-4">
            <p className="font-ui text-xs text-sprawl-yellow uppercase tracking-wider mb-1">Phase 3 of 3</p>
            <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white mb-2">
              Respondeat Superior
            </h2>
            <div className="bg-sprawl-deep-blue/30 border border-sprawl-teal/20 rounded p-4 mb-4 font-ui text-sm text-gray-300 whitespace-pre-line">
              {RESPONDEAT_SCENARIO.facts}
            </div>
            <p className="font-body text-sm font-bold text-gray-800 dark:text-gray-200 mb-4">
              {RESPONDEAT_SCENARIO.question}
            </p>
            <div className="space-y-3">
              {RESPONDEAT_SCENARIO.choices.map((choice) => {
                const isSelected = respAnswer === choice.id;
                let cls = "w-full text-left p-4 rounded border font-body text-sm transition-all ";
                if (respChecked && isSelected) {
                  cls += choice.correct
                    ? "bg-sprawl-teal/15 border-sprawl-teal"
                    : "bg-sprawl-deep-red/15 border-sprawl-bright-red";
                } else if (isSelected) {
                  cls += "bg-sprawl-yellow/10 border-sprawl-yellow";
                } else {
                  cls += "border-gray-200 dark:border-gray-700 hover:border-sprawl-yellow";
                }
                return (
                  <button
                    key={choice.id}
                    onClick={() => !respChecked && setRespAnswer(choice.id)}
                    className={cls}
                  >
                    <span className="font-ui font-bold text-xs mr-2 text-gray-500">{choice.id.toUpperCase()}.</span>
                    <span className="text-gray-700 dark:text-gray-200">{choice.text}</span>
                    {respChecked && isSelected && (
                      <p className="mt-2 font-ui text-xs italic text-gray-500 dark:text-gray-400">
                        {choice.explanation}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
            {!respChecked ? (
              <button
                onClick={() => setRespChecked(true)}
                disabled={!respAnswer}
                className="mt-4 px-5 py-2 bg-sprawl-yellow text-sprawl-deep-blue font-headline uppercase text-xs rounded hover:bg-sprawl-yellow/80 disabled:opacity-40 transition-all"
              >
                Submit Answer
              </button>
            ) : (
              <div className="mt-4 space-y-3">
                {RESPONDEAT_SCENARIO.choices.find((c) => c.id === respAnswer)?.correct ? (
                  <div className="p-3 rounded border bg-sprawl-teal/10 border-sprawl-teal text-sprawl-teal font-ui text-sm">
                    ✓ Correct — Zeeva is vicariously liable under Respondeat Superior.
                  </div>
                ) : (
                  <div className="p-3 rounded border bg-sprawl-deep-red/10 border-sprawl-bright-red text-sprawl-bright-red font-ui text-sm">
                    ✗ Review the explanation — see above.
                  </div>
                )}
                <button
                  onClick={() => setPhase(4)}
                  className="px-5 py-2 bg-sprawl-yellow text-sprawl-deep-blue font-headline uppercase text-xs rounded hover:bg-sprawl-yellow/80 transition-all"
                >
                  See Final Verdict →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Phase 4: Final Verdict */}
      {phase === 4 && (
        <div className="space-y-6">
          <div className="bg-sprawl-deep-blue border border-sprawl-yellow/40 rounded-lg p-6 text-center">
            <p className="font-ui text-xs text-sprawl-yellow/60 uppercase tracking-widest mb-4">
              Attribution Unit · Final Analysis
            </p>
            <h2 className="font-headline text-3xl uppercase text-sprawl-yellow mb-4">
              Investigation Complete
            </h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: "Control Test", score: `${controlScore}/${CONTROL_FACTORS.length}` },
                { label: "Authority", score: `${authScore}/${AUTHORITY_QUESTIONS.length}` },
                { label: "Respondeat", score: RESPONDEAT_SCENARIO.choices.find((c) => c.id === respAnswer)?.correct ? "✓" : "✗" },
              ].map((s) => (
                <div key={s.label} className="bg-sprawl-deep-blue/50 border border-sprawl-yellow/20 rounded p-3">
                  <p className="font-ui text-xs text-gray-400 uppercase">{s.label}</p>
                  <p className="font-headline text-2xl text-sprawl-teal">{s.score}</p>
                </div>
              ))}
            </div>
            <p className="font-body text-base text-gray-300 leading-relaxed max-w-xl mx-auto mb-6">
              You have applied the control test to classify Sammy's status, classified four types
              of authority under <strong>RSA §§ 2.01–2.03</strong>, and determined vicarious
              liability under <strong>RSA § 7.07</strong>. The agency relationship was formed by
              conduct — no formal agreement required.
            </p>
            <div className="mt-4 max-w-xl mx-auto text-left border border-sprawl-yellow/30 rounded p-3 bg-sprawl-yellow/5">
              <p className="font-ui text-xs text-gray-500 mb-2 uppercase tracking-wider">Counsel recommendation notes</p>
              <textarea
                value={counselNotes}
                onChange={(e) => setCounselNotes(e.target.value)}
                placeholder="Capture final agency counseling takeaways and facts to verify in diligence."
                className="w-full min-h-24 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-sprawl-deep-blue/70 p-2 font-body text-xs text-gray-800 dark:text-gray-200"
              />
            </div>
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => {
                  markCompleted();
                  updateMatterFile(
                    "ch02-agency",
                    summarizeModuleHeadline("ch02-agency", {
                      controlScore: `${controlScore}/${CONTROL_FACTORS.length}`,
                      authScore: `${authScore}/${AUTHORITY_QUESTIONS.length}`,
                      counselNotes,
                    }),
                    {
                      controlPosture: "Authority architecture documented through agency analysis",
                      strategicPressure: "Counterparty reliance risk identified for future entity design",
                    }
                  );
                  const report = `AGENCY ANALYSIS SHEET

Control score: ${controlScore}/${CONTROL_FACTORS.length}
Authority score: ${authScore}/${AUTHORITY_QUESTIONS.length}
Respondeat: ${RESPONDEAT_SCENARIO.choices.find((c) => c.id === respAnswer)?.correct ? "Likely liability" : "Needs review"}

Counsel notes:
${counselNotes || "None"}

Key unresolved facts:
- Scope limits communicated to third parties
- Control over negotiation scripts and tools
- Whether deviations were detour or frolic
`;
                  downloadTextFile("constructedge-agency-analysis-sheet.txt", report);
                }}
                className="px-6 py-2 bg-sprawl-yellow text-sprawl-deep-blue font-headline uppercase text-xs rounded hover:bg-sprawl-yellow/80 transition-all"
              >
                Complete Module + Export Agency Analysis Sheet
              </button>
            </div>
            <div className="text-left bg-black/20 border border-sprawl-teal/20 rounded p-4 font-ui text-xs text-gray-400 max-w-xl mx-auto">
              <p className="text-sprawl-teal font-bold mb-1">CASEBOOK REFERENCE</p>
              <p><em>A. Gay Jenson Farms Co. v. Cargill, Inc.</em>, 309 N.W.2d 285 (Minn. 1981) — Control test, course of dealing</p>
              <p className="mt-1">RSA § 1.01 — Definition of Agency</p>
              <p className="mt-1">RSA § 2.01–2.03 — Actual and Apparent Authority</p>
              <p className="mt-1">RSA § 7.07 — Employee Acting Within Scope of Employment</p>
            </div>
            <button
                onClick={() => {
                  markCompleted();
                  setPhase(0);
                setControlAnswers({});
                setControlChecked(false);
                setAuthAnswers({});
                setAuthChecked(false);
                setRespAnswer(null);
                setRespChecked(false);
              }}
              className="mt-6 px-6 py-2 border border-sprawl-yellow text-sprawl-yellow font-headline uppercase text-xs rounded hover:bg-sprawl-yellow/10 transition-all"
            >
              Restart Investigation
            </button>
            <div className="mt-4 text-center">
              <p className="font-ui text-xs text-gray-500 mb-2">{flow.bridge}</p>
              <Link
                to={APP_ROUTES.ch08EntitySelection}
                className="inline-flex items-center gap-2 px-3 py-2 rounded border border-sprawl-light-blue text-sprawl-light-blue font-ui text-xs uppercase tracking-wider hover:bg-sprawl-light-blue/10"
              >
                Continue to Entity Selection →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Progress Indicator */}
      {phase > 0 && phase < 4 && (
        <div className="flex gap-2 justify-center mt-6">
          {[1, 2, 3].map((p) => (
            <div
              key={p}
              className={`h-1.5 rounded-full transition-all ${
                p < phase ? "w-8 bg-sprawl-teal" : p === phase ? "w-8 bg-sprawl-yellow" : "w-4 bg-gray-600"
              }`}
            />
          ))}
        </div>
      )}
      {phase === 0 && <LifecycleHandoff moduleId="ch02-agency" bridge={flow.bridge} />}
    </div>
  );
}
