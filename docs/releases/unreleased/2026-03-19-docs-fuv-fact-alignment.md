---
type: docs
scope: docs
audience: developer
summary: Aligned the active first-usable-version acceptance and release drafts to the current five-route plugin smoke path and latest local test baseline.
breaking: false
demo_ready: false
tests:
  - pnpm typecheck
  - pnpm test
artifacts:
  - TODO.md
  - docs/v1-acceptance-checklist.md
  - docs/releases/2026-03-14-first-usable-version-acceptance-checklist.md
  - docs/releases/2026-03-14-first-usable-version-release-note-public-draft.md
  - docs/releases/2026-03-14-first-usable-version-release-note-internal-draft.md
  - docs/releases/2026-03-14-first-usable-version-announcement-draft.md
---

## What changed

- Updated the active first-usable-version acceptance docs to use the current five-route plugin-owned smoke path: dashboard, checkup, approvals, audit, and settings.
- Updated the detailed acceptance checklist to reflect the latest local validation baseline of `pnpm typecheck` plus `pnpm test` with 218 passing tests and 1 skipped test.
- Updated the public/internal release-note drafts and the announcement draft so their recommended smoke/demo order matches the current dashboard-first Alpha control surface.
- Synced `TODO.md` so the resolved doc-drift items are marked complete instead of staying listed as open drift.

## Why it matters

- The repository now has fewer conflicting fact sources when someone prepares a demo, release note, or operator walkthrough.
- The active drafts better match the current plugin surface instead of preserving an older three-page smoke model that no longer describes the main Alpha flow.

## Demo posture / limitations

- What this proves: the current draft release and acceptance docs now match the present install-demo route surface and local test baseline more closely.
- What this does **not** prove: any new runtime coverage, publish readiness, or broader host integration.
- Any demo-only / unpublished reminder: the project remains Alpha, install-demo only, unpublished, and fake-only.
