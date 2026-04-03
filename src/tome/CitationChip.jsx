import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { resolveQuery } from "./resolver";
import { getTomePath, toSlugToken } from "./corpus";
import { useTome } from "./useTome";

export default function CitationChip({ citation, label }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { openTome } = useTome();
  const resolution = resolveQuery(citation);

  const sectionResult = resolution.type === "section" ? resolution.result : null;
  const previewId = `cite-preview-${toSlugToken(citation)}`;

  function openSectionInPanel() {
    if (sectionResult) {
      openTome({ docSlug: sectionResult.doc.slug, sectionNumber: sectionResult.section.number, query: citation });
      return;
    }
    openTome({ query: citation });
  }

  function openStandalone() {
    if (sectionResult) {
      navigate(getTomePath(sectionResult.doc, sectionResult.section));
      return;
    }
    navigate("/tome");
  }

  return (
    <span className="relative inline-block align-middle">
      <button
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={openSectionInPanel}
        aria-label={`Open citation ${citation} in Tome`}
        aria-describedby={sectionResult ? previewId : undefined}
        className="inline-flex items-center gap-1 rounded-full border border-sprawl-yellow/60 bg-sprawl-yellow/10 px-2 py-0.5 text-xs font-ui text-sprawl-yellow hover:bg-sprawl-yellow/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sprawl-yellow"
      >
        <span aria-hidden>📜</span>
        <span>{label || citation}</span>
      </button>

      {open && sectionResult && (
        <div
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          id={previewId}
          role="tooltip"
          className="absolute z-40 mt-2 w-80 rounded-lg border border-sprawl-yellow/30 bg-sprawl-deep-blue p-3 shadow-2xl"
        >
          <p className="font-headline text-xs uppercase tracking-wider text-sprawl-yellow">
            {sectionResult.doc.shortName} § {sectionResult.section.number}
          </p>
          <p className="mt-1 font-ui text-xs text-gray-300">{sectionResult.section.title}</p>
          <p className="mt-2 font-body text-sm text-gray-200 leading-relaxed">
            {sectionResult.section.text.split(" ").slice(0, 35).join(" ")}...
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={openSectionInPanel}
              className="rounded border border-sprawl-teal/60 px-2 py-1 text-xs font-ui text-sprawl-teal hover:bg-sprawl-teal/10"
            >
              Read in side panel
            </button>
            <button
              onClick={openStandalone}
              className="rounded border border-sprawl-yellow/60 px-2 py-1 text-xs font-ui text-sprawl-yellow hover:bg-sprawl-yellow/10"
            >
              Read full section
            </button>
          </div>
        </div>
      )}
    </span>
  );
}
