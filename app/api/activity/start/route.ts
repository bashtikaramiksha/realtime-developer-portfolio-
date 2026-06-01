import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { z } from 'zod';

const startSchema = z.object({
  activityType: z.string().min(1, 'Activity type description is required'),
  repoName: z.string().min(1, 'Repository name is required'),
});

export async function POST(request: Request) {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = startSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        status: 'error',
        message: validation.error.issues[0].message,
      }, { status: 400 });
    }

    const { activityType, repoName } = validation.data;

    // 1. Close any currently active sessions for this user
    await sql`
      UPDATE activity 
      SET ended_at = CURRENT_TIMESTAMP 
      WHERE user_id = ${session.userId} AND ended_at IS NULL
    `;

    // 2. Insert new session
    const [insertedActivity] = await sql`
      INSERT INTO activity (user_id, activity_type, repo_name, started_at)
      VALUES (${session.userId}, ${activityType}, ${repoName}, CURRENT_TIMESTAMP)
      RETURNING id, activity_type as "activityType", repo_name as "repoName", started_at as "startedAt"
    `;

    return NextResponse.json({
      status: 'success',
      message: 'Coding activity session started successfully!',
      activity: insertedActivity,
    });
  } catch (error: any) {
    console.error('POST /api/activity/start error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to record coding activity.',
      error: error.message || error,
    }, { status: 500 });
  }
}
