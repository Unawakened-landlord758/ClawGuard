---
type: fix
scope: plugin
audience: developer
summary: Aligned host-level outbound handling so message_sending now hard-blocks approval-required direct sends instead of silently letting them through.
breaking: false
demo_ready: true
tests:
  - pnpm typecheck
  - pnpm exec vitest run tests/integration/openclaw-clawguard-outbound-lifecycle.test.ts tests/integration/openclaw-clawguard-plugin.test.ts
  - pnpm test
artifacts:
  - plugins/openclaw-clawguard/src/services/state.ts
  - tests/integration/openclaw-clawguard-outbound-lifecycle.test.ts
  - tests/integration/openclaw-clawguard-plugin.test.ts
  - TODO.md
---

## What changed

- Changed host-level `message_sending` evaluation so direct outbound sends now stay on the hard-block path for both `block` and `approve_required` decisions.
- Changed `message_sent` finalization to skip host-level flows that were already hard-blocked, preventing them from later being recorded as allowed or failed delivery outcomes.
- Added integration coverage for the tightened host-level behavior and updated the outbound task tracker status in `TODO.md`.

## Why it matters

- The plugin behavior now matches the current product posture more closely: tool-level `message` / `sessions_send` can own approvals, while direct host outbound stays conservative and does not silently bypass that boundary.
- Audit replay is more coherent because a direct send that was blocked before channel delivery no longer reappears as a successful host delivery afterward.

## Demo posture / limitations

- What this proves: host-level outbound is now more internally consistent with the existing Alpha explanation of `message_sending` as a hard-block review point.
- What this does **not** prove: full outbound lifecycle governance, host-level approvals, or broader outbound hook coverage.
- Any demo-only / unpublished reminder: the project remains Alpha, install-demo only, unpublished, and fake-only.
