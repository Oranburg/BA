import { useCallback, useEffect, useMemo, useState } from "react";
import { resolveQuery, loadDocSections, loadAllAndRebuild } from "./resolver";
import { isSectionsLoaded } from "./corpus";

import TomeContext from "./context";

export function TomeProvider({ children }) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [currentDocSlug, setCurrentDocSlug] = useState("r3a");
  const [currentSectionNumber, setCurrentSectionNumber] = useState("2.03");
  const [lastQuery, setLastQuery] = useState("");
  const [lastResolution, setLastResolution] = useState(null);
  const [sectionsReady, setSectionsReady] = useState(false);

  // Preload all sections on mount so search works fully
  useEffect(() => {
    loadAllAndRebuild().then(() => setSectionsReady(true));
  }, []);

  const openTome = useCallback(async (opts = {}) => {
    if (opts.query) {
      // If sections aren't loaded yet, wait
      if (!sectionsReady) {
        await loadAllAndRebuild();
      }
      const resolution = resolveQuery(opts.query);
      setLastQuery(opts.query);
      setLastResolution(resolution);
      if (resolution.type === "section") {
        setCurrentDocSlug(resolution.result.doc.slug);
        setCurrentSectionNumber(resolution.result.section.number);
      } else if (resolution.type === "doc") {
        setCurrentDocSlug(resolution.document.slug);
        const doc = resolution.document;
        if (!isSectionsLoaded(doc) && doc.sectionsFile) {
          await loadDocSections(doc);
        }
        setCurrentSectionNumber((doc.sections || [])[0]?.number || "");
      }
    }

    if (opts.docSlug) setCurrentDocSlug(opts.docSlug);
    if (opts.sectionNumber) setCurrentSectionNumber(opts.sectionNumber);

    setIsPanelOpen(true);
  }, [sectionsReady]);

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
      sectionsReady,
    }),
    [isPanelOpen, openTome, currentDocSlug, currentSectionNumber, lastQuery, lastResolution, sectionsReady]
  );

  return <TomeContext.Provider value={value}>{children}</TomeContext.Provider>;
}
