import type { ClawGuardState } from '../services/state.js';

interface ToolResultPersistEventLike {
  readonly toolName: string;
  readonly params: Record<string, unknown>;
  readonly runId?: string;
  readonly toolCallId?: string;
  readonly result?: unknown;
  readonly error?: string;
  readonly durationMs?: number;
}

interface ToolResultPersistContextLike {
  readonly sessionKey?: string;
  readonly sessionId?: string;
  readonly agentId?: string;
}

export function createToolResultPersistHandler(state: ClawGuardState) {
  return (event: ToolResultPersistEventLike, context: ToolResultPersistContextLike): void => {
    state.finalizeToolResultPersist({
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
