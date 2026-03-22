export type RiskLevel = 'DESTRUCTIVE' | 'HIGH' | 'LOW';

export interface FileChange {
  path: string;
  status: 'modified' | 'added' | 'deleted' | 'renamed';
}

export interface RiskClassification {
  risk_level: RiskLevel;
  risk_bullets: string[];
}

const RISK_MAP: Record<string, RiskClassification> = {
  git_push_force: {
    risk_level: 'DESTRUCTIVE',
    risk_bullets: ['Will overwrite upstream commits', 'Bypasses branch protection rules'],
  },
  git_reset_hard: {
    risk_level: 'DESTRUCTIVE',
    risk_bullets: ['Local changes will be permanently lost'],
  },
  rm: {
    risk_level: 'DESTRUCTIVE',
    risk_bullets: ['Files cannot be recovered from trash'],
  },
  sql_drop: {
    risk_level: 'DESTRUCTIVE',
    risk_bullets: ['Table data is permanently deleted'],
  },
  sql_migration: {
    risk_level: 'HIGH',
    risk_bullets: ['Schema changes may be irreversible'],
  },
  git_push: {
    risk_level: 'LOW',
    risk_bullets: ['Reversible via git revert'],
  },
  git_commit: {
    risk_level: 'LOW',
    risk_bullets: ['Reversible via git reset'],
  },
};

export function classifyRisk(commandType: string | null | undefined): RiskClassification {
  if (!commandType) return { risk_level: 'LOW', risk_bullets: [] };
  return RISK_MAP[commandType] ?? { risk_level: 'LOW', risk_bullets: [] };
}

/** Infer command_type from action string when hook doesn't send it. */
export function inferCommandType(action: string): string | null {
  const a = action.toLowerCase();
  if (
    a.includes('push') &&
    (a.includes(' -f') || a.includes(' --force') || a.includes('--force-with-lease'))
  ) {
    return 'git_push_force';
  }
  if (a.includes('reset') && a.includes('--hard')) return 'git_reset_hard';
  if (a.startsWith('rm ') || a === 'rm') return 'rm';
  if (a.includes('drop table')) return 'sql_drop';
  if (a.includes('migrate') || /migration/i.test(action)) return 'sql_migration';
  if (a.includes('push')) return 'git_push';
  if (a.includes('commit')) return 'git_commit';
  return null;
}

const DIFF_EXCLUDED_NAMES = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'];
const DIFF_EXCLUDED_PATTERNS = [/\.lock$/, /\.tsbuildinfo$/, /^dist\//, /^\.next\//];

function isExcludedPath(filePath: string): boolean {
  const name = filePath.split('/').pop() ?? filePath;
  if (DIFF_EXCLUDED_NAMES.includes(name)) return true;
  return DIFF_EXCLUDED_PATTERNS.some((re) => re.test(filePath));
}

/**
 * Extract the first 20 meaningful lines from a diff, skipping excluded files.
 * Returns null if no meaningful diff content exists.
 */
export function parseDiffPreview(diff: string): { preview: string; hasMore: boolean } | null {
  if (!diff.trim()) return null;

  // Split into per-file sections by "diff --git" header
  const fileHunks = diff.split(/(?=^diff --git )/m).filter(Boolean);

  for (const hunk of fileHunks) {
    const pathMatch = hunk.match(/^diff --git a\/(.+?) b\//m);
    const filePath = pathMatch?.[1] ?? '';
    if (isExcludedPath(filePath)) continue;

    const lines = hunk.split('\n');
    if (lines.length <= 1) continue;

    const LIMIT = 20;
    const preview = lines.slice(0, LIMIT).join('\n');
    const hasMore = lines.length > LIMIT;
    return { preview, hasMore };
  }

  return null;
}
