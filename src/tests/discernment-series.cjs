const assert = require("node:assert/strict");
const vm = require("node:vm");
const path = require("node:path");
const esbuild = require("esbuild");
const { Timestamp } = require("firebase-admin/firestore");
const records = new Map();
let chain = Promise.resolve();
function doc(key) {
  return { id: key.split("/").at(-1), async get() { return { ref: doc(key), data: () => records.get(key) }; }, async update(value) { records.set(key, { ...records.get(key), ...value }); } };
}
const db = {
  doc,
  collection(name) { return { where(field, op, value) { return { async get() { return { docs: [...records].filter(([key, data]) => key.startsWith(name + "/") && (op === "==" ? data[field] === value : data[field]?.toMillis() <= value.toMillis())).map(([key, data]) => ({ id: key.split("/").at(-1), ref: doc(key), data: () => data })) }; } }; } }; },
  runTransaction(callback) { const next = chain.then(() => callback({ get: ref => ref.get(), set: (ref, value) => records.set("scheduledEmails/" + ref.id, value), update: (ref, value) => ref.update(value) })); chain = next.catch(() => {}); return next; },
};
let sends = [];
let blacklisted = false;
let ambiguous = false;
let unsubscribeDuringRead = false;
const moduleMock = { exports: {} };
const source = esbuild.buildSync({ entryPoints: [path.resolve(__dirname, "../../functions/src/discernment-series.ts")], bundle: true, platform: "node", format: "cjs", write: false, packages: "external" }).outputFiles[0].text;
vm.runInNewContext(source, {
  module: moduleMock, exports: moduleMock.exports, Date, AbortSignal,
  console: { error() {} },
  require(name) {
    if (name === "firebase-admin/app") return { getApps: () => [true] };
    if (name === "firebase-admin/firestore") return { Timestamp, getFirestore: () => db };
    if (name === "firebase-functions/params") return { defineSecret: () => ({ value: () => "mock" }) };
    if (name === "firebase-functions/v2/scheduler") return { onSchedule: (options, run) => run };
    throw Error(name);
  },
  async fetch(url, options) {
    if (url.includes("/contacts/")) return { ok: true, json: async () => ({ emailBlacklisted: blacklisted }) };
    if (url.includes("/templates/")) {
      if (unsubscribeDuringRead) await doc("subscribers/one").update({ status: "unsubscribed" });
      return { ok: true, json: async () => ({ subject: "Letter", htmlContent: '<a href="{{ unsubscribe }}">Unsubscribe</a>' }) };
    }
    sends.push(JSON.parse(options.body));
    if (ambiguous) throw Error("Timeout after provider received send");
    return { ok: true, json: async () => ({ messageId: "accepted" }) };
  },
});
const series = moduleMock.exports;
const now = Date.now();
function reset() {
  records.clear(); sends = []; blacklisted = false; ambiguous = false; unsubscribeDuringRead = false;
  records.set("emailWorkflows/discernment-v1", { enabled: true, enabledAt: Timestamp.fromMillis(now - 2 * 86400000) });
  records.set("subscribers/one", { status: "active", email: "test@example.com", consentConfirmedAt: Timestamp.fromMillis(now - 86400001), guideSentAt: Timestamp.now(), unsubscribeToken: "a".repeat(64) });
}
(async () => {
  const steps = series.scheduledSteps(now);
  assert.deepEqual(Array.from(steps, x => x.templateId), [8, 1, 3, 4, 5, 6, 7]);
  assert.deepEqual(Array.from(steps, x => (x.scheduledFor - now) / 86400000), [1, 7, 14, 21, 28, 35, 42]);
  reset(); await Promise.all([series.runDiscernmentSeries(), series.runDiscernmentSeries()]);
  assert.equal(sends.length, 1); assert.equal([...records.keys()].filter(x => x.startsWith("scheduledEmails/")).length, 7);
  assert.ok(sends[0].htmlContent.includes("https://kalimeister.com/email/unsubscribe?token="));
  assert.equal(sends[0].replyTo.email, "billy@randi.agency");
  await series.runDiscernmentSeries(); assert.equal(sends.length, 1);
  reset(); await doc("subscribers/one").update({ status: "pending" }); await series.runDiscernmentSeries(); assert.equal(sends.length, 0);
  reset(); records.get("emailWorkflows/discernment-v1").enabled = false; await series.runDiscernmentSeries(); assert.equal(sends.length, 0);
  reset(); records.get("emailWorkflows/discernment-v1").enabledAt = Timestamp.now(); await series.runDiscernmentSeries(); assert.equal(sends.length, 0);
  reset(); blacklisted = true; await series.runDiscernmentSeries(); assert.equal(sends.length, 0);
  reset(); unsubscribeDuringRead = true; await series.runDiscernmentSeries(); assert.equal(sends.length, 0);
  reset(); ambiguous = true; await series.runDiscernmentSeries(); await series.runDiscernmentSeries(); assert.equal(sends.length, 1); assert.ok([...records.values()].some(x => x.status === "needs-review"));
  assert.throws(() => series.renderLetter("No unsubscribe link", "a".repeat(64)));
  console.log("PASS: seven-step timing, confirmed consent, concurrency/deduplication, pause switch, future enrollment, blacklist, unsubscribe race, ambiguous sends, real unsubscribe links and reply address");
})().catch(error => { console.error(error); process.exitCode = 1; });
