---
type: feature
scope: plugin
audience: developer
summary: Include outbound destinations in fast-path summaries and preserve full workspace impact scope lists
breaking: false
demo_ready: true
tests:
  - pnpm typecheck
  - pnpm test -- --run tests/integration/openclaw-adapter-pipeline.test.ts tests/integration/openclaw-clawguard-plugin.test.ts
artifacts:
  - src/orchestration/classifier/evaluation-presentation.ts
  - plugins/openclaw-clawguard/src/services/state.ts
  - tests/integration/openclaw-adapter-pipeline.test.ts
  - tests/integration/openclaw-clawguard-plugin.test.ts
---

## What changed

Outbound fast-path summaries now carry the normalized destination presentation in the same line as the matched rule summary, so approval and audit surfaces no longer lose the actual route target when a primary match exists. Workspace impact-scope fallback also now preserves the full captured path list instead of dropping to the first path when a direct block message is built without an approval request.

## Why it matters

This keeps the same bounded data visible across more replay surfaces. Operators can see where an outbound call was heading directly from the fast-path summary, and blocked workspace messages no longer hide secondary affected paths when the host already provided them.

## Demo posture / limitations

This does not add new routing logic or broader workspace capture. It only reuses existing normalized destination and path data so the Alpha control surface stays more consistent.
