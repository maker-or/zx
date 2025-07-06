import { drizzle } from "drizzle-orm/expo-sqlite";
import { eq, and, desc } from "drizzle-orm";
import { usersTable } from '../db/schema';
import { SQLiteDatabase } from 'expo-sqlite';

export interface Memory {
  id: string;
  userID: string;
  month: number;
  year: number;
  date: string;
  memory: string;
  magic: string | null;
  mood?: string | null;
  prompt?: string | null;
  wordCount?: number | null;
  createdAt: string;
  updatedAt: string;
}

export class MemoryService {
  private db: ReturnType<typeof drizzle>;

  constructor(sqliteDb: SQLiteDatabase) {
    this.db = drizzle(sqliteDb, { schema: { usersTable } });
  }

  /**
   * Save a new memory or update existing one
   */
  async saveMemory(
    userID: string, 
    date: Date, 
    memoryText: string, 
    mood?: string, 
    prompt?: string
  ): Promise<void> {
    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const wordCount = memoryText.trim().split(/\s+/).length;
    const now = new Date().toISOString();

    // Check if memory already exists for this date
    const existingMemory = await this.getMemoryByDate(userID, date);

    if (existingMemory) {
      // Update existing memory
      await this.db
        .update(usersTable)
        .set({
          memory: memoryText,
          mood,
          prompt,
          wordCount,
          updatedAt: now,
        })
        .where(
          and(
            eq(usersTable.userID, userID),
            eq(usersTable.date, dateString)
          )
        );
    } else {
      // Create new memory
      await this.db.insert(usersTable).values({
        userID,
        month,
        year,
        date: dateString,
        memory: memoryText,
        magic: null,
        mood,
        prompt,
        wordCount,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  /**
   * Get memory for a specific date
   */
  async getMemoryByDate(userID: string, date: Date): Promise<Memory | null> {
    const dateString = date.toISOString().split('T')[0];
    
    const result = await this.db
      .select()
      .from(usersTable)
      .where(
        and(
          eq(usersTable.userID, userID),
          eq(usersTable.date, dateString)
        )
      )
      .limit(1);

    return result.length > 0 ? result[0] : null;
  }

  /**
   * Get all memories for a specific month
   */
  async getMemoriesForMonth(userID: string, month: number, year: number): Promise<Memory[]> {
    const result = await this.db
      .select()
      .from(usersTable)
      .where(
        and(
          eq(usersTable.userID, userID),
          eq(usersTable.month, month),
          eq(usersTable.year, year)
        )
      )
      .orderBy(desc(usersTable.date));

    return result;
  }

  /**
   * Get memories for a date range
   */
  async getMemoriesForDateRange(userID: string, startDate: Date, endDate: Date): Promise<Memory[]> {
    const startDateString = startDate.toISOString().split('T')[0];
    const endDateString = endDate.toISOString().split('T')[0];

    const result = await this.db
      .select()
      .from(usersTable)
      .where(
        and(
          eq(usersTable.userID, userID),
          // Note: SQLite string comparison works for ISO date format
        )
      )
      .orderBy(desc(usersTable.date));

    // Filter by date range (since drizzle doesn't have between for SQLite)
    return result.filter(memory => 
      memory.date >= startDateString && memory.date <= endDateString
    );
  }

  /**
   * Get all memories for a user
   */
  async getAllMemories(userID: string): Promise<Memory[]> {
    const result = await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.userID, userID))
      .orderBy(desc(usersTable.date));

    return result;
  }

  /**
   * Delete a memory
   */
  async deleteMemory(userID: string, date: Date): Promise<void> {
    const dateString = date.toISOString().split('T')[0];
    
    await this.db
      .delete(usersTable)
      .where(
        and(
          eq(usersTable.userID, userID),
          eq(usersTable.date, dateString)
        )
      );
  }

  /**
   * Get dates that have memories (for highlighting in calendar)
   */
  async getDatesWithMemories(userID: string, month: number, year: number): Promise<string[]> {
    const memories = await this.getMemoriesForMonth(userID, month, year);
    return memories.map(memory => memory.date);
  }
}
