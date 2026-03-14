import path from 'node:path';

import {
  type IsoTimestamp,
  type RunRef,
  type SessionRef,
  type ToolCallRef,
  type ToolStatus,
  WorkspaceMutationOperationType,
} from '../shared/index.js';

export interface EvaluationOrigin {
  readonly channel?: string;
  readonly to?: string;
  readonly thread?: string;
}

export interface EvaluationDestination {
  readonly kind: 'channel' | 'session' | 'workspace' | 'unknown';
  readonly target?: string;
  readonly thread?: string;
}

export interface WorkspaceContext {
  readonly paths: readonly string[];
  readonly summary?: string;
  readonly operation_type?: WorkspaceMutationOperationType;
}

export interface AgentEventContext {
  readonly stream: string;
  readonly sequence: number;
  readonly timestamp: IsoTimestamp;
  readonly tool_status: ToolStatus;
  readonly summary?: string;
}

export interface EvaluationInput {
  readonly tool_name: string;
  readonly tool_params: Record<string, unknown>;
  readonly session_ref: SessionRef;
  readonly run_ref: RunRef;
  readonly tool_call_ref: ToolCallRef;
  readonly origin?: EvaluationOrigin;
  readonly destination?: EvaluationDestination;
  readonly workspace_context?: WorkspaceContext;
  readonly raw_text_candidates: readonly string[];
  readonly agent_event?: AgentEventContext;
}

export function detectWorkspaceMutationOperationType(
  toolName: string,
  toolParams: Record<string, unknown>,
): WorkspaceMutationOperationType | undefined {
  const normalizedToolName = toolName.trim().toLowerCase();
  const pathPairOperationType = detectPathPairWorkspaceMutationOperationType(toolParams);

  if (pathPairOperationType) {
    return pathPairOperationType;
  }

  if (normalizedToolName === 'edit') {
    return detectEditWorkspaceMutationOperationType(toolParams);
  }

  if (normalizedToolName === 'apply_patch') {
    return detectApplyPatchWorkspaceMutationOperationType(toolParams);
  }

  return undefined;
}

function detectPathPairWorkspaceMutationOperationType(
  toolParams: Record<string, unknown>,
): WorkspaceMutationOperationType | undefined {
  const pathPairs = collectWorkspaceMutationPathPairs(toolParams);
  if (pathPairs.length === 0) {
    return undefined;
  }

  return pathPairs.some(({ fromPath, toPath }) => isHighConfidenceRenameLikePathPair(fromPath, toPath))
    ? WorkspaceMutationOperationType.RenameLike
    : WorkspaceMutationOperationType.Modify;
}

function detectEditWorkspaceMutationOperationType(
  toolParams: Record<string, unknown>,
): WorkspaceMutationOperationType | undefined {
  const oldText = normalizeWorkspaceMutationText(
    toolParams.oldText ?? toolParams.old_string ?? toolParams.oldValue ?? toolParams.old_value,
  );
  const newText = normalizeWorkspaceMutationText(
    toolParams.newText ?? toolParams.new_string ?? toolParams.newValue ?? toolParams.new_value,
  );

  if (oldText && newText) {
    return isRenameLikeEdit(oldText, newText)
      ? WorkspaceMutationOperationType.RenameLike
      : WorkspaceMutationOperationType.Modify;
  }

  if (newText) {
    return WorkspaceMutationOperationType.Insert;
  }

  if (oldText) {
    return WorkspaceMutationOperationType.Delete;
  }

  return WorkspaceMutationOperationType.Modify;
}

function detectApplyPatchWorkspaceMutationOperationType(
  toolParams: Record<string, unknown>,
): WorkspaceMutationOperationType | undefined {
  const patchText = normalizeWorkspaceMutationText(toolParams.patch ?? toolParams.patchText);
  if (!patchText) {
    return undefined;
  }

  return selectConservativeWorkspaceMutationOperationType(collectPatchOperationTypes(patchText));
}

