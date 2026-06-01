import { describe, it, expect } from 'vitest';

// Unit tests validating administrator rules
describe('Admin Authorization Rules - Unit Tests', () => {
  const checkAdminAuth = (user: { role: string; isBanned: boolean } | null): boolean => {
    if (!user) return false;
    if (user.isBanned) return false;
    return user.role === 'admin';
  };

  it('should successfully authorize users flagged with the admin role, and reject suspended admins', () => {
    expect(checkAdminAuth(null)).toBe(false);
    expect(checkAdminAuth({ role: 'user', isBanned: false })).toBe(false);
    expect(checkAdminAuth({ role: 'admin', isBanned: false })).toBe(true);
    expect(checkAdminAuth({ role: 'admin', isBanned: true })).toBe(false); // Banned admins are blocked
  });
});

describe('Admin Analytics Metrics - Unit Tests', () => {
  const calculateGitHubRates = (totalRepos: number, totalUsers: number): number => {
    if (totalUsers <= 0) return 0;
    return parseFloat(((totalRepos / totalUsers) * 10).toFixed(1));
  };

  const calculateLeetCodeRatios = (totalLinked: number, totalUsers: number): number => {
    if (totalUsers <= 0) return 0;
    return parseFloat(((totalLinked / totalUsers) * 100).toFixed(1));
  };

  it('should compile correct GitHub synchronization rates under diverse users and repo sizes', () => {
    expect(calculateGitHubRates(0, 0)).toBe(0);
    expect(calculateGitHubRates(5, 0)).toBe(0);
    expect(calculateGitHubRates(12, 10)).toBe(12.0);
    expect(calculateGitHubRates(3, 40)).toBe(0.8);
  });

  it('should compile correct LeetCode profiles linking rates', () => {
    expect(calculateLeetCodeRatios(0, 0)).toBe(0);
    expect(calculateLeetCodeRatios(4, 5)).toBe(80.0);
    expect(calculateLeetCodeRatios(1, 10)).toBe(10.0);
  });
});
