import { QueryBuilder } from 'drizzle-orm/pg-core';
import { describe, expect, it } from 'vitest';
import { leads } from '../db/schema';
import { followupSentCountSql } from '../leads';

/**
 * Regression for the 2026-08-29/30 drip blast: the correlated subquery
 * compared `e.lead_id` to a bare `"id"` (its own row) instead of the outer
 * lead, so every lead counted 0 sends and got step 1 again every run.
 */
describe('followupSentCountSql', () => {
  it('correlates on the outer leads row, not the subquery row', () => {
    const { sql } = new QueryBuilder()
      .select({ id: leads.id, sentCount: followupSentCountSql() })
      .from(leads)
      .toSQL();
    const compact = sql.replace(/\s+/g, ' ');
    expect(compact).toContain('e.lead_id = "leads"."id"');
    expect(compact).not.toMatch(/e\.lead_id = "id"/);
    expect(compact).toContain(`e.kind = 'weekly_followup'`);
    expect(compact).toContain('e.error is null');
  });
});
