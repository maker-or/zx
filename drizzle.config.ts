import type { Config } from 'drizzle-kit';

export default {
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'expo',
//   dbCredentials: {
//     url: 'file:./your-database-file.sqlite'
//   }
} satisfies Config;
