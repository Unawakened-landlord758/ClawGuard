export interface ClawGuardLimits {
  readonly pendingActions: number;
  readonly allowOnceGrants: number;
}

export const DEFAULT_LIMITS: ClawGuardLimits = {
  pendingActions: 64,
  allowOnceGrants: 64,
};

export function normalizeLimit(input: unknown, fallback: number): number {
  if (typeof input === 'number' && Number.isInteger(input) && input > 0) {
    return input;
  }

  return fallback;
}
