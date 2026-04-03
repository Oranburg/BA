import { useState } from "react";
import CitationChip from "../../tome/CitationChip";
import { useTome } from "../../tome/useTome";

// ---------------------------------------------------------------------------
// M&A Activity: "The Deal Room — Enhanced Scrutiny in The Sprawl"
// Chapter 13: Mergers & Acquisitions
// Focus: Governance → Takeovers / Enhanced Scrutiny
// Statutes: DGCL § 141(a), § 251, § 271
// Cases: Unocal (1985), Revlon (1986), Weinberger (1983), Lyondell (2009)
// ---------------------------------------------------------------------------

const SCENARIO = {
  title: "The Deal Room",
  subtitle: "Enhanced Scrutiny in The Sprawl",
  intro: `
INCOMING TRANSMISSION — ZEEVA CAPITAL SOLUTIONS, INC.
NightCity Grid Node 7 · 03:47 LOCAL

To: Legal Operations — Board Advisory Unit
Re: HOSTILE ACQUISITION ALERT · ZCS-Theta Corp

SITUATION REPORT:

ZCS-Theta Corp (ticker: ZCST) is a mid-tier data-shard company incorporated
in the Delaware Sector. A hostile raider — NeoCorp Holdings, fronted by
Fixer-Class operator "The Phantom" — has launched a two-tier tender offer at
§ 54 per share.

Sammy has intel: ZCS-Theta's independent financial advisors estimate intrinsic
value at § 60-70 per share. The board convened for nine hours. They want to
deploy a defensive Self-Tender at § 72, excluding The Phantom.

Your job: Run the Unocal Analysis. Then decide if the board's actions trigger
Revlon mode. The Council of Sprawl (Delaware Supreme Court) is watching.
  `.trim(),
};

// ---------------------------------------------------------------------------
// PHASE 1: Unocal Two-Prong Analysis
// ---------------------------------------------------------------------------

const UNOCAL_PRONG1 = {
  question: "PRONG 1 OF UNOCAL: Was there a reasonable basis to believe a danger to corporate policy existed?",
  hint: "The board must show it acted in good faith and after reasonable investigation. What facts support — or undermine — that finding?",
  evidence: [
    {
      id: "e1",
      label: "Board met for 9 hours with legal and financial advisors",
      tags: ["Good Faith", "Reasonable Investigation"],
      supports: true,
    },
    {
      id: "e2",
      label: "Independent advisors opined the § 54 offer was inadequate (intrinsic value § 60-70)",
      tags: ["Reasonable Grounds"],
      supports: true,
    },
    {
      id: "e3",
      label: "The Phantom's offer was a two-tier 'front-loaded' offer — minority shareholders face a coercive back-end",
      tags: ["Structural Coercion"],
      supports: true,
    },
    {
      id: "e4",
      label: "Three inside directors on the board had personal financial ties to the raider",
      tags: ["Interest / Self-Dealing"],
      supports: false,
    },
    {
      id: "e5",
      label: "The board received no written materials before the meeting",
      tags: ["Procedural Deficiency"],
      supports: false,
    },
  ],
  correctAnswers: {
    e1: true,
    e2: true,
    e3: true,
    e4: false,
    e5: false,
  },
};

const UNOCAL_PRONG2 = {
  question: "PRONG 2 OF UNOCAL: Was the defensive measure (§ 72 Self-Tender, excluding The Phantom) reasonable in relation to the threat?",
  choices: [
    {
      id: "c1",
      text: "YES — The premium (§ 72 vs. § 54) is proportionate to the threat. The measure is neither preclusive nor coercive. Shareholders may tender to either offer.",
      correct: true,
      explanation: "Correct. Under Unocal and Unitrin, a defensive measure passes if it is not preclusive, not coercive, and falls within a range of reasonableness. A self-tender at a fair price that leaves shareholders with a real choice passes the test.",
    },
    {
      id: "c2",
      text: "NO — Any defensive measure that excludes the raider is per se coercive and fails Prong 2.",
      correct: false,
      explanation: "Incorrect. Unocal itself upheld a selective exchange offer excluding Mesa. The exclusion of the raider is not per se coercive — the court looks at the overall structure and its effect on shareholders.",
    },
    {
      id: "c3",
      text: "NO — Because the board used financial advisors, the business judgment rule applies, not Unocal.",
      correct: false,
      explanation: "Incorrect. Unocal enhanced scrutiny applies to defensive measures regardless of how carefully the board deliberated. Enhanced scrutiny is the standard precisely because the board has a structural conflict in the face of a hostile offer.",
    },
  ],
};

