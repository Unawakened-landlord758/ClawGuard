---
type: refactor
scope: outbound
audience: developer
summary: Extended outbound delivery context normalization to preserve conversationId so destination presentation and audit text can show the full route when it is already available.
breaking: false
demo_ready: true
tests:
  - pnpm typecheck
  - pnpm test -- --run tests/unit/input-normalization.test.ts
  - pnpm test -- --run tests/integration/openclaw-adapter-pipeline.test.ts
artifacts:
  - src/adapters/openclaw/session-policy.ts
  - src/adapters/openclaw/normalization.ts
  - tests/unit/input-normalization.test.ts
  - tests/integration/openclaw-adapter-pipeline.test.ts
---

## What changed

- Added `conversationId` to the outbound delivery context input shape.
- Normalization now carries `conversationId` through from session policy delivery context when the tool call itself did not already provide it.
- The adapter tests now cover the implicit outbound case where route presentation and impact scope include the preserved conversation id.

## Why it matters

- Outbound review text can now show the complete route context that was already present in session policy metadata.
- This keeps destination presentation, impact scope, and summary aligned without changing the explicit/implicit route classification or any runtime hook behavior.

## Demo posture / limitations

- This is still a conservative presentation and normalization change. It does not alter approval state transitions, outbound blocking rules, or session routing policy.
- The new field is only populated when the conversation id already exists in the captured delivery context or the tool params.
