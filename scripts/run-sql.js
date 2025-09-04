const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env.local") });
const { Client } = require("pg");

async function run() {
  const sqlPath = path.resolve(__dirname, "01-create-tables-run.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");

  const connectionString =
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL;
  if (!connectionString) {
    console.error(
      "No POSTGRES URL found in environment. Set POSTGRES_URL_NON_POOLING or POSTGRES_URL in .env.local"
    );
    process.exit(1);
  }

  // For some hosted Postgres instances (like Supabase with custom poolers)
  // the TLS chain may cause self-signed cert errors. For local scripting
  // we can set `ssl.rejectUnauthorized = false` to bypass that. Do NOT
  // use this in production without understanding the security impact.
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    console.log("Connected to Postgres");
    // Split into individual statements and run one-by-one to get better error locations
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(Boolean)

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i]
      try {
        await client.query(stmt)
      } catch (err) {
        console.error(`Error executing statement #${i + 1}:`, stmt.slice(0, 200))
        throw err
      }
    }
    console.log('All statements executed successfully')
  } catch (err) {
    console.error("Error executing SQL:", err);
  } finally {
    await client.end();
  }
}

run();
