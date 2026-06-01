import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sql } from '@/lib/db';
import { comparePassword, setAuthCookies } from '@/lib/auth/utils';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        status: 'error',
        message: validation.error.issues[0].message,
      }, { status: 400 });
    }

    const { email, password } = validation.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Fetch user
    const [user] = await sql`
      SELECT id, name, email, password, role, is_banned FROM users WHERE email = ${normalizedEmail} LIMIT 1
    `;

    if (!user) {
      return NextResponse.json({
        status: 'error',
        message: 'Invalid email or password',
      }, { status: 401 });
    }

    if (user.is_banned) {
      return NextResponse.json({
        status: 'error',
        message: 'Your account has been banned by an administrator.',
      }, { status: 403 });
    }

    // Verify password (if OAuth-only, password will be null)
    if (!user.password) {
      return NextResponse.json({
        status: 'error',
        message: 'This email is registered using GitHub. Please log in using GitHub.',
      }, { status: 400 });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json({
        status: 'error',
        message: 'Invalid email or password',
      }, { status: 401 });
    }

    // Establish a session
    const { refreshToken } = await setAuthCookies(user.id, user.role);

    // Save session in database
    const sessionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await sql`
      INSERT INTO sessions (user_id, refresh_token, expires_at)
      VALUES (${user.id}, ${refreshToken}, ${sessionExpiry})
    `;

    return NextResponse.json({
      status: 'success',
      message: 'Logged in successfully!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error: any) {
    console.error('Login API Error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'An internal server error occurred',
    }, { status: 500 });
  }
}
