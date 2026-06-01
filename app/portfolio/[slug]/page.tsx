import React from 'react';
import { notFound } from 'next/navigation';
import { sql } from '@/lib/db';
import { MapPin, Globe, FileText, User, ArrowLeft, Briefcase, Award, Calendar, ExternalLink, Phone } from 'lucide-react';
import Github from '@/components/icons/Github';
import Linkedin from '@/components/icons/Linkedin';
import Twitter from '@/components/icons/Twitter';
import Link from 'next/link';
import GithubActivity from '@/components/portfolio/GithubActivity';

interface Skill {
  skill_name: string;
  skill_level: number;
}

interface SocialLink {
  platform: string;
  url: string;
}

interface ProfileRecord {
  id: string;
  user_id: string;
  bio: string;
  headline: string;
  location: string;
  resume_url: string;
  profile_image: string;
  portfolio_slug: string;
  name: string;
  email: string;
  github_username: string | null;
  contact_number: string | null;
}

interface CertificationRecord {
  id: string;
  title: string;
  issuer: string;
  issue_date: string;
  credential_url: string;
  image_url: string;
}

interface ExperienceRecord {
  id: string;
  company: string;
  role: string;
  duration: string;
  description: string;
  technologies: string;
}

// Generate dynamic SEO metadata matching the developer's name and headline
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const [profile] = await sql`
    SELECT p.headline, u.name 
    FROM profiles p
    INNER JOIN users u ON p.user_id = u.id
    WHERE p.portfolio_slug = ${slug}
    LIMIT 1
  `;

  if (!profile) {
    return {
      title: 'Developer Portfolio',
      description: 'View this professional developer portfolio.',
    };
  }

  return {
    title: `${profile.name} - Developer Portfolio`,
    description: profile.headline 
      ? `${profile.name} - ${profile.headline}. View skills, experience, biography, and professional resume.`
      : `Professional developer portfolio of ${profile.name}.`,
  };
}

