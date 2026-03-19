---
type: docs
scope: docs
audience: developer
summary: Carried the tightened outbound demo boundary into the active installer strategy and first-usable-version release drafts.
breaking: false
demo_ready: true
tests:
  - pnpm exec vitest run tests/integration/openclaw-clawguard-plugin.test.ts
artifacts:
  - TODO.md
  - docs/v1-installer-demo-strategy.md
  - docs/releases/2026-03-14-first-usable-version-release-note-public-draft.md
  - docs/releases/2026-03-14-first-usable-version-release-note-internal-draft.md
  - docs/releases/2026-03-14-first-usable-version-announcement-draft.md
---

## What changed

- Updated the installer strategy doc so its smoke-path and demo-order guidance now reflects the current five-route plugin surface and the tightened outbound boundary.
- Updated the active first-usable-version public/internal release drafts plus the announcement draft so outbound scope now explicitly says host-level direct sends stay on the hard-block path and do not imply host-level approvals.
- Synced `TODO.md` so the outbound boundary-doc closure item is marked complete.

## Why it matters

- The active strategy/release docs now point at the same outbound story as the runtime and plugin UI instead of preserving an older, looser “minimal outbound” wording.
- This makes it easier to resume mainline development without carrying forward fact drift in the install-demo communication layer.

## Demo posture / limitations

- What this proves: the live demo-facing strategy and release drafts now better match the current outbound behavior.
- What this does **not** prove: broader outbound lifecycle governance, host-level approval support, or any release/publish readiness beyond the current Alpha install-demo.
- Any demo-only / unpublished reminder: the project remains Alpha, install-demo only, unpublished, and fake-only.
