import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { logError } from '@/lib/logger';

export async function GET() {
  try {
    const session = await getAuthUser();
    if (!session || session.role !== 'admin') {
      await logError('admin_warning', `Unauthorized users retrieval attempt from session: ${session?.userId || 'unknown'}`);
      return NextResponse.json({ status: 'error', message: 'Forbidden' }, { status: 403 });
    }

    const users = await sql`
      SELECT 
        id, 
        name, 
        email, 
        role, 
        is_banned as "isBanned",
        created_at as "createdAt"
      FROM users
      ORDER BY created_at ASC
    `;

    return NextResponse.json({
      status: 'success',
      users
    });
  } catch (error: any) {
    console.error('GET /api/admin/users error:', error);
    await logError('admin_error', `Failed to query users table: ${error.message || error}`);
    return NextResponse.json({ status: 'error', message: 'Internal server error' }, { status: 500 });
  }
}
