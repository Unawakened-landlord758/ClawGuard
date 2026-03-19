---
type: refactor
scope: workspace
audience: developer
summary: Improved structured workspace result summaries so rename-like path pairs are rendered as readable from/to or old/new transitions in the final audit trail.
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

- `summarizeStructuredToolResult` now formats object-valued workspace result fields with explicit path pairs when it can recognize `fromPath` / `toPath`, `oldPath` / `newPath`, or `from` / `to` style data.
- The final audit detail keeps the existing workspace result state/source hints, but the rename-like branch now reads more like an operator-facing transition instead of a raw payload dump.

## Why it matters

- Workspace replay details are easier to scan when the result already contains a clear path transition.
- This keeps the audit text readable without changing any workspace policy, route, or schema behavior.

## Demo posture / limitations

- This is a presentation-only improvement. It does not expand the workspace mutation surface or change approval routing.
- The new formatting only applies when the structured result already contains a clear path relationship; ambiguous payloads still fall back to the previous conservative summary.
