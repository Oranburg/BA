import fs from "node:fs";
import path from "node:path";

const distDir = path.resolve("dist");
const indexPath = path.join(distDir, "index.html");
const fallbackPath = path.join(distDir, "404.html");
const SOURCE_ENTRYPOINT_PATTERN = /\/src\/main\.(jsx?|tsx?)/;

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
  fail("Found source entrypoint reference (/src/main.*) in built artifact.");
}

if (!/src="\/BA\/assets\/[^"]+\.js"/.test(indexHtml)) {
  fail("dist/index.html does not reference JS asset under /BA/assets/.");
}

if (!/href="\/BA\/assets\/[^"]+\.css"/.test(indexHtml)) {
  fail("dist/index.html does not reference CSS asset under /BA/assets/.");
}

const assetsDir = path.join(distDir, "assets");
if (!fs.existsSync(assetsDir)) fail("dist/assets directory is missing.");

const assetFiles = fs.readdirSync(assetsDir);
if (!assetFiles.some((name) => name.endsWith(".js"))) fail("No JS bundle found in dist/assets.");
if (!assetFiles.some((name) => name.endsWith(".css"))) fail("No CSS bundle found in dist/assets.");

console.log("✅ dist artifact validation passed.");
