import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import test from "node:test";

const root = new URL("..", import.meta.url).pathname;
const read = (path) => readFileSync(join(root, path), "utf8");

const deploymentFiles = [
  "docs/deployment-lighthouse.md",
  "deploy/nginx/qiuhai.net.cn.conf",
  "scripts/deploy-manual.sh",
  "scripts/verify-deployment.sh",
  "scripts/rollback-deployment.sh",
];

test("Lighthouse deployment assets exist and shell scripts parse", () => {
  for (const path of deploymentFiles) {
    assert.equal(existsSync(join(root, path)), true, `missing ${path}`);
  }

  for (const path of deploymentFiles.filter((path) => path.endsWith(".sh"))) {
    const result = spawnSync("bash", ["-n", join(root, path)], { encoding: "utf8" });
    assert.equal(result.status, 0, `${path} has invalid shell syntax: ${result.stderr}`);
  }
});

test("manual deployment validates locally and guards remote mutation in dry-run", () => {
  const script = read("scripts/deploy-manual.sh");
  for (const command of ["npm run check", "npm test", "npm run build"])
    assert.match(script, new RegExp(command.replaceAll(" ", "\\s+")));
  for (const variable of ["LIGHTHOUSE_HOST", "LIGHTHOUSE_USER", "LIGHTHOUSE_PORT", "LIGHTHOUSE_PATH"])
    assert.match(script, new RegExp(`\\b${variable}\\b`));
  assert.match(script, /--dry-run/);
  assert.match(script, /rsync/);
  assert.match(script, /ln -sfn/);
  assert.match(script, /verify-deployment\.sh/);

  const guard = script.indexOf('if [[ "$DRY_RUN" == "true" ]]');
  const upload = script.indexOf("rsync");
  assert.ok(guard >= 0 && upload > guard, "dry-run guard must precede rsync upload");
  assert.match(script.slice(guard, upload), /exit 0/);
});

test("deployment assets contain no embedded credentials or public IPv4 address", () => {
  const contents = deploymentFiles.map(read).join("\n");
  assert.doesNotMatch(contents, /BEGIN (?:RSA |OPENSSH )?PRIVATE KEY/);
  assert.doesNotMatch(contents, /(?:password|token)\s*[=:]\s*[^\s$<{]+/i);
  assert.doesNotMatch(contents, /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/);
  assert.doesNotMatch(contents, /\/Users\/[A-Za-z0-9._-]+\//);
});
