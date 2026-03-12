import { ResponseAction, buildOpenClawEvaluationArtifacts } from 'clawguard';
import type { Clock, HookDecision, PendingAction } from '../types.js';
import { AuditLog } from './audit.js';
import { fingerprintAction } from '../utils.js';
import { DEFAULT_LIMITS, normalizeLimit, type ClawGuardLimits } from './limits.js';
import {
  StateRepository,
  type PendingActionMutationResult,
} from './state-repository.js';

export interface ClawGuardPluginConfig {
  readonly approvalTtlSeconds: number;
  readonly pendingActionLimit: number;
  readonly allowOnceGrantLimit: number;
  readonly snapshotFilePath?: string;
}

export interface ToolContextSnapshot {
  readonly toolName: string;
  readonly params: Record<string, unknown>;
  readonly runId?: string;
  readonly toolCallId?: string;
  readonly sessionKey?: string;
  readonly sessionId?: string;
  readonly agentId?: string;
}

const defaultClock: Clock = {
  now: () => new Date(),
};

interface CoreExecHotPathDecision {
  readonly decision: ResponseAction;
  readonly reason_summary: string;
  readonly reason_code: string;
  readonly risk_level: string;
  readonly impact_scope?: string;
  readonly guidance_summary: string;
}

function evaluateExecHotPath(input: ToolContextSnapshot): CoreExecHotPathDecision | null {
  const toolName = normalizeToolName(input.toolName);
  if (toolName !== 'exec') {
    return null;
  }

  const artifacts = buildOpenClawEvaluationArtifacts({
    before_tool_call: {
      event: {
        toolName,
        params: input.params,
        runId: input.runId,
        toolCallId: input.toolCallId,
      },
      context: {
        sessionKey: input.sessionKey,
        sessionId: input.sessionId,
        agentId: input.agentId,
        runId: input.runId,
        toolCallId: input.toolCallId,
      },
    },
    session_policy: {
      sessionKey: input.sessionKey,
      sessionId: input.sessionId,
      agentId: input.agentId,
    },
  });

  const command =
    typeof artifacts.evaluation_input.tool_params.command === 'string'
      ? artifacts.evaluation_input.tool_params.command.trim()
      : undefined;

  return {
    decision: artifacts.policy_decision.decision,
    reason_summary: artifacts.approval_request?.reason_summary ?? artifacts.policy_decision.reason,
    reason_code: artifacts.policy_decision.reason_code,
    risk_level: artifacts.risk_event.severity,
    impact_scope: artifacts.approval_request?.impact_scope ?? command,
    guidance_summary: artifacts.risk_event.summary,
  };
}

export class ClawGuardState {
  public readonly audit: AuditLog;

  public readonly pendingActions: {
    list(): PendingAction[];
    getById(pendingActionId: string): PendingAction | undefined;
  };

  public readonly allowOnce: {
    list(): ReturnType<StateRepository['listAllowOnceGrants']>;
  };

  private readonly repository: StateRepository;

  public constructor(
    public readonly config: ClawGuardPluginConfig,
    private readonly clock: Clock = defaultClock,
  ) {
    this.audit = new AuditLog(this.clock);
    this.repository = new StateRepository({
      clock: this.clock,
      audit: this.audit,
      approvalTtlSeconds: config.approvalTtlSeconds,
      limits: {
        pendingActions: config.pendingActionLimit,
        allowOnceGrants: config.allowOnceGrantLimit,
      },
      snapshotFilePath: config.snapshotFilePath,
    });
    this.pendingActions = {
      list: () => this.repository.listPendingActions(),
      getById: (pendingActionId) => this.repository.getPendingActionById(pendingActionId),
    };
    this.allowOnce = {
      list: () => this.repository.listAllowOnceGrants(),
    };
  }

