import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // 1. Enable uuid extension if available (optional for newer PG versions, but good practice)
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    // 2. Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT,
        github_username VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user' NOT NULL,
        is_banned BOOLEAN DEFAULT FALSE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;

    // Ensure is_banned column exists for backward compatibility of existing user rows
    try {
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE NOT NULL`;
    } catch (e) {
      console.log('is_banned alter column might already exist:', e);
    }

    // 3. Create sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        refresh_token TEXT NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;

    // 3b. Create profiles table
    await sql`
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        bio TEXT,
        headline VARCHAR(255),
        location VARCHAR(255),
        contact_number VARCHAR(100),
        resume_url TEXT,
        profile_image TEXT,
        portfolio_slug VARCHAR(255) UNIQUE,
        ats_score INTEGER DEFAULT NULL,
        ats_analysis JSONB DEFAULT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;

    // Ensure contact_number column exists for backward compatibility of existing profiles
    try {
      await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS contact_number VARCHAR(100)`;
    } catch (e) {
      console.log('contact_number alter column might already exist:', e);
    }

    // Ensure ats_score and ats_analysis columns exist for ATS Resume Score functionality
    try {
      await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ats_score INTEGER DEFAULT NULL`;
      await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ats_analysis JSONB DEFAULT NULL`;
    } catch (e) {
      console.log('ATS alter columns might already exist:', e);
    }


    // 4. Create github_repositories table
    await sql`
      CREATE TABLE IF NOT EXISTS github_repositories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        repo_name VARCHAR(255) NOT NULL,
        stars INTEGER DEFAULT 0 NOT NULL,
        forks INTEGER DEFAULT 0 NOT NULL,
        language VARCHAR(255),
        repo_url TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;

    // 5. Create github_commits table
    await sql`
      CREATE TABLE IF NOT EXISTS github_commits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        repo_id UUID NOT NULL REFERENCES github_repositories(id) ON DELETE CASCADE,
        commit_count INTEGER DEFAULT 0 NOT NULL,
        commit_date TIMESTAMP WITH TIME ZONE NOT NULL
      );
    `;

    // 6. Create leetcode_stats table
    await sql`
      CREATE TABLE IF NOT EXISTS leetcode_stats (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        leetcode_username VARCHAR(255) NOT NULL,
        total_solved INTEGER DEFAULT 0 NOT NULL,
        easy_count INTEGER DEFAULT 0 NOT NULL,
        medium_count INTEGER DEFAULT 0 NOT NULL,
        hard_count INTEGER DEFAULT 0 NOT NULL,
        contest_rating INTEGER DEFAULT 0 NOT NULL,
        global_rank INTEGER DEFAULT 0 NOT NULL,
        streak INTEGER DEFAULT 0 NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;

    // 7. Create activity table
    await sql`
      CREATE TABLE IF NOT EXISTS activity (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        activity_type VARCHAR(255) NOT NULL,
        repo_name VARCHAR(255) NOT NULL,
        started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        ended_at TIMESTAMP WITH TIME ZONE
      );
    `;

    // 8. Create deployments table
    await sql`
      CREATE TABLE IF NOT EXISTS deployments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        project_name VARCHAR(255) NOT NULL,
        deployment_url TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'unknown' NOT NULL,
        uptime FLOAT DEFAULT 100.0 NOT NULL,
        response_time INTEGER DEFAULT 0 NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;

    // 9. Create blogs table
    await sql`
      CREATE TABLE IF NOT EXISTS blogs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        url TEXT NOT NULL,
        published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;

    // 10. Create learning table
    await sql`
      CREATE TABLE IF NOT EXISTS learning (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        skill_name VARCHAR(255) NOT NULL,
        progress INTEGER DEFAULT 0 NOT NULL CHECK (progress >= 0 AND progress <= 100),
        resource_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;

    // 11. Create logs table
    await sql`
      CREATE TABLE IF NOT EXISTS logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;

    // 12. Create certifications table
    await sql`
      CREATE TABLE IF NOT EXISTS certifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        issuer VARCHAR(255) NOT NULL,
        issue_date VARCHAR(100),
        credential_url TEXT,
        image_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;

    // 13. Create experiences table
    await sql`
      CREATE TABLE IF NOT EXISTS experiences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        company VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL,
        duration VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        technologies TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;
    // 14. Create comparisons table
    await sql`
      CREATE TABLE IF NOT EXISTS comparisons (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;

    // 15. Create comparison_users table
    await sql`
      CREATE TABLE IF NOT EXISTS comparison_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        comparison_id UUID NOT NULL REFERENCES comparisons(id) ON DELETE CASCADE,
        github_username VARCHAR(255) NOT NULL,
        avatar_url TEXT,
        followers INTEGER DEFAULT 0 NOT NULL,
        following INTEGER DEFAULT 0 NOT NULL,
        public_repos INTEGER DEFAULT 0 NOT NULL,
        stars INTEGER DEFAULT 0 NOT NULL,
        forks INTEGER DEFAULT 0 NOT NULL,
        total_contributions INTEGER DEFAULT 0 NOT NULL,
        commit_activity JSONB,
        pull_requests INTEGER DEFAULT 0 NOT NULL,
        issues INTEGER DEFAULT 0 NOT NULL,
        account_age_years FLOAT DEFAULT 0.0 NOT NULL,
        most_used_languages JSONB,
        tech_stack_analysis JSONB,
        is_shortlisted BOOLEAN DEFAULT FALSE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;

    // 16. Create comparison_reports table
    await sql`
      CREATE TABLE IF NOT EXISTS comparison_reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        comparison_id UUID UNIQUE REFERENCES comparisons(id) ON DELETE CASCADE,
        ai_insights JSONB NOT NULL,
        rankings JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;

    return NextResponse.json({
      status: 'success',
      message: 'Database tables configured successfully!',
    });
  } catch (error: any) {
    console.error('Database setup failed:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Database setup failed.',
      error: error.message || error
    }, { status: 500 });
  }
}
