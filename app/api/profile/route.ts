import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getAuthUser } from '@/lib/auth/session';

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({
        status: 'error',
        message: 'Unauthorized: Access denied',
      }, { status: 401 });
    }

    const userId = auth.userId;

    // 1. Fetch profile
    const [profile] = await sql`
      SELECT bio, headline, location, contact_number as "contactNumber", resume_url as "resumeUrl", profile_image as "profileImage", portfolio_slug as "portfolioSlug", ats_score as "atsScore", ats_analysis as "atsAnalysis"
      FROM profiles
      WHERE user_id = ${userId}
      LIMIT 1
    `;

    // 2. Fetch skills
    const skills = await sql`
      SELECT id, skill_name as "skillName", skill_level as "skillLevel"
      FROM skills
      WHERE user_id = ${userId}
      ORDER BY created_at ASC
    `;

    // 3. Fetch social links
    const socialLinks = await sql`
      SELECT id, platform, url
      FROM social_links
      WHERE user_id = ${userId}
      ORDER BY created_at ASC
    `;

    // Format output
    return NextResponse.json({
      status: 'success',
      profile: profile || {
        bio: '',
        headline: '',
        location: '',
        contactNumber: '',
        resumeUrl: '',
        profileImage: '',
        portfolioSlug: '',
        atsScore: null,
        atsAnalysis: null,
      },
      skills: skills || [],
      socialLinks: socialLinks || [],
    });
  } catch (error: any) {
    console.error('Fetch Profile API Error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'An internal server error occurred',
    }, { status: 500 });
  }
}
