import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  CASE_LAW_INDEX,
  DOCUMENT_CATEGORIES,
  DOCUMENTS,
  PREBUILT_COMPARISONS,
  getTomePath,
  isSectionsLoaded,
} from "./corpus";
import { APP_ROUTES } from "../routing/routes";
import {
  buildChapterLink,
  getBreadcrumbs,
  getDocBySlug,
  getPrevNext,
  getReverseCitations,
  getSectionBySlug,
  loadAllAndRebuild,
  loadDocSections,
  resolveQuery,
} from "./resolver";

/* ---------- Helpers ---------- */

const CATEGORY_ORDER = [
  DOCUMENT_CATEGORIES.UNIFORM_ACTS,
  DOCUMENT_CATEGORIES.STATE_CODES,
  DOCUMENT_CATEGORIES.FEDERAL,
  DOCUMENT_CATEGORIES.RESTATEMENTS,
  DOCUMENT_CATEGORIES.CASES,
];

function groupDocsByCategory() {
  const map = new Map();
  CATEGORY_ORDER.forEach((cat) => map.set(cat, []));
  DOCUMENTS.forEach((d) => {
    const cat = d.category || "Other";
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat).push(d);
  });
  return [...map.entries()].filter(([, docs]) => docs.length > 0);
}

/* ---------- Sidebar TOC ---------- */

