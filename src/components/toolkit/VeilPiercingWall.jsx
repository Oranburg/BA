import { useState } from "react";

const CRACK_LINES = Array.from({ length: 5 }, (_, i) => ({
  top: `${20 + i * 15}%`,
  left: `${(i * 7 + 3) % 10}%`,
  width: `${80 + ((i * 13 + 5) % 20)}%`,
  opacity: 0.5 + ((i * 17 + 3) % 50) / 100,
}));

const RISK_TAGS = [
  { id: "commingling", label: "Asset Commingling", severity: "high" },
  { id: "undercap", label: "Undercapitalization", severity: "high" },
  { id: "fraud", label: "Fraud / Injustice", severity: "critical" },
  { id: "alter-ego", label: "Alter Ego", severity: "high" },
  { id: "formalities", label: "Ignored Formalities", severity: "medium" },
];

export default function VeilPiercingWall() {
  const [appliedTags, setAppliedTags] = useState([]);
  const [dragging, setDragging] = useState(null);

  const isGlitching = appliedTags.length >= 2;
  const isBroken = appliedTags.length >= 3;

  function handleDrop(e) {
    e.preventDefault();
    if (dragging && !appliedTags.find((t) => t.id === dragging.id)) {
      setAppliedTags([...appliedTags, dragging]);
    }
    setDragging(null);
  }

  function removeTag(id) {
    setAppliedTags(appliedTags.filter((t) => t.id !== id));
  }

  return (
    <div className="bg-white dark:bg-sprawl-deep-blue/80 border border-gray-200 dark:border-sprawl-yellow/20 rounded-lg p-6">
      <h3 className="font-headline text-lg uppercase tracking-wider text-sprawl-deep-blue dark:text-sprawl-yellow mb-1">
        Veil-Piercing Wall
      </h3>
      <p className="font-ui text-sm text-gray-500 dark:text-gray-400 mb-4">
        Drag risk factors onto the entity boundary to test veil integrity
      </p>

      <div className="flex flex-wrap gap-2 mb-4" role="list" aria-label="Available risk factors">
        {RISK_TAGS.filter((t) => !appliedTags.find((a) => a.id === t.id)).map((tag) => (
          <button
            key={tag.id}
            type="button"
            draggable
            onDragStart={() => setDragging(tag)}
            onClick={() => {
              if (!appliedTags.find((t) => t.id === tag.id)) {
                setAppliedTags([...appliedTags, tag]);
              }
            }}
            role="listitem"
            aria-label={`Apply risk factor: ${tag.label} (${tag.severity} severity)`}
            className={`px-3 py-1.5 rounded font-ui text-sm cursor-grab active:cursor-grabbing border ${
              tag.severity === "critical"
                ? "border-sprawl-bright-red text-sprawl-bright-red bg-sprawl-bright-red/10"
                : tag.severity === "high"
                ? "border-sprawl-deep-red text-sprawl-deep-red bg-sprawl-deep-red/10 dark:text-sprawl-light-red"
                : "border-yellow-500 text-yellow-600 bg-yellow-500/10 dark:text-yellow-400"
            }`}
          >
            ⚡ {tag.label}
          </button>
        ))}
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        aria-live="polite"
        aria-label={isBroken ? "Corporate veil pierced" : isGlitching ? "Corporate veil stressed" : "Corporate veil intact"}
        className={`relative rounded-lg border-2 p-6 min-h-[120px] transition-all ${
          isBroken
            ? "border-sprawl-bright-red bg-sprawl-bright-red/10 animate-pulse"
            : isGlitching
            ? "border-yellow-500 bg-yellow-500/10"
            : "border-sprawl-teal bg-sprawl-teal/10 dark:border-sprawl-teal/40"
        }`}
      >
        <div className="text-center mb-3">
          <span
            className={`font-headline uppercase tracking-wider text-sm ${
              isBroken
                ? "text-sprawl-bright-red"
                : isGlitching
                ? "text-yellow-500"
                : "text-sprawl-teal"
            }`}
          >
            {isBroken ? "⚡ VEIL PIERCED — Entity Liability" : isGlitching ? "⚠ VEIL STRESSED" : "🛡 Corporate Veil Intact"}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 justify-center" role="list" aria-label="Applied risk factors">
          {appliedTags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => removeTag(tag.id)}
              aria-label={`Remove risk factor: ${tag.label}`}
              className="px-3 py-1.5 rounded font-ui text-sm cursor-pointer bg-sprawl-bright-red/20 border border-sprawl-bright-red text-sprawl-bright-red hover:bg-sprawl-bright-red/40 transition-all"
            >
              ✕ {tag.label}
            </button>
          ))}
          {appliedTags.length === 0 && (
            <p className="font-ui text-sm text-gray-400 italic">Drop risk factors here</p>
          )}
        </div>

        {isBroken && (
          <div className="absolute inset-0 rounded-lg pointer-events-none overflow-hidden">
            {CRACK_LINES.map((line, i) => (
              <div
                key={i}
                className="absolute bg-sprawl-bright-red/20 h-0.5"
                style={line}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
