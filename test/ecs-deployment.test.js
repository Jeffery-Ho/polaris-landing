import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, readlink, realpath, rm, writeFile, mkdir, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const readProjectFile = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("ECS deployment keeps the public origin and runtime configuration aligned", async () => {
  const [home, privacy, support, sitemap, robots, workflow, nginx, internalNginx, npmNginx, npmAcmeNginx, releaseScript, runnerScript, bootstrapScript, npmScript, renewScript, renewService, renewTimer] = await Promise.all([
    readProjectFile("index.html"),
    readProjectFile("privacy.html"),
    readProjectFile("support/index.html"),
    readProjectFile("sitemap.xml"),
    readProjectFile("robots.txt"),
    readProjectFile(".github/workflows/deploy-ecs.yml"),
    readProjectFile("deploy/nginx/polaris-ai.work.conf"),
    readProjectFile("deploy/nginx/polaris-ai.work.internal.conf"),
    readProjectFile("deploy/nginx/polaris-ai.work.npm.conf"),
    readProjectFile("deploy/nginx/polaris-ai.work.npm-acme.conf"),
    readProjectFile("deploy/release.sh"),
    readProjectFile("deploy/install-github-runner.sh"),
    readProjectFile("deploy/bootstrap-ecs.sh"),
    readProjectFile("deploy/configure-npm-edge-origin.sh"),
    readProjectFile("deploy/renew-npm-edge-origin.sh"),
    readProjectFile("deploy/polaris-renew-npm-edge-origin.service"),
    readProjectFile("deploy/polaris-renew-npm-edge-origin.timer")
  ]);

  for (const source of [home, privacy, support, sitemap, robots]) {
    assert.doesNotMatch(source, /jeffery-ho\.github\.io\/polaris-landing/);
  }

  assert.match(home, /https:\/\/polaris-ai\.work\//);
  assert.match(workflow, /runs-on: \[self-hosted, linux, x64, polaris-landing\]/);
  assert.doesNotMatch(workflow, /deploy-pages/);
  assert.match(workflow, /actions\/checkout@11bd71901bbe5b1630ceea73d27597364c9af683/);
  assert.match(nginx, /server_name polaris-ai\.work;/);
  assert.match(nginx, /server_name www\.polaris-ai\.work;/);
  assert.match(nginx, /return 301 https:\/\/polaris-ai\.work\$request_uri;/);
  assert.match(internalNginx, /listen 172\.17\.0\.1:8080;/);
  assert.match(npmNginx, /proxy_pass http:\/\/__ORIGIN_UPSTREAM__;/);
  assert.match(npmNginx, /ssl_certificate \/etc\/letsencrypt\/live\/polaris-ai\.work\/fullchain\.pem;/);
  assert.doesNotMatch(npmAcmeNginx, /listen 443/);
  assert.match(npmAcmeNginx, /acme-challenge/);
  assert.match(bootstrapScript, /POLARIS_EDGE_MODE/);
  assert.match(bootstrapScript, /existing-proxy/);
  assert.match(releaseScript, /POLARIS_SITE_ROOT:-\/srv\/polaris-landing/);
  assert.match(releaseScript, /renameSync/);
  assert.match(runnerScript, /RUNNER_SHA256/);
  assert.match(runnerScript, /RUNNER_DOWNLOAD_ONLY/);
  assert.match(runnerScript, /--continue-at -/);
  assert.match(runnerScript, /RUNNER_CACHE_DIR/);
  assert.match(runnerScript, /--labels self-hosted,linux,x64,polaris-landing/);
  assert.match(runnerScript, /installdependencies\.sh/);
  assert.match(npmScript, /ACME_EMAIL/);
  assert.match(npmScript, /polaris-renew-npm-edge-origin\.timer/);
  assert.match(renewScript, /certbot renew/);
  assert.match(renewService, /ExecStart=\/usr\/local\/sbin\/polaris-renew-npm-edge-origin/);
  assert.match(renewTimer, /OnCalendar=daily/);
  assert.match(home, /source: "polaris-landing-web"/);
});

test("release script switches atomically and retains only the current and previous releases", async () => {
  const temporaryRoot = await mkdtemp(join(tmpdir(), "polaris-release-test-"));
  const sourceRoot = join(temporaryRoot, "source");
  const siteRoot = join(temporaryRoot, "site");
  const releaseScript = new URL("../deploy/release.sh", import.meta.url).pathname;
  const entries = ["assets", "entry", "fonts", "icons", "support", "vendor"];
  const files = ["index.html", "privacy.html", "robots.txt", "sitemap.xml", "support-config.js"];
  const first = "a".repeat(40);
  const second = "b".repeat(40);
  const third = "c".repeat(40);

  const release = (sha) => spawnSync("bash", [releaseScript, sha, sourceRoot], {
    env: { ...process.env, POLARIS_SITE_ROOT: siteRoot },
    encoding: "utf8"
  });

  try {
    await mkdir(sourceRoot, { recursive: true });
    await Promise.all(entries.map((entry) => mkdir(join(sourceRoot, entry))));
    await Promise.all(files.map((file) => writeFile(join(sourceRoot, file), file === "index.html" ? "first" : "fixture")));

    assert.equal(release(first).status, 0);
    assert.equal(await readFile(join(siteRoot, "current", "index.html"), "utf8"), "first");
    assert.equal(((await stat(join(siteRoot, "current", "index.html"))).mode & 0o444) !== 0, true);
    assert.equal(await readlink(join(siteRoot, "current")), join(await realpath(siteRoot), "releases", first));

    await writeFile(join(sourceRoot, "index.html"), "second");
    assert.equal(release(second).status, 0);
    assert.equal(await readFile(join(siteRoot, "current", "index.html"), "utf8"), "second");

    await writeFile(join(sourceRoot, "index.html"), "third");
    assert.equal(release(third).status, 0);
    assert.equal(await readFile(join(siteRoot, "current", "index.html"), "utf8"), "third");
    await assert.rejects(readFile(join(siteRoot, "releases", first, "index.html")));
    assert.equal(await readFile(join(siteRoot, "releases", second, "index.html"), "utf8"), "second");

    await rm(join(sourceRoot, "vendor"), { recursive: true });
    const failed = release("d".repeat(40));
    assert.notEqual(failed.status, 0);
    assert.equal(await readFile(join(siteRoot, "current", "index.html"), "utf8"), "third");
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});
