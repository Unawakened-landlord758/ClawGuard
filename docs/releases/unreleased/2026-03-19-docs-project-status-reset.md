---
type: docs
scope: docs
audience: developer
summary: Compressed the project index back into a true CLAUDE.md pointer file and reset TODO.md around the current Alpha install-demo status, active workstreams, and known doc drift.
breaking: false
demo_ready: false
tests:
  - pnpm typecheck
  - pnpm test
artifacts:
  - CLAUDE.md
  - TODO.md
---

## What changed

- Rewrote `CLAUDE.md` as a compact project index focused on repo structure, commands, architecture pointers, and current development focus instead of duplicating large amounts of product context.
- Reset `TODO.md` around the current factual status: Alpha / first usable version install-demo, the validated plugin-owned control surface, current automated verification baseline, and the next workstreams for outbound and workspace mutation.
- Captured the main documentation drift still left to resolve, especially outdated acceptance-checklist test counts and the remaining three-page versus five-page smoke-path wording mismatch.

## Why it matters

- Future agents and contributors now get a smaller, more accurate entry point instead of re-reading an oversized index file.
- The task tracker is back to being an operational status board rather than a mixed history dump, which should reduce confusion about whether the project is still docs-first or already in an Alpha implementation phase.

## Demo posture / limitations

- What this proves: the repository status has been re-stated against the current code and validation baseline.
- What this does **not** prove: any new runtime capability, broader host coverage, or publish readiness.
- Any demo-only / unpublished reminder: the product posture remains Alpha, install-demo only, unpublished, and fake-only.
