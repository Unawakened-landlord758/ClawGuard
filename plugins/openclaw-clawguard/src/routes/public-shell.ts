import type { IncomingMessage, ServerResponse } from 'node:http';

import {
  APPROVALS_ROUTE_PATH,
  AUDIT_ROUTE_PATH,
  CHECKUP_ROUTE_PATH,
  DASHBOARD_ROUTE_PATH,
  SETTINGS_ROUTE_PATH,
} from './shared.js';

export const PUBLIC_SHELL_ROUTE_BASE_PATH = '/clawguard';

type PublicSurfaceId = 'dashboard' | 'checkup' | 'approvals' | 'audit' | 'settings';

type PublicSurfaceDefinition = {
  readonly id: PublicSurfaceId;
  readonly label: string;
  readonly publicPath: string;
  readonly publicAliases?: readonly string[];
  readonly protectedPath: string;
};

const PUBLIC_SURFACES: readonly PublicSurfaceDefinition[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    publicPath: PUBLIC_SHELL_ROUTE_BASE_PATH,
    publicAliases: [`${PUBLIC_SHELL_ROUTE_BASE_PATH}/dashboard`],
    protectedPath: DASHBOARD_ROUTE_PATH,
  },
  {
    id: 'checkup',
    label: 'Checkup',
    publicPath: `${PUBLIC_SHELL_ROUTE_BASE_PATH}/checkup`,
    protectedPath: CHECKUP_ROUTE_PATH,
  },
  {
    id: 'approvals',
    label: 'Approvals',
    publicPath: `${PUBLIC_SHELL_ROUTE_BASE_PATH}/approvals`,
    protectedPath: APPROVALS_ROUTE_PATH,
  },
  {
    id: 'audit',
    label: 'Audit',
    publicPath: `${PUBLIC_SHELL_ROUTE_BASE_PATH}/audit`,
    protectedPath: AUDIT_ROUTE_PATH,
  },
  {
    id: 'settings',
    label: 'Settings',
    publicPath: `${PUBLIC_SHELL_ROUTE_BASE_PATH}/settings`,
    protectedPath: SETTINGS_ROUTE_PATH,
  },
] as const;

function normalizePublicShellPath(pathname: string): string {
  if (pathname.length > 1) {
    return pathname.replace(/\/+$/u, '');
  }

  return pathname;
}

function isSurfacePathMatch(pathname: string, candidate: string): boolean {
  return pathname === candidate || pathname.startsWith(`${candidate}/`);
}

function resolvePublicSurface(pathname: string): PublicSurfaceDefinition | undefined {
  const normalized = normalizePublicShellPath(pathname).toLowerCase();
  const candidates = PUBLIC_SURFACES.flatMap((surface) => [
    { surface, path: surface.publicPath.toLowerCase() },
    ...(surface.publicAliases ?? []).map((alias) => ({ surface, path: alias.toLowerCase() })),
  ]).filter((candidate) => isSurfacePathMatch(normalized, candidate.path));

  return candidates.sort((left, right) => right.path.length - left.path.length)[0]?.surface;
}

function endJson(res: ServerResponse, statusCode: number, payload: unknown): true {
  res.statusCode = statusCode;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload, null, 2));
  return true;
}