  public evaluateBeforeToolCall(input: ToolContextSnapshot): HookDecision {
    const toolName = normalizeToolName(input.toolName);
    const evaluation = evaluateExecHotPath(input);
    if (
      !evaluation ||
      (evaluation.decision !== ResponseAction.ApproveRequired &&
        evaluation.decision !== ResponseAction.Block)
    ) {
      return { block: false };
    }

    const sessionKey = input.sessionKey ?? 'session-unknown';
    const runId = input.runId ?? 'run-unknown';
    const actionFingerprint = fingerprintAction({
      toolName,
      params: input.params,
    });

    this.audit.record({
      kind: 'risk_hit',
      detail: evaluation.reason_summary,
      session_key: sessionKey,
      tool_name: toolName,
      action_fingerprint: actionFingerprint,
    });

    if (evaluation.decision === ResponseAction.Block) {
      this.audit.record({
        kind: 'blocked',
        detail: 'Blocked a high-risk exec action based on the shared core policy decision.',
        session_key: sessionKey,
        tool_name: toolName,
        action_fingerprint: actionFingerprint,
      });
      return {
        block: true,
        blockReason: this.buildImmediateBlockMessage(evaluation),
      };
    }

    const grantResult = this.repository.consumeMatchingGrant({
      session_key: sessionKey,
      tool_name: toolName,
      action_fingerprint: actionFingerprint,
    });
    if (grantResult.ok) {
      this.audit.record({
        kind: 'allow_once_consumed',
        detail: `Consumed allow-once grant ${grantResult.grant.grant_id}.`,
        session_key: sessionKey,
        tool_name: toolName,
        pending_action_id: grantResult.grant.pending_action_id,
        action_fingerprint: actionFingerprint,
      });
      this.audit.record({
        kind: 'allowed',
        detail: 'Allowed a retried high-risk action after approval.',
        session_key: sessionKey,
        tool_name: toolName,
        pending_action_id: grantResult.grant.pending_action_id,
        action_fingerprint: actionFingerprint,
      });
      return { block: false };
    }

    const existing = this.repository.findLivePendingByFingerprint({
      session_key: sessionKey,
      tool_name: toolName,
      action_fingerprint: actionFingerprint,
    });
    if (existing) {
      return {
        block: true,
        blockReason: this.buildBlockedMessage(existing, evaluation),
      };
    }

    const pendingAction = this.repository.createPendingAction({
      session_key: sessionKey,
      session_id: input.sessionId,
      agent_id: input.agentId,
      run_id: runId,
      tool_call_id: input.toolCallId,
      tool_name: toolName,
      params: input.params,
      action_fingerprint: actionFingerprint,
      decision: 'approve_required',
      reason_summary: evaluation.reason_summary,
      reason_code: evaluation.reason_code,
      risk_level: evaluation.risk_level,
      impact_scope: evaluation.impact_scope,
      guidance_summary: evaluation.guidance_summary,
    });

    this.audit.record({
      kind: 'pending_action_created',
      detail: `Created pending approval ${pendingAction.pending_action_id}.`,
      session_key: sessionKey,
      tool_name: toolName,
      pending_action_id: pendingAction.pending_action_id,
      action_fingerprint: actionFingerprint,
    });
    this.audit.record({
      kind: 'blocked',
      detail: 'Blocked a high-risk action and redirected it to the approval queue.',
      session_key: sessionKey,
      tool_name: toolName,
      pending_action_id: pendingAction.pending_action_id,
      action_fingerprint: actionFingerprint,
    });

    return {
      block: true,
      blockReason: this.buildBlockedMessage(pendingAction),
    };
  }

