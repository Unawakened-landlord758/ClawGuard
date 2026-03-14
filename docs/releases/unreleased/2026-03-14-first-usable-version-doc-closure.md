---
type: docs
scope: docs
audience: public
summary: Converged the install-demo baseline into first-usable-version release-note, announcement, and acceptance-checklist drafts.
breaking: false
demo_ready: true
tests:
  - pnpm typecheck
  - pnpm test
artifacts:
  - README.md
  - README.zh-CN.md
  - TODO.md
  - plugins/openclaw-clawguard/README.md
  - docs/releases/2026-03-14-first-usable-version-release-note-public-draft.md
  - docs/releases/2026-03-14-first-usable-version-release-note-internal-draft.md
  - docs/releases/2026-03-14-first-usable-version-announcement-draft.md
  - docs/releases/2026-03-14-first-usable-version-acceptance-checklist.md
---

## What changed

- Added first usable version public/internal release-note drafts plus an announcement draft.
- Added a small acceptance checklist to keep the current install-demo boundary explicit.
- Tightened README wording around direct plugin routes, fake-only demo posture, and minimal outbound/workspace scope.
- Updated `TODO.md` so the current first usable version includes and excludes are explicit.

## Why it matters

- New visitors can understand the current install-demo baseline without mistaking it for a formal release.
- Internal and external messaging now share one modest first-usable-version boundary.

## Demo posture / limitations

- What this update proves: local install, plugin-route smoke path, and fake-only approval/audit walkthroughs.
- What this update does **not** prove: publish, GA, real dangerous execution, real outbound delivery, or broad runtime completeness.
- Any demo-only / unpublished reminder: keep all public messaging at install-demo only / unpublished / fake-only.
