export interface ClawGuardControlSurfaceTarget {
  readonly id: 'dashboard' | 'checkup' | 'approvals' | 'audit' | 'settings';
  readonly label: string;
  readonly path: string;
}

export const CLAWGUARD_CONTROL_SURFACE_TARGETS: readonly ClawGuardControlSurfaceTarget[] = [
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
] as const;

const CLAWGUARD_CONTROL_SURFACE_PATH_SET = new Set(
  CLAWGUARD_CONTROL_SURFACE_TARGETS.map((target) => target.path),
);

function normalizePathname(pathname: string): string {
  if (pathname.length > 1) {
    return pathname.replace(/\/+$/u, '');
  }

  return pathname;
}

export function normalizeClawGuardCompanionPath(input: string): string | undefined {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return undefined;
  }

  try {
    const parsed = new URL(trimmed, 'http://clawguard.local');
    const normalizedPath = normalizePathname(parsed.pathname);
    return CLAWGUARD_CONTROL_SURFACE_PATH_SET.has(normalizedPath) ? normalizedPath : undefined;
  } catch {
    return undefined;
  }
}

export function isClawGuardCompanionPath(input: string): boolean {
  return normalizeClawGuardCompanionPath(input) !== undefined;
}

export function extractBearerTokenFromHash(hash: string): string | undefined {
  const normalized = hash.startsWith('#') ? hash.slice(1) : hash;
  const params = new URLSearchParams(normalized);
  const token = params.get('token')?.trim();

  return token && token.length > 0 ? token : undefined;
}

export function extractGatewayTokenFromSessionStorageEntries(
  entries: Readonly<Record<string, string>>,
): string | undefined {
  for (const [key, value] of Object.entries(entries)) {
    if (!key.startsWith('openclaw.control.token.v1:')) {
      continue;
    }

    const normalized = normalizeAuthorizationHeader(value);
    if (normalized) {
      return normalized.replace(/^Bearer\s+/iu, '');
    }
  }

  return undefined;
}

export function normalizeAuthorizationHeader(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return undefined;
  }

  if (/^Bearer\s+/iu.test(trimmed)) {
    return trimmed;
  }

  return `Bearer ${trimmed}`;
}

export function buildCompanionWindowTitle(pathname: string): string {
  const target = CLAWGUARD_CONTROL_SURFACE_TARGETS.find((item) => item.path === pathname);
  return target ? `ClawGuard companion - ${target.label}` : 'ClawGuard companion';
}
