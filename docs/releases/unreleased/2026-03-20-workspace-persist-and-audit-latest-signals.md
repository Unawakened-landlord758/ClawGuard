---
type: feature
scope: plugin
audience: developer
summary: Hardened workspace persist replay correlation and unified recent audit latest signals across plugin routes
breaking: false
demo_ready: true
tests:
  - pnpm typecheck
  - pnpm test -- --run tests/integration/openclaw-clawguard-plugin.test.ts
artifacts:
  - plugins/openclaw-clawguard/src/services/state.ts
  - plugins/openclaw-clawguard/src/routes/shared.ts
  - plugins/openclaw-clawguard/src/routes/audit.ts
  - tests/integration/openclaw-clawguard-plugin.test.ts
---

## What changed

- Relaxed workspace replay closure matching so `tool_result_persist` can still close the same tracked workspace flow when the host trims mutation params, as long as the same `sessionKey + runId + toolCallId + toolName` chain is still present.
- Kept that relaxed fallback scoped to workspace replay only; `exec` and outbound finalization still require the stricter correlation path.
- Added a shared `buildRecentAuditLatestSignals()` helper and moved Audit hero/latest-cue rendering onto the same latest-signal payload instead of re-parsing recent replay state in multiple places.
- Filled the `audit?format=json` `timeline.latest.latestOutboundOrigin` field consistently and added regression coverage for mixed outbound lanes.

## Why it matters

- Workspace mutation is now less brittle at the exact host boundary where the current Alpha plugin already claims `tool_result_persist` fallback coverage.
- Audit, Dashboard, and Checkup now read the same latest cue data more consistently, which reduces page-to-page drift without widening the runtime surface.
- Operators get a more trustworthy “latest outbound origin” cue because it is now anchored to the latest outbound-related replay instead of whichever older lane happened to appear in the same recent slice.

## Demo posture / limitations

- This still does not make outbound in-flight lifecycle state restart-safe; host/tool outbound replay closure remains an in-memory Alpha boundary for now.
- Workspace replay correlation is only relaxed for the existing workspace fallback lane and still depends on stable `sessionKey`, `runId`, and `toolCallId` identifiers from the host.
- The install-demo remains fake-only, unpublished, and limited to the current plugin-owned pages rather than a stock Control UI security surface.
