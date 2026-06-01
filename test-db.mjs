import postgres from 'postgres';

console.log('Testing DB connection with 3s timeout...');
const sql = postgres('postgresql://postgres@localhost:5432/postgres', {
  timeout: 3,
  connect_timeout: 3,
  ssl: false
});

try {
  const result = await sql`SELECT NOW() as current_time, version() as pg_version`;
  console.log('SUCCESS!');
  console.log(result[0]);
  process.exit(0);
} catch (error) {
  console.error('FAILED TO CONNECT TO DB:', error);
  process.exit(1);
}
