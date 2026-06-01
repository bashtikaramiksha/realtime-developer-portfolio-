import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/session';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized access' }, { status: 401 });
    }

    const repos = await sql`
      SELECT id, repo_name as name, stars, forks, language, repo_url 
      FROM github_repositories 
      WHERE user_id = ${session.userId}
      ORDER BY stars DESC, repo_name ASC
    `;

    return NextResponse.json({
      status: 'success',
      repositories: repos,
    });
  } catch (error: any) {
    console.error('GET /api/github/repos error:', error);
    return NextResponse.json({ status: 'error', message: 'Internal server error' }, { status: 500 });
  }
}
