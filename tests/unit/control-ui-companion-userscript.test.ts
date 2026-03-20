import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('control-ui companion userscript', () => {
  const userscriptPath = path.resolve(
    'plugins',
    'openclaw-clawguard',
    'companion',
    'clawguard-control-ui.user.js',
  );
  const source = readFileSync(userscriptPath, 'utf8');

  it('keeps the userscript metadata and launcher posture explicit', () => {
    expect(source).toContain('// @name         ClawGuard OpenClaw Companion');
    expect(source).toContain('// @match        http://127.0.0.1:18789/*');
    expect(source).toContain('// @match        http://localhost:18789/*');
    expect(source).toContain('Companion keeps auth in Control UI memory only.');
    expect(source).toContain('window.__clawGuardCompanion');
    expect(source).toContain('popupWindow.__clawGuardCompanion = window.__clawGuardCompanion;');
  });

  it('keeps the five supported plugin routes explicit in the userscript', () => {
    expect(source).toContain("/plugins/clawguard/dashboard");
    expect(source).toContain("/plugins/clawguard/checkup");
    expect(source).toContain("/plugins/clawguard/approvals");
    expect(source).toContain("/plugins/clawguard/audit");
    expect(source).toContain("/plugins/clawguard/settings");
  });
});
