import type { EvaluationInput } from '../../domain/context/index.js';
import type { AuditRecord } from '../../domain/audit/index.js';
import type { PolicyDecision } from '../../domain/policy/index.js';
import type { RiskEvent } from '../../domain/risk/index.js';
import { ToolPhase, type IsoTimestamp, type RunRef, type ToolCallRef, type ToolStatus } from '../../domain/shared/index.js';

import type { EvaluationArtifacts } from './build-evaluation-artifacts.js';
import {
  isTerminalToolStatus,
  mapExecutionResultToFinalStatus,
  mapToolStatusToExecutionResult,
  mapToolStatusToRunStatus,
  resolvePostExecutionRiskEventStatus,
} from './evaluation-outcomes.js';

export interface PostExecutionResult {
  readonly tool_status: ToolStatus;
  readonly timestamp: IsoTimestamp;
  readonly summary?: string;
}

interface PostExecutionArtifactCarrier {
  readonly evaluation_input: EvaluationArtifacts['evaluation_input'];
  readonly run_ref: EvaluationArtifacts['run_ref'];
  readonly tool_call_ref: EvaluationArtifacts['tool_call_ref'];
  readonly risk_event: EvaluationArtifacts['risk_event'];
  readonly policy_decision: EvaluationArtifacts['policy_decision'];
  readonly audit_record: EvaluationArtifacts['audit_record'];
}

export type PostExecutionIntegratedArtifacts<T extends PostExecutionArtifactCarrier> = Omit<
  T,
  'evaluation_input' | 'run_ref' | 'tool_call_ref' | 'risk_event' | 'audit_record'
> & {
  readonly evaluation_input: EvaluationInput;
  readonly run_ref: RunRef;
  readonly tool_call_ref: ToolCallRef;
  readonly risk_event: RiskEvent;
  readonly audit_record: AuditRecord;
};

export function applyPostExecutionResultToEvaluationArtifacts<T extends PostExecutionArtifactCarrier>(
  artifacts: T,
  postExecutionResult: PostExecutionResult,
): PostExecutionIntegratedArtifacts<T> {
  const run_ref = applyPostExecutionToRunRef(artifacts.run_ref, postExecutionResult);
  const tool_call_ref = applyPostExecutionToToolCallRef(artifacts.tool_call_ref, postExecutionResult);
  const evaluation_input = applyPostExecutionToEvaluationInput(artifacts.evaluation_input, run_ref, tool_call_ref, postExecutionResult);
  const execution_result = mapToolStatusToExecutionResult(postExecutionResult.tool_status, artifacts.policy_decision.decision);

  return {
    ...artifacts,
    evaluation_input,
    run_ref,
    tool_call_ref,
    risk_event: applyPostExecutionToRiskEvent(artifacts.risk_event, run_ref, tool_call_ref, postExecutionResult.tool_status),
    audit_record: applyPostExecutionToAuditRecord(
      artifacts.audit_record,
      artifacts.policy_decision,
      run_ref,
      tool_call_ref,
      postExecutionResult,
      execution_result,
    ),
  };
}

function applyPostExecutionToRunRef(runRef: RunRef, postExecutionResult: PostExecutionResult): RunRef {
  return {
    ...runRef,
    run_status: mapToolStatusToRunStatus(postExecutionResult.tool_status),
    ended_at: isTerminalToolStatus(postExecutionResult.tool_status) ? postExecutionResult.timestamp : runRef.ended_at,
  };
}

function applyPostExecutionToToolCallRef(toolCallRef: ToolCallRef, postExecutionResult: PostExecutionResult): ToolCallRef {
  return {
    ...toolCallRef,
    tool_phase: ToolPhase.After,
    tool_status: postExecutionResult.tool_status,
  };
}

function applyPostExecutionToEvaluationInput(
  evaluationInput: EvaluationInput,
  runRef: RunRef,
  toolCallRef: ToolCallRef,
  postExecutionResult: PostExecutionResult,
): EvaluationInput {
  return {
    ...evaluationInput,
    run_ref: runRef,
    tool_call_ref: toolCallRef,
    agent_event: evaluationInput.agent_event
      ? {
          ...evaluationInput.agent_event,
          timestamp: postExecutionResult.timestamp,
          tool_status: postExecutionResult.tool_status,
          summary: postExecutionResult.summary ?? evaluationInput.agent_event.summary,
        }
      : undefined,
  };
}

function applyPostExecutionToRiskEvent(
  riskEvent: RiskEvent,
  runRef: RunRef,
  toolCallRef: ToolCallRef,
  toolStatus: ToolStatus,
): RiskEvent {
  return {
    ...riskEvent,
    status: resolvePostExecutionRiskEventStatus(toolStatus, riskEvent.status),
    run_ref: runRef,
    tool_call_ref: toolCallRef,
  };
}

function applyPostExecutionToAuditRecord(
  auditRecord: AuditRecord,
  policyDecision: PolicyDecision,
  runRef: RunRef,
  toolCallRef: ToolCallRef,
  postExecutionResult: PostExecutionResult,
  executionResult: AuditRecord['execution_result'],
): AuditRecord {
  return {
    ...auditRecord,
    execution_result: executionResult ?? auditRecord.execution_result,
    timestamp: postExecutionResult.timestamp,
    final_status: mapExecutionResultToFinalStatus(executionResult, policyDecision.decision),
    run_ref: runRef,
    tool_call_ref: toolCallRef,
  };
}
