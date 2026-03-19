---
type: fix
scope: ci
audience: developer
summary: Added the missing esbuild root devDependency so the OpenClaw plugin build and prepack steps work in CI.
breaking: false
demo_ready: true
tests:
  - pnpm typecheck
  - pnpm test
  - pnpm --dir plugins/openclaw-clawguard build
artifacts:
  - package.json
  - pnpm-lock.yaml
---

## What changed

- Added `esbuild` to the repository root `devDependencies`.
- Refreshed `pnpm-lock.yaml` so CI installs the bundler needed by `scripts/build-openclaw-clawguard-plugin.mjs`.

## Why it matters

- The GitHub Actions failure was not a test regression in ClawGuard logic. The plugin packaging tests were failing because the build script imported `esbuild`, but the CI install set did not include it.
- With the root dependency in place, the install-demo plugin `build` and `prepack` paths can run in CI the same way they do locally.

## Demo posture / limitations

- This does not expand the plugin surface or change runtime behavior.
- It only restores the existing install-demo build/prepack path so the current tarball and plugin-surface tests can execute in CI.
