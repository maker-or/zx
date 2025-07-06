import { drizzle } from "drizzle-orm/expo-sqlite";
import { eq, and, desc, sql } from "drizzle-orm";
import { tagsTable, memoryTagsTable, usersTable, analyticsTable } from '../db/schema';
import { SQLiteDatabase } from 'expo-sqlite';

export interface Tag {
  id: string;
  userID: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface MemoryTag {
  id: string;
  memoryId: string;
  tagId: string;
  createdAt: string;
}

export interface AnalyticsData {
  id: string;
  userID: string;
  date: string;
  memoryCount: number;
  totalWordCount: number;
  averageMood?: string;
  reflectionCount: number;
  streakDays: number;
  createdAt: string;
}

export class TagsService {
  private db: ReturnType<typeof drizzle>;

  constructor(sqliteDb: SQLiteDatabase) {
    this.db = drizzle(sqliteDb, { 
      schema: { 
        tagsTable, 
        memoryTagsTable, 
        usersTable, 
        analyticsTable 
      } 
    });
  }

  /**
   * Create a new tag
   */
  async createTag(userID: string, name: string, color: string): Promise<Tag> {
    const now = new Date().toISOString();
    const [tag] = await this.db.insert(tagsTable).values({
      userID,
      name: name.trim(),
      color,
      createdAt: now,
    }).returning();

    return tag;
  }

  /**
   * Get all tags for a user
   */
  async getUserTags(userID: string): Promise<Tag[]> {
    return await this.db
      .select()
      .from(tagsTable)
      .where(eq(tagsTable.userID, userID))
      .orderBy(desc(tagsTable.createdAt));
  }

  /**
   * Add tag to a memory
   */
  async addTagToMemory(memoryId: string, tagId: string): Promise<void> {
    const now = new Date().toISOString();
    await this.db.insert(memoryTagsTable).values({
      memoryId,
      tagId,
      createdAt: now,
    });
  }

  /**
   * Remove tag from a memory
   */
  async removeTagFromMemory(memoryId: string, tagId: string): Promise<void> {
    await this.db
      .delete(memoryTagsTable)
      .where(
        and(
          eq(memoryTagsTable.memoryId, memoryId),
          eq(memoryTagsTable.tagId, tagId)
        )
      );
  }

  /**
   * Get tags for a specific memory
   */
  async getMemoryTags(memoryId: string): Promise<Tag[]> {
    return await this.db
      .select({
        id: tagsTable.id,
        userID: tagsTable.userID,
        name: tagsTable.name,
        color: tagsTable.color,
        createdAt: tagsTable.createdAt,
      })
      .from(memoryTagsTable)
      .innerJoin(tagsTable, eq(memoryTagsTable.tagId, tagsTable.id))
      .where(eq(memoryTagsTable.memoryId, memoryId));
  }

  /**
   * Delete a tag
   */
  async deleteTag(tagId: string): Promise<void> {
    // First remove all memory associations
    await this.db
      .delete(memoryTagsTable)
      .where(eq(memoryTagsTable.tagId, tagId));

    // Then delete the tag
    await this.db
      .delete(tagsTable)
      .where(eq(tagsTable.id, tagId));
  }

  /**
   * Update tag
   */
  async updateTag(tagId: string, name: string, color: string): Promise<void> {
    await this.db
      .update(tagsTable)
      .set({ name: name.trim(), color })
      .where(eq(tagsTable.id, tagId));
  }
}

export class AnalyticsService {
  private db: ReturnType<typeof drizzle>;

  constructor(sqliteDb: SQLiteDatabase) {
    this.db = drizzle(sqliteDb, { 
      schema: { 
        usersTable, 
        analyticsTable 
      } 
    });
  }

