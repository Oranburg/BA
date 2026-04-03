import { useState } from "react";
import FiduciarySlider from "../components/toolkit/FiduciarySlider";
import TomeOfLaw from "../components/toolkit/TomeOfLaw";
import VeilPiercingWall from "../components/toolkit/VeilPiercingWall";

const CHAPTERS = [
  { id: "ch01", num: "01", title: "Why Law", problem: "Introduction", focus: "The Four Problems of the Firm" },
  { id: "ch02", num: "02", title: "Agency", problem: "Attribution", focus: "The Control Test" },
  { id: "ch03", num: "03", title: "Partnership", problem: "Risk", focus: "Unlimited Liability" },
  { id: "ch04", num: "04", title: "Corporations & Tech", problem: "Partitioning", focus: "Entity Shielding" },
  { id: "ch05", num: "05", title: "LLCs", problem: "Governance", focus: "Contractual Freedom" },
  { id: "ch06", num: "06", title: "Nonprofits", problem: "Governance", focus: "Nondistribution Constraint" },
  { id: "ch07", num: "07", title: "DAOs", problem: "Attribution", focus: "Code-as-Law" },
  { id: "ch08", num: "08", title: "Entity Selection", problem: "Synthesis", focus: "All Four Problems" },
  { id: "ch09", num: "09", title: "Fiduciary Duties", problem: "Governance", focus: "Loyalty / Care" },
  { id: "ch10", num: "10", title: "Staying Private", problem: "Risk", focus: "Venture Capital / Preferences" },
  { id: "ch11", num: "11", title: "Going Public", problem: "Partitioning", focus: "IPO Disclosure" },
  { id: "ch12", num: "12", title: "Shareholder Franchise", problem: "Governance", focus: "Voting" },
  { id: "ch13", num: "13", title: "M&A", problem: "Governance", focus: "Takeovers / Enhanced Scrutiny" },
  { id: "ch14", num: "14", title: "Piercing the Veil", problem: "Partitioning", focus: "Alter Ego" },
  { id: "ch15", num: "15", title: "Capital Structure", problem: "Risk", focus: "Solvency / Creditors" },
  { id: "ch16", num: "16", title: "Conclusion", problem: "Synthesis", focus: "Final Synthesis" },
];

const FOUR_PROBLEMS = [
  {
    id: "attribution",
    title: "Attribution",
    icon: "🔗",
    color: "border-sprawl-yellow/60 hover:border-sprawl-yellow",
    accent: "text-sprawl-yellow",
    bg: "bg-sprawl-yellow/5",
    desc: "Who is legally responsible for the acts of another? Agency law binds principals to their agents' deeds through the Control Test, Neural-Link Handshakes, and Respondeat Superior.",
    chapters: ["ch02", "ch07"],
  },
  {
    id: "governance",
    title: "Governance",
    icon: "⚙",
    color: "border-sprawl-teal/60 hover:border-sprawl-teal",
    accent: "text-sprawl-teal",
    bg: "bg-sprawl-teal/5",
    desc: "Who controls the firm and how are decisions made? From partnership democracy to board authority, fiduciary duties shape the internal architecture of every entity.",
    chapters: ["ch05", "ch06", "ch09", "ch12", "ch13"],
  },
  {
    id: "risk",
    title: "Risk",
    icon: "⚡",
    color: "border-sprawl-deep-red/60 hover:border-sprawl-bright-red",
    accent: "text-sprawl-bright-red",
    bg: "bg-sprawl-deep-red/5",
    desc: "Who bears the firm's losses? The progression from unlimited personal liability in partnerships to limited liability in corporations and LLCs is the core risk-allocation technology.",
    chapters: ["ch03", "ch10", "ch15"],
  },
  {
    id: "partitioning",
    title: "Partitioning",
    icon: "🧱",
    color: "border-sprawl-light-blue/60 hover:border-sprawl-light-blue",
    accent: "text-sprawl-light-blue",
    bg: "bg-sprawl-light-blue/5",
    desc: "How are asset pools separated? Entity shielding protects firm assets from owners' creditors. The corporate veil can be pierced when boundaries dissolve through commingling.",
    chapters: ["ch04", "ch11", "ch14"],
  },
];

