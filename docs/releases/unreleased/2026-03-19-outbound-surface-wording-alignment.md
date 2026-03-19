---
type: docs
scope: plugin
audience: developer
summary: Aligned the plugin control-surface copy, repo README, and plugin runbook to the tightened host-level outbound hard-block posture.
breaking: false
demo_ready: true
tests:
  - pnpm typecheck
  - pnpm exec vitest run tests/integration/openclaw-clawguard-plugin.test.ts
artifacts:
  - README.md
  - README.zh-CN.md
  - plugins/openclaw-clawguard/README.md
  - plugins/openclaw-clawguard/src/routes/shared.ts
  - tests/integration/openclaw-clawguard-plugin.test.ts
  - TODO.md
---

## What changed

- Updated the shared install-demo limitation copy used by the plugin pages so it now states the real host-level outbound posture: direct sends do not enter the pending approval loop, `message_sending` hard-blocks both `approve_required` and `block` cases, and `message_sent` only closes sends that actually left the host.
- Updated the root README, Chinese README, and plugin README/runbook to use the same outbound explanation instead of the older, looser wording.
- Updated plugin integration assertions so the tests lock this wording to the current outbound behavior.

## Why it matters

- The plugin UI, repo docs, and operator runbook now describe outbound behavior the same way, which reduces confusion during demos and internal review.
- This keeps the current Alpha narrative honest: host-level direct sends stay conservative, while tool-level outbound approvals remain the only approval path in the current scope.

## Demo posture / limitations

- What this proves: the documented/plugin-exposed outbound explanation now matches the current runtime behavior more closely.
- What this does **not** prove: broader outbound lifecycle coverage, host-level approval support, or GA readiness.
- Any demo-only / unpublished reminder: the project remains Alpha, install-demo only, unpublished, and fake-only.
