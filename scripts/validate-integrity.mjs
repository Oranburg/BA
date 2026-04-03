import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(process.cwd());
const srcDir = path.join(repoRoot, "src");
const appFile = path.join(srcDir, "App.jsx");

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function walkFiles(dir, collector = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.forEach((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, collector);
      return;
    }
    if (/\.(jsx?|tsx?)$/.test(entry.name)) collector.push(fullPath);
  });
  return collector;
}

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function extractRouteMatchers() {
  const appSource = read(appFile);
  const pathRegex = /<Route\s+path="([^"]+)"/g;
  const matchers = [];

  let match = pathRegex.exec(appSource);
  while (match) {
    const rawPath = match[1];
    const pattern = `^${rawPath
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      .replace(/\\:[^/]+/g, "[^/]+")}$`;
    matchers.push(new RegExp(pattern));
    match = pathRegex.exec(appSource);
  }

  return matchers;
}

function extractInternalPaths(content) {
  const results = [];
  const patterns = [
    /\bto="([^"]+)"/g,
    /\bto='([^']+)'/g,
    /\bhref="([^"]+)"/g,
    /\bhref='([^']+)'/g,
    /navigate\("([^"]+)"/g,
    /navigate\('([^']+)'/g,
  ];

  patterns.forEach((pattern) => {
    let match = pattern.exec(content);
    while (match) {
      results.push(match[1]);
      match = pattern.exec(content);
    }
  });

  return results;
}

function normalizePathTarget(target) {
  const [pathname] = target.split(/[?#]/);
  return pathname || "/";
}

function extractIds(content) {
  const ids = new Set();
  const idRegex = /\bid="([^"]+)"/g;
  let match = idRegex.exec(content);
  while (match) {
    ids.add(match[1]);
    match = idRegex.exec(content);
  }
  return ids;
}

function extractImageImports(content) {
  const imports = [];
  const importRegex = /import\s+[^\n]+\s+from\s+["']([^"']+\.(?:png|jpe?g|gif|webp|svg))["']/g;
  let match = importRegex.exec(content);
  while (match) {
    imports.push(match[1]);
    match = importRegex.exec(content);
  }
  return imports;
}

const sourceFiles = walkFiles(srcDir);
const routeMatchers = extractRouteMatchers();
const allIds = new Set();
const internalTargets = [];
const imageImports = [];

sourceFiles.forEach((file) => {
  const content = read(file);
  extractIds(content).forEach((id) => allIds.add(id));
  extractInternalPaths(content).forEach((target) => {
    if (target.startsWith("http://") || target.startsWith("https://") || target.startsWith("mailto:")) return;
    internalTargets.push({ file, target });
  });
  extractImageImports(content).forEach((importPath) => imageImports.push({ file, importPath }));
});

const invalidPaths = [];
const missingAnchors = [];

internalTargets.forEach(({ file, target }) => {
  if (target.startsWith("#")) {
    const anchor = target.replace(/^#/, "");
    if (anchor && !allIds.has(anchor)) {
      missingAnchors.push(`${file}: ${target}`);
    }
    return;
  }

  if (!target.startsWith("/")) return;

  const hashPart = target.includes("#") ? target.split("#")[1] : "";
  if (hashPart && !allIds.has(hashPart)) {
    missingAnchors.push(`${file}: ${target}`);
  }

  const pathname = normalizePathTarget(target);
  if (!pathname) return;

  const matchesRoute = routeMatchers.some((matcher) => matcher.test(pathname));
  if (!matchesRoute) {
    invalidPaths.push(`${file}: ${target}`);
  }
});

if (invalidPaths.length) {
  fail(`Invalid internal route target(s):\n${invalidPaths.join("\n")}`);
}

if (missingAnchors.length) {
  fail(`Missing anchor target(s):\n${missingAnchors.join("\n")}`);
}

const missingImages = [];
imageImports.forEach(({ file, importPath }) => {
  if (!importPath.startsWith(".")) return;
  const resolved = path.resolve(path.dirname(file), importPath);
  if (!fs.existsSync(resolved)) {
    missingImages.push(`${file}: ${importPath}`);
  }
});

if (missingImages.length) {
  fail(`Missing referenced image asset(s):\n${missingImages.join("\n")}`);
}

console.log("✅ integrity validation passed (routes, anchors, images).");
