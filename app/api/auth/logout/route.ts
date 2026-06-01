import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sql } from '@/lib/db';
import { clearAuthCookies } from '@/lib/auth/utils';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;

    if (refreshToken) {
      // Remove session from PostgreSQL DB
      await sql`
        DELETE FROM sessions WHERE refresh_token = ${refreshToken}
      `;
    }

    // Clear auth cookies
    await clearAuthCookies();

    return NextResponse.json({
      status: 'success',
      message: 'Logged out successfully!',
    });
  } catch (error: any) {
    console.error('Logout API Error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'An internal server error occurred',
    }, { status: 500 });
  }
}
