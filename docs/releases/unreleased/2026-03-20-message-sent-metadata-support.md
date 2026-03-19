---
type: feature
scope: outbound
audience: developer
summary: Accept optional message_sent metadata so host outbound closure can preserve route context
breaking: false
demo_ready: true
tests:
  - pnpm typecheck
  - pnpm test -- --run tests/integration/openclaw-clawguard-outbound-lifecycle.test.ts
artifacts:
  - src/types/openclaw-plugin-sdk-core.d.ts
  - plugins/openclaw-clawguard/src/hooks/message-sent.ts
  - tests/integration/openclaw-clawguard-outbound-lifecycle.test.ts
---

## What changed

Added optional `metadata` support to the local `message_sent` hook typing and passed it through the plugin handler into the existing host-outbound finalization path.
This lets the post-send hook preserve route details such as thread context even when the pre-send cache is unavailable.

## Why it matters

This tightens the host-level outbound lifecycle without widening its scope.
The plugin can now keep route-aware final audit detail from either side of the host send lifecycle: from cached `message_sending` context or directly from the `message_sent` event when the host exposes it.

## Demo posture / limitations

This remains a backward-compatible optional field on the local plugin SDK surface.
It does not add host-level approvals or broaden outbound coverage; it only makes the current fake-only host replay closure more robust.
