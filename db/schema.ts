import { year } from "drizzle-orm/mysql-core";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { v4 as uuidv4 } from "uuid";

export const usersTable = sqliteTable("users_table", {
  id: text("id").primaryKey().$defaultFn(() => uuidv4()), // Use UUID as primary key
  userID: text("userID").notNull(), // Clerk user ID
  month: int("month").notNull(),
  year: int("year").notNull(),
  date: text("date").notNull(),
  memory: text("memory").notNull(),
  magic: text("magic"),
});
