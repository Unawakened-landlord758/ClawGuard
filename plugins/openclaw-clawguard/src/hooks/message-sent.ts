import type { ClawGuardState } from '../services/state.js';

interface MessageSentEventLike {
  readonly to: string;
  readonly content: string;
  readonly success: boolean;
  readonly error?: string;
  readonly metadata?: Record<string, unknown>;
}

interface MessageContextLike {
  readonly channelId: string;
  readonly accountId?: string;
  readonly conversationId?: string;
}

export function createMessageSentHandler(state: ClawGuardState) {
  return (event: MessageSentEventLike, context: MessageContextLike): void => {
    state.finalizeMessageSent({
      to: event.to,
      content: event.content,
      success: event.success,
      error: event.error,
      metadata: event.metadata,
      channelId: context.channelId,
      accountId: context.accountId,
      conversationId: context.conversationId,
    });
  };
}