// ---------------------------------------------------------------------------
// PHASE 2: Does Revlon Kick In?
// ---------------------------------------------------------------------------

const REVLON_TRIGGERS = [
  {
    id: "t1",
    scenario: "The board adopts the self-tender and succeeds — The Phantom withdraws. ZCS-Theta remains independent.",
    answer: "no",
    explanation: "No Revlon. The company is not being sold for cash, and control remains in the market. The board's duty is to preserve the enterprise, not maximize immediate price.",
  },
  {
    id: "t2",
    scenario: "The board decides to accept a White Knight offer from SynthCorp — a cash merger at § 65 per share.",
    answer: "yes",
    explanation: "Revlon triggers. A sale of the company for cash means shareholders lose their continuing interest. The board's duty shifts to maximizing immediate value — it becomes an 'auctioneer.'",
  },
  {
    id: "t3",
    scenario: "The board approves a stock-for-stock merger with DataMega Corp, where no single shareholder gains control.",
    answer: "no",
    explanation: "No Revlon. Under Paramount v. Time (1989), a stock-for-stock merger where control stays in the market does not trigger Revlon. The board retains discretion to pursue long-term strategy.",
  },
  {
    id: "t4",
    scenario: "The board approves a sale to a single buyer (OmniCorp) for a mix of cash and OmniCorp stock — but OmniCorp's founder will hold a majority stake in the combined company.",
    answer: "yes",
    explanation: "Revlon triggers. Under Paramount v. QVC (1994), any transaction where control shifts from the market to a single controlling shareholder triggers Revlon enhanced scrutiny. The cash-stock mix doesn't change the analysis.",
  },
];

// ---------------------------------------------------------------------------
// PHASE 3: Mad-Libs Holding
// ---------------------------------------------------------------------------

const HOLDING_TEMPLATE = {
  parts: [
    { type: "text", content: "The ZCS-Theta board's defensive self-tender " },
    {
      type: "select",
      id: "s1",
      options: ["satisfies", "fails", "is irrelevant to"],
      correct: "satisfies",
    },
    { type: "text", content: " the first prong of " },
    {
      type: "select",
      id: "s2",
      options: ["Revlon", "Unocal", "Weinberger"],
      correct: "Unocal",
    },
    { type: "text", content: " because the board acted in " },
    {
      type: "select",
      id: "s3",
      options: ["good faith after reasonable investigation", "bad faith motivated by entrenchment", "reliance on management alone"],
      correct: "good faith after reasonable investigation",
    },
    { type: "text", content: ". The defensive measure is " },
    {
      type: "select",
      id: "s4",
      options: ["preclusive and coercive", "within a range of reasonableness", "a per se violation of DGCL"],
      correct: "within a range of reasonableness",
    },
    { type: "text", content: " under " },
    {
      type: "select",
      id: "s5",
      options: ["DGCL § 141(a)", "RUPA § 202", "MBCA § 8.30"],
      correct: "DGCL § 141(a)",
    },
    { type: "text", content: ". Because ZCS-Theta remains independent after the defense, " },
    {
      type: "select",
      id: "s6",
      options: ["Revlon duties are triggered", "Revlon duties are not triggered", "entire fairness applies"],
      correct: "Revlon duties are not triggered",
    },
    { type: "text", content: " and the board retains authority to act in the long-term interest of the enterprise." },
  ],
};

// ---------------------------------------------------------------------------
// COMPONENT
// ---------------------------------------------------------------------------

