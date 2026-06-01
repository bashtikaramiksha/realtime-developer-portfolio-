import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const slug = (await params).slug;

    if (!slug) {
      return NextResponse.json({
        status: 'error',
        message: 'No portfolio slug provided',
      }, { status: 400 });
    }

    // 1. Fetch profile and user details
    const [profile] = await sql`
      SELECT 
        p.user_id as "userId",
        p.bio, 
        p.headline, 
        p.location, 
        p.resume_url as "resumeUrl", 
        p.profile_image as "profileImage", 
        p.portfolio_slug as "portfolioSlug",
        u.name,
        u.email
      FROM profiles p
      INNER JOIN users u ON p.user_id = u.id
      WHERE p.portfolio_slug = ${slug}
      LIMIT 1
    `;

    if (!profile) {
      return NextResponse.json({
        status: 'error',
        message: 'Portfolio not found',
      }, { status: 404 });
    }

    const userId = profile.userId;

    // 2. Fetch skills
    const skills = await sql`
      SELECT skill_name as "skillName", skill_level as "skillLevel"
      FROM skills
      WHERE user_id = ${userId}
      ORDER BY created_at ASC
    `;

    // 3. Fetch social links
    const socialLinks = await sql`
      SELECT platform, url
      FROM social_links
      WHERE user_id = ${userId}
      ORDER BY created_at ASC
    `;

    // 4. Fetch certifications
    const certifications = await sql`
      SELECT id, title, issuer, issue_date as "issueDate", credential_url as "credentialUrl", image_url as "imageUrl"
      FROM certifications
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    // 5. Fetch experiences
    const experiences = await sql`
      SELECT id, company, role, duration, description, technologies
      FROM experiences
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    // Clean up internal properties before responding
    const { userId: _, ...cleanProfile } = profile;

    return NextResponse.json({
      status: 'success',
      profile: cleanProfile,
      skills: skills || [],
      socialLinks: socialLinks || [],
      certifications: certifications || [],
      experiences: experiences || [],
    });
  } catch (error: any) {
    console.error('Fetch Public Profile API Error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'An internal server error occurred',
    }, { status: 500 });
  }
}
