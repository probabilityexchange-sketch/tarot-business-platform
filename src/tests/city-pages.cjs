const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const esbuild = require("esbuild");
const root = path.resolve(__dirname, "../..");
const out = fs.mkdtempSync(path.join(root, "node_modules", ".city-tests-"));
(async () => {
  await esbuild.build({ entryPoints: [path.join(root, "src/lib/city-pages.ts"), path.join(root, "src/lib/pseo-data.ts"), path.join(root, "src/lib/service-page-content.ts")], outdir: out, bundle: true, platform: "node", format: "cjs" });
  const policy = require(path.join(out, "city-pages.js"));
  const { SERVICES, CITIES } = require(path.join(out, "pseo-data.js"));
  const { getCityContent } = require(path.join(out, "service-page-content.js"));
  const redirects = policy.cityRedirects();
  const mappings = new Map(redirects.map(value => [value.source, value.destination]));
  assert.equal(mappings.size, redirects.length);
  assert.equal(Object.keys(policy.retainedTarotCities).length, 45);
  const retained = new Set(Object.keys(policy.retainedTarotCities).map(city => policy.getCityReadingPath(city)));
  let kept = 0, merged = 0, retired = 0;
  for (const city of Object.keys(CITIES)) {
    for (const service of Object.keys(SERVICES)) {
      const source = `/readings/${service}/${city}`;
      if (policy.isRetainedCityPage(service, city)) { kept++; assert.ok(getCityContent(service, city)); assert.ok(!mappings.has(source)); }
      else if (policy.tarotServices.includes(service)) { merged++; assert.ok(mappings.has(source)); assert.equal(getCityContent(service, city), null); }
      else { retired++; assert.ok(!mappings.has(source)); assert.equal(getCityContent(service, city), null); }
    }
  }
  for (const [source, destination] of mappings) { assert.notEqual(source, destination); assert.ok(destination === "/readings" || retained.has(destination)); assert.ok(!mappings.has(destination)); }
  assert.deepEqual({ kept, merged, retired }, { kept: 45, merged: 157, retired: 808 });
  assert.equal(policy.getCityReadingPath("constructor"), null);
  assert.equal(getCityContent("constructor", "constructor"), null);
  assert.equal(policy.getCityReadingPath("grand-rapids-mi"), "/readings/private-tarot-reading/grand-rapids-mi");
  assert.equal(mappings.get("/readings/tarot-reading/grand-rapids-mi"), policy.getCityReadingPath("grand-rapids-mi"));
  await esbuild.build({ entryPoints: [path.join(root, "src/app/sitemap.ts")], outfile: path.join(out, "sitemap.cjs"), bundle: true, platform: "node", format: "cjs", plugins: [{ name: "published-posts", setup(build) { build.onLoad({ filter: /published-blog\.ts$/ }, () => ({ contents: 'export async function getPublicPosts() { return [{ slug: "approved-writing", updatedAt: "2026-10-15T00:00:00.000Z" }]; }', loader: "ts" })); } }] });
  const sitemap = await require(path.join(out, "sitemap.cjs")).default();
  const cityUrls = sitemap.filter(entry => entry.url.includes("/readings/"));
  assert.equal(cityUrls.length, 45);
  for (const item of cityUrls) assert.ok(retained.has(new URL(item.url).pathname));
  assert.ok(sitemap.some(item => item.url.endsWith("/blog/approved-writing")));
  console.log("PASS: all 1,010 city URLs classified; 45 retained, 157 tarot URLs merged, 808 unsupported pages retired; no redirect chains/loops, stronger existing URLs preserved, sitemap contains only canonical city pages");
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => fs.rmSync(out, { recursive: true, force: true }));
