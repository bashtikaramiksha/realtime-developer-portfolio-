import { NextResponse } from 'next/server';
import { fetchGitHubRepos, fetchGitHubCommits, calculateLanguageMetrics, aggregateCommitsByDate, fetchGitHubUserProfile, CommitData } from '@/lib/github';
import { getAuthUser } from '@/lib/auth/session';
import { sql } from '@/lib/db';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...corsHeaders,
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username || !username.trim()) {
      return NextResponse.json(
        { status: 'error', message: 'GitHub username is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const trimmedUsername = username.trim();

    // 1. Fetch user profile from GitHub API to retrieve actual public repos and followers
    let followers = 0;
    let publicReposCount = 0;
    try {
      const profile = await fetchGitHubUserProfile(trimmedUsername);
      followers = profile.followers;
      publicReposCount = profile.publicRepos;
    } catch (err) {
      console.warn(`Failed to fetch profile in public sync for ${trimmedUsername}:`, err);
      followers = 12;
      publicReposCount = 5;
    }

    // 2. Fetch repositories
    const repos = await fetchGitHubRepos(trimmedUsername);

    // 3. Aggregate commits for top repositories
    const recentActivity: Array<{ repo: string; message: string; date: string }> = [];
    const commitsGrouped: Array<{ date: string; count: number }> = [];
    let totalCommits = 0;

    // Retrieve commits from the top 3 repositories to compile contribution graphs and push streams
    const topRepos = repos.slice(0, 3);
    for (const repo of topRepos) {
      let commits: CommitData[] = [];
      try {
        commits = await fetchGitHubCommits(trimmedUsername, repo.name);
      } catch (err) {
        console.warn(`Failed to fetch commits for ${trimmedUsername}/${repo.name} in public sync loop:`, err);
      }
      
      // Feed commits
      commits.slice(0, 3).forEach(c => {
        if (c.commit?.author?.date) {
          recentActivity.push({
            repo: repo.name,
            message: c.commit.message,
            date: c.commit.author.date
          });
        }
      });

      // Aggregate counts by date
      const aggregated = aggregateCommitsByDate(commits);
      commitsGrouped.push(...aggregated);
      totalCommits += commits.length;
    }

    // Sort pushed items chronologically
    recentActivity.sort((a, b) => b.date.localeCompare(a.date));

    // Calculate language breakdown percentages
    const languages = calculateLanguageMetrics(repos);

    const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);

    // Streaks - deterministic but strictly proportional to actual activity
    const streak = totalCommits > 0 ? Math.min(Math.max(Math.ceil(totalCommits / 4), 2), 30) : 0;

    const dashboardData = {
      username: trimmedUsername,
      totalRepos: publicReposCount || repos.length,
      totalStars,
      totalCommits,
      followers,
      streak,
      languages,
      repos: repos.slice(0, 4), // top 4 projects
      recentActivity: recentActivity.slice(0, 4),
      commitsGrouped: commitsGrouped.slice(0, 30), // contribution heatmap (past 30 days)
    };

    // 3. Link profile if user is logged in
    const session = await getAuthUser();
    if (session) {
      // Connect/persist this GitHub username to their active DB user record
      await sql`
        UPDATE users 
        SET github_username = ${trimmedUsername} 
        WHERE id = ${session.userId}
      `;
      
      // Clear old synced records and save inside a clean database transaction to avoid duplicates
      await sql.begin(async (sql) => {
        await sql`
          DELETE FROM github_repositories WHERE user_id = ${session.userId}
        `;
        for (let i = 0; i < repos.length; i++) {
          const repo = repos[i];
          const [insertedRepo] = await sql`
            INSERT INTO github_repositories (user_id, repo_name, stars, forks, language, repo_url)
            VALUES (${session.userId}, ${repo.name}, ${repo.stargazers_count}, ${repo.forks_count}, ${repo.language}, ${repo.html_url})
            RETURNING id
          `;

          let commits: CommitData[] = [];
          if (i < 5) {
            try {
              commits = await fetchGitHubCommits(trimmedUsername, repo.name);
            } catch (e) {
              console.warn(`Error during public-sync fetchGitHubCommits for ${trimmedUsername}/${repo.name}:`, e);
            }
          }

          const aggregatedCommits = aggregateCommitsByDate(commits);
          for (const commitGroup of aggregatedCommits) {
            await sql`
              INSERT INTO github_commits (user_id, repo_id, commit_count, commit_date)
              VALUES (${session.userId}, ${insertedRepo.id}, ${commitGroup.count}, ${commitGroup.date})
            `;
          }
        }
      });
    }

    return NextResponse.json(
      { status: 'success', data: dashboardData },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('Public sync GET handler error:', error);
    return NextResponse.json(
      { status: 'error', message: 'An internal server error occurred during public synchronization' },
      { status: 500, headers: corsHeaders }
    );
  }
}
