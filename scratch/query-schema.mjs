import postgres from 'postgres';

const sql = postgres('postgresql://postgres@localhost:5432/postgres', {
  ssl: false
});

async function main() {
  const tables = ['profiles', 'skills', 'certifications', 'experiences', 'leetcode_stats'];
  for (const table of tables) {
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = ${table}
    `;
    console.log(`\n--- COLUMNS IN ${table.toUpperCase()} TABLE ---`);
    columns.forEach(c => console.log(`${c.column_name}: ${c.data_type}`));
  }
  process.exit(0);
}

main();
