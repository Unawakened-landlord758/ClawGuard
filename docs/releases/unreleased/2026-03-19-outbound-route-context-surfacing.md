---
type: feature
scope: outbound
audience: developer
summary: Surfaced host outbound route context through shared Core normalization so outbound summaries, explanations, and approval scopes now describe both the target and the host delivery route.
breaking: false
demo_ready: true
tests:
  - pnpm typecheck
  - pnpm exec vitest run tests/unit/input-normalization.test.ts tests/integration/openclaw-adapter-pipeline.test.ts
  - pnpm exec vitest run tests/integration/openclaw-clawguard-outbound-lifecycle.test.ts tests/integration/openclaw-clawguard-plugin.test.ts
  - pnpm test
artifacts:
  - src/domain/context/evaluation-input.ts
  - src/adapters/openclaw/normalization.ts
  - src/orchestration/classifier/evaluation-presentation.ts
  - plugins/openclaw-clawguard/src/services/state.ts
  - tests/unit/input-normalization.test.ts
  - tests/integration/openclaw-adapter-pipeline.test.ts
  - TODO.md
---

## What changed

- Extended the shared `EvaluationDestination` shape so outbound normalization can now carry host route context alongside the existing outbound target: `channel`, `account`, `conversation`, and `thread`.
- Updated OpenClaw normalization and the plugin's host-outbound parameter bridge so `message_sending` now preserves `channelId` / `accountId` / `conversationId` / `thread` when building shared Core artifacts.
- Updated outbound presentation helpers so summaries, explanations, and approval impact scopes now render route-aware strings such as `target via channel/account/conversation (thread ...)` instead of only echoing the raw destination target.

## Why it matters

- Outbound review text is now more operator-usable because it explains both where content is going and which host delivery route it would take, instead of flattening everything down to a single destination string.
- This makes host-level outbound audit and approval language line up better with the actual OpenClaw delivery surface the plugin already sees today, without inventing a second outbound interpretation layer.

## Demo posture / limitations

- What this proves: the shared Core can now preserve and surface richer outbound route context for the existing host-level and tool-level outbound paths.
- What this does **not** prove: full delivery-context recovery from OpenClaw sessions, broader outbound hook coverage, or GA-grade outbound lifecycle governance.
- Any demo-only / unpublished reminder: the project remains Alpha, install-demo only, unpublished, and fake-only.