function renderPublicShellPage(surface: PublicSurfaceDefinition): string {
  const bootPayload = JSON.stringify({
    publicBasePath: PUBLIC_SHELL_ROUTE_BASE_PATH,
    initialSurfaceId: surface.id,
    surfaces: PUBLIC_SURFACES,
    protectedPaths: {
      dashboard: DASHBOARD_ROUTE_PATH,
      checkup: CHECKUP_ROUTE_PATH,
      approvals: APPROVALS_ROUTE_PATH,
      audit: AUDIT_ROUTE_PATH,
      settings: SETTINGS_ROUTE_PATH,
    },
  });

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>ClawGuard</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      :root { color-scheme: light; }
      body { font-family: Arial, sans-serif; line-height: 1.5; margin: 0; color: #111827; background: #f3f4f6; }
      .shell { margin: 0 auto; max-width: 1120px; padding: 1.5rem 1rem 3rem; }
      .shell-card { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1rem 1.25rem; margin-bottom: 1rem; }
      .shell-nav { display: flex; flex-wrap: wrap; gap: 0.75rem; margin: 0.75rem 0 0; }
      .shell-nav a { color: #1d4ed8; text-decoration: none; }
      .shell-nav strong { color: #111827; }
      .shell-status { color: #4b5563; font-size: 0.95rem; }
      .shell-error { border-color: #fecaca; background: #fef2f2; color: #991b1b; }
      .shell-loading { color: #1f2937; }
      .shell-content { min-height: 240px; }
      .shell-content form { margin: 0; }
      .shell-content pre { overflow-x: auto; }
      .shell-muted { color: #4b5563; }
    </style>
  </head>
  <body>
    <div class="shell">
      <section class="shell-card">
        <h1>ClawGuard</h1>
        <p class="shell-status">
          Public same-origin entry shell. This page does not require a userscript and does not modify OpenClaw core.
          OpenClaw's official tokenized dashboard URL already lands on the same origin, so this shell can reuse the
          current tab token to load the protected ClawGuard pages behind the scenes.
        </p>
        <nav class="shell-nav" aria-label="ClawGuard public shell">
          ${PUBLIC_SURFACES.map((entry) =>
            entry.id === surface.id
              ? `<strong data-surface-link="${entry.id}">${entry.label}</strong>`
              : `<a href="${entry.publicPath}" data-surface-link="${entry.id}">${entry.label}</a>`,
          ).join(' · ')}
        </nav>
        <p class="shell-muted">
          If you open <code>${DASHBOARD_ROUTE_PATH}</code> directly, OpenClaw will still return <code>401</code>.
          Instead, open <code>${PUBLIC_SHELL_ROUTE_BASE_PATH}#token=&lt;gateway-token&gt;</code> or start from the
          official <code>openclaw dashboard --no-open</code> URL and replace the path with
          <code>${PUBLIC_SHELL_ROUTE_BASE_PATH}</code>.
        </p>
      </section>
      <section id="shell-status" class="shell-card shell-loading">
        Loading ClawGuard ${surface.label.toLowerCase()}...
      </section>
      <section id="shell-content" class="shell-card shell-content" aria-live="polite"></section>
    </div>
    <script>
      (() => {
        const boot = ${bootPayload};
        const statusEl = document.getElementById('shell-status');
        const contentEl = document.getElementById('shell-content');
        const settingsStorageKey = 'openclaw.control.settings.v1';
        const tokenSessionKeyPrefix = 'openclaw.control.token.v1:';
        const shellTokenStorageKey = 'clawguard.public-shell.gateway-token.v1';
        const connectFormId = 'clawguard-shell-connect-form';

        function setStatus(message, isError = false) {
          if (!statusEl) return;
          statusEl.className = isError ? 'shell-card shell-error' : 'shell-card shell-loading';
          statusEl.textContent = message;
        }

        function normalizeGatewayTokenScope(gatewayUrl) {
          const trimmed = typeof gatewayUrl === 'string' ? gatewayUrl.trim() : '';
          if (!trimmed) {
            return 'default';
          }
          try {
            const base = location.protocol + '//' + location.host + (location.pathname || '/');
            const parsed = new URL(trimmed, base);
            const pathname =
              parsed.pathname === '/' ? '' : (parsed.pathname.replace(/\\/+$/u, '') || parsed.pathname);
            return parsed.protocol + '//' + parsed.host + pathname;
          } catch {
            return trimmed;
          }
        }

        function readSettingsGatewayUrl() {
          try {
            const raw = localStorage.getItem(settingsStorageKey);
            if (!raw) {
              return '';
            }
            const parsed = JSON.parse(raw);
            return typeof parsed?.gatewayUrl === 'string' ? parsed.gatewayUrl.trim() : '';
          } catch {
            return '';
          }
        }

        function inferDefaultGatewayUrl() {
          const proto = location.protocol === 'https:' ? 'wss' : 'ws';
          return proto + '://' + location.host;
        }

        function readHashToken() {
          const hash = location.hash.startsWith('#') ? location.hash.slice(1) : location.hash;
          const params = new URLSearchParams(hash);
          const token = params.get('token');
          return token ? token.trim() : '';
        }

        function readGatewaySessionToken() {
          const preferredGatewayUrl = readSettingsGatewayUrl();
          if (preferredGatewayUrl) {
            const preferredKey = tokenSessionKeyPrefix + normalizeGatewayTokenScope(preferredGatewayUrl);
            const preferredToken = sessionStorage.getItem(preferredKey);
            if (preferredToken && preferredToken.trim()) {
              return preferredToken.trim();
            }
          }

          for (let index = 0; index < sessionStorage.length; index += 1) {
            const key = sessionStorage.key(index);
            if (!key || !key.startsWith(tokenSessionKeyPrefix)) {
              continue;
            }
            const token = sessionStorage.getItem(key);
            if (token && token.trim()) {
              return token.trim();
            }
          }

          return '';
        }

        function cacheShellToken(token) {
          if (!token) {
            return '';
          }

          try {
            sessionStorage.setItem(shellTokenStorageKey, token);
          } catch {
            return token;
          }

          return token;
        }

        function persistGatewaySessionToken(token) {
          const normalized = typeof token === 'string' ? token.trim() : '';
          if (!normalized) {
            return '';
          }

          const gatewayUrl = readSettingsGatewayUrl() || inferDefaultGatewayUrl();
          try {
            sessionStorage.setItem(
              tokenSessionKeyPrefix + normalizeGatewayTokenScope(gatewayUrl),
              normalized,
            );
          } catch {
            return normalized;
          }

          return normalized;
        }

        function readCachedShellToken() {
          try {
            const token = sessionStorage.getItem(shellTokenStorageKey);
            return token ? token.trim() : '';
          } catch {
            return '';
          }
        }

        function readPreferredShellToken() {
          const hashToken = readHashToken();
          if (hashToken) {
            persistGatewaySessionToken(hashToken);
            return cacheShellToken(hashToken);
          }

          const cachedShellToken = readCachedShellToken();
          if (cachedShellToken) {
            return cachedShellToken;
          }

          const gatewaySessionToken = readGatewaySessionToken();
          if (gatewaySessionToken) {
            return cacheShellToken(gatewaySessionToken);
          }

          return '';
        }

        function readSessionToken() {
          const preferredShellToken = readPreferredShellToken();
          if (preferredShellToken) {
            return preferredShellToken;
          }

          return '';
        }

        function resolveSurfaceByPublicPath(pathname) {
          const normalized = pathname.length > 1 ? pathname.replace(/\\/+$/u, '') : pathname;
          return (
            boot.surfaces.find(
              (entry) =>
                entry.publicPath === normalized ||
                (Array.isArray(entry.publicAliases) && entry.publicAliases.includes(normalized)),
            ) || boot.surfaces[0]
          );
        }

        function resolveSurfaceByProtectedPath(pathname) {
          const normalized = pathname.length > 1 ? pathname.replace(/\\/+$/u, '') : pathname;
          const candidates = boot.surfaces.filter((entry) => normalized === entry.protectedPath || normalized.startsWith(entry.protectedPath + '/'));
          return candidates.sort((left, right) => right.protectedPath.length - left.protectedPath.length)[0] || boot.surfaces[0];
        }

        function mapProtectedPathToPublicPath(pathname) {
          const surface = resolveSurfaceByProtectedPath(pathname);
          return surface ? surface.publicPath : undefined;
        }

        function buildPublicShellUrl(pathname, search = '', hash = '') {
          return pathname + search + (hash || '');
        }

        function clearBootstrapHash() {
          if (!location.hash) {
            return;
          }
          history.replaceState({}, '', location.pathname + location.search);
        }

        function renderConnectView(message) {
          if (!contentEl) {
            return;
          }

          const hint =
            typeof message === 'string' && message.trim()
              ? message.trim()
              : '输入当前 gateway token，或先从 openclaw dashboard --no-open 打开的官方 dashboard 进入，再切到 /clawguard。';

          contentEl.innerHTML =
            '<h2>Connect ClawGuard</h2>' +
            '<p>ClawGuard 对齐 OpenClaw Control UI 的浏览器连接方式：先进入同源壳页面，再把 gateway token 导入当前标签页 sessionStorage，然后在后台加载受保护的插件页面。</p>' +
            '<p><strong>你可以直接在这里粘贴 token。</strong> token 只写入当前浏览器标签页的 sessionStorage，不会写入 localStorage。</p>' +
            '<form id="' +
            connectFormId +
            '">' +
            '<label for="clawguard-shell-token">Gateway token</label><br />' +
            '<input id="clawguard-shell-token" name="token" type="password" autocomplete="off" spellcheck="false" required style="margin-top:0.5rem;width:100%;max-width:32rem;padding:0.6rem 0.75rem;" />' +
            '<div style="margin-top:0.75rem;display:flex;gap:0.75rem;align-items:center;flex-wrap:wrap;">' +
            '<button type="submit">Connect</button>' +
            '<span class="shell-muted">' +
            hint +
            '</span>' +
            '</div>' +
            '</form>' +
            '<p class="shell-muted" style="margin-top:1rem;">也可以直接打开 <code>' +
            boot.publicBasePath +
            '#token=&lt;gateway-token&gt;</code>；shell 会像 OpenClaw dashboard 一样导入 token 后立刻把它从 URL 中去掉。</p>';
        }

        function updateNav(activeSurfaceId) {
          document.querySelectorAll('[data-surface-link]').forEach((node) => {
            const targetId = node.getAttribute('data-surface-link');
            if (!targetId) {
              return;
            }
            if (targetId === activeSurfaceId) {
              if (node.tagName !== 'STRONG') {
                const strong = document.createElement('strong');
                strong.setAttribute('data-surface-link', targetId);
                strong.textContent = node.textContent || targetId;
                node.replaceWith(strong);
              }
              return;
            }
            if (node.tagName !== 'A') {
              const surface = boot.surfaces.find((entry) => entry.id === targetId);
              const anchor = document.createElement('a');
              anchor.href = buildPublicShellUrl(surface ? surface.publicPath : boot.publicBasePath, '', '');
              anchor.setAttribute('data-surface-link', targetId);
              anchor.textContent = node.textContent || targetId;
              node.replaceWith(anchor);
              return;
            }

            const surface = boot.surfaces.find((entry) => entry.id === targetId);
            node.setAttribute(
              'href',
              buildPublicShellUrl(surface ? surface.publicPath : boot.publicBasePath, '', ''),
            );
          });
        }

        function rewriteInjectedContentLinks() {
          if (!contentEl) {
            return;
          }

          contentEl.querySelectorAll('a[href]').forEach((node) => {
            if (!(node instanceof HTMLAnchorElement)) {
              return;
            }
            const href = node.getAttribute('href');
            if (!href) {
              return;
            }
            const targetUrl = new URL(href, location.origin);
            const publicPath = mapProtectedPathToPublicPath(targetUrl.pathname);
            if (!publicPath) {
              return;
            }
            node.setAttribute(
              'href',
              buildPublicShellUrl(publicPath, targetUrl.search, ''),
            );
          });

          contentEl.querySelectorAll('form[action]').forEach((node) => {
            if (!(node instanceof HTMLFormElement)) {
              return;
            }
            const action = node.getAttribute('action');
            if (!action) {
              return;
            }
            const targetUrl = new URL(action, location.origin);
            const publicPath = mapProtectedPathToPublicPath(targetUrl.pathname);
            if (!publicPath) {
              return;
            }
            node.setAttribute(
              'action',
              buildPublicShellUrl(publicPath, targetUrl.search, ''),
            );
          });
        }

        async function fetchProtected(url, init) {
          const token = readSessionToken();
          if (!token) {
            renderConnectView(
              '当前标签页没有可用的 gateway token。请直接粘贴 token，或先使用 openclaw dashboard --no-open 打开官方 tokenized dashboard URL，再把路径改成 /clawguard。',
            );
            setStatus('ClawGuard 还没有连接到当前 gateway。先输入 token，或从官方 dashboard tab 进入。', true);
            return null;
          }

          const headers = new Headers((init && init.headers) || undefined);
          headers.set('Authorization', 'Bearer ' + token);
          const response = await fetch(url, { ...init, headers, credentials: 'same-origin', redirect: 'follow' });
          return response;
        }

        function renderFetchedHtml(html, protectedUrl) {
          const doc = new DOMParser().parseFromString(html, 'text/html');
          document.title = doc.title || 'ClawGuard';
          if (contentEl) {
            contentEl.innerHTML = doc.body ? doc.body.innerHTML : html;
          }
          const protectedLocation = new URL(protectedUrl, location.origin);
          const activeSurface = resolveSurfaceByProtectedPath(protectedLocation.pathname);
          rewriteInjectedContentLinks();
          updateNav(activeSurface.id);
          setStatus('Loaded ' + activeSurface.label + ' through the public same-origin shell.');
        }

        async function loadSurfaceByPublicUrl(publicUrl, options) {
          const targetUrl = new URL(publicUrl, location.origin);
          const activeSurface = resolveSurfaceByPublicPath(targetUrl.pathname);
          const protectedUrl = new URL(activeSurface.protectedPath, location.origin);
          if (targetUrl.search) {
            protectedUrl.search = targetUrl.search;
          }
          if (targetUrl.hash) {
            protectedUrl.hash = targetUrl.hash;
          }

          setStatus('Loading ' + activeSurface.label + '...');
          const response = await fetchProtected(protectedUrl.toString(), options);
          if (!response) {
            return;
          }
          const html = await response.text();
          renderFetchedHtml(html, response.url || protectedUrl.toString());

          const finalProtectedUrl = new URL(response.url || protectedUrl.toString(), location.origin);
          const finalSurface = resolveSurfaceByProtectedPath(finalProtectedUrl.pathname);
          const finalPublicUrl = new URL(finalSurface.publicPath, location.origin);
          finalPublicUrl.search = finalProtectedUrl.search;
          if (location.pathname + location.search + location.hash !== finalPublicUrl.pathname + finalPublicUrl.search + finalPublicUrl.hash) {
            history.replaceState({ surfaceId: finalSurface.id }, '', finalPublicUrl.pathname + finalPublicUrl.search + finalPublicUrl.hash);
          }
        }

        function buildPublicFormSubmission(form, publicUrl) {
          const method = (form.getAttribute('method') || 'GET').toUpperCase();
          if (method === 'GET') {
            const finalUrl = new URL(publicUrl, location.origin);
            const formData = new FormData(form);
            for (const [key, value] of formData.entries()) {
              finalUrl.searchParams.append(key, String(value));
            }
            return {
              publicUrl: finalUrl.pathname + finalUrl.search + finalUrl.hash,
              requestInit: undefined,
            };
          }

          return {
            publicUrl,
            requestInit: {
              method,
              body: new FormData(form),
            },
          };
        }

        document.addEventListener('click', (event) => {
          const target = event.target instanceof Element ? event.target.closest('a[href]') : null;
          if (!(target instanceof HTMLAnchorElement)) {
            return;
          }
          if (
            event.defaultPrevented ||
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey ||
            target.hasAttribute('download') ||
            (target.target && target.target.toLowerCase() !== '_self')
          ) {
            return;
          }
          const href = target.getAttribute('href');
          if (!href) {
            return;
          }
          const nextUrl = new URL(href, location.origin);
          const isPublicSurface = boot.surfaces.some((entry) => nextUrl.pathname === entry.publicPath);
          const isProtectedSurface = boot.surfaces.some((entry) => nextUrl.pathname === entry.protectedPath);
          if (!isPublicSurface && !isProtectedSurface) {
            return;
          }
          event.preventDefault();
          const publicUrl = isProtectedSurface
            ? (() => {
                const mapped = resolveSurfaceByProtectedPath(nextUrl.pathname);
                return buildPublicShellUrl(mapped.publicPath, nextUrl.search, '');
              })()
            : buildPublicShellUrl(nextUrl.pathname, nextUrl.search, '');
          history.pushState({ surfaceId: resolveSurfaceByPublicPath(new URL(publicUrl, location.origin).pathname).id }, '', publicUrl);
          loadSurfaceByPublicUrl(publicUrl).catch((error) => {
            setStatus(error instanceof Error ? error.message : String(error), true);
          });
        });

        document.addEventListener('submit', (event) => {
          const form = event.target instanceof HTMLFormElement ? event.target : null;
          if (!form) {
            return;
          }
          const action = form.getAttribute('action') || location.pathname;
          const actionUrl = new URL(action, location.origin);
          const isProtectedAction = actionUrl.pathname.startsWith(boot.protectedPaths.approvals);
          if (!isProtectedAction) {
            return;
          }
          event.preventDefault();
          const publicApprovalsUrl = buildPublicShellUrl(
            resolveSurfaceByProtectedPath(actionUrl.pathname).publicPath,
            actionUrl.search,
            '',
          );
          const submission = buildPublicFormSubmission(form, publicApprovalsUrl || boot.publicBasePath);
          history.replaceState({ surfaceId: 'approvals' }, '', submission.publicUrl);
          loadSurfaceByPublicUrl(submission.publicUrl, submission.requestInit).catch((error) => {
            setStatus(error instanceof Error ? error.message : String(error), true);
          });
        });

        document.addEventListener('submit', (event) => {
          const form = event.target instanceof HTMLFormElement ? event.target : null;
          if (!form || form.id !== connectFormId) {
            return;
          }
          event.preventDefault();
          const formData = new FormData(form);
          const token = String(formData.get('token') || '').trim();
          if (!token) {
            setStatus('请输入 gateway token。', true);
            return;
          }
          persistGatewaySessionToken(token);
          cacheShellToken(token);
          clearBootstrapHash();
          setStatus('Gateway token 已导入当前标签页，正在加载 ClawGuard...');
          loadSurfaceByPublicUrl(location.pathname + location.search).catch((error) => {
            setStatus(error instanceof Error ? error.message : String(error), true);
          });
        });

        window.addEventListener('popstate', () => {
          loadSurfaceByPublicUrl(location.pathname + location.search + location.hash).catch((error) => {
            setStatus(error instanceof Error ? error.message : String(error), true);
          });
        });

        if (readHashToken()) {
          clearBootstrapHash();
        }

        loadSurfaceByPublicUrl(location.pathname + location.search).catch((error) => {
          setStatus(error instanceof Error ? error.message : String(error), true);
          if (contentEl) {
            renderConnectView(
              '如果你是首次从浏览器访问这里，请先粘贴 token，或者先打开官方 dashboard 再切到 /clawguard。',
            );
          }
        });
      })();
    </script>
  </body>
</html>`;
}

export function createPublicShellRoute() {
  return (req: IncomingMessage, res: ServerResponse): true | void => {
    const url = new URL(req.url ?? PUBLIC_SHELL_ROUTE_BASE_PATH, 'http://localhost');
    const surface = resolvePublicSurface(url.pathname);
    if (!surface) {
      return undefined;
    }

    if (req.method === 'POST') {
      return endJson(res, 405, { error: 'Method not allowed.' });
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return endJson(res, 405, { error: 'Method not allowed.' });
    }

    res.statusCode = 200;
    res.setHeader('content-type', 'text/html; charset=utf-8');
    if (req.method === 'HEAD') {
      res.end('');
      return true;
    }

    res.end(renderPublicShellPage(surface));
    return true;
  };
}
