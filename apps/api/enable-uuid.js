const { Client } = require('pg');
const client = new Client({ 
  connectionString: 'postgresql://postgres.upwykoazsikszvcblwgh:swJRB%21%3Fqn43h57u@aws-1-us-east-1.pooler.supabase.com:6543/postgres', 
  ssl: { rejectUnauthorized: false } 
});

client.connect()
  .then(() => client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"'))
  .then(() => {
    console.log('Extension created');
    return client.end();
  })
  .catch(err => {
    console.error(err);
    return client.end();
  });
