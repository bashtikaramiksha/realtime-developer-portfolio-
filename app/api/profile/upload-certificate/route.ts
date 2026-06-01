import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/session';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({
        status: 'error',
        message: 'No image file provided for upload',
      }, { 
        status: 400,
        headers: corsHeaders
      });
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({
        status: 'error',
        message: 'Certificate image size exceeds the 2MB limit',
      }, { 
        status: 400,
        headers: corsHeaders
      });
    }

    // Check MIME type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        status: 'error',
        message: 'Only JPG, PNG, GIF, or WEBP images are allowed',
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
      // Already exists
    }

    // Read and save file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileExt = file.name.split('.').pop() || 'png';
    const uniqueFilename = `cert-${userId}-${Date.now()}.${fileExt}`;
    const filePath = join(uploadDir, uniqueFilename);
    
    await writeFile(filePath, buffer);
    
    const imageUrl = `/uploads/${uniqueFilename}`;

    return NextResponse.json({
      status: 'success',
      message: 'Certificate image uploaded successfully!',
      imageUrl,
    }, {
      headers: corsHeaders
    });
  } catch (error: any) {
    console.error('Certificate Image Upload API Error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'An internal server error occurred during certificate image upload',
    }, { 
      status: 500,
      headers: corsHeaders
    });
  }
}
