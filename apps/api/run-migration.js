const { DataSource } = require('typeorm');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const ds = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [path.join(__dirname, 'dist/**/*.entity.js')],
  migrations: [path.join(__dirname, 'dist/database/migrations/*.js')],
  synchronize: false,
  ssl: { rejectUnauthorized: false },
  extra: { options: '-c search_path=public' },
});

ds.initialize()
  .then(async (dataSource) => {
    console.log('Connected. Running migrations...');
    const migrations = await dataSource.runMigrations();
    console.log(`Ran ${migrations.length} migration(s):`);
    migrations.forEach(m => console.log(`  - ${m.name}`));
    await dataSource.destroy();
    console.log('Done.');
  })
  .catch((err) => {
    console.error('Migration failed:', err.message || err);
    process.exit(1);
  });
