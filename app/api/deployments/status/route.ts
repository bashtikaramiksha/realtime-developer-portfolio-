import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { pingUrl } from '@/lib/monitor';

export async function GET() {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    const services = await sql`
      SELECT 
        id, 
        project_name as "projectName", 
        deployment_url as "deploymentUrl", 
        status, 
        uptime, 
        response_time as "responseTime"
      FROM deployments
      WHERE user_id = ${session.userId}
      ORDER BY created_at ASC
    `;

    // Perform real-time async ping updating in database cache
    const updatedServices = await Promise.all(
      services.map(async (service: any) => {
        const ping = await pingUrl(service.deploymentUrl);
        
        // Calculate new uptime percentage simulation (randomly shift uptime based on status)
        let uptimeOffset = service.uptime;
        if (ping.status === 'offline') {
          uptimeOffset = Math.max(90, service.uptime - 0.25);
        } else {
          uptimeOffset = Math.min(100, service.uptime + 0.05);
        }

        // Cache update in database
        await sql`
          UPDATE deployments 
          SET status = ${ping.status}, response_time = ${ping.responseTime}, uptime = ${uptimeOffset}
          WHERE id = ${service.id}
        `;

        return {
          ...service,
          status: ping.status,
          responseTime: ping.responseTime,
          uptime: parseFloat(uptimeOffset.toFixed(2))
        };
      })
    );

    return NextResponse.json({
      status: 'success',
      services: updatedServices
    });
  } catch (error: any) {
    console.error('GET /api/deployments/status error:', error);
    return NextResponse.json({ status: 'error', message: 'Internal server error' }, { status: 500 });
  }
}