export default function Ch13MA() {
  const [phase, setPhase] = useState(0); // 0=intro, 1=unocal-p1, 2=unocal-p2, 3=revlon, 4=holding, 5=verdict
  const { openTome } = useTome();
  const [p1Answers, setP1Answers] = useState({});
  const [p1Checked, setP1Checked] = useState(false);
  const [p2Answer, setP2Answer] = useState(null);
  const [p2Checked, setP2Checked] = useState(false);
  const [revlonAnswers, setRevlonAnswers] = useState({});
  const [revlonChecked, setRevlonChecked] = useState(false);
  const [holdingSelects, setHoldingSelects] = useState({});
  const [holdingChecked, setHoldingChecked] = useState(false);

  // Scoring
  const p1Score = Object.entries(UNOCAL_PRONG1.correctAnswers).filter(
    ([id, correct]) => p1Answers[id] === correct
  ).length;
  const p1Total = UNOCAL_PRONG1.evidence.length;

  const holdingParts = HOLDING_TEMPLATE.parts.filter((p) => p.type === "select");
  const holdingScore = holdingParts.filter((p) => holdingSelects[p.id] === p.correct).length;

  const revlonScore = REVLON_TRIGGERS.filter((t) => revlonAnswers[t.id] === t.answer).length;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <p className="font-ui text-xs text-sprawl-yellow/60 uppercase tracking-widest mb-2">
        Chapter 13 · Mergers &amp; Acquisitions
      </p>
      <h1 className="font-headline text-4xl uppercase tracking-tight text-gray-900 dark:text-white mb-1">
        The Deal Room
      </h1>
      <p className="font-body text-lg text-sprawl-yellow mb-1">Enhanced Scrutiny in The Sprawl</p>
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <p className="font-ui text-xs text-gray-500 dark:text-gray-400">
          Unocal Corp. v. Mesa Petroleum Co., 493 A.2d 946 (Del. 1985) · Revlon, Inc. v. MacAndrews &amp; Forbes, 506 A.2d 173 (Del. 1986) · DGCL § 141(a)
        </p>
        <CitationChip citation="DGCL § 141(a)" />
        <button
          onClick={() => openTome({ query: "DGCL § 141(a)" })}
          className="rounded border border-sprawl-yellow/40 px-2 py-1 font-ui text-xs text-sprawl-yellow hover:bg-sprawl-yellow/10"
        >
          Open in Tome
        </button>
      </div>

      {/* Phase 0: Intro */}
      {phase === 0 && (
        <div className="space-y-6">
          <div className="bg-sprawl-deep-blue text-sprawl-teal border border-sprawl-yellow/30 rounded-lg p-6 font-ui text-sm whitespace-pre-wrap leading-relaxed">
            {SCENARIO.intro}
          </div>
          <div className="bg-white dark:bg-sprawl-deep-blue/50 border border-gray-200 dark:border-sprawl-yellow/20 rounded-lg p-4">
            <h3 className="font-headline text-sm uppercase tracking-wider text-sprawl-deep-blue dark:text-sprawl-yellow mb-2">
              Learning Objectives
            </h3>
            <ul className="space-y-1 font-body text-sm text-gray-700 dark:text-gray-300 list-disc list-inside">
              <li>Apply the two-prong Unocal test to a hostile takeover defense</li>
              <li>Identify when Revlon duties are (and are not) triggered</li>
              <li>Distinguish the standards of review: BJR → Enhanced Scrutiny → Entire Fairness</li>
              <li>Draft a judicial holding using the correct statutory authority (DGCL § 141(a))</li>
            </ul>
          </div>
          <button
            onClick={() => setPhase(1)}
            className="w-full py-3 bg-sprawl-yellow text-sprawl-deep-blue font-headline uppercase tracking-wider text-sm rounded hover:bg-sprawl-yellow/80 transition-all"
          >
            Begin Analysis →
          </button>
        </div>
      )}

      {/* Phase 1: Unocal Prong 1 */}
      {phase === 1 && (
        <div className="space-y-6">
          <div className="border border-sprawl-yellow/40 rounded-lg p-4">
            <p className="font-ui text-xs text-sprawl-yellow uppercase tracking-wider mb-1">Phase 1 of 4</p>
            <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white mb-2">
              Unocal Analysis — Prong 1
            </h2>
            <p className="font-body text-sm text-gray-700 dark:text-gray-300 mb-4">
              {UNOCAL_PRONG1.question}
            </p>
            <p className="font-ui text-xs text-gray-500 dark:text-gray-400 italic mb-4">
              {UNOCAL_PRONG1.hint}
            </p>
            <p className="font-ui text-xs text-sprawl-teal mb-4">
              Mark each piece of evidence as SUPPORTS prong 1 ✓ or UNDERMINES prong 1 ✗
            </p>
            <div className="space-y-3">
              {UNOCAL_PRONG1.evidence.map((ev) => (
                <div key={ev.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center border border-gray-200 dark:border-gray-700 rounded p-3">
                  <div className="flex-1">
                    <p className="font-body text-sm text-gray-800 dark:text-gray-200">{ev.label}</p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {ev.tags.map((t) => (
                        <span key={t} className="px-1.5 py-0.5 bg-sprawl-light-blue/20 text-sprawl-light-blue font-ui text-xs rounded">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {[true, false].map((val) => {
                      const isSelected = p1Answers[ev.id] === val;
                      const isCorrect = UNOCAL_PRONG1.correctAnswers[ev.id] === val;
                      let cls = "px-3 py-1 rounded font-ui text-xs border transition-all ";
                      if (p1Checked && isSelected) {
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
                          key={String(val)}
                          onClick={() => !p1Checked && setP1Answers({ ...p1Answers, [ev.id]: val })}
                          className={cls}
                        >
                          {val ? "✓ Supports" : "✗ Undermines"}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {!p1Checked ? (
              <button
                onClick={() => setP1Checked(true)}
                disabled={Object.keys(p1Answers).length < p1Total}
                className="mt-4 px-5 py-2 bg-sprawl-yellow text-sprawl-deep-blue font-headline uppercase text-xs rounded hover:bg-sprawl-yellow/80 disabled:opacity-40 transition-all"
              >
                Check Evidence Analysis
              </button>
            ) : (
              <div className="mt-4 space-y-3">
                <div className={`p-3 rounded border font-ui text-sm ${p1Score >= 4 ? "bg-sprawl-teal/10 border-sprawl-teal text-sprawl-teal" : "bg-sprawl-yellow/10 border-sprawl-yellow text-sprawl-yellow"}`}>
                  {p1Score}/{p1Total} correct ·{" "}
                  {p1Score === p1Total
                    ? "Perfect — Prong 1 analysis complete. Board had reasonable grounds."
                    : p1Score >= 3
                    ? "Strong analysis. Prong 1 likely satisfied."
                    : "Review the evidence. Prong 1 requires careful factual analysis."}
                </div>
                <div className="space-y-2">
                  {UNOCAL_PRONG1.evidence.map((ev) => {
                    const userCorrect = p1Answers[ev.id] === UNOCAL_PRONG1.correctAnswers[ev.id];
                    return (
                      <div key={ev.id} className={`p-2 rounded text-xs font-ui border ${userCorrect ? "border-sprawl-teal/30 text-gray-500 dark:text-gray-400" : "border-sprawl-bright-red/40 bg-sprawl-bright-red/5"}`}>
                        <span className={userCorrect ? "text-sprawl-teal" : "text-sprawl-bright-red"}>
                          {userCorrect ? "✓" : "✗"}
                        </span>{" "}
                        <strong>{ev.label}</strong> —{" "}
                        {UNOCAL_PRONG1.correctAnswers[ev.id]
                          ? "This SUPPORTS Prong 1 (reasonable grounds)."
                          : "This UNDERMINES Prong 1 (raises procedural / conflict concerns)."}
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={() => setPhase(2)}
                  className="px-5 py-2 bg-sprawl-yellow text-sprawl-deep-blue font-headline uppercase text-xs rounded hover:bg-sprawl-yellow/80 transition-all"
                >
                  Proceed to Prong 2 →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Phase 2: Unocal Prong 2 */}
      {phase === 2 && (
        <div className="space-y-6">
          <div className="border border-sprawl-yellow/40 rounded-lg p-4">
            <p className="font-ui text-xs text-sprawl-yellow uppercase tracking-wider mb-1">Phase 2 of 4</p>
            <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white mb-2">
              Unocal Analysis — Prong 2
            </h2>
            <p className="font-body text-sm text-gray-700 dark:text-gray-300 mb-4">
              {UNOCAL_PRONG2.question}
            </p>
            <div className="space-y-3 mb-4">
              {UNOCAL_PRONG2.choices.map((choice) => {
                const isSelected = p2Answer === choice.id;
                const isChecked = p2Checked;
                let cls = "w-full text-left p-4 rounded border font-body text-sm transition-all ";
                if (isChecked && isSelected) {
                  cls += choice.correct
                    ? "bg-sprawl-teal/15 border-sprawl-teal text-gray-800 dark:text-gray-200"
                    : "bg-sprawl-deep-red/15 border-sprawl-bright-red text-gray-800 dark:text-gray-200";
                } else if (isSelected) {
                  cls += "bg-sprawl-yellow/10 border-sprawl-yellow text-gray-800 dark:text-gray-200";
                } else {
                  cls += "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-sprawl-yellow";
                }
                return (
                  <button key={choice.id} onClick={() => !p2Checked && setP2Answer(choice.id)} className={cls}>
                    <span className="font-ui font-bold text-xs mr-2">{choice.id.toUpperCase()}.</span>
                    {choice.text}
                    {isChecked && isSelected && (
                      <p className="mt-2 font-ui text-xs italic text-gray-500 dark:text-gray-400">
                        {choice.explanation}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
            {!p2Checked ? (
              <button
                onClick={() => setP2Checked(true)}
                disabled={!p2Answer}
                className="px-5 py-2 bg-sprawl-yellow text-sprawl-deep-blue font-headline uppercase text-xs rounded hover:bg-sprawl-yellow/80 disabled:opacity-40 transition-all"
              >
                Submit Answer
              </button>
            ) : (
              <div className="space-y-3">
                {UNOCAL_PRONG2.choices.find((c) => c.id === p2Answer)?.correct ? (
                  <div className="p-3 rounded border bg-sprawl-teal/10 border-sprawl-teal text-sprawl-teal font-ui text-sm">
                    ✓ Correct — The § 72 Self-Tender satisfies both prongs of Unocal.
                  </div>
                ) : (
                  <div className="p-3 rounded border bg-sprawl-deep-red/10 border-sprawl-bright-red text-sprawl-bright-red font-ui text-sm">
                    ✗ Review your reasoning — see explanation above.
                  </div>
                )}
                <button
                  onClick={() => setPhase(3)}
                  className="px-5 py-2 bg-sprawl-yellow text-sprawl-deep-blue font-headline uppercase text-xs rounded hover:bg-sprawl-yellow/80 transition-all"
                >
                  Next: Revlon Trigger Analysis →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Phase 3: Revlon Trigger */}
      {phase === 3 && (
        <div className="space-y-6">
          <div className="border border-sprawl-yellow/40 rounded-lg p-4">
            <p className="font-ui text-xs text-sprawl-yellow uppercase tracking-wider mb-1">Phase 3 of 4</p>
            <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white mb-2">
              Revlon Trigger Analysis
            </h2>
            <p className="font-body text-sm text-gray-700 dark:text-gray-300 mb-4">
              For each scenario below, determine whether <em>Revlon</em> duties are triggered. 
              When a company is being "sold," directors become auctioneers and must maximize immediate value.
              When control remains in the market, the BJR applies.
            </p>
            <div className="space-y-4">
              {REVLON_TRIGGERS.map((trigger, idx) => (
                <div key={trigger.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <p className="font-ui text-xs text-sprawl-light-blue mb-1">Scenario {idx + 1}</p>
                  <p className="font-body text-sm text-gray-800 dark:text-gray-200 mb-3">{trigger.scenario}</p>
                  <div className="flex gap-3">
                    {["yes", "no"].map((val) => {
                      const isSelected = revlonAnswers[trigger.id] === val;
                      const isCorrect = trigger.answer === val;
                      let cls = "px-4 py-1.5 rounded font-headline uppercase text-xs border transition-all ";
                      if (revlonChecked && isSelected) {
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
                          onClick={() => !revlonChecked && setRevlonAnswers({ ...revlonAnswers, [trigger.id]: val })}
                          className={cls}
                        >
                          {val === "yes" ? "Revlon Triggered" : "No Revlon"}
                        </button>
                      );
                    })}
                  </div>
                  {revlonChecked && revlonAnswers[trigger.id] && (
                    <div className={`mt-2 p-2 rounded font-ui text-xs ${revlonAnswers[trigger.id] === trigger.answer ? "text-sprawl-teal" : "text-sprawl-bright-red"}`}>
                      {trigger.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {!revlonChecked ? (
              <button
                onClick={() => setRevlonChecked(true)}
                disabled={Object.keys(revlonAnswers).length < REVLON_TRIGGERS.length}
                className="mt-4 px-5 py-2 bg-sprawl-yellow text-sprawl-deep-blue font-headline uppercase text-xs rounded hover:bg-sprawl-yellow/80 disabled:opacity-40 transition-all"
              >
                Check All Scenarios
              </button>
            ) : (
              <div className="mt-4 space-y-3">
                <div className={`p-3 rounded border font-ui text-sm ${revlonScore >= 3 ? "bg-sprawl-teal/10 border-sprawl-teal text-sprawl-teal" : "bg-sprawl-yellow/10 border-sprawl-yellow text-sprawl-yellow"}`}>
                  {revlonScore}/{REVLON_TRIGGERS.length} correct · {revlonScore === REVLON_TRIGGERS.length ? "Expert M&A analysis — Revlon triggers mastered." : "Review the explanations above to refine your analysis."}
                </div>
                <button
                  onClick={() => setPhase(4)}
                  className="px-5 py-2 bg-sprawl-yellow text-sprawl-deep-blue font-headline uppercase text-xs rounded hover:bg-sprawl-yellow/80 transition-all"
                >
                  Draft the Holding →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Phase 4: Mad-Libs Holding */}
      {phase === 4 && (
        <div className="space-y-6">
          <div className="border border-sprawl-yellow/40 rounded-lg p-4">
            <p className="font-ui text-xs text-sprawl-yellow uppercase tracking-wider mb-1">Phase 4 of 4</p>
            <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white mb-2">
              Draft the Court's Holding
            </h2>
            <p className="font-body text-sm text-gray-700 dark:text-gray-300 mb-4">
              Complete the Council of Sprawl's (Delaware Supreme Court's) holding by selecting the
              correct legal terms. This is your final ruling.
            </p>
            <div className="bg-sprawl-deep-blue/30 dark:bg-sprawl-deep-blue border border-sprawl-yellow/20 rounded-lg p-5 font-body text-base leading-relaxed text-gray-800 dark:text-gray-200">
              {HOLDING_TEMPLATE.parts.map((part, idx) =>
                part.type === "text" ? (
                  <span key={idx}>{part.content}</span>
                ) : (
                  <select
                    key={idx}
                    value={holdingSelects[part.id] || ""}
                    onChange={(e) => setHoldingSelects({ ...holdingSelects, [part.id]: e.target.value })}
                    disabled={holdingChecked}
                    className={`inline-block mx-1 px-2 py-0.5 rounded border font-ui text-sm ${
                      holdingChecked
                        ? holdingSelects[part.id] === part.correct
                          ? "border-sprawl-teal bg-sprawl-teal/10 text-sprawl-teal"
                          : "border-sprawl-bright-red bg-sprawl-deep-red/10 text-sprawl-bright-red"
                        : "border-sprawl-yellow/60 bg-sprawl-deep-blue/50 text-sprawl-yellow focus:outline-none focus:border-sprawl-yellow"
                    }`}
                  >
                    <option value="">— select —</option>
                    {part.options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                )
              )}
            </div>

            {!holdingChecked ? (
              <button
                onClick={() => setHoldingChecked(true)}
                disabled={holdingParts.some((p) => !holdingSelects[p.id])}
                className="mt-4 px-5 py-2 bg-sprawl-yellow text-sprawl-deep-blue font-headline uppercase text-xs rounded hover:bg-sprawl-yellow/80 disabled:opacity-40 transition-all"
              >
                File the Holding
              </button>
            ) : (
              <div className="mt-4 space-y-3">
                <div className={`p-3 rounded border font-ui text-sm ${holdingScore === holdingParts.length ? "bg-sprawl-teal/10 border-sprawl-teal text-sprawl-teal" : "bg-sprawl-yellow/10 border-sprawl-yellow text-sprawl-yellow"}`}>
                  {holdingScore}/{holdingParts.length} terms correct ·{" "}
                  {holdingScore === holdingParts.length
                    ? "⚖ Holding accepted. The Council of Sprawl is satisfied."
                    : "Review the highlighted terms — the Council requires precision."}
                </div>
                <button
                  onClick={() => setPhase(5)}
                  className="px-5 py-2 bg-sprawl-yellow text-sprawl-deep-blue font-headline uppercase text-xs rounded hover:bg-sprawl-yellow/80 transition-all"
                >
                  See Final Verdict →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Phase 5: Final Verdict */}
      {phase === 5 && (
        <div className="space-y-6">
          <div className="bg-sprawl-deep-blue border border-sprawl-yellow/40 rounded-lg p-6 text-center">
            <p className="font-ui text-xs text-sprawl-yellow/60 uppercase tracking-widest mb-4">
              Council of Sprawl · Final Judgment
            </p>
            <h2 className="font-headline text-3xl uppercase text-sprawl-yellow mb-4">
              Analysis Complete
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Prong 1", score: `${p1Score}/${p1Total}` },
                { label: "Prong 2", score: p2Answer === "c1" ? "✓" : "✗" },
                { label: "Revlon", score: `${revlonScore}/${REVLON_TRIGGERS.length}` },
                { label: "Holding", score: `${holdingScore}/${holdingParts.length}` },
              ].map((s) => (
                <div key={s.label} className="bg-sprawl-deep-blue/50 border border-sprawl-yellow/20 rounded p-3">
                  <p className="font-ui text-xs text-gray-400 uppercase">{s.label}</p>
                  <p className="font-headline text-2xl text-sprawl-teal">{s.score}</p>
                </div>
              ))}
            </div>
            <p className="font-body text-base text-gray-300 leading-relaxed max-w-xl mx-auto mb-6">
              You have applied <em>Unocal</em>'s enhanced scrutiny to a hostile takeover defense,
              analyzed four distinct deal structures under <em>Revlon</em>, and drafted a judicial
              holding under <strong>DGCL § 141(a)</strong>. The board of ZCS-Theta acted in good
              faith — its defense was upheld, and the company remained independent.
            </p>
            <div className="text-left bg-black/20 border border-sprawl-teal/20 rounded p-4 font-ui text-xs text-gray-400 max-w-xl mx-auto">
              <p className="text-sprawl-teal font-bold mb-1">CASEBOOK REFERENCE</p>
              <p><em>Unocal Corp. v. Mesa Petroleum Co.</em>, 493 A.2d 946 (Del. 1985) — Enhanced scrutiny, two-prong test</p>
              <p className="mt-1"><em>Revlon, Inc. v. MacAndrews &amp; Forbes Holdings, Inc.</em>, 506 A.2d 173 (Del. 1986) — Auctioneer duty</p>
              <p className="mt-1"><em>Unitrin, Inc. v. Am. Gen. Corp.</em>, 651 A.2d 1361 (Del. 1995) — Range of reasonableness</p>
              <p className="mt-1">DGCL § 141(a) — Board authority to manage business and affairs of the corporation</p>
            </div>
            <button
              onClick={() => {
                setPhase(0);
                setP1Answers({});
                setP1Checked(false);
                setP2Answer(null);
                setP2Checked(false);
                setRevlonAnswers({});
                setRevlonChecked(false);
                setHoldingSelects({});
                setHoldingChecked(false);
              }}
              className="mt-6 px-6 py-2 border border-sprawl-yellow text-sprawl-yellow font-headline uppercase text-xs rounded hover:bg-sprawl-yellow/10 transition-all"
            >
              Restart Simulation
            </button>
          </div>
        </div>
      )}

      {/* Progress Indicator */}
      {phase > 0 && phase < 5 && (
        <div className="flex gap-2 justify-center mt-6">
          {[1, 2, 3, 4].map((p) => (
            <div
              key={p}
              className={`h-1.5 rounded-full transition-all ${
                p < phase
                  ? "w-8 bg-sprawl-teal"
                  : p === phase
                  ? "w-8 bg-sprawl-yellow"
                  : "w-4 bg-gray-600"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
