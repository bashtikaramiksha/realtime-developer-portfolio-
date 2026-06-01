import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/session';
import { sql } from '@/lib/db';

export async function POST() {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    // Set ended_at to current timestamp for open session
    const closedActivities = await sql`
      UPDATE activity 
      SET ended_at = CURRENT_TIMESTAMP 
      WHERE user_id = ${session.userId} AND ended_at IS NULL
      RETURNING id, activity_type as "activityType", repo_name as "repoName", started_at as "startedAt", ended_at as "endedAt"
    `;

    if (closedActivities.length === 0) {
      return NextResponse.json({
        status: 'error',
        message: 'No active coding activity sessions found to stop.',
      }, { status: 404 });
    }

    return NextResponse.json({
      status: 'success',
      message: 'Coding activity session stopped successfully!',
      activity: closedActivities[0],
    });
  } catch (error: any) {
    console.error('POST /api/activity/stop error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to close coding activity.',
      error: error.message || error,
    }, { status: 500 });
  }
}
