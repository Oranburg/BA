import CitationChip from "../../tome/CitationChip";
import { useTome } from "../../tome/useTome";
import { downloadTextFile, useModuleProgress } from "../../learning/progress";

const PROXY_FACTS = [
  {
    id: "f1",
    text: "Incumbent board moved annual meeting date forward by 25 days after activist nomination notice.",
    legalWeight: "high",
    side: "challenger",
  },
  {
    id: "f2",
    text: "Company filed supplemental disclosure correcting prior omission on banker fee incentives.",
    legalWeight: "medium",
    side: "incumbent",
  },
  {
    id: "f3",
    text: "Activist slate financed by competitor with undisclosed commercial side agreements.",
    legalWeight: "high",
    side: "incumbent",
  },
  {
    id: "f4",
    text: "Board rejected all activist nominees without interviewing them.",
    legalWeight: "medium",
    side: "challenger",
  },
];

const PROCESS_CHOICES = [
  {
    id: "pc1",
    label: "Freeze bylaw changes, provide neutral disclosure supplement, and allow both slates equal access to record date mechanics",
    quality: "best",
  },
  {
    id: "pc2",
    label: "Delay meeting indefinitely while litigation proceeds",
    quality: "weak",
  },
  {
    id: "pc3",
    label: "Accelerate vote and restrict stockholder communication channels",
    quality: "weak",
  },
  {
    id: "pc4",
    label: "Adopt rights plan narrowly tailored to disclosure failures and re-open nomination window",
    quality: "strong",
  },
];


function buildShareholderExportText({ ranking, selectedProcess, missingFact, notes }) {
  const lines = [
    "SHAREHOLDER FRANCHISE DECISION RECORD",
    "",
    "Module: Chapter 12 Shareholder Franchise",
    "",
    "Risk ranking (strongest to weakest):",
    ranking.map((id, idx) => `${idx + 1}. ${PROXY_FACTS.find((f) => f.id === id)?.text || id}`).join("\n") || "No ranking submitted.",
    "",
    "Process choice:",
    selectedProcess?.label || "Not selected",
    "",
    "Missing fact that would change result:",
    missingFact || "Not provided",
    "",
    "Counsel notes:",
    notes || "No notes drafted.",
    "",
    "Best plaintiff argument:",
    "Board manipulated franchise mechanics and impaired stockholder voting rights.",
    "Best defense argument:",
    "Board acted to preserve informed voting and neutral process integrity under real disclosure threats.",
  ];
  return lines.join("\n");
}

const INITIAL_STATE = {
  rankedRisks: [],
  processChoice: "",
  missingFact: "",
  notes: "",
  completed: false,
};

function rankScore(rankedRisks) {
  if (!rankedRisks?.length) return 0;
  const target = ["f1", "f3", "f4", "f2"];
  return rankedRisks.reduce((sum, id, idx) => (id === target[idx] ? sum + 1 : sum), 0);
}

