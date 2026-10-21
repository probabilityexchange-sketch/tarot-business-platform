const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "../..");
assert.equal(fs.existsSync(path.join(root, "functions/src/discernment-series.ts")), false);
assert.equal(fs.readFileSync(path.join(root, "functions/src/index.ts"), "utf8").trim(), "export {};");
for (const file of ["src/lib/email-signup.ts", "src/app/api/free-guide/route.ts", "src/app/api/subscribe/route.ts", "src/app/api/course-waitlist/route.ts"]) {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  assert.ok(!source.includes("smtp/email"));
  assert.ok(!source.includes("doubleOptinConfirmation"));
}
console.log("PASS: legacy email engine removed; signup routes contain no sends or DOI requests");
