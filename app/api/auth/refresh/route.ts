import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sql } from '@/lib/db';
import { verifyToken, setAuthCookies } from '@/lib/auth/utils';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json({
        status: 'error',
        message: 'No refresh token provided',
      }, { status: 401 });
    }

    // Verify JWT
    const payload = await verifyToken(refreshToken);
    if (!payload || !payload.userId) {
      return NextResponse.json({
        status: 'error',
        message: 'Invalid refresh token',
      }, { status: 401 });
    }

    const userId = payload.userId as string;

    // Check database session
    const [session] = await sql`
      SELECT id, expires_at FROM sessions 
      WHERE user_id = ${userId} AND refresh_token = ${refreshToken}
      LIMIT 1
    `;

    if (!session) {
      return NextResponse.json({
        status: 'error',
        message: 'Session not found or revoked',
      }, { status: 401 });
    }

    // Check if session has expired
    const isExpired = new Date() > new Date(session.expires_at);
    if (isExpired) {
      // Remove expired session from DB
      await sql`DELETE FROM sessions WHERE id = ${session.id}`;
      return NextResponse.json({
        status: 'error',
        message: 'Session has expired',
      }, { status: 401 });
    }

    // Fetch user details
    const [user] = await sql`
      SELECT id, name, email, role, is_banned FROM users WHERE id = ${userId} LIMIT 1
    `;

    if (!user) {
      return NextResponse.json({
        status: 'error',
        message: 'User not found',
      }, { status: 401 });
    }

    if (user.is_banned) {
      return NextResponse.json({
        status: 'error',
        message: 'Your account has been banned.',
      }, { status: 403 });
    }

    // Set new access/refresh cookies (token rotation)
    const { refreshToken: newRefreshToken } = await setAuthCookies(user.id, user.role);

    // Update refresh token and expiration in PostgreSQL
    const sessionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await sql`
      UPDATE sessions 
      SET refresh_token = ${newRefreshToken}, expires_at = ${sessionExpiry}
      WHERE id = ${session.id}
    `;

    return NextResponse.json({
      status: 'success',
      message: 'Token refreshed successfully!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error: any) {
    console.error('Refresh Token API Error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'An internal server error occurred',
    }, { status: 500 });
  }
}
