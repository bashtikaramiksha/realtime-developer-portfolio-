import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { fetchLeetCodeStats } from '../lib/leetcode';

describe('LeetCode Analytics Helper - Profile Simulator', () => {
  beforeAll(() => {
    // Mock global fetch to return simulated response or fail immediately to test fallback paths
    global.fetch = vi.fn().mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          data: {
            allQuestionsCount: [],
            matchedUser: {
              submitStats: {
                acSubmissionNum: [
                  { difficulty: 'Easy', count: 120 },
                  { difficulty: 'Medium', count: 85 },
                  { difficulty: 'Hard', count: 15 }
                ]
              },
              profile: { ranking: 45000 }
            },
            userContestRanking: { rating: 1750 }
          }
        })
      } as any)
    );
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it('should accurately calculate solved proportions and ranking metrics dynamically from username profiles', async () => {
    const username = 'leetcode-pro-dev';
    const stats = await fetchLeetCodeStats(username);

    expect(stats).toBeDefined();
    expect(stats.leetcodeUsername).toBe(username);
    expect(stats.totalSolved).toBe(220); // 120 + 85 + 15
    expect(stats.easyCount).toBe(120);
    expect(stats.mediumCount).toBe(85);
    expect(stats.hardCount).toBe(15);
    expect(stats.globalRank).toBe(45000);
    expect(stats.contestRating).toBe(1750);
    expect(stats.streak).toBeGreaterThan(0);
  });
});
