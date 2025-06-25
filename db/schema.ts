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

// Reflections table for storing AI-generated stories
export const reflectionsTable = sqliteTable("reflections", {
  id: text("id").primaryKey().$defaultFn(() => uuidv4()),
  userID: text("userID").notNull(),
  type: text("type").notNull(), // "weekly", "monthly", "yearly"
  selectedMemoryId: text("selectedMemoryId").notNull(),
  aiStory: text("aiStory").notNull(),
  storyType: text("storyType").notNull(), // "therapeutic" or "inspirational"
  createdAt: text("createdAt").notNull(),
  weekNumber: int("weekNumber"), // for weekly reflections
  month: int("month"), // for monthly reflections
  year: int("year").notNull(),
  promptUsed: text("promptUsed"), // store the AI prompt for reference
});

// Weekly selections to track chosen memories for monthly reflections
export const weeklySelectionsTable = sqliteTable("weekly_selections", {
  id: text("id").primaryKey().$defaultFn(() => uuidv4()),
  userID: text("userID").notNull(),
  weekNumber: int("weekNumber").notNull(),
  year: int("year").notNull(),
  selectedMemoryId: text("selectedMemoryId").notNull(),
  reflectionId: text("reflectionId"), // links to reflectionsTable
  createdAt: text("createdAt").notNull(),
});

// Monthly selections to track chosen memories for yearly reflections
export const monthlySelectionsTable = sqliteTable("monthly_selections", {
  id: text("id").primaryKey().$defaultFn(() => uuidv4()),
  userID: text("userID").notNull(),
  month: int("month").notNull(),
  year: int("year").notNull(),
  selectedWeeklyReflectionId: text("selectedWeeklyReflectionId").notNull(),
  reflectionId: text("reflectionId"), // links to reflectionsTable
  createdAt: text("createdAt").notNull(),
});

// Reflection triggers to track when prompts should be shown
export const reflectionTriggersTable = sqliteTable("reflection_triggers", {
  id: text("id").primaryKey().$defaultFn(() => uuidv4()),
  userID: text("userID").notNull(),
  type: text("type").notNull(), // "weekly", "monthly", "yearly"
  triggerDate: text("triggerDate").notNull(),
  completed: int("completed").notNull().default(0), // 0 = pending, 1 = completed
  weekNumber: int("weekNumber"),
  month: int("month"),
  year: int("year").notNull(),
});
