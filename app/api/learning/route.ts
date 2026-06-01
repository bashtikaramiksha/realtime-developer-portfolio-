import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/session';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    const learning = await sql`
      SELECT 
        id, 
        skill_name as "skillName", 
        progress, 
        resource_url as "resourceUrl",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM learning
      WHERE user_id = ${session.userId}
      ORDER BY created_at ASC
    `;

    return NextResponse.json({
      status: 'success',
      learning
    });
  } catch (error: any) {
    console.error('GET /api/learning error:', error);
    return NextResponse.json({ status: 'error', message: 'Internal server error' }, { status: 500 });
  }
}
