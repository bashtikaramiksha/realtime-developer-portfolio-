import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/session';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    // Fetch live activities (where ended_at IS NULL)
    const live = await sql`
      SELECT 
        a.id, 
        a.user_id as "userId",
        u.name as "userName",
        a.activity_type as "activityType", 
        a.repo_name as "repoName", 
        a.started_at as "startedAt"
      FROM activity a
      JOIN users u ON a.user_id = u.id
      WHERE a.ended_at IS NULL
      ORDER BY a.started_at DESC
    `;

    // Fetch past activity timeline (past 20 events)
    const timeline = await sql`
      SELECT 
        a.id, 
        a.user_id as "userId",
        u.name as "userName",
        a.activity_type as "activityType", 
        a.repo_name as "repoName", 
        a.started_at as "startedAt",
        a.ended_at as "endedAt"
      FROM activity a
      JOIN users u ON a.user_id = u.id
      WHERE a.ended_at IS NOT NULL
      ORDER BY a.ended_at DESC
      LIMIT 20
    `;

    return NextResponse.json({
      status: 'success',
      live,
      timeline,
    });
  } catch (error: any) {
    console.error('GET /api/activity/live error:', error);
    return NextResponse.json({ status: 'error', message: 'Internal server error' }, { status: 500 });
  }
}
