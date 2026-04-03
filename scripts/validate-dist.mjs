import fs from "node:fs";
import path from "node:path";

const distDir = path.resolve("dist");
const indexPath = path.join(distDir, "index.html");
const fallbackPath = path.join(distDir, "404.html");
const SOURCE_ENTRYPOINT_PATTERN = /\/src\/[^"' >]+\.(jsx?|tsx?)/;
const DEPLOY_BASE_PATH = process.env.DEPLOY_BASE_PATH || "/BA/";

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

if (!fs.existsSync(distDir)) fail("dist/ not found. Run build first.");
if (!fs.existsSync(indexPath)) fail("dist/index.html is missing.");
if (!fs.existsSync(fallbackPath)) fail("dist/404.html is missing (SPA fallback required).");

const indexHtml = fs.readFileSync(indexPath, "utf8");
const fallbackHtml = fs.readFileSync(fallbackPath, "utf8");

if (SOURCE_ENTRYPOINT_PATTERN.test(indexHtml) || SOURCE_ENTRYPOINT_PATTERN.test(fallbackHtml)) {
  fail("Found source script reference under /src/ in built artifact.");
}

const escapedBase = DEPLOY_BASE_PATH.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const builtJsPattern = new RegExp(`src=['"]?${escapedBase}assets\\/[^"' >]+\\.js['"]?`);
const builtCssPattern = new RegExp(`href=['"]?${escapedBase}assets\\/[^"' >]+\\.css['"]?`);

if (!builtJsPattern.test(indexHtml)) {
  fail(`dist/index.html does not reference JS asset under ${DEPLOY_BASE_PATH}assets/.`);
}

if (!builtCssPattern.test(indexHtml)) {
  fail(`dist/index.html does not reference CSS asset under ${DEPLOY_BASE_PATH}assets/.`);
}

const assetsDir = path.join(distDir, "assets");
if (!fs.existsSync(assetsDir)) fail("dist/assets directory is missing.");

const assetFiles = fs.readdirSync(assetsDir);
if (!assetFiles.some((name) => name.endsWith(".js"))) fail("No JS bundle found in dist/assets.");
if (!assetFiles.some((name) => name.endsWith(".css"))) fail("No CSS bundle found in dist/assets.");

console.log("✅ dist artifact validation passed.");
