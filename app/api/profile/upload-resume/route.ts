import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getAuthUser } from '@/lib/auth/session';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const MAX_RESUME_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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

    const userId = auth.userId;
    const formData = await request.formData();
    
    const resumeFile = formData.get('resume') as File | null;
    const avatarFile = formData.get('avatar') as File | null;

    if (!resumeFile && !avatarFile) {
      return NextResponse.json({
        status: 'error',
        message: 'No file provided for upload',
      }, { 
        status: 400,
        headers: corsHeaders
      });
    }

    // Prepare upload directory path
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // Directory already exists
    }

    const responseData: { resumeUrl?: string; profileImage?: string } = {};

    // 1. Process Resume file upload
    if (resumeFile) {
      if (resumeFile.size > MAX_RESUME_SIZE) {
        return NextResponse.json({
          status: 'error',
          message: 'Resume file size exceeds the 5MB limit',
        }, { 
          status: 400,
          headers: corsHeaders
        });
      }

      // Check MIME type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(resumeFile.type)) {
        return NextResponse.json({
          status: 'error',
          message: 'Only PDF or DOC/DOCX documents are allowed',
        }, { 
          status: 400,
          headers: corsHeaders
        });
      }

      // Read and save file
      const arrayBuffer = await resumeFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileExt = resumeFile.name.split('.').pop() || 'pdf';
      const uniqueFilename = `resume-${userId}-${Date.now()}.${fileExt}`;
      const filePath = join(uploadDir, uniqueFilename);
      
      await writeFile(filePath, buffer);
      
      const resumeUrl = `/uploads/${uniqueFilename}`;
      responseData.resumeUrl = resumeUrl;

      // Save to database (profiles table)
      await sql`
        INSERT INTO profiles (user_id, resume_url)
        VALUES (${userId}, ${resumeUrl})
        ON CONFLICT (user_id)
        DO UPDATE SET resume_url = EXCLUDED.resume_url, updated_at = NOW()
      `;
    }

    // 2. Process Avatar image file upload
    if (avatarFile) {
      if (avatarFile.size > MAX_IMAGE_SIZE) {
        return NextResponse.json({
          status: 'error',
          message: 'Profile image size exceeds the 2MB limit',
        }, { 
          status: 400,
          headers: corsHeaders
        });
      }

      // Check MIME type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(avatarFile.type)) {
        return NextResponse.json({
          status: 'error',
          message: 'Only JPG, PNG, GIF, or WEBP images are allowed',
        }, { 
          status: 400,
          headers: corsHeaders
        });
      }

      // Read and save file
      const arrayBuffer = await avatarFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileExt = avatarFile.name.split('.').pop() || 'png';
      const uniqueFilename = `avatar-${userId}-${Date.now()}.${fileExt}`;
      const filePath = join(uploadDir, uniqueFilename);
      
      await writeFile(filePath, buffer);
      
      const profileImage = `/uploads/${uniqueFilename}`;
      responseData.profileImage = profileImage;

      // Save to database (profiles table)
      await sql`
        INSERT INTO profiles (user_id, profile_image)
        VALUES (${userId}, ${profileImage})
        ON CONFLICT (user_id)
        DO UPDATE SET profile_image = EXCLUDED.profile_image, updated_at = NOW()
      `;
    }

    return NextResponse.json({
      status: 'success',
      message: 'Files uploaded successfully!',
      data: responseData,
    }, {
      headers: corsHeaders
    });
  } catch (error: any) {
    console.error('File Upload API Error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'An internal server error occurred during file upload',
    }, { 
      status: 500,
      headers: corsHeaders
    });
  }
}
