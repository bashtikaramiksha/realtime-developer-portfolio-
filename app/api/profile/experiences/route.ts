import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getAuthUser } from '@/lib/auth/session';
import { z } from 'zod';

const experienceSchema = z.object({
  company: z.string().min(1, 'Company name is required'),
  role: z.string().min(1, 'Role title is required'),
  duration: z.string().min(1, 'Duration is required'),
  description: z.string().min(1, 'Description is required'),
  technologies: z.string().optional().default(''),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...corsHeaders,
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function GET(request: Request) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({
        status: 'error',
        message: 'Unauthorized: Access denied',
      }, { 
        status: 401,
        headers: corsHeaders
      });
    }

    const experiences = await sql`
      SELECT id, company, role, duration, description, technologies, created_at as "createdAt"
      FROM experiences
      WHERE user_id = ${auth.userId}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({
      status: 'success',
      experiences: experiences || [],
    }, {
      headers: corsHeaders
    });
  } catch (error: any) {
    console.error('Fetch Experiences API Error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'An internal server error occurred',
    }, { 
      status: 500,
      headers: corsHeaders
    });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({
        status: 'error',
        message: 'Unauthorized: Access denied',
      }, { 
        status: 401,
        headers: corsHeaders
      });
    }

    const body = await request.json();
    const validation = experienceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        status: 'error',
        message: validation.error.issues[0].message,
      }, { 
        status: 400,
        headers: corsHeaders
      });
    }

    const { company, role, duration, description, technologies } = validation.data;

    const [inserted] = await sql`
      INSERT INTO experiences (user_id, company, role, duration, description, technologies)
      VALUES (${auth.userId}, ${company}, ${role}, ${duration}, ${description}, ${technologies})
      RETURNING id, company, role, duration, description, technologies
    `;

    return NextResponse.json({
      status: 'success',
      message: 'Experience added successfully!',
      experience: inserted,
    }, {
      headers: corsHeaders
    });
  } catch (error: any) {
    console.error('Create Experience API Error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'An internal server error occurred',
    }, { 
      status: 500,
      headers: corsHeaders
    });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({
        status: 'error',
        message: 'Unauthorized: Access denied',
      }, { 
        status: 401,
        headers: corsHeaders
      });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        status: 'error',
        message: 'Experience ID is required',
      }, { 
        status: 400,
        headers: corsHeaders
      });
    }

    await sql`
      DELETE FROM experiences
      WHERE id = ${id} AND user_id = ${auth.userId}
    `;

    return NextResponse.json({
      status: 'success',
      message: 'Experience deleted successfully!',
    }, {
      headers: corsHeaders
    });
  } catch (error: any) {
    console.error('Delete Experience API Error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'An internal server error occurred',
    }, { 
      status: 500,
      headers: corsHeaders
    });
  }
}
