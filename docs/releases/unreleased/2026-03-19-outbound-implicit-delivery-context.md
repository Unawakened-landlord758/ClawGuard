---
type: feature
scope: outbound
audience: developer
summary: Added minimal session delivery context support so outbound evaluation can explain and classify implicit routes when a tool call omits an explicit target.
breaking: false
demo_ready: true
tests:
  - pnpm typecheck
  - pnpm exec vitest run tests/unit/input-normalization.test.ts tests/integration/openclaw-adapter-pipeline.test.ts
  - pnpm test
artifacts:
  - src/adapters/openclaw/session-policy.ts
  - src/domain/context/evaluation-input.ts
  - src/adapters/openclaw/normalization.ts
  - src/orchestration/classifier/evaluation-presentation.ts
  - tests/unit/input-normalization.test.ts
  - tests/integration/openclaw-adapter-pipeline.test.ts
  - TODO.md
---

## What changed

- Extended the OpenClaw session-policy adapter with a minimal `deliveryContext` shape: `channel`, `to`, `accountId`, and `threadId`.
- Updated outbound normalization so tool-level outbound calls can now fall back to the session delivery context when no explicit `to` is present, and mark the route as `target_mode=implicit`.
- Updated outbound presentation so explanations now surface both the resolved route and whether it was `explicit` or `implicit`.

## Why it matters

- ClawGuard can now evaluate a realistic OpenClaw delivery plan instead of only looking at explicit tool params, which matters for sessions that reply through a remembered route.
- This keeps the implementation aligned with OpenClaw's stable delivery vocabulary without copying over its full session-routing internals.

## Demo posture / limitations

- What this proves: the shared Core can classify and explain minimal implicit outbound routes using the current session delivery context fields.
- What this does **not** prove: full session-routing parity with OpenClaw, delivery-queue retry/recovery semantics, or broader outbound lifecycle governance.
- Any demo-only / unpublished reminder: the project remains Alpha, install-demo only, unpublished, and fake-only.
