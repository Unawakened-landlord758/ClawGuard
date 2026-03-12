import { describe, expect, it } from 'vitest';

import {
  ApprovalActorType,
  ApprovalResultStatus,
  AuditRecordFinalStatus,
  ExecutionStatus,
  ResponseAction,
  RiskEventStatus,
  ToolPhase,
  ToolStatus,
  applyApprovalResultToEvaluationArtifacts,
  applyPostExecutionResultToEvaluationArtifacts,
  buildOpenClawEvaluationArtifacts,
} from '../../src/index.js';

function buildApprovalArtifacts() {
  const artifacts = buildOpenClawEvaluationArtifacts({
    before_tool_call: {
      event: {
        toolName: 'exec',
        params: {
          command: 'pnpm test',
        },
        runId: 'run-approval-artifacts-1',
        toolCallId: 'tool-approval-artifacts-1',
      },
    },
    session_policy: {
      sessionKey: 'session-approval-artifacts',
      execAsk: true,
    },
  });

  expect(artifacts.approval_request).toBeDefined();

  return artifacts as typeof artifacts & { readonly approval_request: NonNullable<typeof artifacts.approval_request> };
}

function buildApprovalResult(
  artifacts: ReturnType<typeof buildApprovalArtifacts>,
  result: Exclude<ApprovalResultStatus, ApprovalResultStatus.Pending> = ApprovalResultStatus.Approved,
) {
  return {
    approval_result_id: `approval-result-${result}`,
    approval_request_id: artifacts.approval_request.approval_request_id,
    event_id: artifacts.approval_request.event_id,
    decision_id: artifacts.approval_request.decision_id,
    result,
    actor_type: ApprovalActorType.User,
    acted_at: '2026-03-12T00:01:00.000Z',
    remembered: false,
  } as const;
}