function collectPatchOperationTypes(patchText: string): readonly WorkspaceMutationOperationType[] {
  const detectedTypes = new Set<WorkspaceMutationOperationType>();
  let insideGitDiff = false;

  for (const rawLine of patchText.split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    if (/^\*\*\* Add File:\s+.+$/u.test(line)) {
      detectedTypes.add(WorkspaceMutationOperationType.Add);
      continue;
    }

    if (/^\*\*\* Delete File:\s+.+$/u.test(line)) {
      detectedTypes.add(WorkspaceMutationOperationType.Delete);
      continue;
    }

    if (/^\*\*\* Update File:\s+.+$/u.test(line)) {
      detectedTypes.add(WorkspaceMutationOperationType.Modify);
      continue;
    }

    if (/^\*\*\* Move to:\s+.+$/u.test(line)) {
      detectedTypes.add(WorkspaceMutationOperationType.RenameLike);
      continue;
    }

    if (/^diff --git\s+/u.test(line)) {
      insideGitDiff = true;
      continue;
    }

    if (/^new file mode(?:\s+\d+)?$/u.test(line)) {
      detectedTypes.add(WorkspaceMutationOperationType.Add);
      insideGitDiff = true;
      continue;
    }

    if (/^deleted file mode(?:\s+\d+)?$/u.test(line)) {
      detectedTypes.add(WorkspaceMutationOperationType.Delete);
      insideGitDiff = true;
      continue;
    }

    if (/^(?:rename|copy) (?:from|to)\s+.+$/u.test(line)) {
      detectedTypes.add(WorkspaceMutationOperationType.RenameLike);
      insideGitDiff = true;
      continue;
    }

    const diffHeaderOperationType = detectDiffHeaderOperationType(line);
    if (diffHeaderOperationType) {
      detectedTypes.add(diffHeaderOperationType);
      insideGitDiff = true;
      continue;
    }

    if (insideGitDiff && /^@@(?:\s|$)/u.test(line)) {
      detectedTypes.add(WorkspaceMutationOperationType.Modify);
    }
  }

  return Array.from(detectedTypes);
}

function detectDiffHeaderOperationType(line: string): WorkspaceMutationOperationType | undefined {
  const diffFileHeaderMatch = line.match(/^(---|\+\+\+)\s+(.+)$/u);
  if (!diffFileHeaderMatch) {
    return undefined;
  }

  const normalizedPath = normalizeWorkspaceMutationText((diffFileHeaderMatch[2] ?? '').split('\t')[0]);
  if (!normalizedPath) {
    return undefined;
  }

  if (normalizedPath === '/dev/null') {
    return diffFileHeaderMatch[1] === '---'
      ? WorkspaceMutationOperationType.Add
      : WorkspaceMutationOperationType.Delete;
  }

  return WorkspaceMutationOperationType.Modify;
}

const WORKSPACE_MUTATION_OPERATION_PRIORITY: readonly WorkspaceMutationOperationType[] = [
  WorkspaceMutationOperationType.Delete,
  WorkspaceMutationOperationType.RenameLike,
  WorkspaceMutationOperationType.Add,
  WorkspaceMutationOperationType.Insert,
  WorkspaceMutationOperationType.Modify,
];

function selectConservativeWorkspaceMutationOperationType(
  operationTypes: readonly WorkspaceMutationOperationType[],
): WorkspaceMutationOperationType | undefined {
  for (const operationType of WORKSPACE_MUTATION_OPERATION_PRIORITY) {
    if (operationTypes.includes(operationType)) {
      return operationType;
    }
  }

  return undefined;
}

function normalizeWorkspaceMutationText(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

interface WorkspaceMutationPathPair {
  readonly fromPath: string;
  readonly toPath: string;
}

function collectWorkspaceMutationPathPairs(
  toolParams: Record<string, unknown>,
): readonly WorkspaceMutationPathPair[] {
  const pairs = [
    createWorkspaceMutationPathPair(toolParams.fromPath, toolParams.toPath),
    createWorkspaceMutationPathPair(toolParams.oldPath, toolParams.newPath),
  ].filter((pair): pair is WorkspaceMutationPathPair => Boolean(pair));

  const dedupedPairs: WorkspaceMutationPathPair[] = [];
  const seen = new Set<string>();

  for (const pair of pairs) {
    const cacheKey = `${pair.fromPath}\0${pair.toPath}`;
    if (seen.has(cacheKey)) {
      continue;
    }

    seen.add(cacheKey);
    dedupedPairs.push(pair);
  }

  return dedupedPairs;
}

function createWorkspaceMutationPathPair(
  fromValue: unknown,
  toValue: unknown,
): WorkspaceMutationPathPair | undefined {
  const fromPath = normalizeWorkspaceMutationPath(fromValue);
  const toPath = normalizeWorkspaceMutationPath(toValue);
  if (!fromPath || !toPath) {
    return undefined;
  }

  return {
    fromPath,
    toPath,
  };
}

function normalizeWorkspaceMutationPath(value: unknown): string | undefined {
  const normalized = normalizeWorkspaceMutationText(value);
  if (!normalized) {
    return undefined;
  }

  const unquoted =
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))
      ? normalized.slice(1, -1).trim()
      : normalized;

  if (!unquoted) {
    return undefined;
  }

  return unquoted.replace(/\//gu, '\\');
}

