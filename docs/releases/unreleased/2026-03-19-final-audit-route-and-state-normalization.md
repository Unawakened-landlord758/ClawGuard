---
type: feature
scope: plugin
audience: developer
summary: Normalize workspace result-state labels and surface final outbound routes in audit detail
breaking: false
demo_ready: true
tests:
  - pnpm test -- --run tests/integration/openclaw-clawguard-outbound-lifecycle.test.ts
  - pnpm test -- --run tests/integration/openclaw-clawguard-plugin.test.ts
  - pnpm typecheck
artifacts:
  - plugins/openclaw-clawguard/src/services/state.ts
  - tests/integration/openclaw-clawguard-outbound-lifecycle.test.ts
---

## What changed

Final audit detail now includes the fully rendered outbound route for post-delivery host outcomes, using the same `target via channel/account/conversation` presentation already used elsewhere in the plugin. The workspace result-state summarizer also normalizes common operation synonyms such as `created`, `updated`, `renamed`, and `removed` back onto the existing shared labels like `insert`, `modify`, `rename-like`, and `delete`.

## Why it matters

This keeps the replay trail internally consistent. Operators can see the exact host-level delivery route in the final outbound audit entry, and structured workspace results coming back from slightly different host payloads still collapse onto the same small state vocabulary used across approvals, audit, and control-surface summaries.

## Demo posture / limitations

This does not add new hooks, new approval paths, or broader workspace heuristics. It only improves how existing plugin-owned audit details are normalized and rendered inside the current install-demo surface.
