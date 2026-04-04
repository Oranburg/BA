import { useState } from "react";
import { statutes, STATUTE_MAP, getStatute } from "../../data/statutes/index.js";

export default function TomeOfLaw({ isOpen, onClose }) {
  const [selectedLaw, setSelectedLaw] = useState("RSA");
  const [selectedSection, setSelectedSection] = useState("");
  const [result, setResult] = useState(null);

  const sections = Object.keys(statutes[selectedLaw] || {});

  function handleSearch() {
    const r = getStatute(selectedLaw, selectedSection);
    setResult(r);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="tome-of-law-title">
      <button type="button" className="absolute inset-0 bg-black/60" onClick={onClose} aria-label="Close dialog" />
      <div className="relative z-10 w-full max-w-lg bg-sprawl-deep-blue border border-sprawl-yellow/40 rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 id="tome-of-law-title" className="font-headline text-xl uppercase tracking-wider text-sprawl-yellow">
            ⚖ Tome of Law
          </h2>
          <button
            onClick={onClose}
            aria-label="Close Tome of Law"
            className="text-gray-400 hover:text-white font-ui text-sm"
          >
            ✕ Close
          </button>
        </div>
        <p className="font-ui text-sm text-gray-400 mb-4">
          Retrieve verbatim statutory sections by ShortName ID
        </p>

        <div className="flex gap-2 mb-3">
          <select
            value={selectedLaw}
            onChange={(e) => {
              setSelectedLaw(e.target.value);
              setSelectedSection("");
              setResult(null);
            }}
            aria-label="Select statute"
            className="flex-1 bg-sprawl-bright-blue/20 border border-sprawl-yellow/30 rounded px-3 py-2 font-ui text-sm text-white focus:outline-none focus:border-sprawl-yellow"
          >
            {Object.keys(STATUTE_MAP).map((k) => (
              <option key={k} value={k} className="bg-sprawl-deep-blue">
                {k} — {STATUTE_MAP[k]}
              </option>
            ))}
          </select>
          <select
            value={selectedSection}
            onChange={(e) => {
              setSelectedSection(e.target.value);
              setResult(null);
            }}
            aria-label="Select section"
            className="flex-1 bg-sprawl-bright-blue/20 border border-sprawl-yellow/30 rounded px-3 py-2 font-ui text-sm text-white focus:outline-none focus:border-sprawl-yellow"
          >
            <option value="" className="bg-sprawl-deep-blue">Select §</option>
            {sections.map((s) => (
              <option key={s} value={s} className="bg-sprawl-deep-blue">
                § {s}
              </option>
            ))}
          </select>
          <button
            onClick={handleSearch}
            disabled={!selectedSection}
            className="px-4 py-2 bg-sprawl-yellow text-sprawl-deep-blue font-headline font-bold uppercase tracking-wider text-sm rounded hover:bg-sprawl-yellow/80 disabled:opacity-40 transition-all"
          >
            Load
          </button>
        </div>

        {result && (
          <div className="bg-sprawl-bright-blue/10 border border-sprawl-teal/30 rounded p-4 mt-3">
            <h3 className="font-headline text-sprawl-teal uppercase tracking-wider text-sm mb-2">
              {selectedLaw} § {selectedSection} — {result.title}
            </h3>
            <p className="font-body text-gray-200 text-sm leading-relaxed">{result.text}</p>
          </div>
        )}
      </div>
    </div>
  );
}
