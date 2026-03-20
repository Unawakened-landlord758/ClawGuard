---
type: feature
scope: plugin
audience: public
summary: Promote authenticated dashboard tokens into stable ClawGuard public-shell links
breaking: false
demo_ready: true
tests:
  - pnpm typecheck
  - pnpm test -- --run tests/integration/openclaw-clawguard-plugin.test.ts
artifacts:
  - plugins/openclaw-clawguard/src/routes/public-shell.ts
  - plugins/openclaw-clawguard/README.md
  - tests/integration/openclaw-clawguard-plugin.test.ts
---

## What changed

The `/clawguard` public shell now promotes the current tab's authenticated OpenClaw dashboard token into a session-scoped ClawGuard shell token cache whenever it can read a valid gateway session token. That promoted token is then reused for the shell's own `#token=...` links and history state, even when the user first enters through bare `/clawguard` from an already authenticated official dashboard tab.

The plugin README now documents this more stable browser behavior: same-session copied links and new-tab shell links can stay on the `/clawguard*` surface without falling back to raw protected `/plugins/clawguard/*` routes.

## Why it matters

Before this change, the public shell already worked for same-tab navigation, but a user who started from bare `/clawguard` could still lose the stable tokenized shell URL shape. That made copied links and new-tab navigation easier to degrade back into the protected route surface that still requires a gateway `Authorization` header and returns `401` when opened directly.

Promoting the current authenticated dashboard token into the shell's own session-scoped bootstrap token makes the browser path more durable without modifying OpenClaw core and without requiring a userscript.

## Demo posture / limitations

This still does not make raw `/plugins/clawguard/*` routes public, and it still does not create a native OpenClaw left-nav `Security` tab. The public claim remains narrow: ClawGuard now keeps its `/clawguard*` shell links stable for normal browser usage inside the same authenticated browser session.

The shell token cache remains session-scoped browser state. This is still Alpha install-demo behavior, local-only, unpublished, and fake-only.
