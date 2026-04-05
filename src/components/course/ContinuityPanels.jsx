import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMatterFile } from "../../course/matterFile";
import { getNextBuiltModule, MODULE_FLOW } from "../../course/lifecycle";
import { getModuleCompletion } from "../../learning/progress";
import CertificateButton from "./CertificateButton";

export function FourProblemsMarker({ dominant = [], secondary = [], shift }) {
  return (
    <section className="border border-sprawl-yellow/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
      <p className="font-ui text-sm uppercase tracking-wider text-gray-500 mb-2">Four Problems Continuity</p>
      <div className="grid md:grid-cols-3 gap-3 mb-3">
        <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
          <p className="font-ui text-sm text-sprawl-yellow uppercase">Dominant now</p>
          <p className="font-body text-sm text-gray-700 dark:text-gray-300">{dominant.join(" · ") || "—"}</p>
        </div>
        <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
          <p className="font-ui text-sm text-sprawl-light-blue uppercase">Secondary</p>
          <p className="font-body text-sm text-gray-700 dark:text-gray-300">{secondary.join(" · ") || "—"}</p>
        </div>
        <div className="border border-gray-200 dark:border-gray-700 rounded p-3">
          <p className="font-ui text-sm text-sprawl-teal uppercase">Shift from prior chapter</p>
          <p className="font-body text-sm text-gray-700 dark:text-gray-300">{shift}</p>
        </div>
      </div>
    </section>
  );
}

export function ConstructEdgeDossier({ moduleId, factsOverride }) {
  const matterFile = getMatterFile();
  const summary = { ...matterFile.summary, ...(factsOverride || {}) };

  const entries = [
    ["Entity form", summary.entityForm],
    ["Control posture", summary.controlPosture],
    ["Board / investor dynamics", summary.boardDynamics],
    ["Financing posture", summary.financingPosture],
    ["Strategic pressure", summary.strategicPressure],
    ["Transaction context", summary.transactionContext],
    ["Residual claimant posture", summary.residualClaimantPosture],
  ];

  return (
    <section className="border border-sprawl-teal/30 rounded-lg p-4 bg-sprawl-teal/5">
      <p className="font-ui text-sm uppercase tracking-wider text-sprawl-teal mb-2">ConstructEdge Enterprise Dossier</p>
      <p className="font-ui text-sm text-gray-500 mb-3">Module context: {moduleId}</p>
      <div className="grid md:grid-cols-2 gap-2">
        {entries.map(([label, value]) => (
          <div key={label} className="border border-sprawl-teal/20 rounded p-2">
            <p className="font-ui text-sm uppercase text-gray-500">{label}</p>
            <p className="font-body text-sm text-gray-700 dark:text-gray-300">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function MatterFileCarryover({ title = "Matter File Carryover", references = [] }) {
  const matterFile = getMatterFile();
  const timeline = matterFile.timeline || [];

  const rows = references
    .map((moduleId) => timeline.find((item) => item.moduleId === moduleId))
    .filter(Boolean);

  return (
    <section className="border border-sprawl-yellow/30 rounded-lg p-4 bg-white dark:bg-sprawl-deep-blue/40">
      <p className="font-ui text-sm uppercase tracking-wider text-gray-500 mb-2">{title}</p>
      {!rows.length ? (
        <p className="font-body text-sm text-gray-600 dark:text-gray-300">
          No prior exported notes yet. Complete earlier modules to build the matter file.
        </p>
      ) : (
        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row.moduleId} className="border border-gray-200 dark:border-gray-700 rounded p-2">
              <p className="font-ui text-sm uppercase text-sprawl-yellow">{row.moduleId}</p>
              <p className="font-body text-sm text-gray-700 dark:text-gray-300">{row.headline || "Saved analysis available"}</p>
              {row.note && <p className="font-ui text-sm text-gray-500 mt-1">{row.note}</p>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function LifecycleHandoff({ moduleId, bridge }) {
  const next = getNextBuiltModule(moduleId);
  const isComplete = getModuleCompletion(moduleId);
  const flow = MODULE_FLOW[moduleId];
  const chapterNum = flow ? parseInt(moduleId.replace(/^ch0?/, "").split("-")[0], 10) : 0;
  const chapterTitle = flow ? flow.title : moduleId;
  const [media, setMedia] = useState(null);

  useEffect(() => {
    import("../../data/media-map.json").then((mod) => {
      const data = mod.default || mod;
      if (data.chapters && data.chapters[String(chapterNum)]) {
        setMedia(data.chapters[String(chapterNum)]);
      }
    }).catch(() => {});
  }, [chapterNum]);

  return (
    <section className="border border-sprawl-light-blue/30 rounded-lg p-4 bg-sprawl-light-blue/5">
      <p className="font-ui text-sm uppercase tracking-wider text-sprawl-light-blue mb-2">Lifecycle Handoff</p>
      <p className="font-body text-base text-gray-700 dark:text-gray-300 mb-3">{bridge}</p>
      <div className="flex flex-wrap gap-3 items-center">
        {next ? (
          <Link
            to={next.route}
            className="inline-flex items-center gap-2 px-3 py-2 rounded border border-sprawl-light-blue text-sprawl-light-blue font-ui text-sm uppercase tracking-wider hover:bg-sprawl-light-blue/10"
          >
            Continue to {next.title} →
          </Link>
        ) : (
          <p className="font-ui text-sm text-gray-500">End of built sequence.</p>
        )}
        {isComplete && (
          <CertificateButton
            moduleId={moduleId}
            chapterTitle={chapterTitle}
            chapterNum={chapterNum}
          />
        )}
      </div>
      {media && (media.best_video || media.podcast_season) && (
        <div className="mt-3 pt-3 border-t border-sprawl-light-blue/20">
          <p className="font-ui text-sm text-gray-500 mb-2">Review this chapter:</p>
          <div className="flex flex-wrap gap-2">
            {media.best_video && (
              <a
                href={`https://www.youtube.com/watch?v=${media.best_video.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-gray-600 text-gray-300 font-ui text-sm hover:border-sprawl-yellow hover:text-sprawl-yellow transition-colors"
              >
                &#9654; {media.best_video.title}
              </a>
            )}
            {media.podcast_season && (
              <a
                href="https://bizlawbreakdown.podbean.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-gray-600 text-gray-300 font-ui text-sm hover:border-sprawl-teal hover:text-sprawl-teal transition-colors"
              >
                &#127911; {media.podcast_season.name} ({media.podcast_season.episodes} episodes)
              </a>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
