import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // Run a basic query to verify the connection and fetch version details
    const result = await sql`SELECT NOW() as current_time, version() as pg_version`;
    
    return NextResponse.json({
      status: 'success',
      message: 'Successfully connected to PostgreSQL inside Laragon!',
      data: result[0]
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to connect to the database.',
      error: error.message || error
    }, { status: 500 });
  }
}
