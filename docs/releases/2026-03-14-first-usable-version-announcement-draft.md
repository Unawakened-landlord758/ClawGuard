# ClawGuard First Usable Version Announcement Draft

ClawGuard now has a **first usable OpenClaw install demo**.

This is a modest milestone, not a big launch:

- **install-demo only**
- **not published**
- **fake-only**

What you can do today:

1. Install locally from the repo root with `openclaw plugins install .\plugins\openclaw-clawguard`
2. Restart OpenClaw
3. Open:
   - `/plugins/clawguard/settings`
   - `/plugins/clawguard/approvals`
   - `/plugins/clawguard/audit`
4. Walk through a narrow fake-only demo across risky `exec`, minimal outbound review points, and workspace mutation actions currently limited to `write` / `edit` / `apply_patch`

What this proves:

- there is now a real local install path,
- there is now a real plugin-owned smoke surface,
- and there is now a real first approval / audit story people can try and explain.

What this does **not** prove:

- no registry publish,
- no GA,
- no real money movement,
- no real dangerous execution,
- no complete outbound or workspace coverage,
- no native Control UI `Security` tab.

Recommended public demo order:

1. Say the scope reminder first
2. Show the install command
3. Smoke settings → approvals → audit
4. Run one fake-only `exec` example
5. Add outbound and workspace examples only if you keep them clearly fake-only

If you try it, please read it as the **first usable version of the install demo**, not as a mature product release.
