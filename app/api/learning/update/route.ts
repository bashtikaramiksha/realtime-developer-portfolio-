import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { z } from 'zod';

const updateSchema = z.object({
  id: z.string().uuid('Invalid learning record ID format'),
  progress: z.number().int().min(0, 'Progress must be at least 0%').max(100, 'Progress cannot exceed 100%'),
});

export async function PUT(request: Request) {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = updateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        status: 'error',
        message: validation.error.issues[0].message,
      }, { status: 400 });
    }

    const { id, progress } = validation.data;

    const result = await sql`
      UPDATE learning
      SET progress = ${progress}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id} AND user_id = ${session.userId}
      RETURNING id, skill_name as "skillName", progress, resource_url as "resourceUrl", created_at as "createdAt", updated_at as "updatedAt"
    `;

    if (result.length === 0) {
      return NextResponse.json({
        status: 'error',
        message: 'Learning progress target not found or unauthorized modification.',
      }, { status: 404 });
    }

    return NextResponse.json({
      status: 'success',
      message: 'Learning progress updated successfully!',
      learning: result[0]
    });
  } catch (error: any) {
    console.error('PUT /api/learning/update error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to update learning progress.',
      error: error.message || error
    }, { status: 500 });
  }
}
