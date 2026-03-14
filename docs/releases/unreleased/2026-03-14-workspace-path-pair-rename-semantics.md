---
type: feature
scope: runtime
audience: developer
summary: Added conservative shared Core path-pair rename-like semantics so workspace mutation approvals and audit text can explain high-confidence move-style scenarios that carry from/to or old/new paths.
breaking: false
demo_ready: true
tests:
  - node .\node_modules\vitest\vitest.mjs run tests\unit\input-normalization.test.ts tests\integration\openclaw-adapter-pipeline.test.ts tests\integration\openclaw-clawguard-plugin.test.ts
  - pnpm typecheck
artifacts:
  - TODO.md
  - src\domain\context\evaluation-input.ts
  - src\adapters\openclaw\normalization.ts
  - tests\unit\input-normalization.test.ts
  - tests\integration\openclaw-adapter-pipeline.test.ts
  - tests\integration\openclaw-clawguard-plugin.test.ts
---

## What changed

- Added a shared Core path-pair heuristic for workspace mutation inputs that carry `fromPath` / `toPath` or `oldPath` / `newPath`.
- Only high-confidence path migrations emit `rename-like`; lower-confidence path swaps stay on `modify`.
- Reused the existing approval title, risk summary, explanation, pending-action guidance, and approvals page display chain without changing approve/block routing.

## Why it matters

- Host-backed move-style workspace mutations now explain themselves more clearly instead of reading like generic file writes.
- Shared Core semantics stay additive through optional `workspace_context.operation_type`, so plugin and adapter surfaces remain aligned.

## Demo posture / limitations

- What this update proves: ClawGuard can conservatively explain high-confidence path-pair workspace moves using shared Core semantics.
- What this update does **not** prove: broader host-hook coverage, plugin-private rename logic, or AST-aware move/refactor understanding.
