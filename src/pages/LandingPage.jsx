import { useMemo } from "react";
import { Link } from "react-router-dom";
import AppImage from "../components/ui/AppImage";
import { APP_ROUTES, HASH_TARGETS } from "../routing/routes";
import FiduciarySlider from "../components/toolkit/FiduciarySlider";
import VeilPiercingWall from "../components/toolkit/VeilPiercingWall";
import heroImg from "../assets/chapters/ch00.jpg";
import { getLastVisitedModule, getModuleCompletion, getModuleStarted } from "../learning/progress";
import { getRecommendedNextModule } from "../course/lifecycle";

// Chapter hero images
import ch01Img from "../assets/chapters/ch01.jpg";
import ch02Img from "../assets/chapters/ch02.jpg";
import ch03Img from "../assets/chapters/ch03.jpg";
import ch04Img from "../assets/chapters/ch04.jpg";
import ch05Img from "../assets/chapters/ch05.jpg";
import ch06Img from "../assets/chapters/ch06.jpg";
import ch07Img from "../assets/chapters/ch07.jpg";
import ch08Img from "../assets/chapters/ch08.jpg";
import ch09Img from "../assets/chapters/ch09.jpg";
import ch10Img from "../assets/chapters/ch10.jpg";
import ch11Img from "../assets/chapters/ch11.jpg";
import ch12Img from "../assets/chapters/ch12.jpg";
import ch13Img from "../assets/chapters/ch13.jpg";
import ch14Img from "../assets/chapters/ch14.jpg";
import ch15Img from "../assets/chapters/ch15.jpg";
import ch16Img from "../assets/chapters/ch16.jpg";

const CH_IMAGES = { ch01: ch01Img, ch02: ch02Img, ch03: ch03Img, ch04: ch04Img, ch05: ch05Img, ch06: ch06Img, ch07: ch07Img, ch08: ch08Img, ch09: ch09Img, ch10: ch10Img, ch11: ch11Img, ch12: ch12Img, ch13: ch13Img, ch14: ch14Img, ch15: ch15Img, ch16: ch16Img };

const CHAPTERS = [
  { id: "ch01", moduleId: "ch01-why-law", num: "01", title: "Why Law", problem: "Introduction", focus: "The Four Problems of the Firm", route: APP_ROUTES.ch01WhyLaw },
  { id: "ch02", moduleId: "ch02-agency", num: "02", title: "Agency", problem: "Attribution", focus: "The Control Test", route: APP_ROUTES.ch02Agency },
  { id: "ch03", moduleId: "ch03-partnership", num: "03", title: "Partnership", problem: "Risk", focus: "Unlimited Liability", route: APP_ROUTES.ch03Partnership },
  { id: "ch04", moduleId: "ch04-corporations-tech", num: "04", title: "Corporations", problem: "Partitioning", focus: "Entity Shielding", route: APP_ROUTES.ch04CorporationsTech },
  { id: "ch05", moduleId: "ch05-llcs", num: "05", title: "LLCs", problem: "Governance", focus: "Contractual Freedom", route: APP_ROUTES.ch05LLCs },
  { id: "ch06", moduleId: "ch06-nonprofits", num: "06", title: "Nonprofits", problem: "Governance", focus: "Nondistribution Constraint", route: APP_ROUTES.ch06Nonprofits },
  { id: "ch07", moduleId: "ch07-daos", num: "07", title: "DAOs", problem: "Attribution", focus: "Code-as-Law", route: APP_ROUTES.ch07DAOs },
  { id: "ch08", moduleId: "ch08-entity-selection", num: "08", title: "Entity Selection", problem: "Synthesis", focus: "Choosing the Right Form", route: APP_ROUTES.ch08EntitySelection },
  { id: "ch09", moduleId: "ch09-fiduciary-duties", num: "09", title: "Fiduciary Duties", problem: "Governance", focus: "Loyalty and Care", route: APP_ROUTES.ch09FiduciaryDuties },
  { id: "ch10", moduleId: "ch10-staying-private", num: "10", title: "Staying Private", problem: "Risk", focus: "Venture Capital", route: APP_ROUTES.ch10StayingPrivate },
  { id: "ch11", moduleId: "ch11-going-public", num: "11", title: "Going Public", problem: "Partitioning", focus: "IPO Disclosure", route: APP_ROUTES.ch11GoingPublic },
  { id: "ch12", moduleId: "ch12-shareholder-franchise", num: "12", title: "Shareholder Franchise", problem: "Governance", focus: "Voting Rights", route: APP_ROUTES.ch12ShareholderFranchise },
  { id: "ch13", moduleId: "ch13-m-and-a", num: "13", title: "M&A", problem: "Governance", focus: "Enhanced Scrutiny", route: APP_ROUTES.ch13MA },
  { id: "ch14", moduleId: "ch14-piercing-the-veil", num: "14", title: "Piercing the Veil", problem: "Partitioning", focus: "Alter Ego Doctrine", route: APP_ROUTES.ch14PiercingTheVeil },
  { id: "ch15", moduleId: "ch15-capital-structure", num: "15", title: "Capital Structure", problem: "Risk", focus: "Creditor Rights", route: APP_ROUTES.ch15CapitalStructure },
  { id: "ch16", moduleId: "ch16-conclusion", num: "16", title: "Conclusion", problem: "Synthesis", focus: "The Complete Lifecycle", route: APP_ROUTES.ch16Conclusion },
];

