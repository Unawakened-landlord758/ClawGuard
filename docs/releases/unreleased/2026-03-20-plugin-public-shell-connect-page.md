---
type: feature
scope: plugin
audience: public
summary: "Align the ClawGuard public shell with OpenClaw's browser token bootstrap by adding a connect page for bare /clawguard."
breaking: false
demo_ready: true
tests:
  - "pnpm typecheck"
  - "pnpm test -- --run tests/integration/openclaw-clawguard-plugin.test.ts"
artifacts:
  - "plugins/openclaw-clawguard/src/routes/public-shell.ts"
  - "tests/integration/openclaw-clawguard-plugin.test.ts"
  - "plugins/openclaw-clawguard/README.md"
  - "README.md"
  - "README.zh-CN.md"
  - "TODO.md"
---

## What changed

ClawGuard's `/clawguard` public shell no longer degrades into a dead-end startup error when the current browser tab has no gateway token yet. Instead, it now mirrors OpenClaw Control UI's browser bootstrap model more closely:

- bare `/clawguard` renders a connect page
- the page accepts a pasted gateway token
- `/clawguard#token=...` is treated as a one-time bootstrap import and then stripped from the URL
- imported tokens are stored in current-tab `sessionStorage`, not localStorage

The shell still uses the protected `/plugins/clawguard/*` routes as backing pages and keeps approval mutations off the public route family.

## Why it matters

This closes the gap between OpenClaw's own browser UX and ClawGuard's plugin UX. Users can now open `/clawguard` and receive a browser-level connection prompt instead of a startup failure, which is much closer to how the stock Control UI behaves when it needs auth material.

It also removes the need to treat tokenized shell links as the main steady-state navigation model. The hash token is now only a bootstrap mechanism, not the long-lived page URL.

## Demo posture / limitations

This does **not** make `/plugins/clawguard/*` public. Those routes remain protected backing routes and still return `401 Unauthorized` when opened directly without gateway auth. The public shell simply gives the browser a first-class way to bootstrap the same-tab session before loading the protected pages.

This also does **not** change OpenClaw core auth behavior or create a stock Control UI `Security` tab. The supported demo/browser entry remains the plugin-owned `/clawguard*` shell.
