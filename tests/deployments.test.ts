import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { calculateUptime, pingUrl } from '../lib/monitor';

describe('Deployment Monitoring Helper - Uptime Mathematics', () => {
  it('should accurately calculate uptime percentages under different failed ratio metrics', () => {
    // 0 checks should return 100%
    expect(calculateUptime(0, 0)).toBe(100.0);
    
    // 10 checks with 0 failed should be 100%
    expect(calculateUptime(10, 0)).toBe(100.0);

    // 10 checks with 1 failed should be 90%
    expect(calculateUptime(10, 1)).toBe(90.0);

    // 1000 checks with 3 failed should be 99.7%
    expect(calculateUptime(1000, 3)).toBe(99.7);
  });
});

describe('Deployment Monitoring Helper - Service Pingers', () => {
  beforeAll(() => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('offline-test')) {
        return Promise.reject(new Error('Network error'));
      }
      return Promise.resolve({
        status: 200,
        ok: true,
      } as any);
    });
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it('should resolve and track mock service states and respond with latencies', async () => {
    const onlineResult = await pingUrl('https://example.com');
    expect(onlineResult.status).toBeDefined();
    expect(['healthy', 'degraded', 'offline']).toContain(onlineResult.status);
    expect(onlineResult.responseTime).toBeGreaterThanOrEqual(0);

    const offlineResult = await pingUrl('https://offline-test.com');
    expect(offlineResult.status).toBe('offline');
    expect(offlineResult.responseTime).toBe(0);
  });
});
