export interface OpenClawOriginInput {
  readonly channel?: string;
  readonly to?: string;
  readonly thread?: string | number;
}

export interface OpenClawDeliveryContextInput {
  readonly channel?: string;
  readonly to?: string;
  readonly accountId?: string;
  readonly threadId?: string | number;
}

export interface OpenClawSessionPolicyInput {
  readonly sessionKey?: string;
  readonly sessionId?: string;
  readonly agentId?: string;
  readonly origin?: OpenClawOriginInput;
  readonly deliveryContext?: OpenClawDeliveryContextInput;
  readonly sendPolicy?: string;
  readonly execHost?: string;
  readonly execSecurity?: string;
  readonly execAsk?: boolean;
  readonly elevatedLevel?: string;
}
