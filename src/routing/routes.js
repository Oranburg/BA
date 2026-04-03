export const APP_ROUTES = Object.freeze({
  home: "/",
  ch02Agency: "/ch02-agency",
  ch08EntitySelection: "/ch08-entity-selection",
  ch09FiduciaryDuties: "/ch09-fiduciary-duties",
  ch12ShareholderFranchise: "/ch12-shareholder-franchise",
  ch13MA: "/ch13-m-and-a",
  ch15CapitalStructure: "/ch15-capital-structure",
  tomeHome: "/tome",
  tomeIndex: "/tome/index",
});

export const HASH_TARGETS = Object.freeze({
  courseMap: "course-map",
  problems: "problems",
  corpusAnchor: "corpus-anchor",
  simulationLab: "simulation-lab",
});

export const CANONICAL_TOME_PANELS = Object.freeze({
  problems: "problems",
});

export function getHomeHashLink(hash) {
  return `${APP_ROUTES.home}#${hash}`;
}

export function getCanonicalProblemsRoute() {
  return `${APP_ROUTES.tomeHome}?panel=${CANONICAL_TOME_PANELS.problems}`;
}

export const LEGACY_HASH_ROUTE_FALLBACKS = Object.freeze({
  [HASH_TARGETS.problems]: getCanonicalProblemsRoute(),
});
