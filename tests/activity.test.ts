import { describe, it, expect, beforeAll } from 'vitest';
import { z } from 'zod';

describe('Coding Activity System - Zod Schema Validation', () => {
  const startSchema = z.object({
    activityType: z.string().min(1),
    repoName: z.string().min(1),
  });

  it('should validate correctly formatted start activity requests', () => {
    const payload = {
      activityType: 'Optimizing database queries',
      repoName: 'test2'
    };

    const parseResult = startSchema.safeParse(payload);
    expect(parseResult.success).toBe(true);
  });

  it('should fail validation when fields are empty or missing', () => {
    const invalidPayload = {
      activityType: '',
      repoName: ''
    };

    const parseResult = startSchema.safeParse(invalidPayload);
    expect(parseResult.success).toBe(false);
  });
});