  /**
   * Update daily analytics for a user
   */
  async updateDailyAnalytics(userID: string, date: Date): Promise<void> {
    const dateString = date.toISOString().split('T')[0];
    const now = new Date().toISOString();

    // Get memory stats for the day
    const memories = await this.db
      .select()
      .from(usersTable)
      .where(
        and(
          eq(usersTable.userID, userID),
          eq(usersTable.date, dateString)
        )
      );

    const memoryCount = memories.length;
    const totalWordCount = memories.reduce((sum, memory) => 
      sum + (memory.wordCount || 0), 0
    );

    // Calculate most common mood
    const moods = memories.map(m => m.mood).filter(Boolean);
    const moodCounts = moods.reduce((acc, mood) => {
      acc[mood!] = (acc[mood!] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const averageMood = Object.keys(moodCounts).reduce((a, b) => 
      moodCounts[a] > moodCounts[b] ? a : b, ''
    ) || undefined;

    // Calculate streak days
    const streakDays = await this.calculateStreakDays(userID, date);

    // Update or insert analytics
    const existingAnalytics = await this.db
      .select()
      .from(analyticsTable)
      .where(
        and(
          eq(analyticsTable.userID, userID),
          eq(analyticsTable.date, dateString)
        )
      )
      .limit(1);

    if (existingAnalytics.length > 0) {
      await this.db
        .update(analyticsTable)
        .set({
          memoryCount,
          totalWordCount,
          averageMood,
          streakDays,
        })
        .where(
          and(
            eq(analyticsTable.userID, userID),
            eq(analyticsTable.date, dateString)
          )
        );
    } else {
      await this.db.insert(analyticsTable).values({
        userID,
        date: dateString,
        memoryCount,
        totalWordCount,
        averageMood,
        reflectionCount: 0,
        streakDays,
        createdAt: now,
      });
    }
  }

  /**
   * Calculate consecutive days with memories
   */
  private async calculateStreakDays(userID: string, fromDate: Date): Promise<number> {
    let streak = 0;
    let currentDate = new Date(fromDate);

    while (true) {
      const dateString = currentDate.toISOString().split('T')[0];
      const hasMemory = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(usersTable)
        .where(
          and(
            eq(usersTable.userID, userID),
            eq(usersTable.date, dateString)
          )
        );

      if (hasMemory[0].count > 0) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Get analytics for a date range
   */
  async getAnalytics(
    userID: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<AnalyticsData[]> {
    const startDateString = startDate.toISOString().split('T')[0];
    const endDateString = endDate.toISOString().split('T')[0];

    return (await this.db
      .select()
      .from(analyticsTable)
      .where(
        and(
          eq(analyticsTable.userID, userID),
          sql`${analyticsTable.date} >= ${startDateString}`,
          sql`${analyticsTable.date} <= ${endDateString}`
        )
      )
      .orderBy(desc(analyticsTable.date))).map(item => ({
        ...item,
        averageMood: item.averageMood || undefined,
      }));
  }

  /**
   * Get summary statistics for a user
   */
  async getUserSummary(userID: string): Promise<{
    totalMemories: number;
    totalWords: number;
    currentStreak: number;
    longestStreak: number;
    averageWordsPerMemory: number;
    mostCommonMood?: string;
  }> {
    // Get total memories and words
    const totals = await this.db
      .select({
        count: sql<number>`count(*)`,
        totalWords: sql<number>`sum(${usersTable.wordCount})`,
      })
      .from(usersTable)
      .where(eq(usersTable.userID, userID));

    // Get current streak (from today backwards)
    const currentStreak = await this.calculateStreakDays(userID, new Date());

    // Get longest streak from analytics
    const longestStreakResult = await this.db
      .select({
        maxStreak: sql<number>`max(${analyticsTable.streakDays})`,
      })
      .from(analyticsTable)
      .where(eq(analyticsTable.userID, userID));

    // Get most common mood
    const moodStats = await this.db
      .select({
        mood: usersTable.mood,
        count: sql<number>`count(*)`,
      })
      .from(usersTable)
      .where(
        and(
          eq(usersTable.userID, userID),
          sql`${usersTable.mood} IS NOT NULL`
        )
      )
      .groupBy(usersTable.mood)
      .orderBy(sql`count(*) DESC`)
      .limit(1);

    const totalMemories = totals[0]?.count || 0;
    const totalWords = totals[0]?.totalWords || 0;

    return {
      totalMemories,
      totalWords,
      currentStreak,
      longestStreak: longestStreakResult[0]?.maxStreak || 0,
      averageWordsPerMemory: totalMemories > 0 ? Math.round(totalWords / totalMemories) : 0,
      mostCommonMood: moodStats[0]?.mood || undefined,
    };
  }
}
