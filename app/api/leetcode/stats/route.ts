import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/session';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    const [stats] = await sql`
      SELECT 
        leetcode_username as "leetcodeUsername",
        total_solved as "totalSolved",
        easy_count as "easyCount",
        medium_count as "mediumCount",
        hard_count as "hardCount",
        contest_rating as "contestRating",
        global_rank as "globalRank",
        streak
      FROM leetcode_stats 
      WHERE user_id = ${session.userId} 
      LIMIT 1
    `;

    if (!stats) {
      return NextResponse.json({
        status: 'error',
        message: 'No LeetCode statistics found. Please connect your profile first.',
      }, { status: 404 });
    }

    return NextResponse.json({
      status: 'success',
      stats,
    });
  } catch (error: any) {
    console.error('GET /api/leetcode/stats error:', error);
    return NextResponse.json({ status: 'error', message: 'Internal server error' }, { status: 500 });
  }
}