function TocSidebar({ doc, section, onOpenSection, onClose }) {
  const categorizedDocs = useMemo(() => groupDocsByCategory(), []);

  const grouped = useMemo(() => {
    const map = new Map();
    (doc.sections || []).forEach((s) => {
      const k = s.article || "Sections";
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(s);
    });
    return [...map.entries()];
  }, [doc]);

  return (
    <aside className="flex h-full flex-col border-r border-sprawl-yellow/20 bg-sprawl-deep-blue">
      {/* Document selector */}
      <div className="border-b border-sprawl-yellow/20 p-3">
        <div className="flex items-center justify-between">
          <label htmlFor="doc-select" className="font-headline text-xs uppercase tracking-wider text-gray-400">
            Document
          </label>
          {onClose && (
            <button onClick={onClose} className="font-ui text-xs text-gray-500 hover:text-gray-300 md:hidden" aria-label="Close sidebar">
              Close
            </button>
          )}
        </div>
        <select
          id="doc-select"
          value={doc.id}
          onChange={(e) => {
            const nextDoc = DOCUMENTS.find((d) => d.id === e.target.value);
            if (nextDoc) onOpenSection(nextDoc, null);
          }}
          className="mt-1 w-full rounded border border-sprawl-yellow/30 bg-sprawl-deep-blue px-2 py-1.5 font-ui text-sm text-white"
        >
          {categorizedDocs.map(([category, docs]) => (
            <optgroup key={category} label={category}>
              {docs.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.shortName} -- {d.versionInUse}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* TOC tree */}
      <div className="flex-1 overflow-auto p-3">
        {grouped.length === 0 ? (
          <p className="font-ui text-xs text-gray-500">No sections loaded.</p>
        ) : (
          <div className="space-y-3">
            {grouped.map(([article, sections]) => (
              <div key={article}>
                <p className="font-ui text-xs font-medium uppercase tracking-wider text-gray-500">
                  {article}
                </p>
                <div className="mt-1 space-y-0.5">
                  {sections.map((s) => (
                    <button
                      key={s.number}
                      onClick={() => onOpenSection(doc, s)}
                      className={`w-full rounded px-2 py-1 text-left font-ui text-xs transition-colors ${
                        section?.number === s.number
                          ? "bg-sprawl-yellow/20 text-sprawl-yellow"
                          : "text-gray-300 hover:bg-sprawl-yellow/10 hover:text-gray-100"
                      }`}
                    >
                      &sect; {s.number} &mdash; {s.title}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Back to course view */}
      <div className="border-t border-sprawl-yellow/20 p-3">
        <Link
          to={APP_ROUTES.tomeHome}
          className="block rounded border border-sprawl-yellow/30 px-3 py-1.5 text-center font-ui text-xs text-sprawl-yellow hover:bg-sprawl-yellow/10"
        >
          Back to Course View
        </Link>
      </div>
    </aside>
  );
}

/* ---------- Comparison split view ---------- */

function ComparisonView({ leftDoc, leftSection, onOpenSection }) {
  const [selected, setSelected] = useState(PREBUILT_COMPARISONS[0]?.id || "");
  const [rightCitation, setRightCitation] = useState("ULLCA \u00A7 409");

  const current = PREBUILT_COMPARISONS.find((c) => c.id === selected) || PREBUILT_COMPARISONS[0];
  const rightRes = resolveQuery(rightCitation);
  const right = rightRes.type === "section" ? rightRes.result : null;

  return (
    <div className="rounded-lg border border-sprawl-teal/30 bg-black/20 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-headline text-xs uppercase tracking-wider text-sprawl-teal">Comparison View</p>
      </div>
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="mb-3 w-full rounded border border-sprawl-teal/40 bg-sprawl-deep-blue px-2 py-1.5 font-ui text-sm text-white"
        aria-label="Select comparison"
      >
        {PREBUILT_COMPARISONS.map((c) => (
          <option key={c.id} value={c.id}>{c.title}</option>
        ))}
      </select>
      {current && (
        <p className="mb-3 rounded bg-sprawl-teal/10 p-2 font-body text-sm text-gray-300">
          {current.note}
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Left pane */}
        <div className="rounded border border-sprawl-yellow/20 p-3">
          <p className="font-headline text-xs uppercase tracking-wider text-sprawl-yellow">
            {leftDoc.shortName} &sect; {leftSection.number}
          </p>
          <p className="mt-1 font-ui text-xs text-gray-400">{leftSection.title}</p>
          <p className="mt-2 font-body text-sm leading-7 text-gray-200">{leftSection.text}</p>
        </div>

        {/* Right pane */}
        <div className="rounded border border-sprawl-yellow/20 p-3">
          <label htmlFor="compare-right" className="font-headline text-xs uppercase tracking-wider text-gray-400">
            Compare with
          </label>
          <input
            id="compare-right"
            value={rightCitation}
            onChange={(e) => setRightCitation(e.target.value)}
            className="mt-1 w-full rounded border border-sprawl-yellow/30 bg-sprawl-deep-blue px-2 py-1.5 font-ui text-sm text-white"
          />
          {right ? (
            <div className="mt-3">
              <p className="font-headline text-xs uppercase tracking-wider text-sprawl-yellow">
                {right.doc.shortName} &sect; {right.section.number}
              </p>
              <p className="mt-1 font-ui text-xs text-gray-400">{right.section.title}</p>
              <p className="mt-2 font-body text-sm leading-7 text-gray-200">{right.section.text}</p>
              <button
                onClick={() => onOpenSection(right.doc, right.section)}
                className="mt-2 rounded border border-sprawl-yellow/40 px-2 py-1 font-ui text-xs text-sprawl-yellow hover:bg-sprawl-yellow/10"
              >
                Open full section
              </button>
            </div>
          ) : (
            <p className="mt-3 font-ui text-xs text-gray-500">
              Type a citation to compare (e.g. ULLCA &sect; 409)
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Main component ---------- */

export default function TomeDocReader() {
  const params = useParams();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [, setLoadTick] = useState(0);

  // Resolve initial doc from params or default to first doc with sections
  const initialDoc = getDocBySlug(params.docSlug) || DOCUMENTS.find((d) => d.sectionsFile) || DOCUMENTS[0];
  const [doc, setDoc] = useState(initialDoc);
  const loading = !!(doc.sectionsFile && !isSectionsLoaded(doc));

  // Resolve initial section from params
  const initialSection = params.sectionSlug && !loading
    ? getSectionBySlug(doc, params.sectionSlug)
    : null;
  const [section, setSection] = useState(initialSection || (doc.sections || [])[0] || null);

  // Load sections on mount / doc change
  useEffect(() => {
    if (!isSectionsLoaded(doc) && doc.sectionsFile) {
      let cancelled = false;
      loadDocSections(doc).then((loaded) => {
        if (cancelled) return;
        setLoadTick((t) => t + 1);
        // Try to resolve section from route params after load
        if (params.sectionSlug) {
          const resolved = getSectionBySlug(loaded, params.sectionSlug);
          if (resolved) {
            setSection(resolved);
            return;
          }
        }
        setSection((prev) => prev || (loaded.sections || [])[0] || null);
      });
      return () => { cancelled = true; };
    }
  }, [doc, params.sectionSlug]);

  // Sync doc if route changes — use a derived approach to avoid setState in effect
  const routeDocSlug = params.docSlug;
  const routeDocResolved = routeDocSlug ? getDocBySlug(routeDocSlug) : null;
  if (routeDocResolved && routeDocResolved.id !== doc.id) {
    setDoc(routeDocResolved);
    setSection(null);
  }

  // Preload all for search / comparison
  useEffect(() => {
    loadAllAndRebuild();
  }, []);

  const openSection = useCallback(async (nextDoc, nextSection) => {
    if (!nextDoc) return;
    if (!isSectionsLoaded(nextDoc) && nextDoc.sectionsFile) {
      await loadDocSections(nextDoc);
      setLoadTick((t) => t + 1);
      if (!nextSection && nextDoc.sections?.length) {
        nextSection = nextDoc.sections[0];
      }
    }
    setDoc(nextDoc);
    if (nextSection) {
      setSection(nextSection);
      navigate(getTomePath(nextDoc, nextSection));
    } else {
      setSection(nextDoc.sections?.[0] || null);
      navigate(`${APP_ROUTES.tomeHome}/${nextDoc.slug}`);
    }
  }, [navigate]);

  const prevNext = getPrevNext(doc, section);
  const breadcrumbs = section ? getBreadcrumbs(doc, section) : [];
  const reverse = section ? getReverseCitations(doc.shortName, section.number) : [];
  const chapters = section ? (section.chapterUse || doc.chapters || []) : [];
  const crossRefs = section?.crossRefs || [];

  // Matching cases from CASE_LAW_INDEX
  const matchingCases = useMemo(() => {
    if (!section) return [];
    return CASE_LAW_INDEX.filter((c) =>
      c.statutes.some((s) => s.toLowerCase().includes(doc.shortName.toLowerCase()) && s.includes(section.number))
    );
  }, [doc, section]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-sprawl-deep-blue text-gray-100 md:h-[calc(100vh-4rem)]">
      {/* Mobile sidebar toggle */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed bottom-4 left-4 z-30 flex items-center gap-2 rounded-full border border-sprawl-yellow/40 bg-sprawl-deep-blue/95 px-4 py-2.5 font-ui text-sm text-sprawl-yellow shadow-lg backdrop-blur md:hidden"
          aria-label="Open table of contents"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
          TOC
        </button>
      )}

      {/* Sidebar */}
      <div className={`${sidebarOpen ? "fixed inset-y-0 left-0 z-20 w-[85vw] max-w-xs" : "hidden"} md:relative md:block md:w-72 md:shrink-0`}>
        <TocSidebar
          doc={doc}
          section={section}
          onOpenSection={(d, s) => {
            openSection(d, s);
            setSidebarOpen(false);
          }}
          onClose={() => setSidebarOpen(false)}
        />
      </div>
      {sidebarOpen && (
        <button
          className="fixed inset-0 z-10 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
          {/* Breadcrumb + compare toggle */}
          {section && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <nav className="flex flex-wrap items-center gap-1 font-ui text-xs text-gray-400">
                {breadcrumbs.map((b, i) => (
                  <span key={b.label}>
                    <Link to={b.to} className="hover:text-sprawl-yellow">{b.label}</Link>
                    {i < breadcrumbs.length - 1 && <span className="mx-1 text-sprawl-yellow/60">/</span>}
                  </span>
                ))}
              </nav>
              <button
                onClick={() => setCompareOpen((v) => !v)}
                className="rounded border border-sprawl-teal/40 px-2 py-1 font-ui text-xs text-sprawl-teal hover:bg-sprawl-teal/10"
              >
                {compareOpen ? "Hide Comparison" : "Compare"}
              </button>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="flex items-center gap-3 rounded-lg border border-sprawl-yellow/20 bg-black/20 p-6">
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-sprawl-yellow border-t-transparent" />
              <p className="font-ui text-sm text-gray-300">Loading sections...</p>
            </div>
          )}

          {/* No section state */}
          {!loading && !section && (
            <div className="rounded-lg border border-sprawl-yellow/20 bg-black/20 p-6">
              <p className="font-ui text-sm text-gray-300">
                {doc.sections?.length
                  ? "Select a section from the sidebar to begin reading."
                  : "This document is in the corpus but section text is not currently available."}
              </p>
            </div>
          )}

          {/* Section content */}
          {!loading && section && (
            <article>
              {/* Header */}
              <header className="mb-6">
                <h1 className="font-headline text-2xl uppercase tracking-wider text-sprawl-yellow">
                  {doc.shortName} &sect; {section.number}
                </h1>
                <p className="mt-1 font-ui text-sm text-gray-300">{section.title}</p>
                <p className="mt-0.5 font-ui text-xs text-gray-500">{doc.title}</p>
              </header>

              {/* Statutory text */}
              <div className="rounded-lg border border-sprawl-yellow/20 bg-black/20 px-4 py-5 sm:px-6">
                <p className="break-words font-body text-base leading-8 text-gray-100 sm:text-lg">{section.text}</p>
              </div>

              {/* Comparison */}
              {compareOpen && (
                <div className="mt-6">
                  <ComparisonView leftDoc={doc} leftSection={section} onOpenSection={openSection} />
                </div>
              )}

              {/* Used in chapters */}
              {chapters.length > 0 && (
                <div className="mt-6">
                  <p className="font-headline text-xs uppercase tracking-wider text-sprawl-yellow">
                    Used in Chapters
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {chapters.map((ch) => (
                      <Link
                        key={ch}
                        to={buildChapterLink(ch)}
                        className="rounded border border-sprawl-teal/40 px-2 py-1 font-ui text-xs text-sprawl-teal hover:bg-sprawl-teal/10"
                      >
                        Ch. {ch}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Cases citing this section */}
              {(reverse.length > 0 || matchingCases.length > 0) && (
                <div className="mt-6">
                  <p className="font-headline text-xs uppercase tracking-wider text-sprawl-yellow">
                    Cases Citing This Section
                  </p>
                  <div className="mt-2 space-y-1">
                    {matchingCases.map((c) => (
                      <div key={c.caseName} className="rounded border border-sprawl-yellow/10 px-2 py-1.5">
                        <p className="font-ui text-xs text-gray-200">{c.caseName}</p>
                        <p className="font-body text-xs text-gray-400">{c.rule}</p>
                      </div>
                    ))}
                    {reverse.slice(0, 8).map((r, i) => (
                      <button
                        key={`${r.doc.id}-${r.section.number}-${i}`}
                        onClick={() => openSection(r.doc, r.section)}
                        className="block w-full rounded border border-sprawl-yellow/10 px-2 py-1.5 text-left font-ui text-xs text-gray-200 hover:border-sprawl-yellow/40"
                      >
                        {r.doc.shortName} &sect; {r.section.number} &mdash; {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Cross-references */}
              {crossRefs.length > 0 && (
                <div className="mt-6">
                  <p className="font-headline text-xs uppercase tracking-wider text-sprawl-yellow">
                    Cross-References
                  </p>
                  <div className="mt-2 space-y-1">
                    {crossRefs.map((ref, i) => (
                      <p key={i} className="font-ui text-xs text-gray-300">
                        {ref.label || ref.target}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Prev / Next */}
              <div className="mt-8 flex items-center justify-between border-t border-sprawl-yellow/10 pt-4">
                <button
                  disabled={!prevNext.prev}
                  onClick={() => prevNext.prev && openSection(doc, prevNext.prev)}
                  className="rounded border border-sprawl-yellow/30 px-4 py-2 font-ui text-xs text-gray-300 transition-colors hover:border-sprawl-yellow/60 hover:text-gray-100 disabled:opacity-30"
                >
                  &larr; Previous
                </button>
                <button
                  disabled={!prevNext.next}
                  onClick={() => prevNext.next && openSection(doc, prevNext.next)}
                  className="rounded border border-sprawl-yellow/30 px-4 py-2 font-ui text-xs text-gray-300 transition-colors hover:border-sprawl-yellow/60 hover:text-gray-100 disabled:opacity-30"
                >
                  Next &rarr;
                </button>
              </div>
            </article>
          )}
        </div>
      </main>
    </div>
  );
}
