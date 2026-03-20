---
type: docs
scope: docs
audience: public
summary: Align root README and TODO to the /clawguard public-shell entry path
breaking: false
demo_ready: true
tests:
  - pnpm test -- --run tests/integration/openclaw-clawguard-plugin.test.ts
artifacts:
  - README.md
  - README.zh-CN.md
  - TODO.md
---

## What changed

The root English README, Chinese README, and TODO now describe `/clawguard*` as the current browser-facing user entry path. They also keep `/plugins/clawguard/*` explicitly framed as protected backing routes rather than the URLs ordinary users should open directly.

## Why it matters

The plugin README and release drafts had already moved to the public-shell posture, but the root entry documents were still pointing users at raw `/plugins/clawguard/*` routes in several places. That contradicted the current browser behavior and the current no-core-patch entry flow.

Aligning the root documents removes that contradiction and keeps the repo-level story consistent with the actual operator path.

## Demo posture / limitations

This does not remove the protected `/plugins/clawguard/*` routes. They still back the public shell and remain part of regression coverage.

This remains Alpha install-demo only, local-only, unpublished, and fake-only.
