import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { setAuthCookies } from '@/lib/auth/utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/unauthorized?error=Missing+OAuth+code`);
    }

    const client_id = process.env.GITHUB_CLIENT_ID;
    const client_secret = process.env.GITHUB_CLIENT_SECRET;

    if (!client_id || !client_secret) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/unauthorized?error=OAuth+not+configured`);
    }

    // 1. Exchange authorization code for GitHub access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id,
        client_secret,
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/github/callback`,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('GitHub token exchange error:', tokenData.error_description);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/unauthorized?error=Token+exchange+failed`);
    }

    const githubAccessToken = tokenData.access_token;

    // 2. Fetch user details from GitHub profile API
    const userProfileResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${githubAccessToken}`,
        'User-Agent': 'NextJS-Auth-Foundation',
      },
    });

    const profileData = await userProfileResponse.json();
    const githubUsername = profileData.login;
    const name = profileData.name || profileData.login;

    // 3. Fetch primary email from GitHub emails API (to support private email configs)
    const emailsResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${githubAccessToken}`,
        'User-Agent': 'NextJS-Auth-Foundation',
      },
    });

    const emailsData = await emailsResponse.json();
    let primaryEmail = profileData.email;

    if (Array.isArray(emailsData)) {
      const primaryEmailObj = emailsData.find((email: any) => email.primary && email.verified) || emailsData[0];
      if (primaryEmailObj) {
        primaryEmail = primaryEmailObj.email;
      }
    }

    if (!primaryEmail) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/unauthorized?error=No+verified+email+found+on+GitHub`
      );
    }

    const normalizedEmail = primaryEmail.toLowerCase().trim();

    // 4. Find or create user in our database
    let [user] = await sql`
      SELECT id, name, role, github_username FROM users WHERE email = ${normalizedEmail} LIMIT 1
    `;

    if (user) {
      // User exists, update github_username if not already linked
      if (!user.github_username) {
        const [updatedUser] = await sql`
          UPDATE users 
          SET github_username = ${githubUsername}, updated_at = NOW() 
          WHERE id = ${user.id}
          RETURNING id, name, role
        `;
        user = updatedUser;
      }
    } else {
      // User does not exist, auto-create account
      const [newUser] = await sql`
        INSERT INTO users (name, email, github_username, role)
        VALUES (${name}, ${normalizedEmail}, ${githubUsername}, 'user')
        RETURNING id, name, role
      `;
      user = newUser;
    }

    // 5. Establish a session
    const { refreshToken } = await setAuthCookies(user.id, user.role);

    // Save session in DB
    const sessionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await sql`
      INSERT INTO sessions (user_id, refresh_token, expires_at)
      VALUES (${user.id}, ${refreshToken}, ${sessionExpiry})
    `;

    // 6. Redirect to dashboard
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`);
  } catch (error: any) {
    console.error('GitHub OAuth Callback Error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/unauthorized?error=Internal+OAuth+callback+error`
    );
  }
}
