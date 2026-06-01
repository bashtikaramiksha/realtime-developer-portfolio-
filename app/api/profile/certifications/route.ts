import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getAuthUser } from '@/lib/auth/session';
import { z } from 'zod';

const certificationSchema = z.object({
  title: z.string().min(1, 'Certificate title is required'),
  issuer: z.string().min(1, 'Issuing organization is required'),
  issueDate: z.string().optional().default(''),
  credentialUrl: z.string().url('Invalid URL format').or(z.literal('')).optional().default(''),
  imageUrl: z.string().optional().default(''),
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

    const certifications = await sql`
      SELECT id, title, issuer, issue_date as "issueDate", credential_url as "credentialUrl", image_url as "imageUrl", created_at as "createdAt"
      FROM certifications
      WHERE user_id = ${auth.userId}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({
      status: 'success',
      certifications: certifications || [],
    }, {
      headers: corsHeaders
    });
  } catch (error: any) {
    console.error('Fetch Certifications API Error:', error);
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
    const validation = certificationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        status: 'error',
        message: validation.error.issues[0].message,
      }, { 
        status: 400,
        headers: corsHeaders
      });
    }

    const { title, issuer, issueDate, credentialUrl, imageUrl } = validation.data;

    const [inserted] = await sql`
      INSERT INTO certifications (user_id, title, issuer, issue_date, credential_url, image_url)
      VALUES (${auth.userId}, ${title}, ${issuer}, ${issueDate}, ${credentialUrl}, ${imageUrl})
      RETURNING id, title, issuer, issue_date as "issueDate", credential_url as "credentialUrl", image_url as "imageUrl"
    `;

    return NextResponse.json({
      status: 'success',
      message: 'Certification added successfully!',
      certification: inserted,
    }, {
      headers: corsHeaders
    });
  } catch (error: any) {
    console.error('Create Certification API Error:', error);
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
        message: 'Certification ID is required',
      }, { 
        status: 400,
        headers: corsHeaders
      });
    }

    await sql`
      DELETE FROM certifications
      WHERE id = ${id} AND user_id = ${auth.userId}
    `;

    return NextResponse.json({
      status: 'success',
      message: 'Certification deleted successfully!',
    }, {
      headers: corsHeaders
    });
  } catch (error: any) {
    console.error('Delete Certification API Error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'An internal server error occurred',
    }, { 
      status: 500,
      headers: corsHeaders
    });
  }
}
