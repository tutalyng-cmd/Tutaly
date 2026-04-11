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
    console.log('Connecting to database...');
    await client.connect();

    console.log('Creating typeorm_metadata table if not exists...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "typeorm_metadata" (
        "type" varchar NOT NULL,
        "database" varchar,
        "schema" varchar,
        "table" varchar,
        "name" varchar,
        "value" text
      );
    `);
    console.log('typeorm_metadata table ready.');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
