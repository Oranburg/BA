import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DOCUMENTS, isSectionsLoaded, getTomePath } from "./corpus";
import { loadDocSections, getBreadcrumbs, getReverseCitations, buildChapterLink } from "./resolver";
import { APP_ROUTES } from "../routing/routes";

export default function TomeQuickRef({ docSlug, sectionNumber, onClose }) {
  const [doc, setDoc] = useState(null);
  const [section, setSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      setLoading(true);
      setError(false);

      const found = DOCUMENTS.find((d) => d.slug === docSlug);
      if (!found) {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
        return;
      }

      if (!isSectionsLoaded(found) && found.sectionsFile) {
        await loadDocSections(found);
      }

      if (cancelled) return;

      const sec = (found.sections || []).find(
        (s) => String(s.number).toLowerCase() === String(sectionNumber).toLowerCase()
      );

      setDoc(found);
      setSection(sec || null);
      setError(!sec);
      setLoading(false);
    }

    resolve();
    return () => { cancelled = true; };
  }, [docSlug, sectionNumber]);

  if (loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6">
        <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-sprawl-yellow border-t-transparent" />
        <p className="font-ui text-sm text-gray-300">Loading section...</p>
      </div>
    );
  }

  if (error || !doc || !section) {
    return (
      <div className="flex h-full flex-col p-6">
        <div className="flex items-center justify-between">
          <p className="font-headline text-sm uppercase tracking-wider text-gray-400">Quick Reference</p>
          {onClose && (
            <button onClick={onClose} className="rounded border border-gray-600 px-2 py-1 font-ui text-xs text-gray-300 hover:border-gray-400" aria-label="Close panel">
              Close
            </button>
          )}
        </div>
        <div className="mt-8 rounded border border-sprawl-yellow/20 bg-sprawl-bright-blue/10 p-4">
          <p className="font-ui text-sm text-gray-300">Section not found.</p>
          <p className="mt-1 font-ui text-xs text-gray-500">
            {docSlug ? `Document: ${docSlug}` : "No document specified"}{sectionNumber ? ` / Section: ${sectionNumber}` : ""}
          </p>
        </div>
      </div>
    );
  }

  const chapters = section.chapterUse || doc.chapters || [];
  const reverse = getReverseCitations(doc.shortName, section.number);
  const breadcrumbs = getBreadcrumbs(doc, section);
  const fullPath = getTomePath(doc, section);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-sprawl-yellow/20 px-5 py-4">
        <div className="min-w-0">
          <nav className="flex flex-wrap items-center gap-1 font-ui text-xs text-gray-400">
            {breadcrumbs.map((b, i) => (
              <span key={b.label}>
                <span className="text-gray-500">{b.label}</span>
                {i < breadcrumbs.length - 1 && <span className="mx-1 text-sprawl-yellow/60">/</span>}
              </span>
            ))}
          </nav>
          <h2 className="mt-1 font-headline text-lg uppercase tracking-wider text-sprawl-yellow">
            {doc.shortName} &sect; {section.number}
          </h2>
          <p className="font-ui text-sm text-gray-300">{section.title}</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="ml-3 shrink-0 rounded border border-gray-600 px-2 py-1 font-ui text-xs text-gray-300 hover:border-gray-400" aria-label="Close panel">
            Close
          </button>
        )}
      </div>

      {/* Section text */}
      <div className="flex-1 overflow-auto px-5 py-6">
        <p className="font-body text-lg leading-8 text-gray-100">{section.text}</p>

        {/* Used in chapters */}
        {chapters.length > 0 && (
          <div className="mt-6">
            <p className="font-headline text-xs uppercase tracking-wider text-sprawl-yellow">Used in Chapters</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {chapters.map((ch) => (
                <Link
                  key={ch}
                  to={buildChapterLink(ch)}
                  onClick={onClose}
                  className="rounded border border-sprawl-teal/40 px-2 py-1 font-ui text-xs text-sprawl-teal hover:bg-sprawl-teal/10"
                >
                  Ch. {ch}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Reverse citations */}
        {reverse.length > 0 && (
          <div className="mt-6">
            <p className="font-headline text-xs uppercase tracking-wider text-sprawl-yellow">
              Cases interpreting this ({reverse.length})
            </p>
            <div className="mt-2 space-y-1">
              {reverse.slice(0, 8).map((r, i) => (
                <p key={`${r.doc.id}-${r.section.number}-${i}`} className="font-ui text-xs text-gray-300">
                  {r.doc.shortName} &sect; {r.section.number} &mdash; {r.label}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Cross-references */}
        {(section.crossRefs || []).length > 0 && (
          <div className="mt-6">
            <p className="font-headline text-xs uppercase tracking-wider text-sprawl-yellow">Cross-References</p>
            <div className="mt-2 space-y-1">
              {section.crossRefs.map((ref, i) => (
                <p key={i} className="font-ui text-xs text-gray-300">
                  {ref.label || ref.target}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Open full document link */}
        <div className="mt-8">
          <Link
            to={fullPath}
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded border border-sprawl-yellow/50 px-4 py-2 font-ui text-sm text-sprawl-yellow hover:bg-sprawl-yellow/10"
          >
            Open full document
            <span aria-hidden>&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
