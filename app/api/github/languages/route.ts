import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/session';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    const repos = await sql`
      SELECT language FROM github_repositories 
      WHERE user_id = ${session.userId} AND language IS NOT NULL
    `;

    const counts: Record<string, number> = {};
    let total = 0;

    repos.forEach((repo: any) => {
      counts[repo.language] = (counts[repo.language] || 0) + 1;
      total++;
    });

    const languages = Object.keys(counts).map((lang) => ({
      language: lang,
      count: counts[lang],
      percentage: total > 0 ? Math.round((counts[lang] / total) * 100) : 0,
    })).sort((a, b) => b.percentage - a.percentage);

    return NextResponse.json({
      status: 'success',
      languages,
    });
  } catch (error: any) {
    console.error('GET /api/github/languages error:', error);
    return NextResponse.json({ status: 'error', message: 'Internal server error' }, { status: 500 });
  }
}
