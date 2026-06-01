import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/session';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    const commits = await sql`
      SELECT TO_CHAR(commit_date, 'YYYY-MM-DD') as date, SUM(commit_count)::INTEGER as count
      FROM github_commits
      WHERE user_id = ${session.userId}
      GROUP BY TO_CHAR(commit_date, 'YYYY-MM-DD')
      ORDER BY date ASC
    `;

    return NextResponse.json({
      status: 'success',
      commits,
    });
  } catch (error: any) {
    console.error('GET /api/github/commits error:', error);
    return NextResponse.json({ status: 'error', message: 'Internal server error' }, { status: 500 });
  }
}
