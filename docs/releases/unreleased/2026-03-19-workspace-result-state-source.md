---
type: refactor
scope: workspace
audience: developer
summary: Added source hints to normalized workspace result-state summaries so inferred insert, delete, modify, and rename-like outcomes are easier to explain.
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

- `summarizeStructuredToolResult` now includes a `via <source>` hint when the workspace result state is inferred from a single structured field such as `created`, `updated`, `deleted`, or `renamed`.
- The final audit detail still prefers the explicit `operation_type` when present, and it still stays conservative when the structured fields are ambiguous.

## Why it matters

- Operators can see not just the normalized workspace result state, but also the field that justified it when the result was inferred from the structured payload.
- This makes the audit text easier to read without changing the underlying workspace schema or the exec/outbound paths.

## Demo posture / limitations

- This remains a presentation-layer improvement. It does not add any new workspace capability or expand the mutation surface.
- The source hint only appears when the input is already clear enough to support a single conservative inference.
