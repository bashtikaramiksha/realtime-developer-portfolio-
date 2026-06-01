import postgres from 'postgres';

// Prevent multiple instances of postgres client in development
const globalForDb = global as unknown as { conn: ReturnType<typeof postgres> };

const connectionString = process.env.DATABASE_URL || 
                         process.env.POSTGRES_URL || 
                         process.env.NEON_DATABASE_URL || 
                         process.env.STORAGE_URL || 
                         "postgresql://postgres@localhost:5432/postgres";

export const sql = globalForDb.conn || postgres(connectionString, {
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

if (process.env.NODE_ENV !== 'production') globalForDb.conn = sql;
