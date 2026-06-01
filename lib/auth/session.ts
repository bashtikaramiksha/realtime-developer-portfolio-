import { cookies, headers } from 'next/headers';
import { verifyToken } from './utils';

export async function getAuthUser() {
  try {
    const cookieStore = await cookies();
    let accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      // Fallback: extract Bearer token from Authorization header if present
      const headersList = await headers();
      const authHeader = headersList.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        accessToken = authHeader.substring(7);
      }
    }

    if (!accessToken) {
      return null;
    }

    const payload = await verifyToken(accessToken);
    if (!payload || !payload.userId) {
      return null;
    }

    return {
      userId: payload.userId as string,
      role: payload.role as string,
    };
  } catch (error) {
    return null;
  }
}
