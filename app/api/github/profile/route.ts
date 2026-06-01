import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/session';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized access' }, { status: 401 });
    }

    const [user] = await sql`
      SELECT github_username FROM users WHERE id = ${session.userId} LIMIT 1
    `;

    if (!user || !user.github_username) {
      return NextResponse.json({
        status: 'success',
        connected: false,
        githubUsername: null,
      });
    }

    // Get aggregated stats
    const [stats] = await sql`
      SELECT 
        COUNT(id) as total_repos,
        COALESCE(SUM(stars), 0) as total_stars,
        COALESCE(SUM(forks), 0) as total_forks
      FROM github_repositories 
      WHERE user_id = ${session.userId}
    `;

    return NextResponse.json({
      status: 'success',
      connected: true,
      githubUsername: user.github_username,
      stats: {
        totalRepos: parseInt(stats.total_repos || '0'),
        totalStars: parseInt(stats.total_stars || '0'),
        totalForks: parseInt(stats.total_forks || '0'),
      }
    });
  } catch (error: any) {
    console.error('GET /api/github/profile error:', error);
    return NextResponse.json({ status: 'error', message: 'Internal server error' }, { status: 500 });
  }
}
