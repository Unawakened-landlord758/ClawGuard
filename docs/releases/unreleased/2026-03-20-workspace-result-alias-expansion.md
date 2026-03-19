---
type: feature
scope: workspace
audience: developer
summary: Expand structured workspace result alias coverage for closure summaries
breaking: false
demo_ready: true
tests:
  - pnpm typecheck
  - pnpm test -- --run tests/integration/openclaw-clawguard-plugin.test.ts
artifacts:
  - plugins/openclaw-clawguard/src/services/state.ts
  - tests/integration/openclaw-clawguard-plugin.test.ts
---

## What changed

Extended workspace result closure to accept more structured alias fields without changing the existing summary format.
The plugin now recognizes additional plural path aliases such as `createdPaths`, `updatedPaths`, `deletedPaths`, `file_paths`, and rename-like aliases such as `moved`, `movedPaths`, and `moved_paths`.

## Why it matters

This pushes the `workspace mutation` M1 line forward in a real host-compatibility direction.
More structured tool-result payloads can now land on the same existing `insert / modify / delete / rename-like` replay semantics instead of being dropped back to generic path-only detail.

## Demo posture / limitations

This still does not broaden the workspace action surface beyond the current fake-only `write / edit / apply_patch` lane.
It only improves how already-captured structured results are normalized into the existing audit closure wording.
