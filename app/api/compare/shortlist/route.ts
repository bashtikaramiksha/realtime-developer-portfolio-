import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { z } from 'zod';

const shortlistSchema = z.object({
  candidateId: z.string().uuid('Invalid candidate ID format'),
  isShortlisted: z.boolean(),
});

export async function POST(request: Request) {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = shortlistSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        status: 'error',
        message: validation.error.issues[0].message,
      }, { status: 400 });
    }

    const { candidateId, isShortlisted } = validation.data;

    // Verify this candidate belongs to a comparison created by the current user
    const [candidate] = await sql`
      SELECT cu.id, c.user_id
      FROM comparison_users cu
      JOIN comparisons c ON cu.comparison_id = c.id
      WHERE cu.id = ${candidateId} AND c.user_id = ${session.userId}
    `;

    if (!candidate) {
      return NextResponse.json({
        status: 'error',
        message: 'Candidate profile not found or access denied.'
      }, { status: 404 });
    }

    // Toggle shortlist status
    await sql`
      UPDATE comparison_users
      SET is_shortlisted = ${isShortlisted}
      WHERE id = ${candidateId}
    `;

    return NextResponse.json({
      status: 'success',
      message: `Candidate has been successfully ${isShortlisted ? 'shortlisted' : 'removed from shortlist'}.`,
      isShortlisted
    });

  } catch (error: any) {
    console.error('Shortlist API error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to update shortlist status.',
      error: error.message || error
    }, { status: 500 });
  }
}
