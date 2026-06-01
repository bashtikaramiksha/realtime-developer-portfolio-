import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/session';
import { syncGitHubData } from '@/lib/github';
import { z } from 'zod';

const syncSchema = z.object({
  githubUsername: z.string().min(1, 'GitHub username is required'),
});

export async function POST(request: Request) {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = syncSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        status: 'error',
        message: validation.error.issues[0].message,
      }, { status: 400 });
    }

    const { githubUsername } = validation.data;

    // Trigger sync
    const result = await syncGitHubData(session.userId, githubUsername);

    return NextResponse.json({
      status: 'success',
      message: 'GitHub details synchronized successfully!',
      reposSynced: result.reposCount,
    });
  } catch (error: any) {
    console.error('POST /api/github/sync error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to synchronize with GitHub API.',
      error: error.message || error,
    }, { status: 500 });
  }
}
