---
type: feature
scope: workspace
audience: developer
summary: Fold copied workspace result aliases into the existing rename-like closure path
breaking: false
demo_ready: true
tests:
  - pnpm typecheck
  - pnpm test -- --run tests/integration/openclaw-clawguard-plugin.test.ts
artifacts:
  - plugins/openclaw-clawguard/src/services/state.ts
  - tests/integration/openclaw-clawguard-plugin.test.ts
---

## What changed

Extended the workspace result closure logic so `copied`, `copiedPaths`, and `copied_paths` are treated as rename-like structured result aliases.
The same round also normalizes `operationType: copied` onto the existing `rename-like` workspace result state instead of introducing a new public label.

## Why it matters

Input normalization already treated git-style copy headers as the same conservative move-like workspace semantic.
This update closes the remaining gap on the result side, so more host payloads can land on the same replay wording without changing approval routing or public contracts.

## Demo posture / limitations

This does not broaden the workspace action surface beyond the current fake-only `write / edit / apply_patch` lane.
It only improves structured result compatibility for the existing audit closure path, and still refuses no-op or incomplete copy pairs.