describe('approval artifact integration', () => {
  it('marks the audit trail as pending while approval is still unresolved', () => {
    const artifacts = buildApprovalArtifacts();

    expect(artifacts.policy_decision.decision).toBe(ResponseAction.ApproveRequired);
    expect(artifacts.policy_decision.requires_approval).toBe(true);
    expect(artifacts.risk_event.status).toBe(RiskEventStatus.PendingApproval);
    expect(artifacts.approval_request.status).toBe(ApprovalResultStatus.Pending);
    expect(artifacts.audit_record.approval_result).toBe(ApprovalResultStatus.Pending);
    expect(artifacts.audit_record.approval_result_id).toBeUndefined();
    expect(artifacts.audit_record.execution_result).toBeUndefined();
    expect(artifacts.audit_record.final_status).toBe(AuditRecordFinalStatus.Logged);
  });

  it.each([
    {
      label: 'approved',
      result: ApprovalResultStatus.Approved,
      expectedRiskStatus: RiskEventStatus.Approved,
      expectedAuditFinalStatus: AuditRecordFinalStatus.Logged,
      expectedExecutionResult: undefined,
    },
    {
      label: 'denied',
      result: ApprovalResultStatus.Denied,
      expectedRiskStatus: RiskEventStatus.Denied,
      expectedAuditFinalStatus: AuditRecordFinalStatus.Blocked,
      expectedExecutionResult: ExecutionStatus.Blocked,
    },
    {
      label: 'expired',
      result: ApprovalResultStatus.Expired,
      expectedRiskStatus: RiskEventStatus.Blocked,
      expectedAuditFinalStatus: AuditRecordFinalStatus.Blocked,
      expectedExecutionResult: ExecutionStatus.Blocked,
    },
    {
      label: 'bypassed',
      result: ApprovalResultStatus.Bypassed,
      expectedRiskStatus: RiskEventStatus.Approved,
      expectedAuditFinalStatus: AuditRecordFinalStatus.Logged,
      expectedExecutionResult: undefined,
    },
  ] satisfies ReadonlyArray<{
    readonly label: string;
    readonly result: Exclude<ApprovalResultStatus, ApprovalResultStatus.Pending>;
    readonly expectedRiskStatus: RiskEventStatus;
    readonly expectedAuditFinalStatus: AuditRecordFinalStatus;
    readonly expectedExecutionResult?: ExecutionStatus;
  }>)('applies $label approval outcomes back onto evaluation artifacts', (testCase) => {
    const artifacts = buildApprovalArtifacts();
    const integrated = applyApprovalResultToEvaluationArtifacts(artifacts, {
      approval_result_id: `approval-result-${testCase.result}`,
      approval_request_id: artifacts.approval_request.approval_request_id,
      event_id: artifacts.approval_request.event_id,
      decision_id: artifacts.approval_request.decision_id,
      result: testCase.result,
      actor_type: ApprovalActorType.User,
      acted_at: '2026-03-12T00:01:00.000Z',
      remembered: false,
    });

    expect(integrated.policy_decision.decision).toBe(ResponseAction.ApproveRequired);
    expect(integrated.policy_decision.requires_approval).toBe(true);
    expect(integrated.approval_request.status).toBe(testCase.result);
    expect(integrated.approval_result).toMatchObject({
      approval_request_id: artifacts.approval_request.approval_request_id,
      event_id: artifacts.risk_event.event_id,
      decision_id: artifacts.policy_decision.decision_id,
      audit_record_id: artifacts.audit_record.record_id,
      result: testCase.result,
    });
    expect(integrated.risk_event).toMatchObject({
      event_id: artifacts.risk_event.event_id,
      decision_id: artifacts.policy_decision.decision_id,
      status: testCase.expectedRiskStatus,
    });
    expect(integrated.audit_record).toMatchObject({
      record_id: artifacts.audit_record.record_id,
      event_id: artifacts.risk_event.event_id,
      decision_id: artifacts.policy_decision.decision_id,
      approval_result: testCase.result,
      approval_result_id: `approval-result-${testCase.result}`,
      final_status: testCase.expectedAuditFinalStatus,
    });
    expect(integrated.audit_record.execution_result).toBe(testCase.expectedExecutionResult);
  });

  it.each([ApprovalResultStatus.Approved, ApprovalResultStatus.Bypassed] as const)(
    'treats %s as gate closure without claiming execution already completed',
    (result) => {
      const artifacts = buildApprovalArtifacts();
      const integrated = applyApprovalResultToEvaluationArtifacts(artifacts, {
        approval_result_id: `approval-result-${result}`,
        approval_request_id: artifacts.approval_request.approval_request_id,
        event_id: artifacts.approval_request.event_id,
        decision_id: artifacts.approval_request.decision_id,
        result,
        actor_type: ApprovalActorType.User,
        acted_at: '2026-03-12T00:01:00.000Z',
        remembered: false,
      });

      expect(integrated.policy_decision.decision).toBe(ResponseAction.ApproveRequired);
      expect(integrated.approval_result.result).toBe(result);
      expect(integrated.risk_event.status).toBe(RiskEventStatus.Approved);
      expect(integrated.audit_record.execution_result).toBeUndefined();
      expect(integrated.audit_record.final_status).toBe(AuditRecordFinalStatus.Logged);
    },
  );

  it.each([
    {
      label: 'approval passed then execution succeeded',
      result: ApprovalResultStatus.Approved,
      toolStatus: ToolStatus.Completed,
      expectedRiskStatus: RiskEventStatus.Allowed,
      expectedExecutionResult: ExecutionStatus.Allowed,
      expectedFinalStatus: AuditRecordFinalStatus.Allowed,
    },
    {
      label: 'approval passed then execution failed',
      result: ApprovalResultStatus.Approved,
      toolStatus: ToolStatus.Failed,
      expectedRiskStatus: RiskEventStatus.Failed,
      expectedExecutionResult: ExecutionStatus.Failed,
      expectedFinalStatus: AuditRecordFinalStatus.Failed,
    },
    {
      label: 'approval denied then downstream execution stayed blocked',
      result: ApprovalResultStatus.Denied,
      toolStatus: ToolStatus.Blocked,
      expectedRiskStatus: RiskEventStatus.Denied,
      expectedExecutionResult: ExecutionStatus.Blocked,
      expectedFinalStatus: AuditRecordFinalStatus.Blocked,
    },
  ] satisfies ReadonlyArray<{
    readonly label: string;
    readonly result: Exclude<ApprovalResultStatus, ApprovalResultStatus.Pending>;
    readonly toolStatus: ToolStatus;
    readonly expectedRiskStatus: RiskEventStatus;
    readonly expectedExecutionResult: ExecutionStatus;
    readonly expectedFinalStatus: AuditRecordFinalStatus;
  }>)('$label', ({ expectedExecutionResult, expectedFinalStatus, expectedRiskStatus, result, toolStatus }) => {
    const artifacts = buildApprovalArtifacts();
    const approvalIntegrated = applyApprovalResultToEvaluationArtifacts(artifacts, buildApprovalResult(artifacts, result));
    const postExecutionIntegrated = applyPostExecutionResultToEvaluationArtifacts(approvalIntegrated, {
      tool_status: toolStatus,
      timestamp: '2026-03-12T00:02:00.000Z',
      summary: `tool finished with ${toolStatus}`,
    });

    expect(postExecutionIntegrated.policy_decision.decision).toBe(ResponseAction.ApproveRequired);
    expect(postExecutionIntegrated.approval_result.result).toBe(result);
    expect(postExecutionIntegrated.run_ref.ended_at).toBe('2026-03-12T00:02:00.000Z');
    expect(postExecutionIntegrated.tool_call_ref.tool_phase).toBe(ToolPhase.After);
    expect(postExecutionIntegrated.tool_call_ref.tool_status).toBe(toolStatus);
    expect(postExecutionIntegrated.evaluation_input.tool_call_ref.tool_phase).toBe(ToolPhase.After);
    expect(postExecutionIntegrated.risk_event.status).toBe(expectedRiskStatus);
    expect(postExecutionIntegrated.audit_record.execution_result).toBe(expectedExecutionResult);
    expect(postExecutionIntegrated.audit_record.final_status).toBe(expectedFinalStatus);
    expect(postExecutionIntegrated.audit_record.timestamp).toBe('2026-03-12T00:02:00.000Z');
  });

  it('leaves approval_result unset when the decision never entered approval', () => {
    const artifacts = buildOpenClawEvaluationArtifacts({
      before_tool_call: {
        event: {
          toolName: 'message',
          params: {
            to: 'ops-room',
            message: 'all clear',
          },
          runId: 'run-approval-artifacts-no-approval',
          toolCallId: 'tool-approval-artifacts-no-approval',
        },
      },
      session_policy: {
        sessionKey: 'session-approval-artifacts-no-approval',
      },
    });

    expect(artifacts.approval_request).toBeUndefined();
    expect(artifacts.risk_event.status).toBe(RiskEventStatus.Detected);
    expect(artifacts.audit_record.approval_result).toBeUndefined();
    expect(artifacts.audit_record.approval_result_id).toBeUndefined();
  });

  it.each([
    {
      label: 'no approval execution success',
      toolStatus: ToolStatus.Completed,
      expectedRiskStatus: RiskEventStatus.Allowed,
      expectedExecutionResult: ExecutionStatus.Allowed,
      expectedFinalStatus: AuditRecordFinalStatus.Allowed,
    },
    {
      label: 'no approval execution failure',
      toolStatus: ToolStatus.Failed,
      expectedRiskStatus: RiskEventStatus.Failed,
      expectedExecutionResult: ExecutionStatus.Failed,
      expectedFinalStatus: AuditRecordFinalStatus.Failed,
    },
  ])('$label', ({ expectedExecutionResult, expectedFinalStatus, expectedRiskStatus, toolStatus }) => {
    const artifacts = buildOpenClawEvaluationArtifacts({
      before_tool_call: {
        event: {
          toolName: 'message',
          params: {
            to: 'ops-room',
            message: 'all clear',
          },
          runId: 'run-post-execution-no-approval',
          toolCallId: `tool-post-execution-no-approval-${toolStatus}`,
        },
      },
      session_policy: {
        sessionKey: 'session-post-execution-no-approval',
      },
    });

    const postExecutionIntegrated = applyPostExecutionResultToEvaluationArtifacts(artifacts, {
      tool_status: toolStatus,
      timestamp: '2026-03-12T00:03:00.000Z',
      summary: `tool finished with ${toolStatus}`,
    });

    expect(postExecutionIntegrated.policy_decision.decision).toBe(ResponseAction.Allow);
    expect(postExecutionIntegrated.approval_request).toBeUndefined();
    expect(postExecutionIntegrated.tool_call_ref.tool_phase).toBe(ToolPhase.After);
    expect(postExecutionIntegrated.risk_event.status).toBe(expectedRiskStatus);
    expect(postExecutionIntegrated.audit_record.approval_result).toBeUndefined();
    expect(postExecutionIntegrated.audit_record.execution_result).toBe(expectedExecutionResult);
    expect(postExecutionIntegrated.audit_record.final_status).toBe(expectedFinalStatus);
  });

  it('rejects approval integration when the artifacts are missing an approval request', () => {
    const artifacts = buildOpenClawEvaluationArtifacts({
      before_tool_call: {
        event: {
          toolName: 'message',
          params: {
            to: 'ops-room',
            message: 'all clear',
          },
          runId: 'run-approval-artifacts-no-request',
          toolCallId: 'tool-approval-artifacts-no-request',
        },
      },
      session_policy: {
        sessionKey: 'session-approval-artifacts-no-request',
      },
    });

    expect(() =>
      applyApprovalResultToEvaluationArtifacts(artifacts, {
        approval_result_id: 'approval-result-orphaned',
        approval_request_id: 'approval-request-orphaned',
        event_id: artifacts.risk_event.event_id,
        decision_id: artifacts.policy_decision.decision_id,
        result: ApprovalResultStatus.Approved,
        actor_type: ApprovalActorType.User,
        acted_at: '2026-03-12T00:01:00.000Z',
        remembered: false,
      }),
    ).toThrow('Cannot apply approval result to artifacts without an approval request.');
  });

  it.each([
    {
      label: 'approval_request.event_id !== risk_event.event_id',
      mutate: (artifacts: ReturnType<typeof buildApprovalArtifacts>) => ({
        ...artifacts,
        risk_event: {
          ...artifacts.risk_event,
          event_id: 'event-risk-mismatch',
        },
      }),
      expectedError: (artifacts: ReturnType<typeof buildApprovalArtifacts>) =>
        `Approval request event mismatch: expected event-risk-mismatch, received ${artifacts.approval_request.event_id}`,
    },
    {
      label: 'approval_request.event_id !== audit_record.event_id',
      mutate: (artifacts: ReturnType<typeof buildApprovalArtifacts>) => ({
        ...artifacts,
        audit_record: {
          ...artifacts.audit_record,
          event_id: 'event-audit-mismatch',
        },
      }),
      expectedError: (artifacts: ReturnType<typeof buildApprovalArtifacts>) =>
        `Approval request audit event mismatch: expected event-audit-mismatch, received ${artifacts.approval_request.event_id}`,
    },
    {
      label: 'approval_request.decision_id !== policy_decision.decision_id',
      mutate: (artifacts: ReturnType<typeof buildApprovalArtifacts>) => ({
        ...artifacts,
        policy_decision: {
          ...artifacts.policy_decision,
          decision_id: 'decision-policy-mismatch',
        },
      }),
      expectedError: (artifacts: ReturnType<typeof buildApprovalArtifacts>) =>
        `Approval request decision mismatch: expected decision-policy-mismatch, received ${artifacts.approval_request.decision_id}`,
    },
    {
      label: 'approval_request.decision_id !== risk_event.decision_id',
      mutate: (artifacts: ReturnType<typeof buildApprovalArtifacts>) => ({
        ...artifacts,
        risk_event: {
          ...artifacts.risk_event,
          decision_id: 'decision-risk-mismatch',
        },
      }),
      expectedError: (artifacts: ReturnType<typeof buildApprovalArtifacts>) =>
        `Approval request risk decision mismatch: expected decision-risk-mismatch, received ${artifacts.approval_request.decision_id}`,
    },
    {
      label: 'approval_request.decision_id !== audit_record.decision_id',
      mutate: (artifacts: ReturnType<typeof buildApprovalArtifacts>) => ({
        ...artifacts,
        audit_record: {
          ...artifacts.audit_record,
          decision_id: 'decision-audit-mismatch',
        },
      }),
      expectedError: (artifacts: ReturnType<typeof buildApprovalArtifacts>) =>
        `Approval request audit decision mismatch: expected decision-audit-mismatch, received ${artifacts.approval_request.decision_id}`,
    },
  ])('rejects approval integration when $label', ({ mutate, expectedError }) => {
    const artifacts = buildApprovalArtifacts();
    const mismatchedArtifacts = mutate(artifacts);

    expect(() =>
      applyApprovalResultToEvaluationArtifacts(mismatchedArtifacts, buildApprovalResult(mismatchedArtifacts)),
    ).toThrow(expectedError(artifacts));
  });
});
