---
type: feature
scope: runtime
audience: developer
summary: Added conservative shared Core apply_patch operation semantics so workspace mutation approvals and audit text can distinguish add, delete, modify, and rename-like patch intents.
breaking: false
demo_ready: true
tests:
  - node .\node_modules\vitest\vitest.mjs run tests\unit\input-normalization.test.ts tests\integration\openclaw-adapter-pipeline.test.ts tests\integration\openclaw-clawguard-plugin.test.ts
artifacts:
  - src/domain/shared/core.ts
  - src/domain/context/evaluation-input.ts
  - src/orchestration/classifier/evaluation-presentation.ts
  - tests/unit/input-normalization.test.ts
  - tests/integration/openclaw-adapter-pipeline.test.ts
  - tests/integration/openclaw-clawguard-plugin.test.ts
---

## What changed

- Extended the shared Core workspace-mutation classifier so `apply_patch` can infer additive `workspace_context.operation_type` semantics from `*** Add File`, `*** Delete File`, `*** Update File`, `*** Move to`, and git rename/copy metadata.
- Kept routing unchanged and reused the existing approval title, risk summary, explanation, pending-action messaging, and approvals page presentation chain.
- Made mixed-action patches collapse to a conservative single summary using explicit priority: `delete` > `rename-like` > `add` > `modify`.

## Why it matters

- Workspace mutation approvals no longer treat `apply_patch` as an opaque blob when the patch clearly signals add, delete, modify, or rename-like behavior.
- Plugin and adapter surfaces stay aligned because they both read the same optional shared Core semantic.

## Demo posture / limitations

- What this update proves: the current demo pipeline can explain conservative `apply_patch` intent without adding new UI surfaces or plugin-private logic.
- What this update does **not** prove: AST-aware diff understanding, exact per-hunk risk scoring, or broader routing changes for workspace mutation tools.
