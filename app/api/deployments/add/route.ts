import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { pingUrl } from '@/lib/monitor';
import { z } from 'zod';

const addSchema = z.object({
  projectName: z.string().min(1, 'Project name is required'),
  deploymentUrl: z.string().url('Please provide a valid URL (starting with http:// or https://)'),
});

export async function POST(request: Request) {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = addSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        status: 'error',
        message: validation.error.issues[0].message,
      }, { status: 400 });
    }

    const { projectName, deploymentUrl } = validation.data;

    // Run initial health check ping
    const initialCheck = await pingUrl(deploymentUrl);

    // Save in database
    const [insertedDeployment] = await sql`
      INSERT INTO deployments (user_id, project_name, deployment_url, status, uptime, response_time)
      VALUES (${session.userId}, ${projectName}, ${deploymentUrl}, ${initialCheck.status}, 100.0, ${initialCheck.responseTime})
      RETURNING id, project_name as "projectName", deployment_url as "deploymentUrl", status, uptime, response_time as "responseTime"
    `;

    return NextResponse.json({
      status: 'success',
      message: 'Deployment project successfully registered!',
      deployment: insertedDeployment
    });
  } catch (error: any) {
    console.error('POST /api/deployments/add error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to register deployment.',
      error: error.message || error
    }, { status: 500 });
  }
}
