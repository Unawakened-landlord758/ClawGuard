---
type: refactor
scope: audit
audience: developer
summary: Added a top-of-page Audit hero callout that shows the latest outbound route parsed from existing replay detail.
breaking: false
demo_ready: true
tests:
  - pnpm typecheck
  - pnpm test -- --run tests/integration/openclaw-clawguard-plugin.test.ts
artifacts:
  - plugins/openclaw-clawguard/src/routes/audit.ts
  - tests/integration/openclaw-clawguard-plugin.test.ts
---

## What changed

- Audit now shows a hero-level `Latest outbound route in recent replay` line when the replay trail already contains an outbound route.
- The value is derived from existing audit detail only, using the same parsed outbound route text already present in the replay trail.
- The integration test now asserts the hero callout appears for the queued outbound path.

## Why it matters

- Operators can see the most recent outbound target immediately on the Audit page instead of having to scroll to the flow cards first.
- This keeps the page read-only and presentation-only while making the top summary more actionable.

## Demo posture / limitations

- This does not change runtime capture, audit persistence, or state transitions.
- The callout is only shown when an outbound route has already been recorded in the audit trail; no placeholder is shown for trails without outbound activity.
