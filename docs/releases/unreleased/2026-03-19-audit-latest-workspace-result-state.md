---
type: fix
scope: audit
audience: developer
summary: Audit hero now shows the latest workspace result state from recent replay flows as a separate summary field alongside the existing outbound route line.
breaking: false
demo_ready: true
tests:
  - pnpm typecheck
  - pnpm test
artifacts:
  - plugins/openclaw-clawguard/src/routes/audit.ts
  - tests/integration/openclaw-clawguard-plugin.test.ts
---

## What changed

- Added a hero-level summary line that surfaces the latest workspace result state parsed from recent replay audit detail.
- The new line is shown only when a recent replay flow already contains workspace result state text.

## Why it matters

- Audit now mirrors the existing outbound route summary with a symmetric workspace result signal.
- Operators can see both the latest outbound route and the latest workspace replay state at a glance without opening the timeline cards.

## Demo posture / limitations

- This is a presentation-only summary enhancement.
- It does not change the live queue, the audit schema, or how replay flows are recorded.
