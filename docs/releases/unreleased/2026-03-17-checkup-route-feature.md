---
type: feature
scope: plugin
audience: public
summary: Added a plugin-owned safety checkup route that reuses the dashboard posture aggregation and expands it into a deeper install-demo explanation page.
breaking: false
demo_ready: true
tests:
  - pnpm typecheck
  - pnpm test -- --run tests/integration/openclaw-clawguard-plugin.test.ts
artifacts:
  - plugins/openclaw-clawguard/src/index.ts
  - plugins/openclaw-clawguard/src/routes/checkup.ts
  - plugins/openclaw-clawguard/src/routes/dashboard.ts
  - plugins/openclaw-clawguard/src/routes/shared.ts
  - tests/integration/openclaw-clawguard-plugin.test.ts
---

## What changed

- Added the plugin-owned direct-route `/plugins/clawguard/checkup` page.
- Kept it as the deeper Alpha safety checkup page reached after the dashboard, not a separate system.
- Reused the same dashboard posture/checkup aggregation so both pages stay on one read-only UI-facing source.
- Expanded the deeper page to show status summary, main drag, fix first, all checkup items, evidence, and follow-up actions.

## Why it matters

- The Alpha dashboard can stay lightweight while the checkup page gives the deeper explanation of the same current posture.
- This records the route as plugin-owned UI only, without implying stock Control UI `Security` navigation or a separate control surface.

## Demo posture / limitations

- What this proves: ClawGuard now has a dedicated plugin-owned checkup page that explains the same current install-demo posture in more detail.
- What this does **not** prove: any stock Control UI `Security` tab, published package status, or any broader runtime/security surface than the existing demo.
- Any demo-only / unpublished reminder: this remains install-demo only, unpublished, fake-only, and plugin-owned direct-route UI.
