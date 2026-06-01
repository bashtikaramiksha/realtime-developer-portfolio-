import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/session';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    const blogs = await sql`
      SELECT 
        id, 
        title, 
        url, 
        published_at as "publishedAt"
      FROM blogs
      WHERE user_id = ${session.userId}
      ORDER BY published_at DESC
    `;

    return NextResponse.json({
      status: 'success',
      blogs
    });
  } catch (error: any) {
    console.error('GET /api/blogs error:', error);
    return NextResponse.json({ status: 'error', message: 'Internal server error' }, { status: 500 });
  }
}
