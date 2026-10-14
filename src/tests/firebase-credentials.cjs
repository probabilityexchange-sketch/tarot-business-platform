const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const esbuild = require("esbuild");

module.exports = function testFirebaseCredentials() {
  const code = esbuild.transformSync(fs.readFileSync(path.join(__dirname, "../lib/firebase-admin.ts"), "utf8"), { loader: "ts", format: "cjs" }).code;
  for (const [env, expected] of [
    [{ K_SERVICE: "kali", FIREBASE_SERVICE_ACCOUNT_KEY: "RESEND_API_KEY=invalid" }, "default"],
    [{}, "default"],
    [{ FIREBASE_SERVICE_ACCOUNT_KEY: JSON.stringify({ project_id: "local-test" }) }, "certificate"],
  ]) {
    let selected;
    const module = { exports: {} };
    const app = {
      getApps: () => [],
      applicationDefault: () => "default",
      cert: value => { assert.equal(value.project_id, "local-test"); return "certificate"; },
      initializeApp: options => { selected = options.credential; return {}; },
    };
    const requireMock = name => {
      if (name === "firebase-admin/app") return app;
      if (name === "firebase-admin/firestore") return { getFirestore: () => ({ settings() {} }) };
      if (name === "firebase-admin/auth") return { getAuth: () => ({}) };
      throw new Error("Unexpected dependency: " + name);
    };
    vm.runInNewContext(code, { module, exports: module.exports, require: requireMock, process: { env } });
    module.exports.getAdminDb();
    assert.equal(selected, expected);
  }
  console.log("PASS: managed runtime ignores malformed legacy credentials; local credential options remain supported");
};
