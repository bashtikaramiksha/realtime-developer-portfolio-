import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { logError } from '@/lib/logger';

export async function GET() {
  try {
    const session = await getAuthUser();
    if (!session || session.role !== 'admin') {
      await logError('admin_warning', `Unauthorized analytics access attempt from session: ${session?.userId || 'unknown'}`);
      return NextResponse.json({ status: 'error', message: 'Forbidden' }, { status: 403 });
    }

    // Run parallel aggregates for high performance
    const [
      usersCount,
      bannedUsersCount,
      adminsCount,
      reposCount,
      leetcodeCount,
      deploymentsCount,
      logsCount,
      avgProgressResult
    ] = await Promise.all([
      sql`SELECT COUNT(*) FROM users`,
      sql`SELECT COUNT(*) FROM users WHERE is_banned = TRUE`,
      sql`SELECT COUNT(*) FROM users WHERE role = 'admin'`,
      sql`SELECT COUNT(*) FROM github_repositories`,
      sql`SELECT COUNT(*) FROM leetcode_stats`,
      sql`SELECT COUNT(*) FROM deployments`,
      sql`SELECT COUNT(*) FROM logs`,
      sql`SELECT AVG(progress) as avg FROM learning`
    ]);

    // Format results safely
    const totalUsers = parseInt(usersCount[0].count) || 0;
    const bannedUsers = parseInt(bannedUsersCount[0].count) || 0;
    const adminUsers = parseInt(adminsCount[0].count) || 0;
    const githubRepos = parseInt(reposCount[0].count) || 0;
    const leetcodeProfiles = parseInt(leetcodeCount[0].count) || 0;
    const totalDeployments = parseInt(deploymentsCount[0].count) || 0;
    const logsVolume = parseInt(logsCount[0].count) || 0;
    
    const rawAvg = avgProgressResult[0]?.avg;
    const averageLearningProgress = rawAvg !== null && rawAvg !== undefined 
      ? parseFloat(parseFloat(rawAvg).toFixed(1)) 
      : 0.0;

    // Fetch recent error/audit logs (limit 30)
    const logs = await sql`
      SELECT 
        id, 
        type, 
        message, 
        created_at as "createdAt"
      FROM logs
      ORDER BY created_at DESC
      LIMIT 30
    `;

    return NextResponse.json({
      status: 'success',
      analytics: {
        totalUsers,
        bannedUsers,
        adminUsers,
        githubRepos,
        leetcodeProfiles,
        totalDeployments,
        logsVolume,
        averageLearningProgress,
        logs
      }
    });
  } catch (error: any) {
    console.error('GET /api/admin/analytics error:', error);
    await logError('admin_error', `Failed to aggregate admin analytics: ${error.message || error}`);
    return NextResponse.json({ status: 'error', message: 'Internal server error' }, { status: 500 });
  }
}
