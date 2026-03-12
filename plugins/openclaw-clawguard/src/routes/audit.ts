import type { IncomingMessage, ServerResponse } from 'node:http';
import { escapeHtml } from '../utils.js';
import type { ClawGuardState } from '../services/state.js';

function renderAuditPage(state: ClawGuardState): string {
  const items = state.audit
    .list()
    .map(
      (entry) => `
        <article>
          <h2>${escapeHtml(entry.kind)}</h2>
          <p><strong>Time:</strong> ${escapeHtml(entry.timestamp)}</p>
          <p><strong>Detail:</strong> ${escapeHtml(entry.detail)}</p>
          <p><strong>Pending action:</strong> ${escapeHtml(entry.pending_action_id ?? '-')}</p>
        </article>
      `,
    )
    .join('\n');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>ClawGuard audit</title>
  </head>
  <body>
    <h1>ClawGuard audit</h1>
    <nav>
      <a href="/plugins/clawguard/approvals">Approvals</a>
      <a href="/plugins/clawguard/audit">Audit</a>
      <a href="/plugins/clawguard/settings">Settings</a>
    </nav>
    ${items || '<p>No audit entries yet.</p>'}
  </body>
</html>`;
}

export function createAuditRoute(state: ClawGuardState) {
  return (req: IncomingMessage, res: ServerResponse): true | void => {
    const url = new URL(req.url ?? '/plugins/clawguard/audit', 'http://localhost');
    if (url.pathname !== '/plugins/clawguard/audit') {
      return undefined;
    }

    res.statusCode = 200;
    if (url.searchParams.get('format') === 'json') {
      res.setHeader('content-type', 'application/json; charset=utf-8');
      res.end(
        JSON.stringify(
          {
            audit: state.audit.list(),
          },
          null,
          2,
        ),
      );
      return true;
    }

    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.end(renderAuditPage(state));
    return true;
  };
}
