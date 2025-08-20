import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: '.env' });
/**
 * https://orm.drizzle.team/docs/tutorials/drizzle-with-supabase
 * Drizzle configuration for Supabase PostgreSQL
 */
export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
