import postgres from 'postgres';

// Prevent multiple instances of postgres client in development
const globalForDb = global as unknown as { conn: ReturnType<typeof postgres> };

export const sql = globalForDb.conn || postgres(process.env.DATABASE_URL!, {
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

if (process.env.NODE_ENV !== 'production') globalForDb.conn = sql;
