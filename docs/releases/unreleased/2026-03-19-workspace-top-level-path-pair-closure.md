---
type: feature
scope: workspace
audience: developer
summary: Promote top-level workspace result path pairs into rename-like closure summaries
breaking: false
demo_ready: true
tests:
  - pnpm test -- --run tests/integration/openclaw-clawguard-plugin.test.ts
  - pnpm typecheck
artifacts:
  - plugins/openclaw-clawguard/src/services/state.ts
  - tests/integration/openclaw-clawguard-plugin.test.ts
---

## What changed

Structured workspace result closure now has a conservative fallback for top-level path pairs. When a tool result directly returns `fromPath/toPath` or `oldPath/newPath` at the top level, ClawGuard can summarize that as `renamed=... -> ...` and derive `workspace result state=rename-like via renamed` even if the host did not wrap it inside a `renamed` field.

## Why it matters

Some hosts or tool adapters report rename-like workspace outcomes as a top-level path pair instead of nesting them under `renamed`. This keeps the final audit detail readable and consistent without widening the state model or adding a new branch in the approval flow.

## Demo posture / limitations

This remains conservative. ClawGuard only promotes complete, non-empty, non-conflicting top-level path pairs. Incomplete or conflicting fields still fall back to the existing closure summary logic.
