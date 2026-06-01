import { describe, it, expect, beforeAll } from 'vitest';
import { calculateLanguageMetrics, aggregateCommitsByDate, GitHubRepo, CommitData } from '../lib/github';

describe('GitHub Analytics Helper - Language Processor', () => {
  it('should accurately calculate language percentages and counts from a repository set', () => {
    const mockRepos: GitHubRepo[] = [
      { name: 'repo-1', stargazers_count: 1, forks_count: 0, language: 'TypeScript', html_url: '' },
      { name: 'repo-2', stargazers_count: 2, forks_count: 1, language: 'TypeScript', html_url: '' },
      { name: 'repo-3', stargazers_count: 0, forks_count: 0, language: 'JavaScript', html_url: '' },
      { name: 'repo-4', stargazers_count: 5, forks_count: 3, language: null, html_url: '' }, // Should be ignored
      { name: 'repo-5', stargazers_count: 0, forks_count: 0, language: 'Go', html_url: '' },
    ];

    const metrics = calculateLanguageMetrics(mockRepos);

    expect(metrics).toHaveLength(3);
    
    const tsMetric = metrics.find(m => m.language === 'TypeScript');
    expect(tsMetric).toBeDefined();
    expect(tsMetric?.count).toBe(2);
    expect(tsMetric?.percentage).toBe(50); // 2 out of 4 language-connected repos

    const jsMetric = metrics.find(m => m.language === 'JavaScript');
    expect(jsMetric?.count).toBe(1);
    expect(jsMetric?.percentage).toBe(25);

    const goMetric = metrics.find(m => m.language === 'Go');
    expect(goMetric?.count).toBe(1);
    expect(goMetric?.percentage).toBe(25);
  });

  it('should return an empty array if repos list contains no language data', () => {
    const emptyRepos: GitHubRepo[] = [];
    const metrics = calculateLanguageMetrics(emptyRepos);
    expect(metrics).toEqual([]);
  });
});

describe('GitHub Analytics Helper - Commit Aggregator', () => {
  it('should successfully group and count commits by their calendar date string', () => {
    const mockCommits: CommitData[] = [
      { commit: { author: { date: '2026-05-28T09:12:00Z' }, message: 'commit 1' } },
      { commit: { author: { date: '2026-05-28T14:45:00Z' }, message: 'commit 2' } },
      { commit: { author: { date: '2026-05-27T10:00:00Z' }, message: 'commit 3' } },
      { commit: { author: { date: '2026-05-28T23:59:00Z' }, message: 'commit 4' } },
      { commit: { author: { date: '2026-05-26T01:00:00Z' }, message: 'commit 5' } },
    ];

    const aggregated = aggregateCommitsByDate(mockCommits);

    expect(aggregated).toHaveLength(3);
    
    const day28 = aggregated.find(a => a.date === '2026-05-28');
    expect(day28?.count).toBe(3);

    const day27 = aggregated.find(a => a.date === '2026-05-27');
    expect(day27?.count).toBe(1);

    const day26 = aggregated.find(a => a.date === '2026-05-26');
    expect(day26?.count).toBe(1);
  });
});
