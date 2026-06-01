import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { logError } from '@/lib/logger';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthUser();
    if (!session || session.role !== 'admin') {
      await logError('admin_warning', `Unauthorized user deletion attempt from session: ${session?.userId || 'unknown'}`);
      return NextResponse.json({ status: 'error', message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    // Prevent administrators from accidentally deleting their own profiles
    if (id === session.userId) {
      return NextResponse.json({
        status: 'error',
        message: 'Conflict: You cannot delete your own administrative account.',
      }, { status: 409 });
    }

    const result = await sql`
      DELETE FROM users 
      WHERE id = ${id}
      RETURNING id, name, email
    `;

    if (result.length === 0) {
      return NextResponse.json({
        status: 'error',
        message: 'User record not found.',
      }, { status: 404 });
    }

    const deletedUser = result[0];
    await logError('admin_audit', `Administrator deleted user account: ${deletedUser.name} (${deletedUser.email})`);

    return NextResponse.json({
      status: 'success',
      message: `User ${deletedUser.name} has been successfully deleted.`,
    });
  } catch (error: any) {
    console.error('DELETE /api/admin/user error:', error);
    await logError('admin_error', `Failed to delete user record: ${error.message || error}`);
    return NextResponse.json({ status: 'error', message: 'Internal server error' }, { status: 500 });
  }
}
