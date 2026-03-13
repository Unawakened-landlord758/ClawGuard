import type { ClawGuardState } from '../services/state.js';

interface AfterToolCallEventLike {
  readonly toolName: string;
  readonly params: Record<string, unknown>;
  readonly runId?: string;
  readonly toolCallId?: string;
  readonly result?: unknown;
  readonly error?: string;
  readonly durationMs?: number;
}

interface AfterToolCallContextLike {
  readonly sessionKey?: string;
  readonly sessionId?: string;
  readonly agentId?: string;
}

export function createAfterToolCallHandler(state: ClawGuardState) {
  return (event: AfterToolCallEventLike, context: AfterToolCallContextLike): void => {
    state.finalizeAfterToolCall({
      toolName: event.toolName,
      params: event.params,
      runId: event.runId,
      toolCallId: event.toolCallId,
      sessionKey: context.sessionKey,
      sessionId: context.sessionId,
      agentId: context.agentId,
      result: event.result,
      error: event.error,
      durationMs: event.durationMs,
    });
  };
}
