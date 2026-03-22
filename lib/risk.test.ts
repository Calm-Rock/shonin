import { describe, it, expect } from 'vitest';
import { classifyRisk } from './risk';

describe('classifyRisk', () => {
  it('git_push_force → DESTRUCTIVE with 2 bullets', () => {
    const r = classifyRisk('git_push_force');
    expect(r.risk_level).toBe('DESTRUCTIVE');
    expect(r.risk_bullets).toHaveLength(2);
  });

  it('git_reset_hard → DESTRUCTIVE with 1 bullet', () => {
    const r = classifyRisk('git_reset_hard');
    expect(r.risk_level).toBe('DESTRUCTIVE');
    expect(r.risk_bullets).toHaveLength(1);
  });

  it('rm → DESTRUCTIVE with 1 bullet', () => {
    const r = classifyRisk('rm');
    expect(r.risk_level).toBe('DESTRUCTIVE');
    expect(r.risk_bullets).toHaveLength(1);
  });

  it('sql_drop → DESTRUCTIVE with 1 bullet', () => {
    const r = classifyRisk('sql_drop');
    expect(r.risk_level).toBe('DESTRUCTIVE');
    expect(r.risk_bullets).toHaveLength(1);
  });

  it('sql_migration → HIGH with 1 bullet', () => {
    const r = classifyRisk('sql_migration');
    expect(r.risk_level).toBe('HIGH');
    expect(r.risk_bullets).toHaveLength(1);
  });

  it('git_push → LOW with 1 bullet', () => {
    const r = classifyRisk('git_push');
    expect(r.risk_level).toBe('LOW');
    expect(r.risk_bullets).toHaveLength(1);
  });

  it('git_commit → LOW with 1 bullet', () => {
    const r = classifyRisk('git_commit');
    expect(r.risk_level).toBe('LOW');
    expect(r.risk_bullets).toHaveLength(1);
  });

  it('unknown_xyz → LOW with no bullets', () => {
    const r = classifyRisk('unknown_xyz');
    expect(r.risk_level).toBe('LOW');
    expect(r.risk_bullets).toHaveLength(0);
  });

  it('null → LOW with no bullets', () => {
    const r = classifyRisk(null);
    expect(r.risk_level).toBe('LOW');
    expect(r.risk_bullets).toHaveLength(0);
  });

  it('undefined → LOW with no bullets', () => {
    const r = classifyRisk(undefined);
    expect(r.risk_level).toBe('LOW');
    expect(r.risk_bullets).toHaveLength(0);
  });
});
