import type { ClawGuardState } from '../services/state.js';

interface BeforeToolCallEventLike {
  readonly toolName: string;
  readonly params: Record<string, unknown>;
  readonly runId?: string;
  readonly toolCallId?: string;
}

interface BeforeToolCallContextLike {
  readonly sessionKey?: string;
  readonly sessionId?: string;
  readonly agentId?: string;
  readonly deliveryContext?: {
    readonly channel?: string;
    readonly to?: string;
    readonly accountId?: string;
    readonly conversationId?: string;
    readonly threadId?: string | number;
  };
}

interface BeforeToolCallResultLike {
  readonly block?: boolean;
  readonly blockReason?: string;
}

export function createBeforeToolCallHandler(state: ClawGuardState) {
  return (
    event: BeforeToolCallEventLike,
    context: BeforeToolCallContextLike,
  ): BeforeToolCallResultLike | void => {
    const result = state.evaluateBeforeToolCall({
      toolName: event.toolName,
      params: event.params,
      runId: event.runId,
      toolCallId: event.toolCallId,
      sessionKey: context.sessionKey,
      sessionId: context.sessionId,
      agentId: context.agentId,
      deliveryContext: context.deliveryContext,
    });

    if (!result.block) {
      return undefined;
    }

    return {
      block: true,
      blockReason: result.blockReason,
    };
  };
}
