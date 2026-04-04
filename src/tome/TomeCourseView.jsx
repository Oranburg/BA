import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CASE_LAW_INDEX,
  DOCUMENTS,
  PREBUILT_COMPARISONS,
  getTomePath,
} from "./corpus";
import { APP_ROUTES } from "../routing/routes";
import {
  buildChapterLink,
  loadAllAndRebuild,
  resolveQuery,
} from "./resolver";

const CHAPTER_TITLES = {
  1: "Why Law?",
  2: "Agency",
  3: "Partnership",
  4: "Corporations",
  5: "LLCs",
  6: "Nonprofits",
  7: "DAOs",
  8: "Entity Selection",
  9: "Fiduciary Duties",
  10: "Staying Private",
  11: "Going Public",
  12: "Shareholder Franchise",
  13: "M&A",
  14: "Piercing the Veil",
  15: "Capital Structure",
  16: "Conclusion",
};

function buildChapterMap() {
  const map = new Map();
  for (let i = 1; i <= 16; i++) map.set(i, { docs: [], sections: [], cases: [] });

  DOCUMENTS.forEach((doc) => {
    (doc.chapters || []).forEach((ch) => {
      const entry = map.get(ch);
      if (entry && !entry.docs.some((d) => d.id === doc.id)) {
        entry.docs.push(doc);
      }
    });
    (doc.sections || []).forEach((section) => {
      (section.chapterUse || []).forEach((ch) => {
        const entry = map.get(ch);
        if (entry) entry.sections.push({ doc, section });
      });
    });
  });

  CASE_LAW_INDEX.forEach((c) => {
    (c.chapters || []).forEach((ch) => {
      const entry = map.get(ch);
      if (entry) entry.cases.push(c);
    });
  });

  return map;
}

