import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getAuthUser } from '@/lib/auth/session';

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

export async function POST() {
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

    // 1. Fetch user & profile data
    const [user] = await sql`
      SELECT id, name, email, github_username as "githubUsername"
      FROM users
      WHERE id = ${userId}
      LIMIT 1
    `;

    const [profile] = await sql`
      SELECT bio, headline, location, contact_number as "contactNumber", resume_url as "resumeUrl"
      FROM profiles
      WHERE user_id = ${userId}
      LIMIT 1
    `;

    // 2. Fetch linked data sections
    const skills = await sql`
      SELECT skill_name as "skillName", skill_level as "skillLevel"
      FROM skills
      WHERE user_id = ${userId}
    `;

    const experiences = await sql`
      SELECT role, duration, description, technologies
      FROM experiences
      WHERE user_id = ${userId}
    `;

    const certifications = await sql`
      SELECT title, issuer
      FROM certifications
      WHERE user_id = ${userId}
    `;

    const repos = await sql`
      SELECT repo_name
      FROM github_repositories
      WHERE user_id = ${userId}
    `;

    const socialLinks = await sql`
      SELECT platform, url
      FROM social_links
      WHERE user_id = ${userId}
    `;

    // 3. ATS Scoring Engine
    let score = 0;
    const breakdown = {
      contact: 0,
      skills: 0,
      experience: 0,
      education: 0,
      certifications: 0,
      projects: 0,
      githubConnected: 0,
      linkedinConnected: 0,
      resumeUploaded: 0,
      keywords: 0
    };

    const strengths: string[] = [];
    const missingElements: string[] = [];
    const suggestions: string[] = [];

    // --- A. Contact Info Section (Max 10 pts) ---
    if (profile) {
      if (profile.headline && profile.headline.trim()) {
        breakdown.contact += 3;
        strengths.push('Professional headline is defined.');
      } else {
        missingElements.push('Professional headline is blank.');
        suggestions.push('Define a clear, role-specific professional headline (e.g. Senior Frontend Engineer).');
      }

      if (profile.location && profile.location.trim()) {
        breakdown.contact += 2;
        strengths.push('Location is specified, showing geographic readiness.');
      } else {
        missingElements.push('Location is missing.');
        suggestions.push('Add your city/country or specify "Remote" to pass location filters.');
      }

      if (profile.contactNumber && profile.contactNumber.trim()) {
        breakdown.contact += 3;
        strengths.push('Contact phone number is provided.');
      } else {
        missingElements.push('Direct contact phone number is missing.');
        suggestions.push('Add a valid telephone contact number so recruiters can reach you easily.');
      }

      if (profile.bio && profile.bio.trim().length > 20) {
        breakdown.contact += 2;
        strengths.push('Short professional biography is populated.');
      } else {
        missingElements.push('Professional biography is empty or too short.');
        suggestions.push('Expand your biography to briefly outline your career focus and core value proposition.');
      }
    } else {
      missingElements.push('Profile record is completely empty.');
      suggestions.push('Complete your portfolio profile details (headline, location, contact, bio).');
    }
    score += breakdown.contact;

    // --- B. Skills Section (Max 15 pts) ---
    const skillsCount = skills.length;
    if (skillsCount >= 7) {
      breakdown.skills = 15;
      strengths.push('Robust skills inventory populated (7+ active skills).');
    } else if (skillsCount >= 4) {
      breakdown.skills = 10;
      strengths.push('Favorable skills listing defined.');
      suggestions.push('Add a few more skills (aim for 7+) to cover extra recruiter technical queries.');
    } else if (skillsCount >= 1) {
      breakdown.skills = 5;
      strengths.push('Basic technical skills configured.');
      suggestions.push('Add more comprehensive core skills (aim for 7+) to improve keyword hits.');
    } else {
      missingElements.push('Core technical skills section is entirely empty.');
      suggestions.push('Add at least 5 core technical skill tags with proficiency levels.');
    }
    score += breakdown.skills;

    // --- C. Experience Section (Max 20 pts) ---
    const expCount = experiences.length;
    if (expCount >= 2) {
      breakdown.experience = 20;
      strengths.push('Comprehensive career history provided (2+ roles details).');
    } else if (expCount === 1) {
      breakdown.experience = 10;
      strengths.push('Work experience timeline initialized.');
      suggestions.push('Add your previous work or internship history to construct a more robust career timeline.');
    } else {
      missingElements.push('Work experience and history list is completely empty.');
      suggestions.push('Add at least 1-2 detailed work experience roles including responsibilities.');
    }
    score += breakdown.experience;

    // --- D. Education Evaluation in Bio (Max 10 pts) ---
    const bioText = (profile?.bio || '').toLowerCase();
    const educationKeywords = ['degree', 'university', 'college', 'bachelor', 'master', 'phd', 'b.tech', 'b.s', 'm.s', 'computer science', 'engineering', 'education', 'diploma'];
    const hasEducation = educationKeywords.some(keyword => bioText.includes(keyword));
    if (hasEducation) {
      breakdown.education = 10;
      strengths.push('Educational history or formal academic credentials detected.');
    } else {
      missingElements.push('Academic credentials or degrees not recognized in biography.');
      suggestions.push('State your highest university degree or academic qualifications clearly inside your bio.');
    }
    score += breakdown.education;

    // --- E. Certifications Section (Max 10 pts) ---
    const certCount = certifications.length;
    if (certCount > 0) {
      const certPoints = Math.min(10, certCount * 2);
      breakdown.certifications = certPoints;
      strengths.push(`Verifiable industry certifications added (${certCount} active badges).`);
      if (certPoints < 10) {
        suggestions.push('Add additional certifications or professional badges to maximize credentials weight.');
      }
    } else {
      missingElements.push('Professional certifications / credentials section is empty.');
      suggestions.push('Include relevant certificates, training courses, or coding bootcamps to stand out.');
    }
    score += breakdown.certifications;

    // --- F. Projects Showcase (Max 10 pts) ---
    const repoCount = repos.length;
    if (repoCount > 0) {
      const projectPoints = Math.min(10, repoCount * 2);
      breakdown.projects = projectPoints;
      strengths.push(`Active synchronized repository projects visible (${repoCount} synced repos).`);
      if (projectPoints < 10) {
        suggestions.push('Sync additional prominent GitHub projects to enrich your portfolio.');
      }
    } else {
      missingElements.push('Synchronized GitHub projects / repositories showcase is empty.');
      suggestions.push('Synchronize your top GitHub public repositories to display hands-on work.');
    }
    score += breakdown.projects;

    // --- G. GitHub Profile Connected (Max 5 pts) ---
    if (user?.githubUsername && user.githubUsername.trim()) {
      breakdown.githubConnected = 5;
      strengths.push('Open source GitHub developer account linked.');
    } else {
      missingElements.push('GitHub developer handle is not connected.');
      suggestions.push('Connect your GitHub account to sync your public activities and contributions.');
    }
    score += breakdown.githubConnected;

    // --- H. LinkedIn Connected (Max 5 pts) ---
    const hasLinkedIn = socialLinks.some((link: any) => 
      (link.platform || '').toLowerCase() === 'linkedin' || 
      (link.url || '').toLowerCase().includes('linkedin.com')
    );
    if (hasLinkedIn) {
      breakdown.linkedinConnected = 5;
      strengths.push('Professional LinkedIn network profile is connected.');
    } else {
      missingElements.push('LinkedIn network link is missing.');
      suggestions.push('Add your professional LinkedIn profile URL to your social networks list.');
    }
    score += breakdown.linkedinConnected;

    // --- I. Resume Uploaded (Max 10 pts) ---
    if (profile?.resumeUrl && profile.resumeUrl.trim()) {
      breakdown.resumeUploaded = 10;
      strengths.push('Standard resume document (PDF/Word) is uploaded.');
    } else {
      missingElements.push('No resume file has been uploaded.');
      suggestions.push('Upload a printable resume file (PDF/DOCX) for direct recruiter review.');
    }
    score += breakdown.resumeUploaded;

    // --- J. Industry Keywords Match (Max 5 pts) ---
    const skillsText = skills.map((s: any) => s.skillName).join(' ');
    const expText = experiences.map((e: any) => `${e.role} ${e.technologies} ${e.description}`).join(' ');
    const combinedFullText = `${skillsText} ${expText} ${profile?.bio || ''} ${profile?.headline || ''}`.toLowerCase();
    
    const keywordsList = ['react', 'node', 'typescript', 'sql', 'git', 'docker', 'api', 'testing', 'aws', 'python', 'javascript', 'frontend', 'backend', 'fullstack', 'ci/cd'];
    let matchedKeywordsCount = 0;
    
    keywordsList.forEach(kw => {
      if (combinedFullText.includes(kw)) matchedKeywordsCount++;
    });

    const keywordPoints = Math.min(5, Math.round(matchedKeywordsCount * 0.5));
    breakdown.keywords = keywordPoints;
    if (keywordPoints >= 4) {
      strengths.push('Role-relevant technical keywords optimized for ATS engines.');
    } else {
      suggestions.push('Weave more modern industry terms (e.g. AWS, CI/CD, APIs, Testing) into experience bullet points.');
    }
    score += breakdown.keywords;

    // Dynamic analysis structure
    const analysis = {
      strengths,
      missingElements,
      suggestions,
      breakdown
    };

    // Save computed score to profiles table
    await sql`
      INSERT INTO profiles (user_id, ats_score, ats_analysis, updated_at)
      VALUES (${userId}, ${score}, ${JSON.stringify(analysis)}, NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET ats_score = EXCLUDED.ats_score, ats_analysis = EXCLUDED.ats_analysis, updated_at = NOW()
    `;

    return NextResponse.json({
      status: 'success',
      score,
      analysis
    }, {
      headers: corsHeaders
    });

  } catch (error: any) {
    console.error('ATS Recalculate API Error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to calculate and store ATS score'
    }, {
      status: 500,
      headers: corsHeaders
    });
  }
}
