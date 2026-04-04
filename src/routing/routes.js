export const APP_ROUTES = Object.freeze({
  home: "/",
  ch01WhyLaw: "/ch01-why-law",
  ch02Agency: "/ch02-agency",
  ch03Partnership: "/ch03-partnership",
  ch04CorporationsTech: "/ch04-corporations-tech",
  ch05LLCs: "/ch05-llcs",
  ch06Nonprofits: "/ch06-nonprofits",
  ch07DAOs: "/ch07-daos",
  ch08EntitySelection: "/ch08-entity-selection",
  ch09FiduciaryDuties: "/ch09-fiduciary-duties",
  ch10StayingPrivate: "/ch10-staying-private",
  ch11GoingPublic: "/ch11-going-public",
  ch12ShareholderFranchise: "/ch12-shareholder-franchise",
  ch13MA: "/ch13-m-and-a",
  ch14PiercingTheVeil: "/ch14-piercing-the-veil",
  ch15CapitalStructure: "/ch15-capital-structure",
  ch16Conclusion: "/ch16-conclusion",
  tomeHome: "/tome",
  tomeIndex: "/tome/index",
});

export const HASH_TARGETS = Object.freeze({
  courseMap: "course-map",
  problems: "problems",
  corpusAnchor: "corpus-anchor",
  simulationLab: "simulation-lab",
});

export function getHomeHashLink(hash) {
  return `${APP_ROUTES.home}#${hash}`;
}