type IdentifierFamily =
  | 'camelCase'
  | 'PascalCase'
  | 'snake_case'
  | 'SCREAMING_SNAKE_CASE';

const IDENTIFIER_LITERAL_KEYWORDS = new Set(['true', 'false', 'null', 'undefined', 'nan', 'infinity']);

function isRenameLikeEdit(oldText: string, newText: string): boolean {
  if (oldText === newText) {
    return false;
  }

  const oldFamily = detectIdentifierFamily(oldText);
  if (!oldFamily) {
    return false;
  }

  return (
    oldFamily === detectIdentifierFamily(newText) &&
    extractLetters(oldText) !== extractLetters(newText)
  );
}

function detectIdentifierFamily(value: string): IdentifierFamily | undefined {
  if (!isHighConfidenceIdentifierCandidate(value)) {
    return undefined;
  }

  if (/^[a-z]+(?:[A-Z][A-Za-z0-9]*)+$/u.test(value)) {
    return 'camelCase';
  }

  if (/^(?:[A-Z][a-z0-9]+){2,}$/u.test(value)) {
    return 'PascalCase';
  }

  if (/^[a-z]+(?:_[a-z0-9]+)+$/u.test(value)) {
    return 'snake_case';
  }

  if (/^[A-Z]+(?:_[A-Z0-9]+)+$/u.test(value)) {
    return 'SCREAMING_SNAKE_CASE';
  }

  return undefined;
}

function isHighConfidenceIdentifierCandidate(value: string): boolean {
  if (value.length < 3 || value.length > 120 || /\r|\n/u.test(value) || /\s/u.test(value)) {
    return false;
  }

  if (!/^[A-Za-z0-9_]+$/u.test(value) || !/[A-Za-z]/u.test(value) || /^\d+$/u.test(value)) {
    return false;
  }

  if (IDENTIFIER_LITERAL_KEYWORDS.has(value.toLowerCase())) {
    return false;
  }

  return extractLetters(value).length >= 4;
}

function extractLetters(value: string): string {
  return Array.from(value.matchAll(/[A-Za-z]/gu), (match) => match[0]).join('');
}

function isHighConfidenceRenameLikePathPair(fromPath: string, toPath: string): boolean {
  const fromParsedPath = parseWorkspaceMutationPath(fromPath);
  const toParsedPath = parseWorkspaceMutationPath(toPath);
  if (!fromParsedPath || !toParsedPath) {
    return false;
  }

  if (fromParsedPath.normalizedPath === toParsedPath.normalizedPath) {
    return false;
  }

  if (
    fromParsedPath.extension.toLowerCase() !== toParsedPath.extension.toLowerCase() &&
    !(fromParsedPath.extension.length === 0 && toParsedPath.extension.length === 0)
  ) {
    return false;
  }

  if (fromParsedPath.directory === toParsedPath.directory) {
    return isRenameLikeEdit(fromParsedPath.stem, toParsedPath.stem);
  }

  return fromParsedPath.stem.toLowerCase() === toParsedPath.stem.toLowerCase();
}

interface ParsedWorkspaceMutationPath {
  readonly normalizedPath: string;
  readonly directory: string;
  readonly stem: string;
  readonly extension: string;
}

function parseWorkspaceMutationPath(rawPath: string): ParsedWorkspaceMutationPath | undefined {
  const normalizedPath = normalizeWorkspaceMutationPath(rawPath);
  if (!normalizedPath) {
    return undefined;
  }

  const parsedPath = path.win32.parse(normalizedPath);
  const stem = (parsedPath.ext ? parsedPath.name : parsedPath.base).trim();
  const directory = parsedPath.dir.trim().toLowerCase();

  if (!stem || /\s/u.test(stem)) {
    return undefined;
  }

  return {
    normalizedPath: normalizedPath.toLowerCase(),
    directory,
    stem,
    extension: parsedPath.ext.trim(),
  };
}
