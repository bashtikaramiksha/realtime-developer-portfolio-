import postgres from 'postgres';

const sql = postgres('postgresql://postgres@localhost:5432/postgres', {
  ssl: false
});

try {
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
  `;
  console.log('--- TABLES IN PUBLIC SCHEMA ---');
  console.log(tables.map(t => t.table_name));

  const columns = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'users'
  `;
  console.log('\n--- COLUMNS IN USERS TABLE ---');
  columns.forEach(c => console.log(`${c.column_name}: ${c.data_type}`));

  process.exit(0);
} catch (error) {
  console.error('Database query failed:', error);
  process.exit(1);
}
