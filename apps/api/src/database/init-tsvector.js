const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('Connecting to database via pg...');
    await client.connect();

    console.log('Checking if jobs table exists...');
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'jobs'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
        console.log("WAITING: 'jobs' table does not exist. Make sure you restart your backend so TypeORM synchronizes the schema first.");
        process.exit(0);
    }

    console.log('Checking if jobs table has TSVector column...');
    const checkCol = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='jobs' and column_name='tsv';
    `);

    if (checkCol.rowCount === 0) {
      await client.query(`
        ALTER TABLE jobs ADD COLUMN tsv tsvector GENERATED ALWAYS AS (
          setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
          setweight(to_tsvector('english', coalesce(description, '')), 'B')
        ) STORED;
      `);
      console.log('Added TSVector column.');

      await client.query(`
        CREATE INDEX jobs_tsv_idx ON jobs USING GIN (tsv);
      `);
      console.log('Added GIN Index on TSVector column.');
    } else {
      console.log('TSVector column already exists. Skipping.');
    }

    console.log('Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
