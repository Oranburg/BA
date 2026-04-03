import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CASE_LAW_INDEX, DOCUMENTS, PREBUILT_COMPARISONS, getTomePath } from "./corpus";
import { APP_ROUTES, HASH_TARGETS } from "../routing/routes";
import {
  buildChapterLink,
  coverageAnswer,
  getBreadcrumbs,
  getDocBySlug,
  getPrevNext,
  getReverseCitations,
  getSectionBySlug,
  resolveQuery,
} from "./resolver";

function SearchPanel({ onOpenSection }) {
  const [query, setQuery] = useState("");
  const result = useMemo(() => resolveQuery(query), [query]);
  const [coverageQuery, setCoverageQuery] = useState("");
  const coverage = coverageAnswer(coverageQuery);

  return (
    <div className="space-y-4 border-b border-sprawl-yellow/20 pb-4">
      <div>
        <label className="font-ui text-xs uppercase tracking-wider text-gray-400" htmlFor="quick-search">
          Quick search
        </label>
        <input
          id="quick-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search docs, sections, concepts, citations"
          className="mt-1 w-full rounded border border-sprawl-yellow/30 bg-sprawl-deep-blue px-3 py-2 font-ui text-sm text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-sprawl-yellow"
        />
      </div>

      {result?.feedback && <p className="font-ui text-xs text-sprawl-teal">{result.feedback}</p>}
      {result?.type === "not-in-corpus" && <p className="font-ui text-sm text-gray-300">{result.message}</p>}

      {result?.type === "disambiguation" && (
        <div>
          <p className="font-headline text-xs uppercase tracking-wider text-sprawl-yellow">Disambiguation</p>
          <div className="mt-2 space-y-2">
            {result.matches.map((m) => (
              <button
                key={`${m.doc.id}-${m.section.number}`}
                onClick={() => onOpenSection(m.doc, m.section)}
                className={`w-full rounded border p-2 text-left ${m.emphasized ? "border-sprawl-yellow bg-sprawl-yellow/10" : "border-sprawl-yellow/20 bg-sprawl-bright-blue/10"}`}
              >
                <p className="font-ui text-sm text-gray-100">
                  {m.doc.shortName} § {m.section.number} — {m.section.title}
                </p>
                <p className="font-body text-xs text-gray-300 mt-1">{m.preview}...</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {result?.type === "search" && (
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <p className="font-headline text-xs uppercase tracking-wider text-sprawl-yellow">Documents</p>
            <div className="mt-2 space-y-2">
              {result.documents.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => onOpenSection(doc, doc.sections?.[0])}
                  className="w-full rounded border border-sprawl-yellow/20 bg-sprawl-bright-blue/10 px-2 py-1 text-left font-ui text-sm text-gray-100 hover:border-sprawl-yellow/60"
                >
                  {doc.shortName} · {doc.title}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="font-headline text-xs uppercase tracking-wider text-sprawl-yellow">Sections</p>
            <div className="mt-2 space-y-2">
              {result.sections.map((row) => (
                <button
                  key={`${row.doc.id}-${row.section.number}`}
                  onClick={() => onOpenSection(row.doc, row.section)}
                  className={`w-full rounded border px-2 py-1 text-left ${row.emphasized ? "border-sprawl-yellow bg-sprawl-yellow/10" : "border-sprawl-yellow/20 bg-sprawl-bright-blue/10"}`}
                >
                  <p className="font-ui text-sm text-gray-100">
                    {row.doc.shortName} § {row.section.number}
                  </p>
                  <p className="font-ui text-xs text-gray-400">{row.relevance}</p>
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="font-headline text-xs uppercase tracking-wider text-sprawl-yellow">Concepts</p>
            <div className="mt-2 space-y-2">
              {result.concepts.map((row) => (
                <button
                  key={`${row.doc.id}-${row.section.number}-concept`}
                  onClick={() => onOpenSection(row.doc, row.section)}
                  className="w-full rounded border border-sprawl-yellow/20 bg-sprawl-bright-blue/10 px-2 py-1 text-left"
                >
                  <p className="font-ui text-sm text-gray-100">
                    {row.doc.shortName} § {row.section.number}
                  </p>
                  <p className="font-ui text-xs text-gray-400">Related concept</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div>
        <label htmlFor="coverage-query" className="font-ui text-xs uppercase tracking-wider text-gray-400">
          Coverage query
        </label>
        <input
          id="coverage-query"
          value={coverageQuery}
          onChange={(e) => setCoverageQuery(e.target.value)}
          placeholder="Do we have the GENIUS Act?"
          className="mt-1 w-full rounded border border-sprawl-yellow/30 bg-sprawl-deep-blue px-3 py-2 font-ui text-sm text-white"
        />
        {coverageQuery && <p className="mt-2 font-ui text-xs text-gray-300">{coverage}</p>}
      </div>
    </div>
  );
}

function TocTree({ doc, section, onOpenSection }) {
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
    <div className="space-y-3">
      <p className="font-headline text-xs uppercase tracking-wider text-sprawl-yellow">TOC</p>
      {grouped.map(([article, sections]) => (
        <div key={article} className="rounded border border-sprawl-yellow/10 p-2">
          <p className="font-ui text-xs text-gray-400">{article}</p>
          <div className="mt-1 space-y-1">
            {sections.map((s) => (
              <button
                key={s.number}
                onClick={() => onOpenSection(doc, s)}
                className={`w-full text-left rounded px-2 py-1 font-ui text-xs ${section?.number === s.number ? "bg-sprawl-yellow/20 text-sprawl-yellow" : "text-gray-300 hover:bg-sprawl-yellow/10"}`}
              >
                § {s.number} — {s.title}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ComparisonView({ leftDoc, leftSection, onOpenSection }) {
  const [selected, setSelected] = useState(PREBUILT_COMPARISONS[0]?.id || "");
  const [rightCitation, setRightCitation] = useState("ULLCA § 409");

  const current = PREBUILT_COMPARISONS.find((c) => c.id === selected) || PREBUILT_COMPARISONS[0];
  const rightRes = resolveQuery(rightCitation);
  const right = rightRes.type === "section" ? rightRes.result : null;

  return (
    <div className="space-y-3 rounded border border-sprawl-teal/30 p-3">
      <p className="font-headline text-xs uppercase tracking-wider text-sprawl-teal">Comparisons</p>
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="w-full rounded border border-sprawl-teal/40 bg-sprawl-deep-blue px-2 py-1 font-ui text-sm text-white"
      >
        {PREBUILT_COMPARISONS.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title}
          </option>
        ))}
      </select>
      {current && (
        <div className="rounded bg-sprawl-teal/10 p-2">
          <p className="font-ui text-xs text-gray-300">{current.sections.join(" ↔ ")}</p>
          <p className="mt-1 font-body text-sm text-gray-200">{current.note}</p>
        </div>
      )}

      <div className="grid gap-2 md:grid-cols-2">
        <div className="rounded border border-sprawl-yellow/20 p-2">
          <p className="font-ui text-xs text-gray-400">Left pane (locked)</p>
          <p className="font-headline text-xs text-sprawl-yellow">
            {leftDoc.shortName} § {leftSection.number}
          </p>
          <p className="font-ui text-xs text-gray-200">{leftSection.title}</p>
        </div>
        <div className="rounded border border-sprawl-yellow/20 p-2">
          <label htmlFor="right-pane" className="font-ui text-xs text-gray-400">
            Right pane section
          </label>
          <input
            id="right-pane"
            value={rightCitation}
            onChange={(e) => setRightCitation(e.target.value)}
            className="mt-1 w-full rounded border border-sprawl-yellow/30 bg-sprawl-deep-blue px-2 py-1 font-ui text-sm text-white"
          />
          {right ? (
            <button
              onClick={() => onOpenSection(right.doc, right.section)}
              className="mt-2 rounded border border-sprawl-yellow/50 px-2 py-1 font-ui text-xs text-sprawl-yellow hover:bg-sprawl-yellow/10"
            >
              Open {right.doc.shortName} § {right.section.number}
            </button>
          ) : (
            <p className="mt-2 font-ui text-xs text-gray-400">No resolved section</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ChapterStatuteList({ onOpenSection }) {
  const chapterMap = useMemo(() => {
    const map = new Map();
    DOCUMENTS.forEach((doc) => {
      (doc.sections || []).forEach((section) => {
        (section.chapterUse || []).forEach((ch) => {
          if (!map.has(ch)) map.set(ch, []);
          map.get(ch).push({ doc, section });
        });
      });
    });
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, []);

  return (
    <div className="rounded border border-sprawl-yellow/20 p-3">
      <p className="font-headline text-xs uppercase tracking-wider text-sprawl-yellow">Chapter statute list</p>
      <div className="mt-2 max-h-48 overflow-auto space-y-2">
        {chapterMap.map(([ch, rows]) => (
          <div key={ch}>
            <p className="font-ui text-xs text-gray-400">Ch. {ch}</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {rows.map((r) => (
                <button
                  key={`${ch}-${r.doc.id}-${r.section.number}`}
                  onClick={() => onOpenSection(r.doc, r.section)}
                  className="rounded border border-sprawl-yellow/20 px-2 py-0.5 font-ui text-xs text-gray-200 hover:border-sprawl-yellow/60"
                >
                  {r.doc.shortName} § {r.section.number}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnnotationPanel({ keyId, sectionText, sectionLabel }) {
  const storageKey = `tome-annotations:${keyId}`;
  const [note, setNote] = useState(() => localStorage.getItem(`${storageKey}:note`) || "");
  const [selection, setSelection] = useState("");
  const [highlights, setHighlights] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`${storageKey}:highlights`) || "[]");
    } catch {
      return [];
    }
  });

  function addHighlight(color) {
    if (!selection.trim()) return;
    const next = [...highlights, { text: selection.trim(), color }];
    setHighlights(next);
    localStorage.setItem(`${storageKey}:highlights`, JSON.stringify(next));
    setSelection("");
  }

  function saveNote(v) {
    setNote(v);
    localStorage.setItem(`${storageKey}:note`, v);
  }

  function exportText() {
    const lines = [
      `Section: ${sectionLabel}`,
      "",
      "Highlights:",
      ...(highlights.length ? highlights.map((h) => `- [${h.color}] ${h.text}`) : ["- None"]),
      "",
      "Note:",
      note || "(none)",
      "",
      "Section excerpt:",
      sectionText,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${sectionLabel.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-annotations.txt`;
    a.click();
  }

  return (
    <div className="rounded border border-sprawl-yellow/20 p-3">
      <p className="font-headline text-xs uppercase tracking-wider text-sprawl-yellow">Annotations</p>
      <textarea
        value={selection}
        onChange={(e) => setSelection(e.target.value)}
        placeholder="Paste passage to highlight"
        className="mt-2 h-20 w-full rounded border border-sprawl-yellow/20 bg-sprawl-deep-blue px-2 py-1 font-body text-sm text-gray-100"
      />
      <div className="mt-2 flex gap-2">
        {["Key rule", "Exam note", "Confusing"].map((label, i) => (
          <button
            key={label}
            onClick={() => addHighlight(["amber", "teal", "rose"][i])}
            className="rounded border border-sprawl-yellow/30 px-2 py-1 font-ui text-xs text-gray-200"
          >
            {label}
          </button>
        ))}
      </div>
      <ul className="mt-2 space-y-1">
        {highlights.map((h, i) => (
          <li key={i} className="font-body text-xs text-gray-300">
            [{h.color}] {h.text}
          </li>
        ))}
      </ul>
      <textarea
        value={note}
        onChange={(e) => saveNote(e.target.value)}
        placeholder="Margin note"
        className="mt-2 h-20 w-full rounded border border-sprawl-yellow/20 bg-sprawl-deep-blue px-2 py-1 font-body text-sm text-gray-100"
      />
      <button onClick={exportText} className="mt-2 rounded border border-sprawl-teal/50 px-2 py-1 font-ui text-xs text-sprawl-teal">
        Export annotations
      </button>
    </div>
  );
}

export default function TomeExperience({ embedded = false, onClose }) {
  const params = useParams();
  const navigate = useNavigate();

  const defaultDoc = DOCUMENTS.find((d) => d.shortName === "R3A") || DOCUMENTS[0];
  const routeDoc = getDocBySlug(params.docSlug);
  const [doc, setDoc] = useState(routeDoc || defaultDoc);

  const routeSection = routeDoc && params.sectionSlug ? getSectionBySlug(routeDoc, params.sectionSlug) : null;
  const [section, setSection] = useState(routeSection || (doc.sections || [])[0] || null);

  const [jump, setJump] = useState("");
  const [focus, setFocus] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const initialPanel = new URLSearchParams(window.location.search).get("panel");
  const initialTab = embedded || initialPanel === "problems" ? "comparisons" : "browse";
  const [activeTab, setActiveTab] = useState(initialTab);

  const prevNext = getPrevNext(doc, section);
  const breadcrumbs = getBreadcrumbs(doc, section);
  const reverse = section ? getReverseCitations(doc.shortName, section.number) : [];

  function openSection(nextDoc, nextSection) {
    if (!nextDoc || !nextSection) return;
    setDoc(nextDoc);
    setSection(nextSection);
    navigate(getTomePath(nextDoc, nextSection));
  }

  function onJumpSubmit(e) {
    e.preventDefault();
    const direct = (doc.sections || []).find((s) => s.number.toLowerCase() === jump.toLowerCase().replace(/^§\s*/, ""));
    if (direct) {
      openSection(doc, direct);
      return;
    }

    const fromQuery = resolveQuery(jump);
    if (fromQuery.type === "section") {
      openSection(fromQuery.result.doc, fromQuery.result.section);
    }
  }

  const jumpMatches = useMemo(() => (doc.sections || []).filter((s) => s.number.toLowerCase().includes(jump.toLowerCase().replace(/^§\s*/, ""))).slice(0, 6), [doc, jump]);

  const rootClass = embedded
    ? "h-full bg-sprawl-deep-blue text-gray-100"
    : "min-h-screen bg-sprawl-deep-blue text-gray-100";

  return (
    <div className={rootClass}>
      <div className="border-b border-sprawl-yellow/20 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-headline text-lg uppercase tracking-wider text-sprawl-yellow">Tome of Law</h1>
          <div className="ml-auto flex items-center gap-2">
            {!embedded && (
              <Link to={APP_ROUTES.tomeIndex} className="rounded border border-sprawl-yellow/30 px-2 py-1 font-ui text-xs text-sprawl-yellow">
                Corpus Index
              </Link>
            )}
            <button onClick={() => setFocus((f) => !f)} className="rounded border border-sprawl-yellow/30 px-2 py-1 font-ui text-xs text-gray-200">
              {focus ? "Exit Focus" : "Focus"}
            </button>
            {onClose && (
              <button onClick={onClose} className="rounded border border-sprawl-yellow/30 px-2 py-1 font-ui text-xs text-gray-200">
                Close
              </button>
            )}
          </div>
        </div>

        <SearchPanel onOpenSection={openSection} />
      </div>

      <div className="grid h-[calc(100%-150px)] grid-cols-1 md:grid-cols-[280px_1fr]">
        {!focus && (
          <aside className="border-r border-sprawl-yellow/20 p-3 overflow-auto">
            <div className="mb-3">
              <label htmlFor="doc-select" className="font-ui text-xs uppercase tracking-wider text-gray-400">
                Document
              </label>
              <select
                id="doc-select"
                value={doc.id}
                onChange={(e) => {
                  const nextDoc = DOCUMENTS.find((d) => d.id === e.target.value);
                  const first = nextDoc?.sections?.[0] || null;
                  if (nextDoc && first) openSection(nextDoc, first);
                  else if (nextDoc) {
                    setDoc(nextDoc);
                    setSection(null);
                    navigate(`${APP_ROUTES.tomeHome}/${nextDoc.slug}`);
                  }
                }}
                className="mt-1 w-full rounded border border-sprawl-yellow/30 bg-sprawl-deep-blue px-2 py-1 font-ui text-sm text-white"
              >
                {DOCUMENTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.shortName} — {d.versionInUse}
                  </option>
                ))}
              </select>
              <details className="mt-2 rounded border border-sprawl-yellow/10 p-2">
                <summary className="cursor-pointer font-ui text-xs text-sprawl-teal">Also known as</summary>
                <p className="mt-1 font-ui text-xs text-gray-300">{doc.aliases.join(", ")}</p>
              </details>
            </div>
            {doc.sections?.length ? <TocTree doc={doc} section={section} onOpenSection={openSection} /> : <p className="font-ui text-xs text-gray-400">No section text loaded for this document.</p>}
            <div className="mt-4 space-y-2">
              <button
                onClick={() => setActiveTab("browse")}
                className={`rounded px-2 py-1 font-ui text-xs ${activeTab === "browse" ? "bg-sprawl-yellow/20 text-sprawl-yellow" : "text-gray-300"}`}
              >
                Browse
              </button>
              <button
                onClick={() => setActiveTab("comparisons")}
                className={`ml-2 rounded px-2 py-1 font-ui text-xs ${activeTab === "comparisons" ? "bg-sprawl-yellow/20 text-sprawl-yellow" : "text-gray-300"}`}
              >
                Comparisons
              </button>
              <button
                onClick={() => setActiveTab("cases")}
                className={`ml-2 rounded px-2 py-1 font-ui text-xs ${activeTab === "cases" ? "bg-sprawl-yellow/20 text-sprawl-yellow" : "text-gray-300"}`}
              >
                Case Law Index
              </button>
            </div>
          </aside>
        )}

        <section className="overflow-auto p-4">
          {activeTab === "cases" && !focus && (
            <div className="mb-4 rounded border border-sprawl-yellow/20 p-3">
              <p className="font-headline text-xs uppercase tracking-wider text-sprawl-yellow">Case Law Index</p>
              <div className="mt-2 space-y-2">
                {CASE_LAW_INDEX.map((c) => (
                  <div key={c.caseName} className="rounded border border-sprawl-yellow/10 p-2">
                    <p className="font-ui text-sm text-gray-100">{c.caseName}</p>
                    <p className="font-body text-sm text-gray-300">{c.rule}</p>
                    <p className="font-ui text-xs text-gray-400">Statutes: {c.statutes.join(", ")} · Chapters: {c.chapters.map((n) => `Ch. ${n}`).join(", ")}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section ? (
            <article>
              <div className="sticky top-0 z-10 rounded border border-sprawl-yellow/30 bg-sprawl-deep-blue/95 px-3 py-2 backdrop-blur">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex flex-wrap items-center gap-1 text-xs font-ui text-gray-400">
                    {breadcrumbs.map((b, i) => (
                      <span key={b.label}>
                        <Link to={b.to} className="hover:text-sprawl-yellow">
                          {b.label}
                        </Link>
                        {i < breadcrumbs.length - 1 ? <span className="mx-1 text-sprawl-yellow">›</span> : null}
                      </span>
                    ))}
                  </div>
                  <button onClick={() => setCompareOpen((v) => !v)} className="ml-auto rounded border border-sprawl-teal/40 px-2 py-1 font-ui text-xs text-sprawl-teal">
                    Compare
                  </button>
                </div>

                <form onSubmit={onJumpSubmit} className="mt-2 relative">
                  <input
                    value={jump}
                    onChange={(e) => setJump(e.target.value)}
                    placeholder="Jump to section (e.g., § 301, 8.30, 501(c)(3))"
                    className="w-full rounded border border-sprawl-yellow/30 bg-sprawl-deep-blue px-2 py-1 font-ui text-sm text-white"
                  />
                  {jump && jumpMatches.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 rounded border border-sprawl-yellow/20 bg-sprawl-deep-blue p-1 shadow-xl">
                      {jumpMatches.map((m) => (
                        <button
                          type="button"
                          key={m.number}
                          onClick={() => openSection(doc, m)}
                          className="block w-full rounded px-2 py-1 text-left font-ui text-xs text-gray-200 hover:bg-sprawl-yellow/10"
                        >
                          § {m.number} — {m.title}
                        </button>
                      ))}
                    </div>
                  )}
                </form>
              </div>

              <header className="mt-4">
                <h2 className="font-headline text-2xl uppercase tracking-wider text-sprawl-yellow">
                  {doc.shortName} § {section.number}
                </h2>
                <p className="font-ui text-sm text-gray-200">{section.title}</p>
                <p className="mt-1 font-ui text-xs text-gray-400">{doc.title}</p>
                {!!(doc.aliases || []).length && (
                  <details className="mt-2 rounded border border-sprawl-yellow/10 p-2">
                    <summary className="cursor-pointer font-ui text-xs text-sprawl-teal">Also known as</summary>
                    <p className="mt-1 font-ui text-xs text-gray-300">{doc.aliases.join(", ")}</p>
                  </details>
                )}
              </header>

              <div className="mt-4 rounded border border-sprawl-yellow/20 bg-black/20 p-4">
                <h3 className="text-base font-semibold">Statutory Text</h3>
                <p className="mt-2 text-[18px] leading-8 font-body text-gray-100">{section.text}</p>
              </div>

              {compareOpen && <div className="mt-4"><ComparisonView leftDoc={doc} leftSection={section} onOpenSection={openSection} /></div>}

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded border border-sprawl-yellow/20 p-3">
                  <p className="font-headline text-xs uppercase tracking-wider text-sprawl-yellow">Used in chapters</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(section.chapterUse || doc.chapters || []).map((ch) => (
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

                <div className="rounded border border-sprawl-yellow/20 p-3">
                  <p className="font-headline text-xs uppercase tracking-wider text-sprawl-yellow">Cited elsewhere in this corpus ({reverse.length})</p>
                  <div className="mt-2 space-y-1">
                    {reverse.slice(0, 8).map((r, i) => (
                      <button
                        key={`${r.doc.id}-${r.section.number}-${i}`}
                        onClick={() => openSection(r.doc, r.section)}
                        className="block w-full rounded border border-sprawl-yellow/10 px-2 py-1 text-left font-ui text-xs text-gray-200 hover:border-sprawl-yellow/50"
                      >
                        {r.doc.shortName} § {r.section.number} ({r.label})
                      </button>
                    ))}
                    {reverse.length === 0 && <p className="font-ui text-xs text-gray-400">No reverse citations found.</p>}
                  </div>
                </div>
              </div>

              {!focus && (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <AnnotationPanel keyId={`${doc.id}:${section.number}`} sectionText={section.text} sectionLabel={`${doc.shortName} § ${section.number}`} />
                  <ChapterStatuteList onOpenSection={openSection} />
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <button
                  disabled={!prevNext.prev}
                  onClick={() => prevNext.prev && openSection(doc, prevNext.prev)}
                  className="rounded border border-sprawl-yellow/40 px-3 py-2 font-ui text-xs text-gray-200 disabled:opacity-40"
                >
                  Previous Section
                </button>
                <button
                  disabled={!prevNext.next}
                  onClick={() => prevNext.next && openSection(doc, prevNext.next)}
                  className="rounded border border-sprawl-yellow/40 px-3 py-2 font-ui text-xs text-gray-200 disabled:opacity-40"
                >
                  Next Section
                </button>
              </div>
            </article>
          ) : (
            <div className="rounded border border-sprawl-yellow/20 bg-sprawl-bright-blue/10 p-4">
              <p className="font-ui text-sm text-gray-200">This document is listed in the corpus but section text is not currently available.</p>
            </div>
          )}

          {activeTab === "comparisons" && !focus && (
            <div className="mt-4 rounded border border-sprawl-teal/30 p-3">
              <p className="font-headline text-xs uppercase tracking-wider text-sprawl-teal">Pre-built comparisons library</p>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                {PREBUILT_COMPARISONS.map((c) => (
                  <div key={c.id} className="rounded border border-sprawl-teal/20 p-2">
                    <p className="font-ui text-sm text-gray-100">{c.title}</p>
                    <p className="font-ui text-xs text-gray-400">{c.sections.join(" ↔ ")}</p>
                    <p className="mt-1 font-body text-sm text-gray-300">{c.note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
