const assert = require("node:assert/strict");
const vm = require("node:vm");
const path = require("node:path");
const esbuild = require("esbuild");

async function retiredModule(file) {
  const moduleMock = { exports: {} };
  const source = esbuild.buildSync({ entryPoints: [path.resolve(__dirname, file)], bundle: true, platform: "node", format: "cjs", write: false, packages: "external" }).outputFiles[0].text;
  vm.runInNewContext(source, {
    module: moduleMock, exports: moduleMock.exports,
    fetch() { throw new Error("Retired email sender attempted a network request"); },
    require(name) {
      if (name === "firebase-functions/v2/scheduler") return { onSchedule: (options, run) => run };
      if (name === "firebase-functions/v2/firestore") return { onDocumentCreated: (options, run) => run };
      if (name === "firebase-functions/v2") return { setGlobalOptions() {} };
      throw Error(name);
    },
  });
  return moduleMock.exports;
}
(async () => {
  const series = await retiredModule("../../functions/src/discernment-series.ts");
  await series.runDiscernmentSeries();
  await series.deliverDiscernmentSeries();
  const legacy = await retiredModule("../../functions/src/index.ts");
  await legacy.onSubscriberCreated({ data: { data: () => ({ emailSequence: "welcome" }) } });
  await legacy.processScheduledEmails({ data: { data: () => ({ status: "pending", scheduledFor: new Date(0) }) } });
  await legacy.processAllPendingEmails();
  console.log("PASS: retired subscriber triggers and scheduler perform no provider calls or database work");
})().catch(error => { console.error(error); process.exitCode = 1; });
