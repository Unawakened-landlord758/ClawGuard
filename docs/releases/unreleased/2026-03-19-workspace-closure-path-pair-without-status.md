---
type: fix
scope: workspace
audience: developer
summary: Preserve rename-like workspace closure summaries when top-level path-pair results arrive without status, summary, or explicit path arrays.
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

- Tightened `summarizeStructuredToolResult()` so it no longer returns early when a structured workspace result has no `summary`, `status`, or `paths`, but still has a usable derived workspace state or top-level rename pair.
- Added a plugin integration test covering the narrow case where a persisted workspace result only reports `fromPath/toPath` and still needs to produce a readable rename-like closure summary.

## Why it matters

- Some hosts can report workspace closure details as a minimal top-level path pair without also sending status text or path arrays.
- This keeps the final audit trail readable and consistent instead of silently dropping the closure summary in that narrow path.

## Demo posture / limitations

- This does not expand the runtime surface or change approval behavior.
- The fix only affects conservative summary generation for already-recorded workspace result detail.
