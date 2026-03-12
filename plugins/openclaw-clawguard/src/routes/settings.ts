import type { IncomingMessage, ServerResponse } from 'node:http';
import type { ClawGuardState } from '../services/state.js';

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
    <p>This spike only protects risky <code>exec</code> commands and requires one manual retry after approval.</p>
  </body>
</html>`);
    return true;
  };
}
