---
type: feature
scope: plugin
audience: developer
summary: Added a workspace-only tool_result_persist fallback so workspace mutation replays can still close through the plugin when the host persists tool results before or instead of after_tool_call.
breaking: false
demo_ready: true
tests:
  - pnpm typecheck
  - pnpm exec vitest run tests/integration/openclaw-clawguard-plugin.test.ts
  - pnpm test
artifacts:
  - src/types/openclaw-plugin-sdk-core.d.ts
  - plugins/openclaw-clawguard/src/index.ts
  - plugins/openclaw-clawguard/src/hooks/tool-result-persist.ts
  - plugins/openclaw-clawguard/src/services/state.ts
  - plugins/openclaw-clawguard/README.md
  - tests/integration/openclaw-clawguard-plugin.test.ts
  - TODO.md
---

## What changed

- Extended the local OpenClaw plugin SDK typing surface with `tool_result_persist` and added a dedicated plugin hook handler for it.
- Wired the plugin to register `tool_result_persist`, but kept the behavior narrow: it only closes tracked `workspace_mutation` executions and does not take over `exec` or outbound finalization.
- Added integration coverage to prove that workspace replays can close through `tool_result_persist`, while `exec` still remains owned by the existing `after_tool_call` path.

## Why it matters

- This expands the current workspace mutation host hook surface without changing approval ownership or introducing a second decision pipeline.
- The plugin is now more resilient to host/runtime differences in when concrete tool results become available for `write`, `edit`, and `apply_patch`.

## Demo posture / limitations

- What this proves: the install-demo plugin can close workspace mutation replays through one additional host hook while keeping the current approval and audit model intact.
- What this does **not** prove: broad new workspace governance, fs-bridge instrumentation, or a generalized replacement for `after_tool_call`.
- Any demo-only / unpublished reminder: the project remains Alpha, install-demo only, unpublished, and fake-only.
