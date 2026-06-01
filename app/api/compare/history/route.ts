import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/session';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    // Query comparisons descending by created date
    const comparisons = await sql`
      SELECT id, title, created_at
      FROM comparisons
      WHERE user_id = ${session.userId}
      ORDER BY created_at DESC
    `;

    const fullHistory = [];

    for (const comp of comparisons) {
      // Query users
      const users = await sql`
        SELECT id, github_username as username, avatar_url, followers, following,
               public_repos as "publicRepos", stars, forks, total_contributions as "totalContributions",
               commit_activity as "commitActivity", pull_requests as "pullRequests",
               issues, account_age_years as "accountAgeYears", most_used_languages as "mostUsedLanguages",
               tech_stack_analysis as "techStackAnalysis", is_shortlisted as "isShortlisted"
        FROM comparison_users
        WHERE comparison_id = ${comp.id}
      `;

      // Query reports
      const [report] = await sql`
        SELECT ai_insights as "aiInsights", rankings
        FROM comparison_reports
        WHERE comparison_id = ${comp.id}
      `;

      fullHistory.push({
        id: comp.id,
        title: comp.title,
        createdAt: comp.created_at,
        developers: users,
        aiInsights: report?.aiInsights || null,
        rankings: report?.rankings || null
      });
    }

    return NextResponse.json({
      status: 'success',
      history: fullHistory
    });

  } catch (error: any) {
    console.error('History API error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to fetch comparison history.',
      error: error.message || error
    }, { status: 500 });
  }
}
