import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = dirname(fileURLToPath(import.meta.url));

describe("pnpm toolchain (CI, Docker, local)", () => {
  it("declares packageManager as pnpm for Corepack and reproducible installs", () => {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
    expect(pkg.packageManager).toMatch(/^pnpm@\d+\.\d+\.\d+$/);
  });

  it("keeps pnpm-lock.yaml as the canonical lockfile", () => {
    expect(existsSync(join(root, "pnpm-lock.yaml"))).toBe(true);
    expect(existsSync(join(root, "package-lock.json"))).toBe(false);
  });

  it("pins the same pnpm version in CI, Dockerfile, and package.json", () => {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
    const match = /^pnpm@(.+)$/.exec(pkg.packageManager);
    expect(match).not.toBeNull();
    const version = match![1];

    const ci = readFileSync(join(root, ".github/workflows/ci.yml"), "utf8");
    expect(ci).toContain(`version: ${version}`);

    const dockerfile = readFileSync(join(root, "Dockerfile"), "utf8");
    const pnpmPrepares = dockerfile.match(/pnpm@[\d.]+/g) ?? [];
    expect(pnpmPrepares.length).toBeGreaterThan(0);
    expect(pnpmPrepares.every((s) => s === `pnpm@${version}`)).toBe(true);
  });

  it("uses pnpm in Husky hooks (not npx/npm)", () => {
    const preCommit = readFileSync(join(root, ".husky/pre-commit"), "utf8");
    expect(preCommit).toContain("pnpm exec lint-staged");
    expect(preCommit).not.toMatch(/\bnpx\b/);

    const commitMsgHook = readFileSync(join(root, ".husky/commit-msg"), "utf8");
    // `pnpm exec commit-msg-linter` runs the wrong bin (SHA-based CLI). The real hook
    // is `commit-msg-linter/commit-msg-linter.js`, which reads `.git/COMMIT_EDITMSG`.
    expect(commitMsgHook).toContain("pnpm run commit-msg-hook");
    expect(commitMsgHook).not.toMatch(/\bnpx\b/);
    expect(commitMsgHook).not.toContain("pnpm exec commit-msg-linter");

    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
    expect(pkg.scripts["commit-msg-hook"]).toContain(
      "commit-msg-linter/commit-msg-linter.js",
    );
  });
});