  public approvePendingAction(pendingActionId: string): PendingActionMutationResult {
    const result = this.repository.approvePendingAction(pendingActionId);
    if (!result.ok && result.reason === 'invalid_transition') {
      this.recordInvalidTransition('approve', pendingActionId, result.currentState);
    }
    if (!result.ok) {
      return result;
    }

    this.audit.record({
      kind: 'approved',
      detail: `Approved pending action ${result.pendingAction.pending_action_id}.`,
      session_key: result.pendingAction.session_key,
      tool_name: result.pendingAction.tool_name,
      pending_action_id: result.pendingAction.pending_action_id,
      action_fingerprint: result.pendingAction.action_fingerprint,
    });
    if (result.grant) {
      this.audit.record({
        kind: 'allow_once_issued',
        detail: `Issued allow-once grant ${result.grant.grant_id}.`,
        session_key: result.grant.session_key,
        tool_name: result.grant.tool_name,
        pending_action_id: result.grant.pending_action_id,
        action_fingerprint: result.grant.action_fingerprint,
      });
    }

    return result;
  }

  public denyPendingAction(pendingActionId: string): PendingActionMutationResult {
    const result = this.repository.denyPendingAction(pendingActionId);
    if (!result.ok && result.reason === 'invalid_transition') {
      this.recordInvalidTransition('deny', pendingActionId, result.currentState);
    }
    if (!result.ok) {
      return result;
    }

    this.audit.record({
      kind: 'denied',
      detail: `Denied pending action ${result.pendingAction.pending_action_id}.`,
      session_key: result.pendingAction.session_key,
      tool_name: result.pendingAction.tool_name,
      pending_action_id: result.pendingAction.pending_action_id,
      action_fingerprint: result.pendingAction.action_fingerprint,
    });

    return result;
  }

  private buildBlockedMessage(
    pendingAction: PendingAction,
    evaluation?: CoreExecHotPathDecision,
  ): string {
    const reason = pendingAction.reason_summary || evaluation?.reason_summary;
    const guidance = pendingAction.guidance_summary || evaluation?.guidance_summary;
    const impactScope = pendingAction.impact_scope || evaluation?.impact_scope;

    return [
      'ClawGuard paused this exec action and queued it for approval.',
      reason ? `Reason: ${reason}` : undefined,
      guidance ? `Guidance: ${guidance}` : undefined,
      impactScope ? `Impact scope: ${impactScope}` : undefined,
      `Pending action: ${pendingAction.pending_action_id}`,
      'Review it at: /plugins/clawguard/approvals',
      `After approval, retry the same ${pendingAction.tool_name} call once within ${this.config.approvalTtlSeconds} seconds.`,
    ]
      .filter((line): line is string => Boolean(line))
      .join('\n');
  }

  private buildImmediateBlockMessage(evaluation: CoreExecHotPathDecision): string {
    return [
      'ClawGuard blocked this exec action.',
      `Reason: ${evaluation.reason_summary}`,
      `Guidance: ${evaluation.guidance_summary}`,
      evaluation.impact_scope ? `Impact scope: ${evaluation.impact_scope}` : undefined,
    ]
      .filter((line): line is string => Boolean(line))
      .join('\n');
  }

  private recordInvalidTransition(
    action: 'approve' | 'deny',
    pendingActionId: string,
    currentState?: string,
  ): void {
    this.audit.record({
      kind: 'invalid_transition',
      detail: `Rejected ${action} for pending action ${pendingActionId}${
        currentState ? ` from state ${currentState}` : ''
      }.`,
      pending_action_id: pendingActionId,
    });
  }
}

export function createClawGuardState(
  config?: Partial<ClawGuardPluginConfig>,
  clock?: Clock,
): ClawGuardState {
  const limits: ClawGuardLimits = {
    pendingActions: normalizeLimit(config?.pendingActionLimit, DEFAULT_LIMITS.pendingActions),
    allowOnceGrants: normalizeLimit(
      config?.allowOnceGrantLimit,
      DEFAULT_LIMITS.allowOnceGrants,
    ),
  };

  return new ClawGuardState(
    {
      approvalTtlSeconds: config?.approvalTtlSeconds ?? 900,
      pendingActionLimit: limits.pendingActions,
      allowOnceGrantLimit: limits.allowOnceGrants,
      snapshotFilePath: config?.snapshotFilePath,
    },
    clock,
  );
}

function normalizeToolName(toolName: string): string {
  return toolName.trim().toLowerCase();
}
