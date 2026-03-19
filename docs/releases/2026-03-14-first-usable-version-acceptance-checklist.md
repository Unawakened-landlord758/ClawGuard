# First Usable Version Acceptance Checklist

Use this checklist before sharing the current install-demo baseline as the **first usable version**.

- [ ] Default install path stays `openclaw plugins install .\plugins\openclaw-clawguard`
- [ ] Optional tarball path stays local-only and unpublished
- [ ] Smoke path works on `/plugins/clawguard/dashboard`, `/plugins/clawguard/checkup`, `/plugins/clawguard/approvals`, `/plugins/clawguard/audit`, and `/plugins/clawguard/settings`, with repeatable HTTP-level regression coverage on the plugin-owned direct-route surface
- [ ] Demo order stays fake-only across `exec`, outbound, and workspace mutation examples
- [ ] Public wording says **install-demo only / unpublished / fake-only**
- [ ] Public wording does **not** claim GA, registry publish, real outbound proof, real money movement, or broad workspace coverage
- [ ] Public wording does **not** imply a native Control UI left-nav `Security` tab
- [ ] Validation baseline remains `pnpm typecheck` and `pnpm test`
