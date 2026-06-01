import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/session';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch all unbanned platform users who have linked their github_username
    const platformUsers = await sql`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.github_username as "githubUsername",
        p.headline, 
        p.bio, 
        p.location, 
        p.profile_image as "avatarUrl"
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE u.is_banned = FALSE AND u.github_username IS NOT NULL AND u.github_username != ''
      ORDER BY u.name ASC
    `;

    const classifiedUsers = [];

    for (const user of platformUsers) {
      // 2. Fetch skills
      const skills = await sql`
        SELECT skill_name as name FROM skills WHERE user_id = ${user.id}
      `;

      // 3. Fetch experiences
      const experiences = await sql`
        SELECT role, duration, technologies, description FROM experiences WHERE user_id = ${user.id}
      `;

      // Calculate total years of experience
      const parsedYears = experiences.reduce((sum, e: any) => {
        const dur = e.duration || '';
        const lower = dur.toLowerCase();
        
        const numericMatch = lower.match(/(\d+(\.\d+)?)\s*(year|yr|month|mon|wk|week)/i);
        if (numericMatch) {
          const val = parseFloat(numericMatch[1]);
          const unit = numericMatch[3].toLowerCase();
          if (unit.startsWith('month') || unit.startsWith('mon')) return sum + (val / 12);
          if (unit.startsWith('week') || unit.startsWith('wk')) return sum + (val / 52);
          return sum + val;
        }
        
        const years = lower.match(/\b(20\d{2}|19\d{2})\b/g);
        if (years && years.length > 0) {
          const startYear = parseInt(years[0]);
          let endYear = new Date().getFullYear();
          if (years.length > 1) {
            endYear = parseInt(years[1]);
          } else if (lower.includes('present') || lower.includes('current') || lower.includes('now')) {
            endYear = new Date().getFullYear();
          } else {
            return sum + 1;
          }
          return sum + Math.max(0.5, endYear - startYear);
        }
        return sum + 0.5;
      }, 0);

      const expYears = parseFloat(parsedYears.toFixed(1));

      // Combine text to analyze keywords
      const skillsText = skills.map(s => s.name).join(' ');
      const expText = experiences.map(e => `${e.role} ${e.technologies} ${e.description}`).join(' ');
      const headlineText = user.headline || '';
      const combinedProfileText = `${skillsText} ${expText} ${headlineText}`.toLowerCase();

      // Taxonomy Classification
      const categories: string[] = [];

      const matchesFrontend = combinedProfileText.match(/(frontend|front-end|react|vue|angular|svelte|next\.js|nextjs|css|html|ui\/ux|tailwind|javascript|js|typescript|ts)/i);
      const matchesBackend = combinedProfileText.match(/(backend|back-end|node|express|nest|go|golang|python|django|flask|ruby|rails|php|laravel|postgres|sql|mongo|redis|java|spring|c#|\.net|api)/i);
      const matchesFullStack = combinedProfileText.match(/(fullstack|full-stack|full stack|generalist)/i);
      const matchesAIML = combinedProfileText.match(/(ai|ml|machine learning|artificial intelligence|pytorch|tensorflow|keras|llm|deep learning|nlp|data science|pandas|numpy)/i);
      const matchesDevOps = combinedProfileText.match(/(devops|dev-ops|docker|kubernetes|k8s|aws|gcp|azure|terraform|jenkins|ci\/cd|github actions|nginx|linux|ansible|sysadmin)/i);

      if (matchesFrontend) categories.push('Frontend');
      if (matchesBackend) categories.push('Backend');
      if (matchesFullStack || (matchesFrontend && matchesBackend)) categories.push('Full Stack');
      if (matchesAIML) categories.push('AI/ML');
      if (matchesDevOps) categories.push('DevOps');

      // Fallback classification if profile is sparse (assign based on simple alphabetical hash)
      if (categories.length === 0) {
        const fallbacks = ['Frontend', 'Backend', 'Full Stack'];
        const hash = user.name.charCodeAt(0) % fallbacks.length;
        categories.push(fallbacks[hash]);
      }

      classifiedUsers.push({
        id: user.id,
        name: user.name,
        email: user.email,
        githubUsername: user.githubUsername,
        headline: user.headline || 'Software Developer',
        bio: user.bio || 'Platform Developer Profile',
        location: user.location || 'Distributed',
        avatarUrl: user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.githubUsername}`,
        categories,
        expYears
      });
    }

    return NextResponse.json({
      status: 'success',
      users: classifiedUsers
    });

  } catch (error: any) {
    console.error('Compare Users retrieval API error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to retrieve comparison developers.',
      error: error.message || error
    }, { status: 500 });
  }
}
