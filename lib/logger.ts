import { sql } from './db';

/**
 * Standard utility to record system events, operational warnings, or admin audits inside the logs database table.
 */
export async function logError(type: string, message: string): Promise<void> {
  try {
    const cleanType = type.trim().substring(0, 255);
    const cleanMessage = message.trim();

    await sql`
      INSERT INTO logs (type, message)
      VALUES (${cleanType}, ${cleanMessage})
    `;
  } catch (err) {
    console.error('Logger failed to write log in PostgreSQL:', err);
  }
}
