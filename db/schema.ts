import { year } from "drizzle-orm/mysql-core";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users_table", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  month: int().notNull(),
  year: int().notNull(),
  date: text().notNull(),
  memory: text().notNull(),
  magic: text().notNull(),
  email: text().notNull().unique(),
});
