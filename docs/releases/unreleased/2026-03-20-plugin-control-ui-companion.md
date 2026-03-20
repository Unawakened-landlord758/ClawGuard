---
type: feature
scope: plugin
audience: developer
summary: Added a browser-side OpenClaw Control UI companion so ClawGuard plugin pages can open and navigate without patching OpenClaw core.
breaking: false
demo_ready: true
tests:
  - pnpm typecheck
  - pnpm test -- --run tests/unit/control-ui-companion.test.ts tests/unit/control-ui-companion-userscript.test.ts
artifacts:
  - plugins/openclaw-clawguard/companion/clawguard-control-ui.user.js
  - plugins/openclaw-clawguard/src/companion/control-ui-companion.ts
  - plugins/openclaw-clawguard/README.md
  - tests/unit/control-ui-companion.test.ts
  - tests/unit/control-ui-companion-userscript.test.ts
---

## What changed

Added a small browser-side companion userscript at `plugins/openclaw-clawguard/companion/clawguard-control-ui.user.js`.

The companion injects a floating `ClawGuard` launcher into the authenticated OpenClaw Control UI, opens a popup shell, and proxies plugin-page navigation plus form submissions through authenticated same-origin fetches. The raw gateway token stays in the already-authenticated Control UI tab memory, with fallback reads from the current URL hash and the current tab's `sessionStorage`.

Also added companion helper tests and updated the plugin README to document the new local workflow and the current `401 Unauthorized` boundary for direct browser navigation to `/plugins/clawguard/*`.

## Why it matters

OpenClaw's current browser auth middleware accepts gateway auth headers, but direct browser navigation to plugin HTTP routes does not carry those headers automatically. That made the plugin pages usable with curl or explicit headers, but not as a normal Control UI browser workflow.

The companion closes that gap without modifying OpenClaw core, without exposing the raw token in query params, and without depending on a patched left-nav `Security` tab.

## Demo posture / limitations

This remains an Alpha install-demo workaround, not proof of a first-class OpenClaw plugin-navigation API.

The companion is browser-side glue for the current local workflow. It does not change OpenClaw's underlying auth model, does not make direct `/plugins/clawguard/*` browser navigation public, and does not imply that future OpenClaw builds will preserve the same `sessionStorage` key shape forever. The stable claim for this round is narrower: ClawGuard now has a no-core-patch local browser flow that can open and navigate the five plugin-owned pages from an authenticated Control UI session.
