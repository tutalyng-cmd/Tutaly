import { Client } from 'pg';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Load .env from root
dotenv.config({ path: join(__dirname, '../../../../.env') });

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('Connecting to database via pg...');
    await client.connect();

    console.log('Checking if jobs table has search_vector TSVector column...');
    const checkCol = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='jobs' and column_name='search_vector';
    `);

    if (checkCol.rowCount === 0) {
      await client.query(`
        ALTER TABLE jobs ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (
          to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,''))
        ) STORED;
      `);
      console.log('Added search_vector TSVector column.');

      await client.query(`
        CREATE INDEX jobs_search_idx ON jobs USING GIN(search_vector);
      `);
      console.log('Added GIN Index on search_vector column.');
    } else {
      console.log('search_vector column already exists. Skipping.');
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
