# ClawGuard for OpenClaw install demo

This directory contains the **ClawGuard for OpenClaw install demo**.

- It is **not a formal release**
- It is **not published to any registry**
- The package name `@clawguard/openclaw-clawguard` is metadata only and a future-compatibility placeholder

## Current coverage

This install demo currently covers:

- risky `exec`
- minimal outbound coverage
- minimal workspace mutation coverage
- plugin-hosted pages at `/plugins/clawguard/settings`, `/plugins/clawguard/approvals`, and `/plugins/clawguard/audit`

Current limitation:

- host-level outbound coverage is currently only the `message_sending` hard block, not a full outbound lifecycle

## Recommended install method: local path from repo root

Run the install from the repository root:

```powershell
openclaw plugins install .\plugins\openclaw-clawguard
```

After install, restart OpenClaw (or reload the plugin host if your local dev setup already supports that). For this demo, **restart is the safe assumption**.

## Optional method: local tarball only

This is only for local demo packaging. It does **not** imply any registry publish.

From the repository root:

```powershell
pnpm --dir plugins\openclaw-clawguard pack
openclaw plugins install .\plugins\openclaw-clawguard\<generated-tarball>.tgz
```

Restart OpenClaw after installing the tarball as well.

## How to verify the plugin loaded

After install and restart:

1. Open `/plugins/clawguard/settings`
2. Open `/plugins/clawguard/approvals`
3. Open `/plugins/clawguard/audit`
4. Confirm the settings page shows the install-demo notes and the other two routes return normally

If you are watching logs, the plugin also reports that the ClawGuard demo plugin loaded.

## Smoke path

- `/plugins/clawguard/settings`
- `/plugins/clawguard/approvals`
- `/plugins/clawguard/audit`

## Minimal demo scenarios

### 1. Exec risk

Ask OpenClaw to run a clearly risky shell action. Expected result:

- ClawGuard blocks or queues the action for approval
- the approval appears on `/plugins/clawguard/approvals`
- after approval, retry once to continue the demo path

### 2. Outbound risk

Ask OpenClaw to send a risky outbound message. Expected result:

- tool-level outbound coverage remains minimal
- direct host outbound matches currently rely on the `message_sending` hard block path
- the event should be visible through the demo pages and audit trail

### 3. Workspace mutation risk

Ask OpenClaw to perform a risky file change such as a suspicious `write`, `edit`, or `apply_patch`. Expected result:

- ClawGuard creates a pending approval or block decision
- the action can be reviewed in `/plugins/clawguard/approvals`
- the result is captured in `/plugins/clawguard/audit`

## Current limitations

- install posture is demo-only and local-only
- recommended path is local path install from the repo root
- optional tarball flow is local-only and for demo packaging only
- no registry publish should be implied
- outbound coverage is still intentionally minimal
- host-level outbound coverage is currently only `message_sending` hard block, rather than a full outbound lifecycle
