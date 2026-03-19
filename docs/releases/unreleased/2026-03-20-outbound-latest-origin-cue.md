---
type: refactor
scope: outbound
audience: developer
summary: Add a stable latest outbound origin cue to the audit hero and JSON payload so host-level direct outbound and approval-gated outbound are easier to distinguish in replay views.
breaking: false
demo_ready: true
tests:
  - pnpm exec vitest run tests/integration/openclaw-clawguard-plugin.test.ts -t "surfaces explicit outbound route mode through approvals and audit for queued message deliveries"
  - pnpm exec vitest run tests/integration/openclaw-clawguard-plugin.test.ts -t "explains host-level direct outbound as an audit-only lane in the replay view"
  - pnpm typecheck
artifacts:
  - plugins/openclaw-clawguard/src/routes/audit.ts
  - tests/integration/openclaw-clawguard-plugin.test.ts
---

## What changed

- The audit hero and JSON `timeline.latest` payload now include `latestOutboundOrigin` when the most recent outbound-related replay can be identified.
- The cue is derived from existing replay flow classification, so approval-gated outbound replays surface `Approvals queue` while host-level direct outbound replays surface `Direct host outbound`.
- Existing route and route-mode cues remain unchanged.

## Why it matters

- Replay views now distinguish outbound lanes more explicitly without changing runtime behavior or audit storage.
- This makes the host-level versus tool-level outbound split easier to scan in the same place operators already inspect the latest replay detail.

## Demo posture / limitations

- This is a presentation-only alignment change. It does not add new hooks or expand outbound handling beyond the current install-demo surface.
- The cue is intentionally conservative and only appears when the current audit flows already expose an outbound-related replay lane.
