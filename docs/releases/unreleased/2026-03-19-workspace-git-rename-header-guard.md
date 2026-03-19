---
type: fix
scope: workspace
audience: developer
summary: Tighten apply_patch git rename header detection so only clean same-name directory moves surface as rename-like.
breaking: false
demo_ready: true
tests:
  - pnpm test -- tests/unit/input-normalization.test.ts tests/integration/openclaw-adapter-pipeline.test.ts
artifacts:
  - src/adapters/openclaw/normalization.ts
  - tests/unit/input-normalization.test.ts
  - tests/integration/openclaw-adapter-pipeline.test.ts
---

## What changed

The OpenClaw adapter now treats git-style `rename from` / `rename to` apply_patch headers as `rename-like` only when the patch is a clean header-only move with one explicit path pair and the same filename moving between directories. If rename headers are mixed with diff body markers or hunks, the adapter now falls back to the existing section-based semantics instead of preserving `rename-like`.

## Why it matters

This keeps workspace mutation approvals aligned with the same conservative posture already used for add/delete move detection. Clean patch-header moves still get the more precise `rename-like` approval surface, while rename patches that also modify file contents no longer overstate confidence.

## Demo posture / limitations

This does not expand the workspace control surface beyond `write`, `edit`, and `apply_patch`, and it does not change public contracts. It only narrows when `apply_patch` should surface `rename-like` for git rename metadata so the install-demo remains conservative.
