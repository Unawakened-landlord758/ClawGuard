---
type: feature
scope: workspace
audience: developer
summary: Expand workspace mutation alias coverage across input normalization and final result closure.
breaking: false
demo_ready: true
tests:
  - pnpm test -- tests/unit/input-normalization.test.ts tests/integration/openclaw-adapter-pipeline.test.ts
  - pnpm test -- tests/integration/openclaw-clawguard-plugin.test.ts -t "canonicalizes added and changedPaths aliases into workspace closure detail" -t "canonicalizes modified and filePaths aliases into workspace closure detail" -t "canonicalizes removed aliases into workspace delete closure detail"
artifacts:
  - src/domain/context/evaluation-input.ts
  - src/adapters/openclaw/normalization.ts
  - plugins/openclaw-clawguard/src/services/state.ts
  - tests/unit/input-normalization.test.ts
  - tests/integration/openclaw-adapter-pipeline.test.ts
  - tests/integration/openclaw-clawguard-plugin.test.ts
---

## What changed

Workspace mutation normalization now accepts a broader but still bounded alias surface. Before-tool evaluation can treat `sourcePath/targetPath` like the existing path-pair forms, pick up `oldValue/newValue` edit text aliases, and normalize `patch_text` in the same way as `patch` and `patchText`.

The plugin-side workspace result closure was expanded in parallel. Final audit detail now canonicalizes `added`, `modified`, and `removed` into the existing `created`, `updated`, and `deleted` lanes, and preserves extra path lists from `changedPaths`, `changed_paths`, and `filePaths`.

## Why it matters

This moves the workspace M1 line forward in a concrete way: more real host payloads can now land on the same shared workspace semantics without changing public contracts. Approval titles, impact scope, operation heuristics, and final replay detail stay aligned instead of depending on one exact field spelling.

## Demo posture / limitations

This is still a conservative expansion. It does not widen rename-like beyond the existing bounded path-pair rules, and it does not claim broad workspace coverage outside the current `write`, `edit`, and `apply_patch` surface. The goal here is compatibility and replay stability, not a new policy model.
