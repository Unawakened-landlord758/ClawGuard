import type { IncomingMessage, ServerResponse } from 'node:http';
import type { ClawGuardState } from '../services/state.js';

const INSTALL_DEMO = {
  published: false,
  packageName: '@clawguard/openclaw-clawguard',
  recommendedCommand: 'openclaw plugins install .\\plugins\\openclaw-clawguard',
  optionalPackedArtifactHint: 'pnpm --dir plugins\\openclaw-clawguard pack',
  docsPath: 'docs/v1-installer-demo-strategy.md',
};

export function createSettingsRoute(state: ClawGuardState) {
  return (req: IncomingMessage, res: ServerResponse): true | void => {
    const url = new URL(req.url ?? '/plugins/clawguard/settings', 'http://localhost');
    if (url.pathname !== '/plugins/clawguard/settings') {
      return undefined;
    }

    res.statusCode = 200;
    if (url.searchParams.get('format') === 'json') {
      res.setHeader('content-type', 'application/json; charset=utf-8');
      res.end(
        JSON.stringify(
          {
            approvalTtlSeconds: state.config.approvalTtlSeconds,
            pendingActionLimit: state.config.pendingActionLimit,
            allowOnceGrantLimit: state.config.allowOnceGrantLimit,
            installDemo: INSTALL_DEMO,
          },
          null,
          2,
        ),
      );
      return true;
    }

    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.end(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>ClawGuard settings</title>
  </head>
  <body>
    <h1>ClawGuard settings</h1>
    <nav>
      <a href="/plugins/clawguard/approvals">Approvals</a>
      <a href="/plugins/clawguard/audit">Audit</a>
      <a href="/plugins/clawguard/settings">Settings</a>
    </nav>
    <p>Approval TTL: ${state.config.approvalTtlSeconds} seconds</p>
    <p>Pending action limit: ${state.config.pendingActionLimit}</p>
    <p>Allow-once grant limit: ${state.config.allowOnceGrantLimit}</p>
    <p>Install demo path: use <code>${INSTALL_DEMO.recommendedCommand}</code> from the repo root. The package name <code>${INSTALL_DEMO.packageName}</code> is metadata only for now and is <strong>not published</strong>.</p>
    <p>Optional single-artifact demo: run <code>${INSTALL_DEMO.optionalPackedArtifactHint}</code> first, then install the generated tarball manually.</p>
    <p>Demo notes: <code>${INSTALL_DEMO.docsPath}</code></p>
    <p>This spike currently covers risky <code>exec</code>, minimal outbound tool calls, and a minimum <code>workspace mutation</code> loop for <code>write</code> / <code>apply_patch</code>, then requires one manual retry after approval.</p>
  </body>
</html>`);
    return true;
  };
}
