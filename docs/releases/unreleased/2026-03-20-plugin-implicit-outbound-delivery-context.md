---
type: feature
scope: outbound
audience: developer
summary: Carry deliveryContext through plugin before_tool_call so implicit outbound routes reach approvals and audit
breaking: false
demo_ready: true
tests:
  - pnpm typecheck
  - pnpm test -- --run tests/integration/openclaw-clawguard-plugin.test.ts
artifacts:
  - src/types/openclaw-plugin-sdk-core.d.ts
  - plugins/openclaw-clawguard/src/hooks/before-tool.ts
  - plugins/openclaw-clawguard/src/services/state.ts
  - plugins/openclaw-clawguard/src/routes/approvals.ts
  - tests/integration/openclaw-clawguard-plugin.test.ts
---

## What changed

Extended the local plugin hook typing and before-tool bridge so `deliveryContext` can flow into the shared Core `session_policy` for tool-level outbound evaluation.
The same round also fixed the Approvals page to derive outbound route text from existing shared cues when the tool call has no explicit `params.to`, which is the normal implicit-route shape.

## Why it matters

Shared Core already knew how to classify implicit outbound routes, but the plugin had not been passing that host/session context through its `before_tool_call` bridge.
This closes that gap and proves the end-to-end path: implicit tool-level outbound can now reach pending approval, keep route-aware live queue messaging, and close with a route-aware final audit outcome.

## Demo posture / limitations

This remains within the current fake-only outbound lane and does not add retry queues, recovery logic, or host-level approvals.
It only makes the plugin bridge match the existing shared Core outbound semantics more closely.
