import { createId, toIsoString } from '../utils.js';
import type { AuditEntry, AuditEntryKind, Clock } from '../types.js';

export class AuditLog {
  private readonly entries: AuditEntry[] = [];

  public constructor(private readonly clock: Clock) {}

  public record(input: {
    readonly kind: AuditEntryKind;
    readonly detail: string;
    readonly session_key?: string;
    readonly run_id?: string;
    readonly tool_call_id?: string;
    readonly tool_name?: string;
    readonly pending_action_id?: string;
    readonly action_fingerprint?: string;
  }): AuditEntry {
    const entry: AuditEntry = {
      record_id: createId('audit'),
      kind: input.kind,
      detail: input.detail,
      session_key: input.session_key,
      run_id: input.run_id,
      tool_call_id: input.tool_call_id,
      tool_name: input.tool_name,
      pending_action_id: input.pending_action_id,
      action_fingerprint: input.action_fingerprint,
      timestamp: toIsoString(this.clock.now()),
    };

    this.entries.unshift(entry);
    return entry;
  }

  public list(): AuditEntry[] {
    return [...this.entries];
  }
}
