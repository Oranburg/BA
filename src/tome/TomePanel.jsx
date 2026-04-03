import { useTome } from "./useTome";
import TomeExperience from "./TomeExperience";

export default function TomePanel() {
  const { isPanelOpen, closeTome, currentDocSlug, currentSectionNumber } = useTome();

  if (!isPanelOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        onClick={closeTome}
        aria-label="Close Tome panel backdrop"
      />
      <div className="absolute right-0 top-0 h-full w-full md:w-[40vw] min-w-[320px] bg-sprawl-deep-blue border-l border-sprawl-yellow/30 shadow-2xl overflow-auto">
        <TomeExperience
          key={`${currentDocSlug}:${currentSectionNumber}`}
          embedded
          onClose={closeTome}
          initialDocSlug={currentDocSlug}
          initialSectionNumber={currentSectionNumber}
        />
      </div>
    </div>
  );
}
