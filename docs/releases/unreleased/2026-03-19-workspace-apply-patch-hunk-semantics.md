---
type: feature
scope: workspace
audience: developer
summary: Refined apply_patch workspace semantics so pure update hunks can now surface conservative insert/delete intent instead of always collapsing to modify.
breaking: false
demo_ready: true
tests:
  - pnpm typecheck
  - pnpm exec vitest run tests/unit/input-normalization.test.ts tests/integration/openclaw-adapter-pipeline.test.ts
  - pnpm test
artifacts:
  - src/adapters/openclaw/normalization.ts
  - tests/unit/input-normalization.test.ts
  - tests/integration/openclaw-adapter-pipeline.test.ts
  - TODO.md
---

## What changed

- Added a conservative second-pass classifier for `apply_patch` so update-file hunks that only add lines now surface as `insert`, and update-file hunks that only remove lines now surface as `delete`.
- Kept the existing stronger signals intact: add/delete/move headers still win first, and mixed or conflicting multi-file patch shapes still fall back to `modify`.
- Added unit and adapter-pipeline coverage for pure insert, pure delete, and conflicting multi-file fallback scenarios.

## Why it matters

- Workspace mutation approvals now communicate a little more of the real operator intent for common patch flows, especially when an `apply_patch` is clearly appending or removing content from an existing file.
- The implementation stays conservative and explainable: it improves signal quality without pretending to fully understand arbitrary patch semantics or widening the review surface too aggressively.

## Demo posture / limitations

- What this proves: the shared Core can recover a slightly richer `workspace_context.operation_type` from existing `apply_patch` text without any new host hooks.
- What this does **not** prove: broad host-level workspace governance, file-system bridge integration, or aggressive semantic understanding of arbitrary multi-file patches.
- Any demo-only / unpublished reminder: the project remains Alpha, install-demo only, unpublished, and fake-only.
