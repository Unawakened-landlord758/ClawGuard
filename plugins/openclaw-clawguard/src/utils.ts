import { createHash, randomUUID } from 'node:crypto';

export function createId(prefix: string): string {
  return `${prefix}_${randomUUID()}`;
}

function sortUnknown(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortUnknown);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, sortUnknown(nested)]),
    );
  }

  return value;
}

export function stableStringify(value: unknown): string {
  return JSON.stringify(sortUnknown(value));
}

export function fingerprintAction(params: {
  toolName: string;
  params: Record<string, unknown>;
}): string {
  const hash = createHash('sha256');
  hash.update(params.toolName);
  hash.update(':');
  hash.update(stableStringify(params.params));
  return hash.digest('hex');
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function toIsoString(value: Date): string {
  return value.toISOString();
}
