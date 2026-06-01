import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sql } from '@/lib/db';
import { verifyToken } from '@/lib/auth/utils';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json({
        status: 'error',
        message: 'Unauthorized: No token provided',
      }, { status: 401 });
    }

    const payload = await verifyToken(accessToken);
    if (!payload || !payload.userId) {
      return NextResponse.json({
        status: 'error',
        message: 'Unauthorized: Invalid token',
      }, { status: 401 });
    }

    const userId = payload.userId as string;

    const [user] = await sql`
      SELECT id, name, email, role, github_username, is_banned, created_at FROM users WHERE id = ${userId} LIMIT 1
    `;

    if (!user) {
      return NextResponse.json({
        status: 'error',
        message: 'Unauthorized: User not found',
      }, { status: 401 });
    }

    if (user.is_banned) {
      return NextResponse.json({
        status: 'error',
        message: 'Unauthorized: Your account has been banned by an administrator.',
      }, { status: 403 });
    }

    return NextResponse.json({
      status: 'success',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        githubUsername: user.github_username,
        createdAt: user.created_at,
      }
    });
  } catch (error: any) {
    console.error('Me API Error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'An internal server error occurred',
    }, { status: 500 });
  }
}
