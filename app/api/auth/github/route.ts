import { NextResponse } from 'next/server';

export async function GET() {
  const client_id = process.env.GITHUB_CLIENT_ID;
  
  if (!client_id) {
    return NextResponse.json({
      status: 'error',
      message: 'GitHub OAuth Client ID is not configured in .env.local. Please see installation instructions.'
    }, { status: 500 });
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/github/callback`;
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`;

  return NextResponse.redirect(githubAuthUrl);
}
