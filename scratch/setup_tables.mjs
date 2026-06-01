import postgres from 'postgres';

console.log('Connecting to database...');
const sql = postgres('postgresql://postgres@localhost:5432/postgres', {
  ssl: false
});

async function main() {
  try {
    console.log('Creating comparisons table...');
    await sql`
      CREATE TABLE IF NOT EXISTS comparisons (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `;

    console.log('Creating comparison_users table...');
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
      )
    `;

    console.log('Creating comparison_reports table...');
    await sql`
      CREATE TABLE IF NOT EXISTS comparison_reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        comparison_id UUID UNIQUE REFERENCES comparisons(id) ON DELETE CASCADE,
        ai_insights JSONB NOT NULL,
        rankings JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `;

    console.log('All tables created successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error creating tables:', err);
    process.exit(1);
  }
}

main();
