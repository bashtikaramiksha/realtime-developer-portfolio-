import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/session';
import { syncLeetCodeData } from '@/lib/leetcode';
import { z } from 'zod';

const syncSchema = z.object({
  leetcodeUsername: z.string().min(1, 'LeetCode username is required'),
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

    const { leetcodeUsername } = validation.data;

    // Trigger sync
    const stats = await syncLeetCodeData(session.userId, leetcodeUsername.trim());

    return NextResponse.json({
      status: 'success',
      message: 'LeetCode details synchronized successfully!',
      stats,
    });
  } catch (error: any) {
    console.error('POST /api/leetcode/sync error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to synchronize with LeetCode profile.',
      error: error.message || error,
    }, { status: 500 });
  }
}
