import { describe, it, expect } from 'vitest';
import { parseRssFeed } from '../lib/blog';
import { calculateAverageProgress, categorizeSkills } from '../lib/learning';

describe('Blog RSS Feed Parser Unit Tests', () => {
  it('should extract blog items, strip CDATA tags, and resolve dates correctly', () => {
    const xmlMock = `
      <rss version="2.0">
        <channel>
          <title>Developer Blog</title>
          <item>
            <title><![CDATA[Getting Started with Next.js 16]]></title>
            <link>https://medium.com/devpulse/next16</link>
            <pubDate>Thu, 28 May 2026 12:00:00 GMT</pubDate>
          </item>
          <item>
            <title>Tuning Database Queries &amp; Indexes</title>
            <link>https://medium.com/devpulse/tuning-indexes</link>
            <pubDate>Wed, 27 May 2026 08:30:00 GMT</pubDate>
          </item>
        </channel>
      </rss>
    `;

    const parsed = parseRssFeed(xmlMock);
    expect(parsed).toHaveLength(2);

    expect(parsed[0].title).toBe('Getting Started with Next.js 16');
    expect(parsed[0].url).toBe('https://medium.com/devpulse/next16');
    expect(parsed[0].publishedAt).toBeInstanceOf(Date);
    expect(parsed[0].publishedAt.toUTCString()).toBe('Thu, 28 May 2026 12:00:00 GMT');

    expect(parsed[1].title).toBe('Tuning Database Queries & Indexes'); // &amp; should be &
    expect(parsed[1].url).toBe('https://medium.com/devpulse/tuning-indexes');
    expect(parsed[1].publishedAt.toUTCString()).toBe('Wed, 27 May 2026 08:30:00 GMT');
  });

  it('should return empty list on malformed or empty feed XML inputs', () => {
    expect(parseRssFeed('')).toEqual([]);
    expect(parseRssFeed('malformed xml no item')).toEqual([]);
  });
});

describe('Learning Progress Mathematics Unit Tests', () => {
  it('should accurately calculate progress averages under diverse ratios', () => {
    expect(calculateAverageProgress([])).toBe(0);
    expect(calculateAverageProgress([{ progress: 50 }])).toBe(50.0);
    expect(calculateAverageProgress([{ progress: 10 }, { progress: 20 }, { progress: 30 }])).toBe(20.0);
    expect(calculateAverageProgress([{ progress: 85 }, { progress: 90 }])).toBe(87.5);
  });

  it('should categorize learning progress into Beginner, Intermediate, and Advanced milestones', () => {
    const skills = [
      { progress: 15 }, // beginner
      { progress: 29 }, // beginner
      { progress: 30 }, // intermediate
      { progress: 55 }, // intermediate
      { progress: 70 }, // intermediate
      { progress: 71 }, // advanced
      { progress: 95 }  // advanced
    ];

    const breakdown = categorizeSkills(skills);
    expect(breakdown.beginner).toBe(2);
    expect(breakdown.intermediate).toBe(3);
    expect(breakdown.advanced).toBe(2);
  });
});
