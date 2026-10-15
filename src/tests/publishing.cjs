const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const esbuild = require("esbuild");
const root = path.resolve(__dirname, "../..");
const out = fs.mkdtempSync(path.join(root, "node_modules", ".publishing-tests-"));
const records = new Map();
let id = 0;
let queue = Promise.resolve();
function snapshot(key) { return { id: key, exists: records.has(key), data: () => records.get(key) }; }
function ref(key) { return { id: key, async get() { return snapshot(key); } }; }
function query(field, value) { return { async get() { return { docs: [...records].filter(([, data]) => data[field] === value).map(([key]) => snapshot(key)) }; } }; }
global.__publishingDb = {
  collection() { return { doc: key => ref(key || "post" + ++id), where: (field, op, value) => query(field, value) }; },
  runTransaction(callback) { const next = queue.then(() => callback({ get: obj => obj.get(), set: (obj, value) => records.set(obj.id, value) })); queue = next.catch(() => {}); return next; },
};
(async () => {
  await esbuild.build({ entryPoints: [path.join(root, "src/lib/published-blog.ts")], outfile: path.join(out, "blog.cjs"), bundle: true, platform: "node", format: "cjs", plugins: [{ name: "admin-mock", setup(build) { build.onLoad({ filter: /firebase-admin\.ts$/ }, () => ({ contents: "export function getAdminDb() { return global.__publishingDb; }", loader: "ts" })); } }] });
  const blog = require(path.join(out, "blog.cjs"));
  const input = { title: "An approved article", slug: "approved-article", content: "<p>A thoughtful reflection.</p>", excerpt: "A reflection", category: "Writing", coverImageUrl: "", status: "draft" };
  const draft = await blog.savePost(input); assert.equal(draft.status, 200); assert.equal((await blog.getPublicPosts()).length, 0);
  assert.equal((await blog.getPublicPost(input.slug)), null);
  const published = await blog.savePost({ ...input, status: "published", publishedAt: "1900-01-01" }, draft.id); assert.equal(published.status, 200);
  const firstDate = records.get(draft.id).publishedAt; assert.ok(firstDate.startsWith(new Date().getFullYear().toString()));
  assert.equal((await blog.getPublicPost(input.slug)).title, input.title);
  await blog.savePost({ ...input, title: "Updated title", status: "published" }, draft.id); assert.equal(records.get(draft.id).publishedAt, firstDate);
  assert.equal((await blog.getPublicPost(input.slug)).title, "Updated title");
  await blog.savePost(input, draft.id); assert.equal((await blog.getPublicPost(input.slug)), null);
  const duplicates = await Promise.all([blog.savePost({ ...input, slug: "unique-post" }), blog.savePost({ ...input, slug: "unique-post" })]); assert.equal(duplicates.filter(x => x.status === 409).length, 1);
  assert.equal((await blog.savePost({ ...input, slug: "../admin" })).status, 400);
  assert.equal((await blog.savePost({ ...input, status: "fake" })).status, 400);
  assert.equal((await blog.savePost({ ...input, content: "<p></p>" })).status, 400);
  assert.equal((await blog.savePost({ ...input, coverImageUrl: "javascript:alert(1)" })).status, 400);
  assert.equal((await blog.savePost(input, "missing")).status, 404);
  const safe = blog.safeArticleHtml('<p onclick="bad()">Words <em>matter</em>.</p><script>alert(1)</script><img src=x onerror=bad()><a href="javascript:bad()">Bad</a><a href="https://example.com">Good</a><svg onload=bad()>bad</svg>');
  assert.ok(!/onclick|onerror|script|javascript:|svg/.test(safe)); assert.ok(safe.includes("<em>matter</em>")); assert.ok(safe.includes('href="https://example.com"'));
  assert.equal(blog.normalizePost("malformed", { ...input, status: "published", publishedAt: "not-a-date" }), null);
  console.log("PASS: draft privacy, publishing visibility, unpublishing, publication dates, duplicate slugs under concurrency, invalid inputs and safe rich text");
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => { fs.rmSync(out, { recursive: true, force: true }); delete global.__publishingDb; });
