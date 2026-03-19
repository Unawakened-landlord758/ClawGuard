---
type: feature
scope: plugin
audience: developer
summary: Surface outbound routes in audit replay and summarize structured workspace result arrays
breaking: false
demo_ready: true
tests:
  - pnpm typecheck
  - pnpm test -- --run tests/integration/openclaw-clawguard-plugin.test.ts
artifacts:
  - plugins/openclaw-clawguard/src/routes/audit.ts
  - plugins/openclaw-clawguard/src/services/state.ts
  - tests/integration/openclaw-clawguard-plugin.test.ts
---

## What changed

The Audit page now parses `Outbound route=...` out of replay detail and surfaces it as a structured field on both replay flows and individual events. The workspace structured-result summarizer also learned two new safe shapes: arrays of path-pair objects and arrays of readable path objects such as `{ path: ... }` or `{ filePath: ... }`.

## Why it matters

This makes replay output easier to scan without changing the underlying audit model. Operators can see which outbound route a replay is about without reading the full detail blob, and workspace finalization stays readable even when host result payloads return multiple structured file entries instead of a single string.

## Demo posture / limitations

This is still presentation-only on top of the existing plugin-owned audit trail. It does not add new hooks or broader workspace capture, and the workspace summarizer still ignores ambiguous objects instead of guessing at unsupported shapes.
