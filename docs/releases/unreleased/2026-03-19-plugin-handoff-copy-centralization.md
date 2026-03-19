---
type: refactor
scope: plugin
audience: developer
summary: Centralize approvals and audit handoff copy for the alpha control surface.
breaking: false
demo_ready: true
tests:
  - pnpm typecheck
  - pnpm test
artifacts:
  - plugins/openclaw-clawguard/src/routes/shared.ts
  - plugins/openclaw-clawguard/src/routes/approvals.ts
  - plugins/openclaw-clawguard/src/routes/audit.ts
  - tests/integration/openclaw-clawguard-plugin.test.ts
---

## What changed

ClawGuard now sources the live-queue boundary copy and the approvals-to-audit handoff text from shared route helpers instead of repeating those phrases inline in `approvals.ts` and `audit.ts`.

## Why it matters

The control surface now keeps the operator flow wording aligned across the live queue, the replay page, and the shared navigation copy. That reduces drift when we tighten the alpha handoff language further.

## Demo posture / limitations

This is still an install-demo only wording and composition change. It does not alter runtime behavior, queue state transitions, or approval logic. It only makes the live-item versus final-closure handoff easier to read and maintain.
