import { MemoryRouter, Route, Routes } from "react-router-dom";
import TomeExperience from "./TomeExperience";
import { useTome } from "./useTome";

export default function TomePanel() {
  const { isPanelOpen, closeTome, currentDocSlug, currentSectionNumber } = useTome();

  if (!isPanelOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={closeTome} aria-hidden />
      <div className="absolute right-0 top-0 h-full w-full md:w-[40vw] min-w-[320px] bg-sprawl-deep-blue border-l border-sprawl-yellow/30 shadow-2xl">
        <div className="h-full">
          <MemoryRouter
            key={`${currentDocSlug}:${currentSectionNumber}`}
            initialEntries={[`/tome/${currentDocSlug}/title/section-${String(currentSectionNumber || "").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`]}
          >
            <Routes>
              <Route path="*" element={<TomeExperience embedded onClose={closeTome} />} />
            </Routes>
          </MemoryRouter>
        </div>
      </div>
    </div>
  );
}
