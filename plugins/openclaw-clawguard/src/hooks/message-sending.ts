import type { ClawGuardState } from '../services/state.js';

interface MessageSendingEventLike {
  readonly to: string;
  readonly content: string;
  readonly metadata?: Record<string, unknown>;
}

interface MessageContextLike {
  readonly channelId: string;
  readonly accountId?: string;
  readonly conversationId?: string;
}

interface MessageSendingResultLike {
  readonly cancel?: boolean;
}

export function createMessageSendingHandler(state: ClawGuardState) {
  return (
    event: MessageSendingEventLike,
    context: MessageContextLike,
  ): MessageSendingResultLike | void => {
    const result = state.evaluateMessageSending({
      to: event.to,
      content: event.content,
      channelId: context.channelId,
      accountId: context.accountId,
      conversationId: context.conversationId,
      metadata: event.metadata,
    });

    if (!result.cancel) {
      return undefined;
    }

    return {
      cancel: true,
    };
  };
}
