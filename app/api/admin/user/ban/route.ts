import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { logError } from '@/lib/logger';
import { z } from 'zod';

const banSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  isBanned: z.boolean(),
});

export async function POST(request: Request) {
  try {
    const session = await getAuthUser();
    if (!session || session.role !== 'admin') {
      await logError('admin_warning', `Unauthorized user ban attempt from session: ${session?.userId || 'unknown'}`);
      return NextResponse.json({ status: 'error', message: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validation = banSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        status: 'error',
        message: validation.error.issues[0].message,
      }, { status: 400 });
    }

    const { userId, isBanned } = validation.data;

    // Prevent administrators from suspending their own accounts
    if (userId === session.userId) {
      return NextResponse.json({
        status: 'error',
        message: 'Conflict: You cannot suspend or ban your own administrative account.',
      }, { status: 409 });
    }

    const result = await sql`
      UPDATE users
      SET is_banned = ${isBanned}
      WHERE id = ${userId}
      RETURNING id, name, email, is_banned as "isBanned"
    `;

    if (result.length === 0) {
      return NextResponse.json({
        status: 'error',
        message: 'User record not found.',
      }, { status: 404 });
    }

    const updatedUser = result[0];
    const auditMsg = isBanned 
      ? `Administrator suspended user account: ${updatedUser.name} (${updatedUser.email})`
      : `Administrator restored user account access: ${updatedUser.name} (${updatedUser.email})`;
      
    await logError('admin_audit', auditMsg);

    return NextResponse.json({
      status: 'success',
      message: isBanned 
        ? `User ${updatedUser.name} has been successfully suspended from platform access.`
        : `User ${updatedUser.name} has been successfully restored to active status.`,
      user: updatedUser
    });
  } catch (error: any) {
    console.error('POST /api/admin/user/ban error:', error);
    await logError('admin_error', `Failed to modify user ban status: ${error.message || error}`);
    return NextResponse.json({ status: 'error', message: 'Internal server error' }, { status: 500 });
  }
}
