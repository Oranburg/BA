import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { parseParaIDs } from "./index.js";

/**
 * CasebookReader - renders casebook Markdown with paragraph-level anchor support.
 */
export default function CasebookReader({ markdown }) {
  const paragraphs = useMemo(() => parseParaIDs(markdown || ""), [markdown]);

  return (
    <div className="max-w-3xl mx-auto font-body text-base leading-relaxed px-4 py-8">
      {paragraphs.map((para, idx) => (
        <div
          key={para.id || idx}
          id={para.id ? `para-${para.id}` : undefined}
          className="mb-4 scroll-mt-20"
        >
          {para.id && (
            <a
              href={`#para-${para.id}`}
              className="inline-block font-ui text-xs text-sprawl-yellow/60 hover:text-sprawl-yellow mr-2 font-mono select-none"
              title={`Paragraph ${para.id}`}
            >
              [{para.id}]
            </a>
          )}
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{para.text}</ReactMarkdown>
        </div>
      ))}
    </div>
  );
}