const FOUR_PROBLEMS = [
  {
    id: "attribution",
    title: "Attribution",
    color: "border-sprawl-yellow/60 hover:border-sprawl-yellow",
    accent: "text-sprawl-yellow",
    bg: "bg-sprawl-yellow/5",
    desc: "Who is legally responsible for the acts of another? Agency law binds principals to their agents through authority, the Control Test, and respondeat superior.",
    chapters: ["02", "07"],
  },
  {
    id: "governance",
    title: "Governance",
    color: "border-sprawl-teal/60 hover:border-sprawl-teal",
    accent: "text-sprawl-teal",
    bg: "bg-sprawl-teal/5",
    desc: "Who controls the firm and how are decisions made? From partnership democracy to board authority, fiduciary duties shape the internal architecture of every entity.",
    chapters: ["05", "06", "09", "12", "13"],
  },
  {
    id: "risk",
    title: "Risk",
    color: "border-sprawl-deep-red/60 hover:border-sprawl-bright-red",
    accent: "text-sprawl-bright-red",
    bg: "bg-sprawl-deep-red/5",
    desc: "Who bears the firm's losses? The progression from unlimited personal liability in partnerships to limited liability in corporations and LLCs is the core risk-allocation technology of entity law.",
    chapters: ["03", "10", "15"],
  },
  {
    id: "partitioning",
    title: "Partitioning",
    color: "border-sprawl-light-blue/60 hover:border-sprawl-light-blue",
    accent: "text-sprawl-light-blue",
    bg: "bg-sprawl-light-blue/5",
    desc: "How are asset pools separated? Entity shielding protects firm assets from owners' creditors. The corporate veil can be pierced when boundaries dissolve through commingling or fraud.",
    chapters: ["04", "11", "14"],
  },
];

const PROBLEM_COLORS = {
  Attribution: "text-sprawl-yellow",
  Risk: "text-sprawl-bright-red",
  Governance: "text-sprawl-teal",
  Partitioning: "text-sprawl-light-blue",
  Introduction: "text-gray-400",
  Synthesis: "text-purple-400",
};