export default function Ch12ShareholderFranchise() {
  const { openTome } = useTome();
  const { state, patch, markCompleted } = useModuleProgress("ch12-shareholder-franchise", INITIAL_STATE);

  const ranking = state.rankedRisks || [];
  const rankingQuality = rankScore(ranking);
  const selectedProcess = PROCESS_CHOICES.find((p) => p.id === state.processChoice);

  const exportText = buildShareholderExportText({
    ranking,
    selectedProcess,
    missingFact: state.missingFact,
    notes: state.notes,
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-6">
      <p className="font-ui text-xs text-sprawl-yellow/60 uppercase tracking-widest">Chapter 12 · Shareholder Franchise</p>
      <h1 className="font-headline text-4xl uppercase tracking-tight text-gray-900 dark:text-white">Proxy Contest Control Room</h1>
      <p className="font-body text-gray-700 dark:text-gray-300">
        ConstructEdge enters public-company governance. Activist pressure, disclosure friction, and
        process design now determine franchise legitimacy.
      </p>

      <div className="flex flex-wrap gap-2">
        <CitationChip citation="DGCL § 211" />
        <CitationChip citation="DGCL § 220" />
        <CitationChip citation="Blasius" />
        <button
          onClick={() => openTome({ query: "DGCL § 211" })}
          className="rounded border border-sprawl-yellow/40 px-2 py-1 font-ui text-xs text-sprawl-yellow hover:bg-sprawl-yellow/10"
        >
          Open in Tome
        </button>
      </div>

      <section className="border border-sprawl-yellow/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
        <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white mb-2">Risk ranking exercise</h2>
        <p className="font-ui text-xs text-gray-500 mb-3">Rank from strongest litigation risk to weakest.</p>
        <div className="space-y-2">
          {PROXY_FACTS.map((fact) => {
            const position = ranking.indexOf(fact.id);
            return (
              <div key={fact.id} className="border border-gray-200 dark:border-gray-700 rounded p-3">
                <p className="font-body text-sm text-gray-700 dark:text-gray-300">{fact.text}</p>
                <div className="mt-2 flex flex-wrap gap-2 items-center">
                  <span className="font-ui text-xs text-gray-500">Position:</span>
                  {[1, 2, 3, 4].map((n) => (
                    <button
                      key={n}
                      onClick={() => {
                        const next = [...ranking.filter((x) => x !== fact.id)];
                        next.splice(n - 1, 0, fact.id);
                        patch({ rankedRisks: next.slice(0, 4) });
                      }}
                      className={`px-2 py-1 text-xs rounded border ${
                        position === n - 1 ? "border-sprawl-yellow bg-sprawl-yellow/10" : "border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                  <span className="font-ui text-xs text-sprawl-light-blue">Weight: {fact.legalWeight}</span>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-3 font-ui text-xs text-sprawl-teal">Ranking precision: {rankingQuality}/4</p>
      </section>

      <section className="border border-sprawl-yellow/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
        <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white mb-2">Choose-the-process</h2>
        <p className="font-ui text-xs text-gray-500 mb-3">Pick the process most defensible under franchise-sensitive scrutiny.</p>
        <div className="space-y-2">
          {PROCESS_CHOICES.map((choice) => (
            <button
              key={choice.id}
              onClick={() => patch({ processChoice: choice.id })}
              className={`w-full text-left border rounded p-3 ${
                state.processChoice === choice.id
                  ? "border-sprawl-yellow bg-sprawl-yellow/10"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <p className="font-body text-sm text-gray-700 dark:text-gray-300">{choice.label}</p>
              <p className="font-ui text-xs text-gray-500 mt-1">Process quality: {choice.quality}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="border border-sprawl-yellow/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
        <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white mb-2">Missing fact finder</h2>
        <p className="font-ui text-xs text-gray-500 mb-2">Identify one missing fact that could flip your recommendation.</p>
        <input
          value={state.missingFact || ""}
          onChange={(e) => patch({ missingFact: e.target.value })}
          placeholder="e.g., whether controller-linked funds coordinated with either slate"
          className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-sprawl-deep-blue/70 p-2 font-body text-sm"
        />
      </section>

      <section className="border border-sprawl-yellow/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
        <h2 className="font-headline text-xl uppercase text-gray-900 dark:text-white mb-2">Counsel recommendation notes</h2>
        <textarea
          value={state.notes || ""}
          onChange={(e) => patch({ notes: e.target.value })}
          placeholder="Draft recommendation: voting-process protections, disclosure repairs, and litigation posture."
          className="w-full min-h-32 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-sprawl-deep-blue/70 p-3 font-body text-sm"
        />
        <div className="mt-4">
          <button
            onClick={() => {
              markCompleted();
              downloadTextFile("constructedge-shareholder-franchise-record.txt", exportText);
            }}
            className="px-5 py-2 bg-sprawl-yellow text-sprawl-deep-blue font-headline uppercase text-xs rounded hover:bg-sprawl-yellow/80"
          >
            Complete Module + Export Decision Record
          </button>
        </div>
      </section>
    </div>
  );
}
