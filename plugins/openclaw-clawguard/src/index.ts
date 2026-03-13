import path from 'node:path';

import type { OpenClawPluginApi } from 'openclaw/plugin-sdk/core';
import { createAfterToolCallHandler } from './hooks/after-tool.js';
import { createBeforeToolCallHandler } from './hooks/before-tool.js';
import { createApprovalsRoute } from './routes/approvals.js';
import { createAuditRoute } from './routes/audit.js';
import { createSettingsRoute } from './routes/settings.js';
import { createClawGuardState } from './services/state.js';

function readApprovalTtlSeconds(pluginConfig: Record<string, unknown> | undefined): number {
  const raw = pluginConfig?.approvalTtlSeconds;
  if (typeof raw === 'number' && Number.isInteger(raw) && raw >= 30 && raw <= 3600) {
    return raw;
  }

  return 900;
}

function readCapacityLimit(
  pluginConfig: Record<string, unknown> | undefined,
  key: 'pendingActionLimit' | 'allowOnceGrantLimit',
  fallback: number,
): number {
  const raw = pluginConfig?.[key];
  if (typeof raw === 'number' && Number.isInteger(raw) && raw > 0 && raw <= 512) {
    return raw;
  }

  return fallback;
}

const plugin = {
  id: 'clawguard',
  name: 'ClawGuard',
  description: 'Minimal ClawGuard approval spike for OpenClaw.',
  register(api: OpenClawPluginApi) {
    const state = createClawGuardState({
      approvalTtlSeconds: readApprovalTtlSeconds(api.pluginConfig),
      pendingActionLimit: readCapacityLimit(api.pluginConfig, 'pendingActionLimit', 64),
      allowOnceGrantLimit: readCapacityLimit(api.pluginConfig, 'allowOnceGrantLimit', 64),
      snapshotFilePath: path.join(
        api.runtime.state.resolveStateDir(),
        'plugins',
        api.id,
        'live-state.json',
      ),
    });

    api.on('before_tool_call', createBeforeToolCallHandler(state));
    api.on('after_tool_call', createAfterToolCallHandler(state));
    api.registerHttpRoute({
      path: '/plugins/clawguard/approvals',
      auth: 'gateway',
      match: 'prefix',
      handler: createApprovalsRoute(state),
    });
    api.registerHttpRoute({
      path: '/plugins/clawguard/audit',
      auth: 'gateway',
      match: 'exact',
      handler: createAuditRoute(state),
    });
    api.registerHttpRoute({
      path: '/plugins/clawguard/settings',
      auth: 'gateway',
      match: 'exact',
      handler: createSettingsRoute(state),
    });

    api.logger.info('ClawGuard spike plugin loaded.');
  },
};

export default plugin;
