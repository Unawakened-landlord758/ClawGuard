---
type: test
scope: plugin
audience: developer
summary: Added quick-scan regression coverage for audit entries that include a route mode but no outbound route target.
breaking: false
demo_ready: true
tests:
  - pnpm typecheck
  - pnpm test -- --run tests/integration/openclaw-clawguard-plugin.test.ts
artifacts:
  - tests/integration/openclaw-clawguard-plugin.test.ts
---

## What changed

- Added a plugin integration test that exercises the conservative quick-scan path when recent audit detail includes `Route mode=...` but does not include `Outbound route=...`.
- The new test asserts that dashboard and checkup still show the workspace state and route mode while intentionally omitting the outbound route line.

## Why it matters

- This protects the new quick-scan route presentation from over-rendering made-up route targets when the audit trail only captured a mode.
- It keeps the control-surface summary aligned with the same conservative parsing posture already used elsewhere in the plugin.

## Demo posture / limitations

- This is test coverage only. It does not change runtime behavior, route extraction, or any page layout.
- The install-demo remains fake-only and continues to surface route details only when they already exist in audit text.
