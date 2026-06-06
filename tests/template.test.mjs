import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const root = new URL("..", import.meta.url).pathname;

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function readJson(path) {
  return JSON.parse(read(path));
}

describe("Railway deployment contract", () => {
  it("uses Railway config-as-code with Dockerfile builds and a healthcheck", () => {
    const config = readJson("railway.json");

    assert.equal(config.$schema, "https://railway.com/railway.schema.json");
    assert.equal(config.build.builder, "DOCKERFILE");
    assert.equal(config.build.dockerfilePath, "Dockerfile");
    assert.equal(config.deploy.healthcheckPath, "/api/health");
    assert.equal(config.deploy.healthcheckTimeout, 120);
    assert.equal(config.deploy.restartPolicyType, "ON_FAILURE");
    assert.equal(config.deploy.restartPolicyMaxRetries, 10);
  });

  it("downloads a pinned PocketBase release and verifies its checksum", () => {
    const dockerfile = read("Dockerfile");

    assert.match(dockerfile, /ARG PB_VERSION=0\.39\.1/);
    assert.match(dockerfile, /checksums\.txt/);
    assert.match(dockerfile, /sha256sum -c -/);
    assert.match(dockerfile, /USER pocketbase/);
    assert.match(dockerfile, /COPY pb_migrations/);
    assert.match(dockerfile, /COPY pb_hooks/);
    assert.match(dockerfile, /COPY pb_public/);
  });

  it("starts PocketBase on Railway's PORT and persists data on the volume path", () => {
    const entrypoint = read("docker-entrypoint.sh");

    assert.match(entrypoint, /PORT:=8080/);
    assert.match(entrypoint, /PB_DATA_DIR:=\/pb\/pb_data/);
    assert.match(entrypoint, /0\.0\.0\.0:\$\{PORT\}/);
    assert.match(entrypoint, /--dir="\$\{PB_DATA_DIR\}"/);
    assert.match(entrypoint, /exec pocketbase serve/);
  });

  it("keeps local and persistent runtime state out of Docker and git contexts", () => {
    const dockerignore = read(".dockerignore");
    const gitignore = read(".gitignore");

    assert.match(dockerignore, /(^|\n)\.git(\n|$)/);

    for (const ignoredPath of [".railway", "node_modules", "pb_data", "*.db"]) {
      const pattern = new RegExp(`(^|\\n)${ignoredPath.replace(".", "\\.")}(\\n|$)`);
      assert.match(dockerignore, pattern);
      assert.match(gitignore, pattern);
    }
  });

  it("documents the Railway template composer settings and operating model", () => {
    const readme = read("README.md");
    const templateGuide = read("TEMPLATE.md");

    assert.match(readme, /\/pb\/pb_data/);
    assert.match(readme, /RAILWAY_RUN_UID=0/);
    assert.match(readme, /\/api\/health/);
    assert.match(readme, /railway up --ci/);
    assert.match(templateGuide, /Template Composer/);
    assert.match(templateGuide, /Attach Volume/);
    assert.match(templateGuide, /RAILWAY_RUN_UID/);
    assert.match(templateGuide, /\/pb\/pb_data/);
  });

  it("ships executable validation and smoke-test helpers", () => {
    for (const file of [
      "scripts/validate-template.mjs",
      "scripts/docker-smoke-test.sh",
      "scripts/railway-smoke-test.sh",
    ]) {
      assert.equal(existsSync(join(root, file)), true, `${file} should exist`);
    }

    assert.match(read("scripts/railway-smoke-test.sh"), /RAILWAY_RUN_UID=0/);
  });
});