export default async function PublicPortfolioPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;

  // 1. Fetch user profile
  const [profile] = (await sql`
    SELECT 
      p.id, p.user_id, p.bio, p.headline, p.location, p.resume_url, p.profile_image, p.portfolio_slug, p.contact_number, p.ats_score, p.ats_analysis,
      u.name, u.email, u.github_username
    FROM profiles p
    INNER JOIN users u ON p.user_id = u.id
    WHERE p.portfolio_slug = ${slug}
    LIMIT 1
  `) as (ProfileRecord & { ats_score?: number | null; ats_analysis?: any })[];

  if (!profile) {
    notFound();
  }

  // 2. Fetch skills
  const skills = (await sql`
    SELECT skill_name, skill_level 
    FROM skills 
    WHERE user_id = ${profile.user_id}
    ORDER BY created_at ASC
  `) as Skill[];

  // 3. Fetch social links
  const socialLinks = (await sql`
    SELECT platform, url 
    FROM social_links 
    WHERE user_id = ${profile.user_id}
    ORDER BY created_at ASC
  `) as SocialLink[];

  // 4. Fetch certifications
  const certifications = (await sql`
    SELECT id, title, issuer, issue_date as "issue_date", credential_url as "credential_url", image_url as "image_url"
    FROM certifications
    WHERE user_id = ${profile.user_id}
    ORDER BY created_at DESC
  `) as CertificationRecord[];

  // 5. Fetch experiences
  const experiences = (await sql`
    SELECT id, company, role, duration, description, technologies
    FROM experiences
    WHERE user_id = ${profile.user_id}
    ORDER BY created_at DESC
  `) as ExperienceRecord[];

  // Resolve ATS Score on-the-fly if not already calculated
  let atsScore = profile.ats_score;
  let atsAnalysis = profile.ats_analysis;

  if (atsScore === null || atsScore === undefined) {
    let tempScore = 40; // Base score
    const strengthsList: string[] = [];

    if (profile.headline && profile.headline.trim()) { tempScore += 5; strengthsList.push('Professional headline is defined.'); }
    if (profile.location && profile.location.trim()) { tempScore += 5; strengthsList.push('Location is specified.'); }
    if (profile.contact_number && profile.contact_number.trim()) { tempScore += 5; strengthsList.push('Contact information is provided.'); }

    if (skills.length >= 7) { tempScore += 15; strengthsList.push('Robust skills inventory populated.'); }
    else if (skills.length > 0) { tempScore += 10; strengthsList.push('Technical skills cataloged.'); }

    if (experiences.length >= 2) { tempScore += 20; strengthsList.push('Comprehensive work history included.'); }
    else if (experiences.length === 1) { tempScore += 10; strengthsList.push('Professional timeline initialized.'); }

    const bioText = (profile.bio || '').toLowerCase();
    const educationKeywords = ['degree', 'university', 'college', 'bachelor', 'master', 'phd', 'b.tech', 'b.s', 'm.s', 'computer science', 'engineering', 'education', 'diploma'];
    if (educationKeywords.some(kw => bioText.includes(kw))) { tempScore += 10; strengthsList.push('Educational qualifications declared.'); }

    if (certifications.length > 0) { tempScore += Math.min(10, certifications.length * 2); strengthsList.push('Industry certifications verified.'); }

    if (profile.github_username && profile.github_username.trim()) { tempScore += 5; strengthsList.push('GitHub developer account linked.'); }

    const hasLinkedIn = socialLinks.some((l: any) => (l.platform || '').toLowerCase() === 'linkedin' || (l.url || '').toLowerCase().includes('linkedin.com'));
    if (hasLinkedIn) { tempScore += 5; strengthsList.push('LinkedIn network profile connected.'); }

    if (profile.resume_url && profile.resume_url.trim()) { tempScore += 15; strengthsList.push('Printable resume document uploaded.'); }

    atsScore = Math.min(100, Math.round(tempScore));
    atsAnalysis = {
      strengths: strengthsList.length > 0 ? strengthsList : ['Profile successfully set up.'],
      missingElements: [],
      suggestions: []
    };
  }

  // Social icon mapper
  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'github':
        return <Github className="h-5 w-5" />;
      case 'linkedin':
        return <Linkedin className="h-5 w-5" />;
      case 'twitter':
        return <Twitter className="h-5 w-5" />;
      default:
        return <Globe className="h-5 w-5" />;
    }
  };

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white font-sans relative overflow-hidden flex flex-col justify-center py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      {/* Mesh gradients */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl" aria-hidden="true">
        <div
          className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-cyan-500 to-indigo-600 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>

      <div className="mx-auto max-w-5xl w-full z-10 space-y-8">
        
        {/* Back navigation */}
        <div className="flex justify-between items-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        {/* Profile Card Header */}
        <header className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/40 p-8 backdrop-blur-md shadow-md dark:shadow-xl flex flex-col md:flex-row items-center text-center md:text-left gap-6">
          {/* Avatar Preview */}
          <div className="h-28 w-28 rounded-full bg-zinc-100 dark:bg-zinc-950 border-2 border-cyan-500/20 overflow-hidden flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0 shadow-lg">
            {profile.profile_image ? (
              <img src={profile.profile_image} alt={profile.name} className="h-full w-full object-cover" />
            ) : (
              <User className="h-12 w-12" />
            )}
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
                {profile.name}
              </h1>
              <p className="text-lg font-semibold text-cyan-600 dark:text-cyan-400 mt-1">{profile.headline || 'Software Engineer'}</p>
            </div>

            <div className="flex flex-wrap gap-3 justify-center md:justify-start text-xs text-zinc-650 dark:text-zinc-400 font-medium">
              <span className="flex items-center gap-1 bg-zinc-100/50 dark:bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80">
                <MapPin className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
                {profile.location || 'Remote'}
              </span>
              <span className="flex items-center gap-1 bg-zinc-100/50 dark:bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80">
                <Globe className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
                {profile.email}
              </span>
              {profile.contact_number && (
                <span className="flex items-center gap-1 bg-zinc-100/50 dark:bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80">
                  <Phone className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
                  {profile.contact_number}
                </span>
              )}
            </div>
          </div>

          {/* Social Platforms links & Open to Work */}
          <div className="flex flex-col items-center md:items-end gap-2.5 shrink-0 self-center md:self-end pb-1">
            {/* Animated Blue "Open to Work" Indicator */}
            <span className="inline-flex items-center gap-1.5 text-[9px] font-extrabold tracking-wider uppercase text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full shadow-sm animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping"></span>
              Open to Work
            </span>

            {socialLinks.length > 0 && (
              <div className="flex gap-2.5">
                {socialLinks.map((link) => (
                  <a
                    key={link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-950 hover:bg-cyan-600 hover:text-white text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-850 hover:border-cyan-500 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all active:scale-[0.95]"
                    title={link.platform}
                    id={`social-${link.platform.toLowerCase()}`}
                  >
                    {getSocialIcon(link.platform)}
                  </a>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Dynamic Detail grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left bio column */}
          <section className="md:col-span-2 space-y-6">
            
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/30 p-8 backdrop-blur-sm space-y-4 shadow-sm dark:shadow-none">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <User className="h-5 w-5 text-cyan-550 dark:text-cyan-400" />
                About Me
              </h2>
              <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
                {profile.bio || 'This developer has not filled out their biography details yet.'}
              </p>
            </div>

            {/* Embedded Resume View/Download */}
            {profile.resume_url && (
              <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/30 p-8 backdrop-blur-sm space-y-4 shadow-sm dark:shadow-none">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-cyan-550 dark:text-cyan-400" />
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                      Professional Resume
                    </h2>
                  </div>
                  
                  <div className="flex items-center gap-2.5">
                    <a
                      href={profile.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-950 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-all active:scale-[0.98]"
                    >
                      View Resume
                    </a>
                    
                    <a
                      href={profile.resume_url}
                      download={`Resume-${profile.name}.pdf`}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-xs font-bold text-white transition-all shadow-md active:scale-[0.98]"
                    >
                      Download Resume
                    </a>
                  </div>
                </div>
                
                <p className="text-xs text-zinc-500 leading-normal">
                  Select "View Resume" to open the document inside your browser in a new tab, or "Download Resume" to save a copy directly to your system files.
                </p>
              </section>
            )}

            {/* Certifications Section */}
            {certifications.length > 0 && (
              <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/30 p-8 backdrop-blur-sm space-y-6 shadow-sm dark:shadow-none">
                <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
                  <Award className="h-5 w-5 text-cyan-555 dark:text-cyan-400" />
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                    Certifications & Credentials
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {certifications.map((cert) => (
                    <div 
                      key={cert.id} 
                      className="group rounded-xl border border-zinc-200 dark:border-zinc-850 hover:border-cyan-500/30 bg-zinc-100/50 dark:bg-zinc-900/20 hover:bg-cyan-955/[0.02] p-5 transition-all hover:translate-y-[-2px] flex gap-4 shadow-sm hover:shadow-md"
                    >
                      {/* Badge preview */}
                      <div className="w-14 h-14 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-950 shrink-0 flex items-center justify-center shadow-inner animate-fade-in">
                        {cert.image_url ? (
                          <img src={cert.image_url} alt={cert.title} className="w-full h-full object-cover" />
                        ) : (
                          <Award className="h-6 w-6 text-zinc-650" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <h4 className="text-xs font-extrabold text-zinc-900 dark:text-white truncate" title={cert.title}>
                          {cert.title}
                        </h4>
                        <p className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 truncate">
                          {cert.issuer}
                        </p>
                        
                        <div className="flex items-center gap-3 pt-2 text-[9px] text-zinc-500 font-semibold">
                          {cert.issue_date && (
                            <span className="flex items-center gap-0.5">
                              <Calendar className="h-3 w-3 text-cyan-500" />
                              {cert.issue_date}
                            </span>
                          )}
                          
                          {cert.credential_url && (
                            <a
                              href={cert.credential_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-0.5 text-zinc-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                            >
                              Verify Link
                              <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Experience Section */}
            {experiences.length > 0 && (
              <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/30 p-8 backdrop-blur-sm space-y-6 shadow-sm dark:shadow-none">
                <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
                  <Briefcase className="h-5 w-5 text-cyan-555 dark:text-cyan-400" />
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                    Professional Work History
                  </h2>
                </div>

                <div className="space-y-6">
                  {experiences.map((exp) => (
                    <div 
                      key={exp.id} 
                      className="group rounded-xl border border-zinc-200 dark:border-zinc-850 bg-zinc-100/50 dark:bg-zinc-900/10 p-6 transition-all hover:bg-cyan-955/[0.01] hover:border-cyan-500/20 relative space-y-3 shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-extrabold text-zinc-900 dark:text-white">
                            {exp.role}
                          </h4>
                          <p className="text-xs font-bold text-cyan-600 dark:text-cyan-400 mt-0.5">
                            {exp.company}
                          </p>
                        </div>

                        <div className="inline-flex items-center gap-1 text-[9px] text-zinc-500 font-bold bg-zinc-150 dark:bg-zinc-950/60 px-3 py-1.5 rounded-full border border-zinc-250 dark:border-zinc-800/80 self-start sm:self-center">
                          <Calendar className="h-3 w-3 text-cyan-500" />
                          {exp.duration}
                        </div>
                      </div>

                      <p className="text-xs text-zinc-650 dark:text-zinc-300 leading-relaxed whitespace-pre-line font-medium">
                        {exp.description}
                      </p>

                      {exp.technologies && (
                        <div className="flex flex-wrap gap-1.5 pt-3 border-t border-zinc-200/50 dark:border-zinc-900">
                          {exp.technologies.split(',').map((tech) => {
                            const trimmedTech = tech.trim();
                            if (!trimmedTech) return null;
                            return (
                              <span 
                                key={trimmedTech} 
                                className="inline-flex items-center gap-1 rounded-md bg-cyan-400/5 px-2.5 py-1 text-[9px] font-bold text-cyan-600 dark:text-cyan-400 ring-1 ring-inset ring-cyan-500/10"
                              >
                                <Globe className="h-2.5 w-2.5" />
                                {trimmedTech}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

          </section>

          {/* Right skills column */}
          <aside className="space-y-6">
            
            <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/30 p-8 backdrop-blur-sm space-y-6 shadow-sm dark:shadow-none">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <Award className="h-5 w-5 text-cyan-550 dark:text-cyan-400" />
                Core Expertise
              </h2>
              
              {skills.length === 0 ? (
                <p className="text-xs text-zinc-500">Expertise tags have not been configured yet.</p>
              ) : (
                <div className="space-y-5">
                  {skills.map((sk) => (
                    <div key={sk.skill_name} className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        <span>{sk.skill_name}</span>
                        <span className="text-cyan-600 dark:text-cyan-400">
                          {sk.skill_level <= 50 ? 'Good' : sk.skill_level <= 80 ? 'Intermediate' : 'Best'} ({sk.skill_level}%)
                        </span>
                      </div>
                      <div className="w-full bg-zinc-100 dark:bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-900">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full"
                          style={{ width: `${sk.skill_level}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ATS Resume Score Card */}
            {atsScore !== undefined && atsScore !== null && (
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/30 p-6 backdrop-blur-sm space-y-4 shadow-sm dark:shadow-none">
                <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <FileText className="h-4 w-4 text-cyan-500" />
                  ATS Resume Score
                </h2>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Completeness Score</span>
                  <span className="text-xl font-extrabold text-cyan-600 dark:text-cyan-400 font-mono">{atsScore}/100</span>
                </div>
                <div className="w-full bg-zinc-150 dark:bg-zinc-950 h-2.5 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-900">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-full rounded-full"
                    style={{ width: `${atsScore}%` }}
                  />
                </div>
                {atsAnalysis && atsAnalysis.strengths && atsAnalysis.strengths.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Key Strengths</span>
                    <ul className="text-[10px] text-zinc-650 dark:text-zinc-400 space-y-1 font-semibold">
                      {atsAnalysis.strengths.slice(0, 3).map((strength: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-1">
                          <span className="text-emerald-500 font-bold">✓</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}



          </aside>

        </div>

        {/* Live GitHub Consistency & Analytics Showcase */}
        <GithubActivity githubUsername={profile.github_username} />

      </div>
    </main>
  );
}
