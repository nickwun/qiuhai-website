import assert from "node:assert/strict";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readlinkSync,
  renameSync,
  rmSync,
  symlinkSync,
} from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
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
  "docs/server-bootstrap.md",
  "scripts/server-bootstrap.sh",
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

test("remote deployment and rollback require a non-root deployment user", () => {
  for (const path of ["scripts/deploy-manual.sh", "scripts/rollback-deployment.sh"]) {
    const script = read(path);
    assert.match(script, /LIGHTHOUSE_USER.*root|root.*LIGHTHOUSE_USER/, `${path} must reject root deployment`);
  }
});

test("deployment assets contain no embedded credentials or public IPv4 address", () => {
  const contents = deploymentFiles.map(read).join("\n");
  assert.doesNotMatch(contents, /BEGIN (?:RSA |OPENSSH )?PRIVATE KEY/);
  assert.doesNotMatch(contents, /(?:password|token)\s*[=:]\s*[^\s$<{]+/i);
  assert.doesNotMatch(contents, /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/);
  assert.doesNotMatch(contents, /\/Users\/[A-Za-z0-9._-]+\//);
});

test("server bootstrap defaults to a non-mutating dry-run with the required Ubuntu packages", () => {
  const result = spawnSync("bash", [join(root, "scripts/server-bootstrap.sh")], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /dry-run/);
  assert.match(result.stdout, /未执行任何系统修改/);
  for (const packageName of ["nginx", "rsync", "curl", "ufw"])
    assert.match(result.stdout, new RegExp(`\\b${packageName}\\b`));
  assert.match(result.stdout, /qiuhai-deploy/);
  assert.match(result.stdout, /\/var\/www\/qiuhai\/releases/);
  assert.match(result.stdout, /OpenSSH|22\/tcp/);
  assert.match(result.stdout, /80\/tcp/);
  assert.match(result.stdout, /443\/tcp/);
});

test("server bootstrap requires explicit apply mode and contains no remote or secret handling", () => {
  const script = read("scripts/server-bootstrap.sh");
  assert.match(script, /--dry-run/);
  assert.match(script, /--apply/);
  assert.match(script, /Ubuntu 24\.04/);
  assert.match(script, /useradd|adduser/);
  assert.match(script, /ufw/);
  assert.doesNotMatch(script, /^\s*ssh\b/m);
  assert.doesNotMatch(script, /(?:>|tee|install|cp|mv)[^\n]*authorized_keys|password\s*=/i);
  assert.doesNotMatch(script, /apt-get install[^\n]*(?:docker|mysql|postgres|宝塔)/i);
});

test("the release directory model supports an atomic current symlink switch", () => {
  const rootDirectory = mkdtempSync(join(tmpdir(), "qiuhai-release-switch-"));
  const first = join(rootDirectory, "releases", "20260720T010000Z-first");
  const second = join(rootDirectory, "releases", "20260720T020000Z-second");
  const current = join(rootDirectory, "current");
  const next = join(rootDirectory, "current.next");

  try {
    mkdirSync(first, { recursive: true });
    mkdirSync(second, { recursive: true });
    symlinkSync(first, current);
    symlinkSync(second, next);
    renameSync(next, current);

    assert.equal(lstatSync(current).isSymbolicLink(), true);
    assert.equal(readlinkSync(current), second);
    assert.equal(existsSync(first), true, "previous release must remain available for rollback");
  } finally {
    rmSync(rootDirectory, { recursive: true, force: true });
  }
});

test("the Nginx template is static HTTP-only preparation with the expected document root", () => {
  const nginx = read("deploy/nginx/qiuhai.net.cn.conf");
  assert.match(nginx, /server_name qiuhai\.net\.cn/);
  assert.match(nginx, /root \/var\/www\/qiuhai\/current;/);
  assert.match(nginx, /listen 80;/);
  assert.doesNotMatch(nginx, /listen 443|ssl_certificate|proxy_pass/);
});
