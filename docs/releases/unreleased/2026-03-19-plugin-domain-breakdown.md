---
type: refactor
scope: plugin
audience: developer
summary: Added a shared exec/outbound/workspace live posture breakdown to dashboard and checkup.
breaking: false
demo_ready: true
tests:
  - pnpm typecheck
  - pnpm test
artifacts:
  - plugins/openclaw-clawguard/src/routes/shared.ts
  - plugins/openclaw-clawguard/src/routes/dashboard.ts
  - plugins/openclaw-clawguard/src/routes/checkup.ts
  - tests/integration/openclaw-clawguard-plugin.test.ts
---

## What changed

- Added a shared control-surface domain classifier and renderer for the current `exec`, `outbound`, `workspace`, and `other` lanes.
- Wired the live posture domain breakdown into `dashboard` and `checkup` so the current queue mix is visible next to the existing coverage legend.
- Extended the control-surface integration test to assert that the new domain breakdown is present in both the HTML views and the shared JSON payload.

## Why it matters

- The control surface now shows which lane is carrying the live posture, not just the static install-demo boundary.
- This keeps the current roadmap visible to operators without moving any logic into the state layer or introducing new hooks.

## Demo posture / limitations

- This remains presentation-only. It does not add new runtime capture, broaden outbound behavior, or change workspace mutation semantics.
- The breakdown is intentionally small and conservative: `exec`, `outbound`, `workspace`, and `other` are only derived from already captured tool names.
