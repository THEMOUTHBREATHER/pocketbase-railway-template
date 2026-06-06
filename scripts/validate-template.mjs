#!/usr/bin/env node
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const requiredFiles = [
  ".dockerignore",
  ".gitignore",
  "Dockerfile",
  "README.md",
  "TEMPLATE.md",
  "docker-entrypoint.sh",
  "pb_hooks/README.md",
  "pb_migrations/README.md",
  "pb_public/index.html",
  "railway.json",
  "scripts/docker-smoke-test.sh",
  "scripts/railway-smoke-test.sh",
  "tests/template.test.mjs",
];

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function readJson(path) {
  return JSON.parse(read(path));
}

function assertExecutable(path) {
  const mode = statSync(join(root, path)).mode;
  assert.ok((mode & 0o111) !== 0, `${path} must be executable`);
}

const failures = [];

function check(name, fn) {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    failures.push({ name, error });
    console.error(`not ok - ${name}`);
    console.error(`  ${error.message}`);
  }
}

check("required files exist", () => {
  for (const file of requiredFiles) {
    assert.equal(existsSync(join(root, file)), true, `${file} is missing`);
  }
});

check("railway.json uses Dockerfile builds and healthcheck", () => {
  const config = readJson("railway.json");
  assert.equal(config.$schema, "https://railway.com/railway.schema.json");
  assert.equal(config.build?.builder, "DOCKERFILE");
  assert.equal(config.build?.dockerfilePath, "Dockerfile");
  assert.equal(config.deploy?.healthcheckPath, "/api/health");
  assert.equal(config.deploy?.healthcheckTimeout, 120);
  assert.equal(config.deploy?.restartPolicyType, "ON_FAILURE");
  assert.equal(config.deploy?.restartPolicyMaxRetries, 10);
});

check("Dockerfile pins and verifies the PocketBase artifact", () => {
  const dockerfile = read("Dockerfile");
  assert.match(dockerfile, /ARG PB_VERSION=0\.39\.1/);
  assert.match(dockerfile, /checksums\.txt/);
  assert.match(dockerfile, /sha256sum -c -/);
  assert.match(dockerfile, /USER pocketbase/);
});

check("entrypoint binds Railway PORT and the persistent data directory", () => {
  const entrypoint = read("docker-entrypoint.sh");
  assert.match(entrypoint, /PORT:=8080/);
  assert.match(entrypoint, /PB_DATA_DIR:=\/pb\/pb_data/);
  assert.match(entrypoint, /0\.0\.0\.0:\$\{PORT\}/);
  assert.match(entrypoint, /--dir="\$\{PB_DATA_DIR\}"/);
});

check("runtime helpers are executable", () => {
  assertExecutable("docker-entrypoint.sh");
  assertExecutable("scripts/docker-smoke-test.sh");
  assertExecutable("scripts/railway-smoke-test.sh");
});

if (failures.length > 0) {
  console.error(`\n${failures.length} validation check(s) failed.`);
  process.exit(1);
}

console.log("\nTemplate validation passed.");
