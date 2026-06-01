import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/session';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // 1. Fetch all unbanned platform users who have linked their github_username and have a public portfolio slug
    const platformUsers = await sql`
      SELECT 
        u.id, 
        u.name, 
        u.github_username as "githubUsername",
        p.headline, 
        p.bio, 
        p.location, 
        p.profile_image as "avatarUrl",
        p.resume_url as "resumeUrl",
        p.ats_score as "atsScore",
        p.ats_analysis as "atsAnalysis",
        p.portfolio_slug as "portfolioSlug",
        (SELECT COUNT(*) FROM skills WHERE user_id = u.id) as "skillsCount",
        (SELECT ARRAY_AGG(skill_name) FROM (SELECT skill_name FROM skills WHERE user_id = u.id ORDER BY created_at ASC LIMIT 6) s) as "topSkills",
        (SELECT COUNT(*) FROM experiences WHERE user_id = u.id) as "experiencesCount",
        (SELECT COUNT(*) FROM certifications WHERE user_id = u.id) as "certificationsCount",
        (SELECT COALESCE(SUM(stars), 0) FROM github_repositories WHERE user_id = u.id) as "starsTally",
        (SELECT COALESCE(SUM(forks), 0) FROM github_repositories WHERE user_id = u.id) as "forksTally",
        (SELECT COUNT(*) FROM github_repositories WHERE user_id = u.id) as "reposCount",
        (SELECT COALESCE(SUM(commit_count), 0) FROM github_commits WHERE user_id = u.id) as "contributionsTally",
        ls.total_solved as "lcSolved",
        ls.medium_count as "lcMedium",
        ls.hard_count as "lcHard"
      FROM users u
      INNER JOIN profiles p ON u.id = p.user_id
      LEFT JOIN leetcode_stats ls ON u.id = ls.user_id
      WHERE u.is_banned = FALSE 
        AND u.github_username IS NOT NULL AND u.github_username != ''
        AND p.portfolio_slug IS NOT NULL AND p.portfolio_slug != ''
      ORDER BY u.name ASC
    `;

    const classifiedUsers = [];

    for (const user of platformUsers) {
      // 2. Fetch all skills for categorization taxonomy
      const skills = await sql`
        SELECT skill_name as name FROM skills WHERE user_id = ${user.id}
      `;

      // 3. Fetch experiences for durational calculations
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

      // Combine text to analyze keywords for Specialty Taxonomy
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

      // Pre-calculate Advanced Hiring Score (0-100) exactly as in the AI Compare Route
      const contributionsTally = parseInt(user.contributionsTally || 0);
      const reposCount = parseInt(user.reposCount || 0);
      const starsTally = parseInt(user.starsTally || 0);
      const forksTally = parseInt(user.forksTally || 0);
      const certificationsCount = parseInt(user.certificationsCount || 0);
      const experiencesCount = parseInt(user.experiencesCount || 0);
      const skillsCount = parseInt(user.skillsCount || 0);
      const lcSolved = user.lcSolved !== null ? parseInt(user.lcSolved) : null;
      const lcMedium = parseInt(user.lcMedium || 0);
      const lcHard = parseInt(user.lcHard || 0);

      const githubScore = Math.min(100, (contributionsTally * 0.15) + (reposCount * 1.5) + (reposCount * 1.0));
      const lcScore = lcSolved !== null
        ? Math.min(100, (lcSolved * 0.25) + (lcMedium * 0.5) + (lcHard * 1.0))
        : 45; // Neutral base for candidates without LeetCode linked
      const projectScore = Math.min(100, (starsTally * 0.5) + (forksTally * 1.0) + 30);
      const certsScore = Math.min(100, (certificationsCount * 25) + 30);
      const expScore = Math.min(100, (experiencesCount * 25) + 30);
      const completeness = 50 + 
        (skillsCount ? 20 : 0) + 
        (certificationsCount ? 15 : 0) + 
        (experiencesCount ? 15 : 0);
      const skillsScore = Math.min(100, skillsCount * 10 + 40);

      const hiringScore = Math.round(
        (githubScore * 0.25) +
        (lcScore * 0.20) +
        (projectScore * 0.20) +
        (certsScore * 0.10) +
        (expScore * 0.10) +
        (completeness * 0.10) +
        (skillsScore * 0.05)
      );

      // On-the-fly ATS scoring fallback if not pre-calculated
      let finalAtsScore = user.atsScore;
      let finalAtsAnalysis = user.atsAnalysis;

      if (finalAtsScore === null || finalAtsScore === undefined) {
        let tempScore = 40; // Base score
        const tempStrengths: string[] = ['Open source GitHub developer account linked.'];
        const tempMissing: string[] = [];
        const tempSuggestions: string[] = [];

        if (user.headline) { tempScore += 5; tempStrengths.push('Professional headline configured.'); }
        else { tempMissing.push('Professional headline is blank.'); }

        if (user.location) { tempScore += 5; tempStrengths.push('Location is specified.'); }
        else { tempMissing.push('Location is missing.'); }

        if (skillsCount > 0) { tempScore += Math.min(15, skillsCount * 2.5); tempStrengths.push('Technical skills declared.'); }
        else { tempMissing.push('Skills are empty.'); }

        if (experiencesCount > 0) { tempScore += Math.min(20, experiencesCount * 10); tempStrengths.push('Experience history provided.'); }
        else { tempMissing.push('Experience history is blank.'); }

        if (user.resumeUrl) { tempScore += 15; tempStrengths.push('Resume document uploaded.'); }
        else { tempMissing.push('No resume file has been uploaded.'); }

        const kws = ['react', 'node', 'typescript', 'sql', 'git', 'docker', 'api', 'testing', 'aws', 'python', 'javascript'];
        let matchedKw = 0;
        kws.forEach(kw => { if (combinedProfileText.includes(kw)) matchedKw++; });
        tempScore += Math.min(5, matchedKw * 0.5);

        finalAtsScore = Math.min(100, Math.round(tempScore));
        finalAtsAnalysis = {
          strengths: tempStrengths,
          missingElements: tempMissing,
          suggestions: tempSuggestions,
          breakdown: { contact: 10, skills: 10, experience: 10, education: 5, certifications: 5, projects: 5, githubConnected: 5, linkedinConnected: 5, resumeUploaded: 5, keywords: 5 }
        };
      }

      // Determine openToWork status deterministically
      const openToWork = (reposCount > 0) && (contributionsTally > 0 || skillsCount > 3);

      classifiedUsers.push({
        id: user.id,
        name: user.name,
        githubUsername: user.githubUsername,
        headline: user.headline || 'Software Developer',
        bio: user.bio || 'Platform Developer Profile',
        location: user.location || 'Distributed',
        avatarUrl: user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.githubUsername}`,
        categories,
        expYears,
        atsScore: finalAtsScore,
        atsAnalysis: finalAtsAnalysis,
        portfolioSlug: user.portfolioSlug,
        skills: user.topSkills || [],
        hiringScore,
        openToWork
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
