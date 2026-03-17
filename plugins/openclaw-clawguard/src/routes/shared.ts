export const DASHBOARD_ROUTE_PATH = '/plugins/clawguard/dashboard';
export const CHECKUP_ROUTE_PATH = '/plugins/clawguard/checkup';
export const APPROVALS_ROUTE_PATH = '/plugins/clawguard/approvals';
export const AUDIT_ROUTE_PATH = '/plugins/clawguard/audit';
export const SETTINGS_ROUTE_PATH = '/plugins/clawguard/settings';

export const INSTALL_DEMO = {
  title: 'ClawGuard for OpenClaw install demo',
  releaseStatus: 'Install demo only. Not a formal release.',
  published: false,
  demoPosture:
    'Alpha install-demo only. Unpublished and fake-only. This remains a plugin-owned page rather than a stock Control UI Security tab.',
  packageName: '@clawguard/openclaw-clawguard',
  packageNamePosture: 'Metadata and future compatibility placeholder only.',
  recommendedMethod: 'Local path install from the repo root.',
  recommendedCommand: 'openclaw plugins install .\\plugins\\openclaw-clawguard',
  optionalMethod: 'Local tarball install only. No registry implication.',
  optionalPackedArtifactHint: 'pnpm --dir plugins\\openclaw-clawguard pack',
  readmePath: 'plugins/openclaw-clawguard/README.md',
  docsPath: 'docs/v1-installer-demo-strategy.md',
  reloadRequirement: 'Restart OpenClaw after install; hot reload is not assumed for the demo.',
  smokePaths: [
    DASHBOARD_ROUTE_PATH,
    CHECKUP_ROUTE_PATH,
    APPROVALS_ROUTE_PATH,
    AUDIT_ROUTE_PATH,
    SETTINGS_ROUTE_PATH,
  ],
  coverage:
    'Risky exec approvals, minimal outbound checks, and limited workspace mutation heuristics for write / edit / apply_patch. This alpha UI stays fake-only and does not claim broad outbound or workspace coverage.',
  limitations:
    'Host-level outbound keeps hard blocks on message_sending and closes allowed or failed delivery on message_sent, while tool-level approvals stay on message / sessions_send.',
  navigationPosture:
    'There is no stock Control UI Security tab for this alpha, and ClawGuard does not depend on a patched nav hack.',
} as const;

const NAV_ITEMS = [
  { href: DASHBOARD_ROUTE_PATH, label: 'Dashboard' },
  { href: CHECKUP_ROUTE_PATH, label: 'Checkup' },
  { href: APPROVALS_ROUTE_PATH, label: 'Approvals' },
  { href: AUDIT_ROUTE_PATH, label: 'Audit' },
  { href: SETTINGS_ROUTE_PATH, label: 'Settings' },
] as const;

export function renderClawGuardNav(currentPath: string): string {
  const links = NAV_ITEMS.map((item) =>
    item.href === currentPath
      ? `<strong>${item.label}</strong>`
      : `<a href="${item.href}">${item.label}</a>`,
  ).join(' ');

  return `<nav>${links}</nav>`;
}
