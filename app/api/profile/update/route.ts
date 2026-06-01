import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sql } from '@/lib/db';
import { getAuthUser } from '@/lib/auth/session';

const skillSchema = z.object({
  skillName: z.string().min(1, 'Skill name is required'),
  skillLevel: z.number().min(0).max(100),
});

const socialSchema = z.object({
  platform: z.string().min(1, 'Platform is required'),
  url: z.string().url('Invalid URL format'),
});

const updateSchema = z.object({
  bio: z.string().optional().default(''),
  headline: z.string().optional().default(''),
  location: z.string().optional().default(''),
  contactNumber: z.string()
    .regex(/^\+?[0-9\s\-()]{7,18}$/, 'Invalid contact number format. Use numbers, spaces, dashes, or parentheses (7-18 chars).')
    .optional()
    .or(z.literal(''))
    .default(''),
  portfolioSlug: z.string().regex(/^[a-z0-9-_]*$/, 'Slug can only contain lowercase letters, numbers, dashes, and underscores').optional().default(''),
  skills: z.array(skillSchema).optional().default([]),
  socialLinks: z.array(socialSchema).optional().default([]),
});

// Helper to slugify a string
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start
    .replace(/-+$/, ''); // Trim - from end
}

export async function PUT(request: Request) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({
        status: 'error',
        message: 'Unauthorized: Access denied',
      }, { status: 401 });
    }

    const userId = auth.userId;
    const body = await request.json();
    const validation = updateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        status: 'error',
        message: validation.error.issues[0].message,
      }, { status: 400 });
    }

    const { bio, headline, location, contactNumber, skills, socialLinks } = validation.data;
    let portfolioSlug = validation.data.portfolioSlug;

    // 1. Resolve & validate custom slug
    if (!portfolioSlug) {
      // Get user name to build initial slug
      const [user] = await sql`SELECT name FROM users WHERE id = ${userId} LIMIT 1`;
      portfolioSlug = slugify(user?.name || 'developer');
    } else {
      portfolioSlug = slugify(portfolioSlug);
    }

    // Ensure slug is unique (and doesn't belong to ANOTHER user)
    let isSlugTaken = true;
    let counter = 0;
    let finalSlug = portfolioSlug;

    while (isSlugTaken) {
      const existing = await sql`
        SELECT id FROM profiles 
        WHERE portfolio_slug = ${finalSlug} AND user_id != ${userId}
        LIMIT 1
      `;
      if (existing.length === 0) {
        isSlugTaken = false;
      } else {
        counter++;
        finalSlug = `${portfolioSlug}-${counter}`;
      }
    }

    // 2. Upsert profile record
    await sql`
      INSERT INTO profiles (user_id, bio, headline, location, contact_number, portfolio_slug, updated_at)
      VALUES (${userId}, ${bio}, ${headline}, ${location}, ${contactNumber}, ${finalSlug}, NOW())
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        bio = EXCLUDED.bio, 
        headline = EXCLUDED.headline, 
        location = EXCLUDED.location, 
        contact_number = EXCLUDED.contact_number, 
        portfolio_slug = EXCLUDED.portfolio_slug, 
        updated_at = NOW()
    `;

    // 3. Synchronize Skills
    await sql`DELETE FROM skills WHERE user_id = ${userId}`;
    if (skills.length > 0) {
      for (const sk of skills) {
        await sql`
          INSERT INTO skills (user_id, skill_name, skill_level)
          VALUES (${userId}, ${sk.skillName}, ${sk.skillLevel})
        `;
      }
    }

    // 4. Synchronize Social Links
    await sql`DELETE FROM social_links WHERE user_id = ${userId}`;
    if (socialLinks.length > 0) {
      for (const link of socialLinks) {
        await sql`
          INSERT INTO social_links (user_id, platform, url)
          VALUES (${userId}, ${link.platform}, ${link.url})
        `;
      }
    }

    return NextResponse.json({
      status: 'success',
      message: 'Portfolio profile updated successfully!',
      slug: finalSlug,
    });
  } catch (error: any) {
    console.error('Update Profile API Error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'An internal server error occurred',
    }, { status: 500 });
  }
}
