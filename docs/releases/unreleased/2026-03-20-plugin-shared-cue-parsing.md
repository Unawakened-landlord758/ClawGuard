---
type: refactor
scope: plugin
audience: developer
summary: Centralize audit and pending cue parsing for dashboard, approvals, and audit routes
breaking: false
demo_ready: true
tests:
  - pnpm typecheck
  - pnpm test -- --run tests/integration/openclaw-clawguard-plugin.test.ts
artifacts:
  - plugins/openclaw-clawguard/src/routes/shared.ts
  - plugins/openclaw-clawguard/src/routes/dashboard.ts
  - plugins/openclaw-clawguard/src/routes/approvals.ts
  - plugins/openclaw-clawguard/src/routes/audit.ts
---

## What changed

Moved the repeated outbound-route, route-mode, and workspace-result cue parsing into shared route helpers.
`dashboard`, `approvals`, and `audit` now reuse the same helper functions instead of each carrying a local regex and string-splitting variant.

## Why it matters

This keeps the control-surface presentation aligned across HTML and JSON views without changing the underlying runtime model.
It also reduces the chance that one page drifts and starts reading the same audit detail differently from another page.

## Demo posture / limitations

This is still a presentation-layer refactor for the install demo only.
It does not add new hooks, broader capture, or a stronger outbound/workspace policy surface; it only keeps the existing fake-only operator cues consistent.
