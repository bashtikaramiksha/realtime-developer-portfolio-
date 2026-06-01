import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sql } from '@/lib/db';
import { hashPassword, setAuthCookies } from '@/lib/auth/utils';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        status: 'error',
        message: validation.error.issues[0].message,
        errors: validation.error.format(),
      }, { status: 400 });
    }

    const { name, email, password } = validation.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${normalizedEmail} LIMIT 1
    `;

    if (existingUsers.length > 0) {
      return NextResponse.json({
        status: 'error',
        message: 'A user with this email already exists',
      }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create user in the database
    const [newUser] = await sql`
      INSERT INTO users (name, email, password, role)
      VALUES (${name}, ${normalizedEmail}, ${hashedPassword}, 'user')
      RETURNING id, name, email, role, created_at
    `;

    // Establish a session
    const { refreshToken } = await setAuthCookies(newUser.id, newUser.role);

    // Store session in DB
    const sessionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await sql`
      INSERT INTO sessions (user_id, refresh_token, expires_at)
      VALUES (${newUser.id}, ${refreshToken}, ${sessionExpiry})
    `;

    return NextResponse.json({
      status: 'success',
      message: 'Account created successfully!',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      }
    });
  } catch (error: any) {
    console.error('Registration API Error:', error);
    return NextResponse.json({
      status: 'error',
      message: error.message || 'An internal server error occurred',
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
    }, { status: 500 });
  }
}
