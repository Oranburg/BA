import { useState } from "react";

const ACTIONS = [
  { id: "1", label: "Sign contract within usual business scope", correct: "Actual" },
  { id: "2", label: "Third party reasonably assumed authority", correct: "Apparent" },
  { id: "3", label: "Agent exceeds express instructions", correct: "Inherent" },
  { id: "4", label: "Principal granted written power of attorney", correct: "Actual" },
  { id: "5", label: "Agent acts without any authorization", correct: "None" },
];

const CATEGORIES = ["Actual", "Apparent", "Inherent", "None"];

export default function AuthorityMatrix() {
  const [assignments, setAssignments] = useState({});
  const [checked, setChecked] = useState(false);

  function assign(actionId, category) {
    setAssignments({ ...assignments, [actionId]: category });
    setChecked(false);
  }

  const allAssigned = ACTIONS.every((a) => assignments[a.id]);
  const score = ACTIONS.filter((a) => assignments[a.id] === a.correct).length;

  return (
    <div className="bg-white dark:bg-sprawl-deep-blue/80 border border-gray-200 dark:border-sprawl-yellow/20 rounded-lg p-6">
      <h3 className="font-headline text-lg uppercase tracking-wider text-sprawl-deep-blue dark:text-sprawl-yellow mb-1">
        Authority Matrix
      </h3>
      <p className="font-ui text-xs text-gray-500 dark:text-gray-400 mb-4">
        Classify each agent action by authority type
      </p>

      <div className="space-y-3">
        {ACTIONS.map((action) => (
          <div key={action.id} className="flex flex-col sm:flex-row gap-2">
            <p className="flex-1 font-body text-sm text-gray-700 dark:text-gray-300 pt-1">
              {action.label}
            </p>
            <div className="flex gap-1 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => assign(action.id, cat)}
                  className={`px-2 py-1 rounded font-ui text-xs transition-all border ${
                    assignments[action.id] === cat
                      ? checked
                        ? assignments[action.id] === action.correct
                          ? "bg-sprawl-teal border-sprawl-teal text-sprawl-deep-blue"
                          : "bg-sprawl-bright-red border-sprawl-bright-red text-white"
                        : "bg-sprawl-yellow border-sprawl-yellow text-sprawl-deep-blue"
                      : "border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-sprawl-yellow"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mt-4">
        <button
          onClick={() => setChecked(true)}
          disabled={!allAssigned}
          className="px-4 py-2 bg-sprawl-yellow text-sprawl-deep-blue font-headline uppercase tracking-wider text-xs rounded hover:bg-sprawl-yellow/80 disabled:opacity-40 transition-all"
        >
          Check Answers
        </button>
        <button
          onClick={() => { setAssignments({}); setChecked(false); }}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 font-headline uppercase tracking-wider text-xs rounded hover:border-sprawl-yellow transition-all"
        >
          Reset
        </button>
      </div>

      {checked && (
        <div className={`mt-3 p-3 rounded border font-ui text-xs ${score === ACTIONS.length ? "bg-sprawl-teal/10 border-sprawl-teal text-sprawl-teal" : "bg-sprawl-yellow/10 border-sprawl-yellow text-sprawl-yellow"}`}>
          Score: {score}/{ACTIONS.length} — {score === ACTIONS.length ? "Perfect! All authority types correctly identified." : "Review highlighted items."}
        </div>
      )}
    </div>
  );
}