export default function LandingPage() {
  const lastVisited = getLastVisitedModule();

  const chapterStatus = useMemo(() => {
    const map = {};
    CHAPTERS.forEach((ch) => {
      const id = ch.moduleId || ch.id;
      if (getModuleCompletion(id)) map[ch.id] = "completed";
      else if (getModuleStarted(id)) map[ch.id] = "started";
      else map[ch.id] = "not-started";
    });
    return map;
  }, []);

  const completionMap = useMemo(() => {
    const map = {};
    CHAPTERS.forEach((ch) => {
      map[ch.moduleId || ch.id] = chapterStatus[ch.id] === "completed";
    });
    return map;
  }, [chapterStatus]);

  const recommendedNext = getRecommendedNextModule(lastVisited, completionMap);
  const completedCount = Object.values(chapterStatus).filter((s) => s === "completed").length;

  return (
    <div>
      {/* ═══════ HERO ═══════ */}
      <section className="relative min-h-[480px] flex items-center justify-center overflow-hidden bg-sprawl-deep-blue">
        <img
          src={heroImg}
          alt="Business Associations"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-sprawl-deep-blue/60 via-sprawl-deep-blue/80 to-sprawl-deep-blue" />
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto py-20">
          <h1 className="font-headline font-bold text-5xl sm:text-7xl uppercase tracking-tight text-white mb-4">
            Business Associations
          </h1>
          <p className="font-body text-xl sm:text-2xl text-sprawl-yellow mb-2">
            Law of the Firm
          </p>
          <p className="font-ui text-base text-gray-300 mb-8">
            Seth C. Oranburg
          </p>
          <p className="font-body text-lg text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Sixteen chapters covering the complete firm lifecycle — from agency and formation through
            governance, financing, M&A, and creditor distress. Every entity is a legal technology
            for solving four fundamental problems.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href={`#${HASH_TARGETS.courseMap}`}
              className="px-8 py-3 bg-sprawl-yellow text-sprawl-deep-blue font-headline font-bold uppercase tracking-wider text-base rounded hover:bg-sprawl-yellow/80 transition-all"
            >
              Start the Course
            </a>
            <a
              href={`#${HASH_TARGETS.problems}`}
              className="px-8 py-3 border border-white/30 text-white font-headline uppercase tracking-wider text-base rounded hover:bg-white/10 transition-all"
            >
              The Four Problems
            </a>
          </div>
        </div>
      </section>

      {/* ═══════ FOUR PROBLEMS ═══════ */}
      <section id={HASH_TARGETS.problems} className="py-20 px-6 bg-sprawl-deep-blue/90 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-headline font-bold text-4xl sm:text-5xl uppercase tracking-tight text-white">
              The Four Problems{" "}
              <span className="text-sprawl-yellow">of the Firm</span>
            </h2>
            <p className="font-body text-gray-400 max-w-2xl mx-auto mt-4 text-lg">
              Every business entity is a legal technology designed to solve four recurring problems.
              The entire course is organized around this framework.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FOUR_PROBLEMS.map((p) => (
              <div
                key={p.id}
                className={`card-hover rounded-xl border-2 ${p.color} ${p.bg} p-6`}
              >
                <h3 className={`font-headline text-xl uppercase tracking-wider ${p.accent} mb-3`}>
                  {p.title}
                </h3>
                <p className="font-body text-base text-gray-300 leading-relaxed mb-4">
                  {p.desc}
                </p>
                <p className="font-ui text-sm text-gray-500">
                  Chapters {p.chapters.join(", ")}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CHAPTER GRID ═══════ */}
      <section id={HASH_TARGETS.courseMap} className="py-20 px-6 bg-sprawl-deep-blue scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-headline font-bold text-4xl sm:text-5xl uppercase tracking-tight text-white">
              Course <span className="text-sprawl-yellow">Roadmap</span>
            </h2>
            <p className="font-body text-gray-400 max-w-2xl mx-auto mt-4 text-lg">
              Sixteen chapters mapping the complete lifecycle of business association law.
            </p>
            {completedCount > 0 && (
              <p className="font-ui text-base text-sprawl-teal mt-3">
                {completedCount} of 16 completed
              </p>
            )}
            {recommendedNext && (
              <p className="font-ui text-base text-sprawl-yellow/70 mt-1">
                Continue with: {recommendedNext.title}
              </p>
            )}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CHAPTERS.map((ch) => {
              const status = chapterStatus[ch.id] || "not-started";
              const img = CH_IMAGES[ch.id];

              const borderClass = status === "completed"
                ? "border-sprawl-yellow/50 shadow-[0_0_12px_rgba(255,214,92,0.15)]"
                : status === "started"
                ? "border-sprawl-teal/40"
                : "border-gray-700/40 hover:border-sprawl-yellow/40";

              const badgeClass = status === "completed"
                ? "bg-sprawl-yellow text-sprawl-deep-blue"
                : status === "started"
                ? "bg-sprawl-teal/30 text-sprawl-teal border border-sprawl-teal/50"
                : "bg-sprawl-bright-blue/20 text-gray-400";

              return (
                <Link
                  key={ch.id}
                  to={ch.route}
                  className={`group relative rounded-xl border overflow-hidden transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer ${borderClass}`}
                >
                  {img && (
                    <div className="relative h-32 overflow-hidden">
                      <img src={img} alt={ch.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-sprawl-deep-blue via-sprawl-deep-blue/60 to-transparent" />
                      <div className={`absolute top-2 left-2 w-8 h-8 rounded-lg flex items-center justify-center font-headline font-bold text-sm ${badgeClass}`}>
                        {ch.num}
                      </div>
                      {status === "completed" && (
                        <div className="absolute top-2 right-2 text-sprawl-yellow text-lg">&#10003;</div>
                      )}
                    </div>
                  )}
                  <div className="p-3 bg-sprawl-deep-blue">
                    <h4 className="font-headline uppercase tracking-wider text-base text-white mb-1">
                      {ch.title}
                    </h4>
                    <p className={`font-ui text-sm ${PROBLEM_COLORS[ch.problem] || "text-gray-400"} mb-1`}>
                      {ch.problem}
                    </p>
                    <p className="font-ui text-sm text-gray-400 leading-snug">{ch.focus}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════ INTERACTIVE TOOLS ═══════ */}
      <section id={HASH_TARGETS.simulationLab} className="py-20 px-6 bg-sprawl-deep-blue/90 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-headline font-bold text-4xl sm:text-5xl uppercase tracking-tight text-white">
              Interactive <span className="text-sprawl-yellow">Tools</span>
            </h2>
            <p className="font-body text-gray-400 max-w-xl mx-auto mt-4 text-lg">
              Hands-on exercises that make doctrine tangible.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <FiduciarySlider />
            <VeilPiercingWall />
          </div>
        </div>
      </section>

    </div>
  );
}
