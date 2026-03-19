---
type: feature
scope: runtime
audience: developer
summary: Expanded conservative workspace-mutation path heuristics so more repo automation and cross-language workspace config files enter the existing approval and audit path.
breaking: false
demo_ready: true
tests:
  - pnpm typecheck
  - pnpm exec vitest run tests/unit/path-rules.test.ts tests/integration/openclaw-adapter-pipeline.test.ts
artifacts:
  - src/orchestration/classifier/path-rules.ts
  - tests/unit/path-rules.test.ts
  - tests/integration/openclaw-adapter-pipeline.test.ts
  - TODO.md
---

## What changed

- Expanded the conservative `path.repo.workflow` coverage to include more automation-entry files and directories such as `.github/actions`, `.gitlab-ci.yml`, `azure-pipelines.yml`, `bitbucket-pipelines.yml`, `.circleci`, `.buildkite`, and `.github/dependabot.yml`.
- Expanded `path.workspace.config` coverage to include additional cross-language workspace config and packaging files such as `pyproject.toml`, `poetry.lock`, `uv.lock`, `requirements*.txt`, `Dockerfile`, `docker-compose*.yml`, `compose*.yml`, `.nvmrc`, `.python-version`, `.tool-versions`, and `.pre-commit-config.yaml`.
- Added unit and adapter-pipeline coverage so the new paths reuse the existing explainable approval / audit path rather than introducing a separate workspace classifier branch.

## Why it matters

- The workspace-mutation pipeline now catches a broader set of high-value repo automation and environment-shaping files without changing the product posture or pushing low-confidence cases into aggressive blocking.
- This keeps the current Alpha logic conservative: broadening the known high-signal path set while still reusing the same existing `approve_required` semantics and audit language.

## Demo posture / limitations

- What this proves: the shared Core now recognizes a wider set of obvious automation/config mutations as review-worthy workspace changes.
- What this does **not** prove: full workspace governance, broader host-hook coverage, or aggressive semantic understanding of arbitrary file edits.
- Any demo-only / unpublished reminder: the project remains Alpha, install-demo only, unpublished, and fake-only.