const PROBLEM_COLORS = {
  Attribution: "text-sprawl-yellow",
  Risk: "text-sprawl-bright-red",
  Governance: "text-sprawl-teal",
  Partitioning: "text-sprawl-light-blue",
  Synthesis: "text-purple-400",
};

export default function LandingPage() {
  const [tomeOpen, setTomeOpen] = useState(false);
  const [activeChapter, setActiveChapter] = useState(null);

  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-sprawl-deep-blue">
        <div className="absolute inset-0 scanlines opacity-30 pointer-events-none" />
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,214,92,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,214,92,0.3) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sprawl-bright-blue/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-sprawl-deep-red/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <p className="font-ui text-sprawl-yellow/60 uppercase tracking-[0.3em] text-xs mb-6">
            The Neon Edge · Law of the Firm · Oranburg Universe
          </p>
          <h1 className="font-headline font-bold text-6xl sm:text-8xl uppercase tracking-tight text-white mb-4 glitch-text">
            <span className="neon-glow text-sprawl-yellow">BA</span>
            <br />
            <span className="text-white/90 text-4xl sm:text-5xl">Law of the Firm</span>
          </h1>
          <p className="font-body text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            A high-fidelity simulation of corporate law — where{" "}
            <span className="text-sprawl-yellow font-semibold">Zeeva</span> architects the entity
            structure and <span className="text-sprawl-teal font-semibold">Sammy</span> executes
            the street-level strategy. The law is the technology.
          </p>

          <div className="flex flex-wrap gap-4 justify-center mb-10">
            <div className="flex items-center gap-3 bg-sprawl-yellow/10 border border-sprawl-yellow/40 rounded-full px-5 py-2">
              <div className="w-8 h-8 rounded-full bg-sprawl-yellow/20 border border-sprawl-yellow flex items-center justify-center text-sprawl-yellow font-headline font-bold text-sm">Z</div>
              <div className="text-left">
                <p className="font-headline text-sprawl-yellow uppercase tracking-wider text-xs">Zeeva</p>
                <p className="font-ui text-gray-400 text-xs">Structural Architect · Principal</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-sprawl-teal/10 border border-sprawl-teal/40 rounded-full px-5 py-2">
              <div className="w-8 h-8 rounded-full bg-sprawl-teal/20 border border-sprawl-teal flex items-center justify-center text-sprawl-teal font-headline font-bold text-sm">S</div>
              <div className="text-left">
                <p className="font-headline text-sprawl-teal uppercase tracking-wider text-xs">Sammy</p>
                <p className="font-ui text-gray-400 text-xs">Strategic Fixer · Agent</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="#problems"
              className="px-8 py-3 bg-sprawl-yellow text-sprawl-deep-blue font-headline font-bold uppercase tracking-wider text-sm rounded hover:bg-sprawl-yellow/80 transition-all"
            >
              Enter the Neon Edge
            </a>
            <button
              onClick={() => setTomeOpen(true)}
              className="px-8 py-3 border border-sprawl-yellow/50 text-sprawl-yellow font-headline uppercase tracking-wider text-sm rounded hover:bg-sprawl-yellow/10 transition-all"
            >
              Open Tome of Law
            </button>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-5 h-5 text-sprawl-yellow/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* FOUR PROBLEMS HUB */}
      <section id="problems" className="py-20 px-6 bg-gray-50 dark:bg-sprawl-deep-blue/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-ui text-sprawl-yellow/60 uppercase tracking-[0.3em] text-xs mb-3">
              Core Architecture
            </p>
            <h2 className="font-headline font-bold text-4xl sm:text-5xl uppercase tracking-tight text-gray-900 dark:text-white">
              The Four Problems
              <br />
              <span className="text-sprawl-yellow">of the Firm</span>
            </h2>
            <p className="font-body text-gray-500 dark:text-gray-400 max-w-xl mx-auto mt-4">
              Every business entity is a technological solution to these four coordination problems.
              Master the framework; master the law.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FOUR_PROBLEMS.map((p) => (
              <div
                key={p.id}
                className={`card-hover rounded-xl border-2 ${p.color} ${p.bg} p-6 cursor-pointer`}
              >
                <div className="text-3xl mb-3">{p.icon}</div>
                <h3 className={`font-headline text-xl uppercase tracking-wider ${p.accent} mb-2`}>
                  {p.title}
                </h3>
                <p className="font-body text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  {p.desc}
                </p>
                <p className="font-ui text-xs text-gray-400">
                  Ch. {p.chapters.map((c) => c.replace("ch0", "").replace("ch", "")).join(", ")}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LAB PREVIEW */}
      <section className="py-20 px-6 bg-white dark:bg-sprawl-deep-blue">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-ui text-sprawl-yellow/60 uppercase tracking-[0.3em] text-xs mb-3">
              Interactive Toolkit
            </p>
            <h2 className="font-headline font-bold text-4xl sm:text-5xl uppercase tracking-tight text-gray-900 dark:text-white">
              The <span className="text-sprawl-yellow">Simulation Lab</span>
            </h2>
            <p className="font-body text-gray-500 dark:text-gray-400 max-w-xl mx-auto mt-4">
              High-fidelity interactive tools that make the law tactile. Test them below.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <FiduciarySlider />
            <VeilPiercingWall />
          </div>

          <div className="text-center">
            <button
              onClick={() => setTomeOpen(true)}
              className="px-8 py-3 bg-sprawl-bright-blue text-white font-headline uppercase tracking-wider text-sm rounded hover:bg-sprawl-bright-blue/80 transition-all"
            >
              ⚖ Open Tome of Law
            </button>
          </div>
        </div>
      </section>

      {/* CURRICULUM ROADMAP */}
      <section className="py-20 px-6 bg-gray-50 dark:bg-sprawl-deep-blue/70">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-ui text-sprawl-yellow/60 uppercase tracking-[0.3em] text-xs mb-3">
              Network Map
            </p>
            <h2 className="font-headline font-bold text-4xl sm:text-5xl uppercase tracking-tight text-gray-900 dark:text-white">
              Curriculum <span className="text-sprawl-yellow">Roadmap</span>
            </h2>
            <p className="font-body text-gray-500 dark:text-gray-400 max-w-xl mx-auto mt-4">
              16 modules mapping the evolution of business association law.
            </p>
          </div>

          <div className="space-y-2">
            {CHAPTERS.map((ch, idx) => (
              <div
                key={ch.id}
                onClick={() => setActiveChapter(activeChapter === ch.id ? null : ch.id)}
                className={`group flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-all ${
                  activeChapter === ch.id
                    ? "border-sprawl-yellow/60 bg-sprawl-yellow/5"
                    : "border-gray-200 dark:border-gray-700/50 hover:border-sprawl-yellow/30 hover:bg-gray-100/50 dark:hover:bg-sprawl-bright-blue/10"
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-headline font-bold text-sm flex-shrink-0 transition-all ${
                  activeChapter === ch.id
                    ? "bg-sprawl-yellow text-sprawl-deep-blue"
                    : "bg-gray-100 dark:bg-sprawl-bright-blue/20 text-gray-500 dark:text-gray-400 group-hover:bg-sprawl-yellow/20 group-hover:text-sprawl-yellow"
                }`}>
                  {ch.num}
                </div>

                <div className="hidden sm:block w-8 h-0.5 bg-gray-200 dark:bg-gray-700 flex-shrink-0 group-hover:bg-sprawl-yellow/30 transition-colors" />

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-headline uppercase tracking-wider text-sm text-gray-800 dark:text-gray-200">
                      {ch.title}
                    </h4>
                    <span className={`font-ui text-xs ${PROBLEM_COLORS[ch.problem] || "text-gray-400"}`}>
                      [{ch.problem}]
                    </span>
                  </div>
                  <p className="font-ui text-xs text-gray-500 dark:text-gray-500 truncate">{ch.focus}</p>
                </div>

                <div className="flex-shrink-0 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${idx < 2 ? "bg-sprawl-teal" : "bg-gray-300 dark:bg-gray-600"}`} />
                  <span className="font-ui text-xs text-gray-400 hidden sm:block">
                    {idx < 2 ? "Available" : "Locked"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TomeOfLaw isOpen={tomeOpen} onClose={() => setTomeOpen(false)} />
    </div>
  );
}
