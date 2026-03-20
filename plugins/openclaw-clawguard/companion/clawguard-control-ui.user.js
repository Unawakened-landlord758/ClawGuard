// ==UserScript==
// @name         ClawGuard OpenClaw Companion
// @namespace    https://clawguard.dev/openclaw
// @version      0.0.0-demo.0
// @description  Open ClawGuard plugin pages from the authenticated OpenClaw Control UI without persisting the gateway token.
// @match        http://127.0.0.1:18789/*
// @match        http://localhost:18789/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function clawGuardControlUiCompanion() {
  'use strict';

  const TARGETS = [
    { id: 'dashboard', label: 'Dashboard', path: '/plugins/clawguard/dashboard' },
    { id: 'checkup', label: 'Checkup', path: '/plugins/clawguard/checkup' },
    { id: 'approvals', label: 'Approvals', path: '/plugins/clawguard/approvals' },
    { id: 'audit', label: 'Audit', path: '/plugins/clawguard/audit' },
    { id: 'settings', label: 'Settings', path: '/plugins/clawguard/settings' },
  ];
  const TARGET_PATHS = new Set(TARGETS.map((target) => target.path));
  const POPUP_NAME = 'clawguard-control-surface';
  const ROOT_STYLE_ID = 'clawguard-companion-style';
  const ROOT_LAUNCHER_ID = 'clawguard-companion-launcher';
  const POPUP_BAR_ID = 'clawguard-companion-bar';
  const ORIGIN = window.location.origin;
  let capturedAuthorization;
  let popupWindow = null;

  function normalizePathname(pathname) {
    if (typeof pathname !== 'string' || pathname.length === 0) {
      return undefined;
    }

    return pathname.length > 1 ? pathname.replace(/\/+$/u, '') : pathname;
  }

  function normalizeCompanionPath(input) {
    if (typeof input !== 'string') {
      return undefined;
    }

    const trimmed = input.trim();
    if (!trimmed) {
      return undefined;
    }

    try {
      const parsed = new URL(trimmed, ORIGIN);
      const pathname = normalizePathname(parsed.pathname);
      return TARGET_PATHS.has(pathname) ? pathname : undefined;
    } catch {
      return undefined;
    }
  }

  function normalizeAuthorization(value) {
    if (typeof value !== 'string') {
      return undefined;
    }

    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }

    return /^Bearer\s+/iu.test(trimmed) ? trimmed : `Bearer ${trimmed}`;
  }

  function captureAuthorization(headers) {
    if (!headers) {
      return;
    }

    try {
      if (typeof headers.get === 'function') {
        const headerValue = normalizeAuthorization(headers.get('authorization'));
        if (headerValue) {
          capturedAuthorization = headerValue;
          return;
        }
      }

      if (Array.isArray(headers)) {
        for (const entry of headers) {
          if (!Array.isArray(entry) || entry.length < 2) {
            continue;
          }

          if (String(entry[0]).toLowerCase() === 'authorization') {
            const headerValue = normalizeAuthorization(entry[1]);
            if (headerValue) {
              capturedAuthorization = headerValue;
              return;
            }
          }
        }

        return;
      }

      if (typeof headers === 'object') {
        for (const [key, value] of Object.entries(headers)) {
          if (key.toLowerCase() === 'authorization') {
            const headerValue = normalizeAuthorization(value);
            if (headerValue) {
              capturedAuthorization = headerValue;
              return;
            }
          }
        }
      }
    } catch (error) {
      console.warn('[ClawGuard companion] failed to capture authorization header', error);
    }
  }

  function captureAuthorizationFromHash() {
    const params = new URLSearchParams(window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash);
    const token = params.get('token');
    const headerValue = normalizeAuthorization(token);
    if (headerValue) {
      capturedAuthorization = headerValue;
    }
  }

  function captureAuthorizationFromSessionStorage() {
    try {
      for (let index = 0; index < window.sessionStorage.length; index += 1) {
        const key = window.sessionStorage.key(index);
        if (!key || !key.startsWith('openclaw.control.token.v1:')) {
          continue;
        }

        const headerValue = normalizeAuthorization(window.sessionStorage.getItem(key));
        if (headerValue) {
          capturedAuthorization = headerValue;
          return;
        }
      }
    } catch (error) {
      console.warn('[ClawGuard companion] failed to inspect sessionStorage for gateway auth', error);
    }
  }

  function patchFetch() {
    if (typeof window.fetch !== 'function') {
      return;
    }

    const originalFetch = window.fetch.bind(window);
    window.fetch = function clawGuardCompanionFetch(input, init) {
      try {
        if (input && typeof input === 'object' && 'headers' in input) {
          captureAuthorization(input.headers);
        }
        if (init && typeof init === 'object') {
          captureAuthorization(init.headers);
        }
      } catch (error) {
        console.warn('[ClawGuard companion] failed to inspect fetch arguments', error);
      }

      return originalFetch(input, init);
    };
  }

  function getAuthorization() {
    if (capturedAuthorization) {
      return capturedAuthorization;
    }

    captureAuthorizationFromHash();
    if (capturedAuthorization) {
      return capturedAuthorization;
    }

    captureAuthorizationFromSessionStorage();
    return capturedAuthorization;
  }

  function buildWindowTitle(pathname) {
    const target = TARGETS.find((item) => item.path === pathname);
    return target ? `ClawGuard companion - ${target.label}` : 'ClawGuard companion';
  }

  function ensurePopup() {
    if (popupWindow && !popupWindow.closed) {
      popupWindow.__clawGuardCompanion = window.__clawGuardCompanion;
      return popupWindow;
    }

    popupWindow = window.open('', POPUP_NAME, 'popup=yes,width=1200,height=920,resizable=yes,scrollbars=yes');
    if (!popupWindow) {
      throw new Error('Popup blocked');
    }

    popupWindow.__clawGuardCompanion = window.__clawGuardCompanion;

    return popupWindow;
  }

  function addPopupChrome(popup, activePath, statusText) {
    const doc = popup.document;
    const previous = doc.getElementById(POPUP_BAR_ID);
    if (previous) {
      previous.remove();
    }

    const bar = doc.createElement('div');
    bar.id = POPUP_BAR_ID;
    bar.style.cssText = [
      'position: sticky',
      'top: 0',
      'z-index: 2147483647',
      'padding: 10px 14px',
      'background: #0f172a',
      'color: #e2e8f0',
      'border-bottom: 1px solid #1e293b',
      'font: 13px/1.4 ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif',
    ].join(';');

    const heading = doc.createElement('div');
    heading.style.cssText = 'font-weight: 700; margin-bottom: 6px;';
    heading.textContent = 'ClawGuard companion';
    bar.appendChild(heading);

    const nav = doc.createElement('div');
    nav.style.cssText = 'display: flex; flex-wrap: wrap; gap: 8px; align-items: center;';
    for (const target of TARGETS) {
      const button = doc.createElement('button');
      button.type = 'button';
      button.dataset.clawguardPath = target.path;
      button.textContent = target.label;
      button.style.cssText = [
        'border: 1px solid #334155',
        'background: ' + (target.path === activePath ? '#1d4ed8' : '#111827'),
        'color: #f8fafc',
        'padding: 6px 10px',
        'border-radius: 999px',
        'cursor: pointer',
      ].join(';');
      nav.appendChild(button);
    }
    bar.appendChild(nav);

    const note = doc.createElement('div');
    note.style.cssText = 'margin-top: 8px; font-size: 12px; color: #cbd5e1;';
    note.textContent =
      statusText ||
      'Gateway auth stays in the original OpenClaw Control UI tab and is kept in memory only.';
    bar.appendChild(note);

    if (!doc.body) {
      return;
    }

    doc.body.prepend(bar);
    bar.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof popup.HTMLButtonElement)) {
        return;
      }

      const path = normalizeCompanionPath(target.dataset.clawguardPath || '');
      if (!path) {
        return;
      }

      event.preventDefault();
      void window.__clawGuardCompanion.navigate(path);
    });
  }

  async function fetchPage(path, init) {
    const authorization = getAuthorization();
    if (!authorization) {
      throw new Error('No gateway authorization is available in the current Control UI tab yet.');
    }

    const response = await window.fetch(new URL(path, ORIGIN).toString(), {
      ...init,
      headers: {
        Authorization: authorization,
        ...(init && init.headers ? init.headers : {}),
      },
      credentials: 'omit',
    });

    return response;
  }

  async function renderPath(path, init) {
    const normalizedPath = normalizeCompanionPath(path);
    if (!normalizedPath) {
      throw new Error(`Unsupported ClawGuard path: ${path}`);
    }

    const popup = ensurePopup();
    const response = await fetchPage(path, init);
    const contentType = response.headers.get('content-type') || 'text/plain; charset=utf-8';
    const body = await response.text();

    popup.document.open();
    popup.document.write(body);
    popup.document.close();
    popup.document.title = buildWindowTitle(normalizedPath);
    addPopupChrome(
      popup,
      normalizedPath,
      `Loaded ${normalizedPath} through the authenticated Control UI companion. Raw gateway token stays in memory only.`,
    );
    installPopupInterceptors(popup);

    if (!/text\/html/iu.test(contentType)) {
      popup.document.body.innerHTML = `<pre style="white-space: pre-wrap; font: 13px/1.5 ui-monospace, monospace; padding: 16px;">${escapeHtml(body)}</pre>`;
      addPopupChrome(
        popup,
        normalizedPath,
        `Loaded ${normalizedPath} as ${contentType} through the authenticated Control UI companion.`,
      );
    }

    return response;
  }

  function installPopupInterceptors(popup) {
    const doc = popup.document;
    doc.addEventListener(
      'click',
      (event) => {
        const anchor = event.target instanceof popup.Element ? event.target.closest('a[href]') : null;
        if (!anchor) {
          return;
        }

        const href = anchor.getAttribute('href');
        if (!href) {
          return;
        }

        const url = new URL(href, ORIGIN);
        const normalizedPath = normalizeCompanionPath(url.pathname);
        if (!normalizedPath) {
          return;
        }

        event.preventDefault();
        void window.__clawGuardCompanion.navigate(`${normalizedPath}${url.search}`);
      },
      true,
    );

    doc.addEventListener(
      'submit',
      (event) => {
        const form = event.target;
        if (!(form instanceof popup.HTMLFormElement)) {
          return;
        }

        const method = (form.method || 'GET').toUpperCase();
        const actionUrl = new URL(form.action || popup.location.href, ORIGIN);
        const normalizedPath = normalizeCompanionPath(actionUrl.pathname);
        if (!normalizedPath) {
          return;
        }

        event.preventDefault();
        const formData = new popup.FormData(form);
        if (method === 'GET') {
          const query = new URLSearchParams();
          for (const [key, value] of formData.entries()) {
            query.append(key, String(value));
          }
          const suffix = query.size > 0 ? `?${query.toString()}` : '';
          void window.__clawGuardCompanion.navigate(`${normalizedPath}${suffix}`);
          return;
        }

        const body = new URLSearchParams();
        for (const [key, value] of formData.entries()) {
          body.append(key, String(value));
        }
        void window.__clawGuardCompanion.navigate(`${normalizedPath}${actionUrl.search}`, {
          method,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
          },
          body: body.toString(),
        });
      },
      true,
    );
  }

  function escapeHtml(text) {
    return String(text)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');
  }

  function installLauncher() {
    if (window.top !== window.self) {
      return;
    }

    const attach = () => {
      if (!document.body || document.getElementById(ROOT_LAUNCHER_ID)) {
        return;
      }

      if (!document.getElementById(ROOT_STYLE_ID)) {
        const style = document.createElement('style');
        style.id = ROOT_STYLE_ID;
        style.textContent = `
          #${ROOT_LAUNCHER_ID} {
            position: fixed;
            right: 20px;
            bottom: 20px;
            z-index: 2147483647;
            display: flex;
            gap: 8px;
            align-items: center;
            padding: 12px 14px;
            border-radius: 16px;
            background: rgba(15, 23, 42, 0.96);
            color: #f8fafc;
            box-shadow: 0 18px 48px rgba(15, 23, 42, 0.35);
            font: 13px/1.4 ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif;
          }
          #${ROOT_LAUNCHER_ID} button {
            border: 1px solid #334155;
            border-radius: 999px;
            padding: 6px 10px;
            background: #111827;
            color: #f8fafc;
            cursor: pointer;
          }
          #${ROOT_LAUNCHER_ID} strong {
            font-weight: 700;
          }
        `;
        document.head.appendChild(style);
      }

      const launcher = document.createElement('div');
      launcher.id = ROOT_LAUNCHER_ID;

      const label = document.createElement('strong');
      label.textContent = 'ClawGuard';
      launcher.appendChild(label);

      for (const target of TARGETS) {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.clawguardPath = target.path;
        button.textContent = target.label;
        launcher.appendChild(button);
      }

      const status = document.createElement('span');
      status.textContent = 'Companion keeps auth in Control UI memory only.';
      launcher.appendChild(status);

      launcher.addEventListener('click', (event) => {
        const target = event.target;
        if (!(target instanceof HTMLButtonElement)) {
          return;
        }

        const path = normalizeCompanionPath(target.dataset.clawguardPath || '');
        if (!path) {
          return;
        }

        void window.__clawGuardCompanion.navigate(path).catch((error) => {
          console.error('[ClawGuard companion] failed to open path', error);
          window.alert(
            `ClawGuard companion could not open ${path}. ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        });
      });

      document.body.appendChild(launcher);
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', attach, { once: true });
      return;
    }

    attach();
  }

  window.__clawGuardCompanion = {
    navigate: renderPath,
    getAuthorization,
  };

  captureAuthorizationFromHash();
  patchFetch();
  installLauncher();
})();
