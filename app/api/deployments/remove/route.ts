import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { z } from 'zod';

const removeSchema = z.object({
  id: z.string().uuid('Invalid service ID format'),
});

export async function DELETE(request: Request) {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = removeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        status: 'error',
        message: validation.error.issues[0].message,
      }, { status: 400 });
    }

    const { id } = validation.data;

    // Delete record from database
    const result = await sql`
      DELETE FROM deployments 
      WHERE id = ${id} AND user_id = ${session.userId}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json({
        status: 'error',
        message: 'Deployment service record not found or unauthorized deletion.',
      }, { status: 404 });
    }

    return NextResponse.json({
      status: 'success',
      message: 'Deployment service successfully removed from tracking.',
    });
  } catch (error: any) {
    console.error('DELETE /api/deployments/remove error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to remove deployment service.',
      error: error.message || error
    }, { status: 500 });
  }
}
