import { createContext, useContext, useMemo, useState } from "react";
import { resolveQuery } from "./resolver";

const TomeContext = createContext(null);

export function TomeProvider({ children }) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [currentDocSlug, setCurrentDocSlug] = useState("r3a");
  const [currentSectionNumber, setCurrentSectionNumber] = useState("2.03");
  const [lastQuery, setLastQuery] = useState("");
  const [lastResolution, setLastResolution] = useState(null);

  const openTome = (opts = {}) => {
    if (opts.query) {
      const resolution = resolveQuery(opts.query);
      setLastQuery(opts.query);
      setLastResolution(resolution);
      if (resolution.type === "section") {
        setCurrentDocSlug(resolution.result.doc.slug);
        setCurrentSectionNumber(resolution.result.section.number);
      } else if (resolution.type === "doc") {
        setCurrentDocSlug(resolution.document.slug);
        setCurrentSectionNumber((resolution.document.sections || [])[0]?.number || "");
      }
    }

    if (opts.docSlug) setCurrentDocSlug(opts.docSlug);
    if (opts.sectionNumber) setCurrentSectionNumber(opts.sectionNumber);

    setIsPanelOpen(true);
  };

  const closeTome = () => setIsPanelOpen(false);

  const value = useMemo(
    () => ({
      isPanelOpen,
      openTome,
      closeTome,
      currentDocSlug,
      setCurrentDocSlug,
      currentSectionNumber,
      setCurrentSectionNumber,
      lastQuery,
      lastResolution,
    }),
    [isPanelOpen, currentDocSlug, currentSectionNumber, lastQuery, lastResolution]
  );

  return <TomeContext.Provider value={value}>{children}</TomeContext.Provider>;
}

export function useTomeContextInternal() {
  return useContext(TomeContext);
}
