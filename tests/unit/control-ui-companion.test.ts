import { describe, expect, it } from 'vitest';

import {
  CLAWGUARD_CONTROL_SURFACE_TARGETS,
  buildCompanionWindowTitle,
  extractBearerTokenFromHash,
  extractGatewayTokenFromSessionStorageEntries,
  isClawGuardCompanionPath,
  normalizeAuthorizationHeader,
  normalizeClawGuardCompanionPath,
} from '../../plugins/openclaw-clawguard/src/companion/control-ui-companion.js';

describe('control-ui companion helpers', () => {
  it('keeps the supported control-surface routes explicit', () => {
    expect(CLAWGUARD_CONTROL_SURFACE_TARGETS).toEqual([
      {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/plugins/clawguard/dashboard',
      },
      {
        id: 'checkup',
        label: 'Checkup',
        path: '/plugins/clawguard/checkup',
      },
      {
        id: 'approvals',
        label: 'Approvals',
        path: '/plugins/clawguard/approvals',
      },
      {
        id: 'audit',
        label: 'Audit',
        path: '/plugins/clawguard/audit',
      },
      {
        id: 'settings',
        label: 'Settings',
        path: '/plugins/clawguard/settings',
      },
    ]);
  });

  it('normalizes only supported ClawGuard control-surface paths', () => {
    expect(normalizeClawGuardCompanionPath('/plugins/clawguard/dashboard')).toBe(
      '/plugins/clawguard/dashboard',
    );
    expect(normalizeClawGuardCompanionPath('/plugins/clawguard/dashboard/')).toBe(
      '/plugins/clawguard/dashboard',
    );
    expect(normalizeClawGuardCompanionPath('/plugins/clawguard/checkup?format=json')).toBe(
      '/plugins/clawguard/checkup',
    );
    expect(normalizeClawGuardCompanionPath('http://127.0.0.1:18789/plugins/clawguard/audit')).toBe(
      '/plugins/clawguard/audit',
    );
    expect(normalizeClawGuardCompanionPath('/plugins/clawguard/launch/dashboard')).toBeUndefined();
    expect(normalizeClawGuardCompanionPath('/plugins/other/dashboard')).toBeUndefined();
    expect(isClawGuardCompanionPath('/plugins/clawguard/settings/')).toBe(true);
    expect(isClawGuardCompanionPath('/plugins/clawguard/settings/raw')).toBe(false);
  });

  it('extracts a gateway token from the hash fragment only when present', () => {
    expect(extractBearerTokenFromHash('#token=abc123')).toBe('abc123');
    expect(extractBearerTokenFromHash('token=xyz')).toBe('xyz');
    expect(extractBearerTokenFromHash('#token=')).toBeUndefined();
    expect(extractBearerTokenFromHash('#mode=local')).toBeUndefined();
  });

  it('extracts the current gateway token from sessionStorage-like entries when present', () => {
    expect(
      extractGatewayTokenFromSessionStorageEntries({
        'openclaw.control.token.v1:ws://127.0.0.1:18789': 'abc123',
      }),
    ).toBe('abc123');
    expect(
      extractGatewayTokenFromSessionStorageEntries({
        unrelated: 'value',
      }),
    ).toBeUndefined();
  });

  it('normalizes bearer headers without inventing empty auth', () => {
    expect(normalizeAuthorizationHeader('Bearer abc123')).toBe('Bearer abc123');
    expect(normalizeAuthorizationHeader('abc123')).toBe('Bearer abc123');
    expect(normalizeAuthorizationHeader('  ')).toBeUndefined();
    expect(normalizeAuthorizationHeader(undefined)).toBeUndefined();
  });

  it('builds readable popup titles from supported paths', () => {
    expect(buildCompanionWindowTitle('/plugins/clawguard/dashboard')).toBe(
      'ClawGuard companion - Dashboard',
    );
    expect(buildCompanionWindowTitle('/plugins/clawguard/checkup')).toBe(
      'ClawGuard companion - Checkup',
    );
    expect(buildCompanionWindowTitle('/plugins/other/unknown')).toBe('ClawGuard companion');
  });
});
