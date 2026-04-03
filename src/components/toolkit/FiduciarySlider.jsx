import { useState } from "react";

export default function FiduciarySlider() {
  const [informed, setInformed] = useState(true);
  const [goodFaith, setGoodFaith] = useState(true);
  const [disinterested, setDisinterested] = useState(true);

  const bjrActive = informed && goodFaith && disinterested;

  return (
    <div className="bg-white dark:bg-sprawl-deep-blue/80 border border-sprawl-teal/40 dark:border-sprawl-yellow/20 rounded-lg p-6">
      <h3 className="font-headline text-lg uppercase tracking-wider text-sprawl-deep-blue dark:text-sprawl-yellow mb-1">
        Fiduciary Shield Analyzer
      </h3>
      <p className="font-ui text-xs text-gray-500 dark:text-gray-400 mb-4">
        Business Judgment Rule Tipping Point Calculator
      </p>

      <div className="space-y-3 mb-5">
        {[
          { label: "Informed Decision", state: informed, setter: setInformed },
          { label: "Good Faith", state: goodFaith, setter: setGoodFaith },
          { label: "Disinterested", state: disinterested, setter: setDisinterested },
        ].map(({ label, state, setter }) => (
          <label key={label} className="flex items-center gap-3 cursor-pointer group">
            <div
              onClick={() => setter(!state)}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                state
                  ? "bg-sprawl-teal border-sprawl-teal"
                  : "bg-transparent border-sprawl-bright-red"
              }`}
            >
              {state && (
                <svg className="w-3 h-3 text-sprawl-deep-blue" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <span className="font-ui text-sm text-gray-700 dark:text-gray-300 group-hover:text-sprawl-deep-blue dark:group-hover:text-sprawl-yellow transition-colors">
              {label}
            </span>
          </label>
        ))}
      </div>

      <div
        className={`rounded p-4 text-center transition-all ${
          bjrActive
            ? "bg-sprawl-teal/20 border border-sprawl-teal"
            : "bg-sprawl-deep-red/20 border border-sprawl-bright-red animate-pulse"
        }`}
      >
        <p
          className={`font-headline uppercase tracking-wider text-sm ${
            bjrActive ? "text-sprawl-teal" : "text-sprawl-bright-red"
          }`}
        >
          {bjrActive ? "🛡 BJR Shield Active" : "⚡ BJR Shield Broken"}
        </p>
        <p className="font-ui text-xs mt-1 text-gray-500 dark:text-gray-400">
          {bjrActive
            ? "Director protected under Business Judgment Rule"
            : "Director faces entire fairness / enhanced scrutiny review"}
        </p>
      </div>
    </div>
  );
}