function SearchBar() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const result = useMemo(() => resolveQuery(query), [query]);

  function goToSection(doc, section) {
    navigate(getTomePath(doc, section));
  }

  function goToDoc(doc) {
    navigate(`${APP_ROUTES.tomeHome}/${doc.slug}`);
  }

  return (
    <div className="relative">
      <label htmlFor="tome-search" className="sr-only">Search the Tome</label>
      <input
        id="tome-search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search statutes, sections, cases, or concepts..."
        className="w-full rounded-lg border border-sprawl-yellow/30 bg-black/30 px-4 py-3 font-ui text-sm text-white placeholder-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sprawl-yellow"
      />

      {query.length > 1 && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-80 overflow-auto rounded-lg border border-sprawl-yellow/20 bg-sprawl-deep-blue shadow-2xl">
          {result?.type === "not-in-corpus" && (
            <p className="p-3 font-ui text-sm text-gray-400">{result.message}</p>
          )}

          {result?.feedback && (
            <p className="border-b border-sprawl-yellow/10 px-3 py-2 font-ui text-xs text-sprawl-teal">{result.feedback}</p>
          )}

          {result?.type === "doc" && result.document && (
            <button
              onClick={() => goToDoc(result.document)}
              className="w-full px-3 py-2 text-left font-ui text-sm text-gray-100 hover:bg-sprawl-yellow/10"
            >
              {result.document.shortName} &mdash; {result.document.title}
            </button>
          )}

          {result?.type === "disambiguation" && result.matches?.map((m) => (
            <button
              key={`${m.doc.id}-${m.section.number}`}
              onClick={() => goToSection(m.doc, m.section)}
              className={`w-full border-b border-sprawl-yellow/10 px-3 py-2 text-left hover:bg-sprawl-yellow/10 ${m.emphasized ? "bg-sprawl-yellow/5" : ""}`}
            >
              <p className="font-ui text-sm text-gray-100">{m.doc.shortName} &sect; {m.section.number} &mdash; {m.section.title}</p>
              <p className="font-body text-xs text-gray-400">{m.preview}...</p>
            </button>
          ))}

          {result?.type === "section" && result.result && (
            <button
              onClick={() => goToSection(result.result.doc, result.result.section)}
              className="w-full px-3 py-2 text-left font-ui text-sm text-gray-100 hover:bg-sprawl-yellow/10"
            >
              {result.result.doc.shortName} &sect; {result.result.section.number} &mdash; {result.result.section.title}
            </button>
          )}

          {result?.type === "search" && (
            <div>
              {result.documents.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => goToDoc(doc)}
                  className="w-full border-b border-sprawl-yellow/10 px-3 py-2 text-left hover:bg-sprawl-yellow/10"
                >
                  <p className="font-ui text-sm text-gray-100">{doc.shortName}</p>
                  <p className="font-ui text-xs text-gray-400">{doc.title}</p>
                </button>
              ))}
              {result.sections.map((row) => (
                <button
                  key={`${row.doc.id}-${row.section.number}`}
                  onClick={() => goToSection(row.doc, row.section)}
                  className={`w-full border-b border-sprawl-yellow/10 px-3 py-2 text-left hover:bg-sprawl-yellow/10 ${row.emphasized ? "bg-sprawl-yellow/5" : ""}`}
                >
                  <p className="font-ui text-sm text-gray-100">{row.doc.shortName} &sect; {row.section.number}</p>
                  <p className="font-ui text-xs text-gray-400">{row.relevance} &mdash; {row.section.title}</p>
                </button>
              ))}
              {result.concepts.map((row) => (
                <button
                  key={`${row.doc.id}-${row.section.number}-c`}
                  onClick={() => goToSection(row.doc, row.section)}
                  className="w-full border-b border-sprawl-yellow/10 px-3 py-2 text-left hover:bg-sprawl-yellow/10"
                >
                  <p className="font-ui text-sm text-gray-100">{row.doc.shortName} &sect; {row.section.number}</p>
                  <p className="font-ui text-xs text-gray-400">Concept match</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ChapterCard({ chapterNum, data, expanded, onToggle }) {
  const title = CHAPTER_TITLES[chapterNum] || `Chapter ${chapterNum}`;
  const chapterRoute = buildChapterLink(chapterNum);
  const docCount = data.docs.length;
  const sectionCount = data.sections.length;
  const caseCount = data.cases.length;

  return (
    <div className="rounded-lg border border-sprawl-yellow/20 bg-black/20 transition-colors hover:border-sprawl-yellow/40">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 text-left"
        aria-expanded={expanded}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-headline text-xs uppercase tracking-wider text-sprawl-yellow/70">
              Chapter {chapterNum}
            </p>
            <p className="mt-0.5 font-headline text-base uppercase tracking-wide text-sprawl-yellow">
              {title}
            </p>
          </div>
          <span className={`mt-1 shrink-0 font-ui text-xs text-gray-500 transition-transform ${expanded ? "rotate-180" : ""}`}>
            &#x25BC;
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {data.docs.slice(0, 5).map((d) => (
            <span key={d.id} className="rounded bg-sprawl-bright-blue/20 px-1.5 py-0.5 font-ui text-xs text-gray-300">
              {d.shortName}
            </span>
          ))}
          {docCount > 5 && (
            <span className="font-ui text-xs text-gray-500">+{docCount - 5} more</span>
          )}
        </div>
        <p className="mt-1 font-ui text-xs text-gray-500">
          {sectionCount} provision{sectionCount !== 1 ? "s" : ""} &middot; {caseCount} case{caseCount !== 1 ? "s" : ""}
        </p>
      </button>

      {expanded && (
        <div className="border-t border-sprawl-yellow/10 px-4 py-3">
          {/* Provisions */}
          {sectionCount > 0 && (
            <div className="mb-3">
              <p className="font-headline text-xs uppercase tracking-wider text-gray-400">Provisions</p>
              <div className="mt-2 space-y-1">
                {data.sections.map((r) => (
                  <Link
                    key={`${r.doc.id}-${r.section.number}`}
                    to={getTomePath(r.doc, r.section)}
                    className="block rounded px-2 py-1 font-ui text-xs text-gray-200 hover:bg-sprawl-yellow/10"
                  >
                    <span className="text-sprawl-teal">{r.doc.shortName}</span> &sect; {r.section.number}{" "}
                    <span className="text-gray-400">&mdash; {r.section.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Documents with no specific section mapping */}
          {sectionCount === 0 && docCount > 0 && (
            <div className="mb-3">
              <p className="font-headline text-xs uppercase tracking-wider text-gray-400">Documents</p>
              <div className="mt-2 space-y-1">
                {data.docs.map((d) => (
                  <Link
                    key={d.id}
                    to={`${APP_ROUTES.tomeHome}/${d.slug}`}
                    className="block rounded px-2 py-1 font-ui text-xs text-gray-200 hover:bg-sprawl-yellow/10"
                  >
                    <span className="text-sprawl-teal">{d.shortName}</span>{" "}
                    <span className="text-gray-400">&mdash; {d.coverage}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Cases */}
          {caseCount > 0 && (
            <div className="mb-3">
              <p className="font-headline text-xs uppercase tracking-wider text-gray-400">Cases</p>
              <div className="mt-2 space-y-1">
                {data.cases.map((c) => (
                  <div key={c.caseName} className="rounded px-2 py-1">
                    <p className="font-ui text-xs text-gray-200">{c.caseName}</p>
                    <p className="font-body text-xs text-gray-400">{c.rule}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Link
            to={chapterRoute}
            className="mt-2 inline-block rounded border border-sprawl-teal/40 px-3 py-1 font-ui text-xs text-sprawl-teal hover:bg-sprawl-teal/10"
          >
            Go to Chapter {chapterNum}
          </Link>
        </div>
      )}
    </div>
  );
}

export default function TomeCourseView() {
  const [ready, setReady] = useState(false);
  const [expandedChapter, setExpandedChapter] = useState(null);

  useEffect(() => {
    loadAllAndRebuild().then(() => setReady(true));
  }, []);

  const chapterMap = useMemo(() => {
    if (!ready) return new Map();
    return buildChapterMap();
  }, [ready]);

  const toggleChapter = useCallback((ch) => {
    setExpandedChapter((prev) => (prev === ch ? null : ch));
  }, []);

  return (
    <div className="min-h-screen bg-sprawl-deep-blue text-gray-100">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-headline text-3xl uppercase tracking-wider text-sprawl-yellow">
            Tome of Law
          </h1>
          <p className="mt-2 font-ui text-sm text-gray-400">
            The course codebook. Search, browse by chapter, or read full documents.
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <SearchBar />
        </div>

        {/* Browse by Document link */}
        <div className="mb-6 flex items-center gap-4">
          <Link
            to={`${APP_ROUTES.tomeHome}/${DOCUMENTS.find((d) => d.sectionsFile)?.slug || "rupa"}`}
            className="rounded border border-sprawl-yellow/40 px-4 py-2 font-ui text-sm text-sprawl-yellow hover:bg-sprawl-yellow/10"
          >
            Browse by Document
          </Link>
          <span className="font-ui text-xs text-gray-500">
            {DOCUMENTS.length} documents in the corpus
          </span>
        </div>

        {/* Loading state */}
        {!ready && (
          <div className="flex items-center gap-3 rounded-lg border border-sprawl-yellow/20 bg-black/20 p-6">
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-sprawl-yellow border-t-transparent" />
            <p className="font-ui text-sm text-gray-300">Loading the corpus...</p>
          </div>
        )}

        {/* Chapter grid */}
        {ready && (
          <div className="mb-10">
            <h2 className="mb-4 font-headline text-sm uppercase tracking-wider text-gray-400">
              Chapters
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 16 }, (_, i) => i + 1).map((ch) => (
                <ChapterCard
                  key={ch}
                  chapterNum={ch}
                  data={chapterMap.get(ch) || { docs: [], sections: [], cases: [] }}
                  expanded={expandedChapter === ch}
                  onToggle={() => toggleChapter(ch)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Cross-statute comparisons */}
        {ready && (
          <div className="mb-10">
            <h2 className="mb-4 font-headline text-sm uppercase tracking-wider text-gray-400">
              Cross-Statute Comparisons
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {PREBUILT_COMPARISONS.map((c) => (
                <div key={c.id} className="rounded-lg border border-sprawl-teal/20 bg-black/20 p-4">
                  <p className="font-headline text-sm uppercase tracking-wide text-sprawl-teal">
                    {c.title}
                  </p>
                  <p className="mt-1 font-ui text-xs text-gray-400">
                    {c.sections.join(" \u2194 ")}
                  </p>
                  <p className="mt-2 font-body text-sm leading-relaxed text-gray-300">
                    {c.note}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Case law index by chapter */}
        {ready && (
          <div className="mb-10">
            <h2 className="mb-4 font-headline text-sm uppercase tracking-wider text-gray-400">
              Case Law Index
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {CASE_LAW_INDEX.map((c) => (
                <div key={c.caseName} className="rounded-lg border border-sprawl-yellow/15 bg-black/20 p-4">
                  <p className="font-ui text-sm font-medium text-gray-100">{c.caseName}</p>
                  <p className="mt-1 font-body text-sm leading-relaxed text-gray-300">{c.rule}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className="font-ui text-xs text-gray-500">
                      {c.statutes.join(", ")}
                    </span>
                    <span className="text-gray-600">&middot;</span>
                    <span className="font-ui text-xs text-gray-500">
                      {c.chapters.map((n) => `Ch. ${n}`).join(", ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
