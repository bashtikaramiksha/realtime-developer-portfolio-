import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/session';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized access' }, { status: 401 });
    }

    const [stats] = await sql`
      SELECT leetcode_username FROM leetcode_stats WHERE user_id = ${session.userId} LIMIT 1
    `;

    if (!stats) {
      return NextResponse.json({
        status: 'success',
        connected: false,
        leetcodeUsername: null,
      });
    }

    return NextResponse.json({
      status: 'success',
      connected: true,
      leetcodeUsername: stats.leetcode_username,
    });
  } catch (error: any) {
    console.error('GET /api/leetcode/profile error:', error);
    return NextResponse.json({ status: 'error', message: 'Internal server error' }, { status: 500 });
  }
}
