import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { z } from 'zod';

const addSchema = z.object({
  skillName: z.string().min(1, 'Skill name is required').max(255),
  progress: z.number().int().min(0, 'Progress must be at least 0%').max(100, 'Progress cannot exceed 100%'),
  resourceUrl: z.string().url('Please provide a valid URL (starting with http:// or https://)').optional().or(z.literal('')),
});

export async function POST(request: Request) {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = addSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        status: 'error',
        message: validation.error.issues[0].message,
      }, { status: 400 });
    }

    const { skillName, progress, resourceUrl } = validation.data;
    const cleanUrl = resourceUrl && resourceUrl.trim() !== '' ? resourceUrl.trim() : null;

    const [inserted] = await sql`
      INSERT INTO learning (user_id, skill_name, progress, resource_url)
      VALUES (${session.userId}, ${skillName}, ${progress}, ${cleanUrl})
      RETURNING id, skill_name as "skillName", progress, resource_url as "resourceUrl", created_at as "createdAt", updated_at as "updatedAt"
    `;

    return NextResponse.json({
      status: 'success',
      message: 'Learning progress target added successfully!',
      learning: inserted
    });
  } catch (error: any) {
    console.error('POST /api/learning/add error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to add learning progress target.',
      error: error.message || error
    }, { status: 500 });
  }
}
