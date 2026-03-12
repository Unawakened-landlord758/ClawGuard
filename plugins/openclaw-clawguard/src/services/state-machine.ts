import type {
  AllowOnceGrantStatus,
  PendingActionLifecycleStatus,
} from '../types.js';

type PendingActionTransition = 'approve' | 'deny' | 'consume' | 'expire' | 'evict';
type GrantTransition = 'consume' | 'expire' | 'evict' | 'revoke';

const pendingActionTransitions: Record<
  PendingActionLifecycleStatus,
  Partial<Record<PendingActionTransition, PendingActionLifecycleStatus>>
> = {
  pending: {
    approve: 'approved_waiting_retry',
    deny: 'denied',
    expire: 'expired',
    evict: 'evicted',
  },
  approved_waiting_retry: {
    deny: 'denied',
    consume: 'consumed',
    expire: 'expired',
    evict: 'evicted',
  },
  denied: {},
  expired: {},
  consumed: {},
  evicted: {},
};

const grantTransitions: Record<
  AllowOnceGrantStatus,
  Partial<Record<GrantTransition, AllowOnceGrantStatus>>
> = {
  issued: {
    consume: 'consumed',
    expire: 'expired',
    evict: 'evicted',
    revoke: 'revoked',
  },
  consumed: {},
  expired: {},
  evicted: {},
  revoked: {},
};

export function getNextPendingActionState(
  currentState: PendingActionLifecycleStatus,
  transition: PendingActionTransition,
): PendingActionLifecycleStatus | undefined {
  return pendingActionTransitions[currentState][transition];
}

export function getNextGrantState(
  currentState: AllowOnceGrantStatus,
  transition: GrantTransition,
): AllowOnceGrantStatus | undefined {
  return grantTransitions[currentState][transition];
}
