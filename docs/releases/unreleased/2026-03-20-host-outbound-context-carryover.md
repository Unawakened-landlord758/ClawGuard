---
type: feature
scope: outbound
audience: developer
summary: Preserve host outbound route context from message_sending through message_sent closure
breaking: false
demo_ready: true
tests:
  - pnpm typecheck
  - pnpm test -- --run tests/integration/openclaw-clawguard-outbound-lifecycle.test.ts tests/integration/openclaw-clawguard-plugin.test.ts
artifacts:
  - plugins/openclaw-clawguard/src/services/state.ts
  - tests/integration/openclaw-clawguard-outbound-lifecycle.test.ts
---

## What changed

Added a small host-outbound tracking cache so route context captured during `message_sending` can be reused when `message_sent` closes the replay.
This lets the final host-outbound audit detail keep route fields such as thread context even when the `message_sent` hook does not resend the same metadata payload.

## Why it matters

This is a lifecycle-closure fix, not a presentation-only tweak.
Without it, host-level direct outbound could lose part of the route context between the pre-send and post-send hooks, which makes the final replay less trustworthy than the initial interception point.

## Demo posture / limitations

This still keeps host-level direct outbound on the current hard-block-or-audit lane and does not add host-level approvals.
It only makes the existing `message_sending -> message_sent` closure more stable for the fake-only alpha replay path.
