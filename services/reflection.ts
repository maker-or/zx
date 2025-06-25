import { drizzle } from "drizzle-orm/expo-sqlite";
import { eq, and, desc, asc } from "drizzle-orm";
import { 
  reflectionsTable, 
  weeklySelectionsTable, 
  monthlySelectionsTable,
  reflectionTriggersTable,
  usersTable 
} from '../db/schema';
import { SQLiteDatabase } from 'expo-sqlite';
import { AIService, AIStoryRequest } from './ai';

export interface Reflection {
  id: string;
  userID: string;
  type: 'weekly' | 'monthly' | 'yearly';
  selectedMemoryId: string;
  aiStory: string;
  storyType: 'therapeutic' | 'inspirational';
  createdAt: string;
  weekNumber?: number;
  month?: number;
  year: number;
  promptUsed?: string;
}

export interface WeeklySelection {
  id: string;
  userID: string;
  weekNumber: number;
  year: number;
  selectedMemoryId: string;
  reflectionId?: string;
  createdAt: string;
}

export interface ReflectionTrigger {
  id: string;
  userID: string;
  type: 'weekly' | 'monthly' | 'yearly';
  triggerDate: string;
  completed: boolean;
  weekNumber?: number;
  month?: number;
  year: number;
}

export class ReflectionService {
  private db: ReturnType<typeof drizzle>;
  private aiService: AIService;

  constructor(sqliteDb: SQLiteDatabase, openRouterApiKey: string) {
    this.db = drizzle(sqliteDb, { 
      schema: { 
        reflectionsTable, 
        weeklySelectionsTable, 
        monthlySelectionsTable,
        reflectionTriggersTable,
        usersTable 
      } 
    });
    this.aiService = new AIService(openRouterApiKey);
  }

  /**
   * Get memories for a specific week for reflection selection
   */
  async getWeekMemories(userID: string, weekNumber: number, year: number) {
    // Calculate start and end dates for the week
    const startDate = this.getWeekStartDate(year, weekNumber);
    const endDate = this.getWeekEndDate(year, weekNumber);

    const memories = await this.db
      .select()
      .from(usersTable)
      .where(
        and(
          eq(usersTable.userID, userID),
          eq(usersTable.year, year)
        )
      )
      .orderBy(asc(usersTable.date));

    // Filter memories within the week range
    return memories.filter(memory => {
      const memoryDate = new Date(memory.date);
      return memoryDate >= startDate && memoryDate <= endDate;
    });
  }

  /**
   * Create a weekly reflection by selecting a memory and generating AI story
   */
  async createWeeklyReflection(
    userID: string, 
    weekNumber: number, 
    year: number,
    selectedMemoryId: string,
    storyType: 'therapeutic' | 'inspirational'
  ): Promise<Reflection> {
    // Get the selected memory
    const memory = await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, selectedMemoryId))
      .limit(1);

    if (memory.length === 0) {
      throw new Error('Selected memory not found');
    }

    const selectedMemory = memory[0];

    // Generate AI story
    const aiRequest: AIStoryRequest = {
      memory: selectedMemory.memory,
      memoryDate: selectedMemory.date,
      storyType,
      reflectionType: 'weekly'
    };

    const aiResponse = await this.aiService.generateStory(aiRequest);

    // Save reflection
    const reflection = await this.db.insert(reflectionsTable).values({
      userID,
      type: 'weekly',
      selectedMemoryId,
      aiStory: aiResponse.story,
      storyType: aiResponse.storyType,
      createdAt: new Date().toISOString(),
      weekNumber,
      year,
      promptUsed: aiResponse.promptUsed,
    }).returning();

    // Save weekly selection
    await this.db.insert(weeklySelectionsTable).values({
      userID,
      weekNumber,
      year,
      selectedMemoryId,
      reflectionId: reflection[0].id,
      createdAt: new Date().toISOString(),
    });

    // Mark trigger as completed
    await this.markTriggerCompleted(userID, 'weekly', weekNumber, undefined, year);

    return reflection[0] as Reflection;
  }

  /**
   * Get weekly selections for monthly reflection
   */
  async getMonthlyReflectionOptions(userID: string, month: number, year: number) {
    const weeklySelections = await this.db
      .select({
        selection: weeklySelectionsTable,
        reflection: reflectionsTable,
        memory: usersTable
      })
      .from(weeklySelectionsTable)
      .leftJoin(reflectionsTable, eq(weeklySelectionsTable.reflectionId, reflectionsTable.id))
      .leftJoin(usersTable, eq(weeklySelectionsTable.selectedMemoryId, usersTable.id))
      .where(
        and(
          eq(weeklySelectionsTable.userID, userID),
          eq(weeklySelectionsTable.year, year)
        )
      );

    // Filter by month (approximate week calculation)
    return weeklySelections.filter(item => {
      if (!item.memory) return false;
      const memoryDate = new Date(item.memory.date);
      return memoryDate.getMonth() + 1 === month;
    });
  }

  /**
   * Create monthly reflection
   */
  async createMonthlyReflection(
    userID: string,
    month: number,
    year: number,
    selectedWeeklyReflectionId: string,
    storyType: 'therapeutic' | 'inspirational'
  ): Promise<Reflection> {
    // Get the selected weekly reflection
    const weeklyReflection = await this.db
      .select()
      .from(reflectionsTable)
      .where(eq(reflectionsTable.id, selectedWeeklyReflectionId))
      .limit(1);

    if (weeklyReflection.length === 0) {
      throw new Error('Selected weekly reflection not found');
    }

    const selectedReflection = weeklyReflection[0];

    // Get the original memory
    const memory = await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, selectedReflection.selectedMemoryId))
      .limit(1);

    if (memory.length === 0) {
      throw new Error('Original memory not found');
    }

    // Generate AI story with monthly context
    const aiRequest: AIStoryRequest = {
      memory: memory[0].memory,
      memoryDate: memory[0].date,
      storyType,
      reflectionType: 'monthly',
      userContext: `Previous weekly reflection: ${selectedReflection.aiStory}`
    };

    const aiResponse = await this.aiService.generateStory(aiRequest);

    // Save monthly reflection
    const reflection = await this.db.insert(reflectionsTable).values({
      userID,
      type: 'monthly',
      selectedMemoryId: selectedReflection.selectedMemoryId,
      aiStory: aiResponse.story,
      storyType: aiResponse.storyType,
      createdAt: new Date().toISOString(),
      month,
      year,
      promptUsed: aiResponse.promptUsed,
    }).returning();

    // Save monthly selection
    await this.db.insert(monthlySelectionsTable).values({
      userID,
      month,
      year,
      selectedWeeklyReflectionId,
      reflectionId: reflection[0].id,
      createdAt: new Date().toISOString(),
    });

    // Mark trigger as completed
    await this.markTriggerCompleted(userID, 'monthly', undefined, month, year);

    return reflection[0] as Reflection;
  }

  /**
   * Get monthly selections for yearly reflection
   */
  async getYearlyReflectionOptions(userID: string, year: number) {
    const monthlySelections = await this.db
      .select({
        selection: monthlySelectionsTable,
        reflection: reflectionsTable,
      })
      .from(monthlySelectionsTable)
      .leftJoin(reflectionsTable, eq(monthlySelectionsTable.reflectionId, reflectionsTable.id))
      .where(
        and(
          eq(monthlySelectionsTable.userID, userID),
          eq(monthlySelectionsTable.year, year)
        )
      )
      .orderBy(asc(monthlySelectionsTable.month));

    return monthlySelections;
  }

  /**
   * Create yearly reflection
   */
  async createYearlyReflection(
    userID: string,
    year: number,
    selectedMonthlyReflectionId: string,
    storyType: 'therapeutic' | 'inspirational'
  ): Promise<Reflection> {
    // Get the selected monthly reflection
    const monthlyReflection = await this.db
      .select()
      .from(reflectionsTable)
      .where(eq(reflectionsTable.id, selectedMonthlyReflectionId))
      .limit(1);

    if (monthlyReflection.length === 0) {
      throw new Error('Selected monthly reflection not found');
    }

    const selectedReflection = monthlyReflection[0];

    // Get the original memory
    const memory = await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, selectedReflection.selectedMemoryId))
      .limit(1);

    if (memory.length === 0) {
      throw new Error('Original memory not found');
    }

    // Generate AI story with yearly context
    const aiRequest: AIStoryRequest = {
      memory: memory[0].memory,
      memoryDate: memory[0].date,
      storyType,
      reflectionType: 'yearly',
      userContext: `Previous monthly reflection: ${selectedReflection.aiStory}`
    };

    const aiResponse = await this.aiService.generateStory(aiRequest);

    // Save yearly reflection
    const reflection = await this.db.insert(reflectionsTable).values({
      userID,
      type: 'yearly',
      selectedMemoryId: selectedReflection.selectedMemoryId,
      aiStory: aiResponse.story,
      storyType: aiResponse.storyType,
      createdAt: new Date().toISOString(),
      year,
      promptUsed: aiResponse.promptUsed,
    }).returning();

    // Mark trigger as completed
    await this.markTriggerCompleted(userID, 'yearly', undefined, undefined, year);

    return reflection[0] as Reflection;
  }

  /**
   * Get all reflections for a user
   */
  async getUserReflections(userID: string): Promise<Reflection[]> {
    const results = await this.db
      .select()
      .from(reflectionsTable)
      .where(eq(reflectionsTable.userID, userID))
      .orderBy(desc(reflectionsTable.createdAt));
    
    return results as Reflection[];
  }

  /**
   * Check for pending reflection triggers
   */
  async getPendingTriggers(userID: string): Promise<ReflectionTrigger[]> {
    const results = await this.db
      .select()
      .from(reflectionTriggersTable)
      .where(
        and(
          eq(reflectionTriggersTable.userID, userID),
          eq(reflectionTriggersTable.completed, 0)
        )
      )
      .orderBy(asc(reflectionTriggersTable.triggerDate));
    
    return results.map(result => ({
      ...result,
      completed: result.completed === 1,
      type: result.type as 'weekly' | 'monthly' | 'yearly',
      weekNumber: result.weekNumber ?? undefined,
      month: result.month ?? undefined,
    }));
  }

  /**
   * Create reflection triggers (called weekly to check for new reflection opportunities)
   */
  async createReflectionTriggers(userID: string): Promise<void> {
    const now = new Date();
    const currentWeek = this.getWeekNumber(now);
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Check if we need a weekly trigger
    const hasWeeklyMemories = await this.hasMemoriesForWeek(userID, currentWeek - 1, currentYear);
    if (hasWeeklyMemories && currentWeek > 1) {
      await this.createTriggerIfNotExists(userID, 'weekly', currentWeek - 1, undefined, currentYear);
    }

    // Check if we need a monthly trigger (first week of new month)
    if (currentWeek <= 1 && currentMonth > 1) {
      const hasMonthlyReflections = await this.hasWeeklyReflectionsForMonth(userID, currentMonth - 1, currentYear);
      if (hasMonthlyReflections) {
        await this.createTriggerIfNotExists(userID, 'monthly', undefined, currentMonth - 1, currentYear);
      }
    }

    // Check if we need a yearly trigger (first month of new year)
    if (currentMonth === 1 && currentWeek <= 1) {
      const hasYearlyReflections = await this.hasMonthlyReflectionsForYear(userID, currentYear - 1);
      if (hasYearlyReflections) {
        await this.createTriggerIfNotExists(userID, 'yearly', undefined, undefined, currentYear - 1);
      }
    }
  }

  // Helper methods
  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  private getWeekStartDate(year: number, weekNumber: number): Date {
    const firstDayOfYear = new Date(year, 0, 1);
    const daysToAdd = (weekNumber - 1) * 7 - firstDayOfYear.getDay();
    return new Date(year, 0, 1 + daysToAdd);
  }

  private getWeekEndDate(year: number, weekNumber: number): Date {
    const startDate = this.getWeekStartDate(year, weekNumber);
    return new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
  }

  private async hasMemoriesForWeek(userID: string, weekNumber: number, year: number): Promise<boolean> {
    const memories = await this.getWeekMemories(userID, weekNumber, year);
    return memories.length > 0;
  }

  private async hasWeeklyReflectionsForMonth(userID: string, month: number, year: number): Promise<boolean> {
    const reflections = await this.getMonthlyReflectionOptions(userID, month, year);
    return reflections.length > 0;
  }

  private async hasMonthlyReflectionsForYear(userID: string, year: number): Promise<boolean> {
    const reflections = await this.db
      .select()
      .from(monthlySelectionsTable)
      .where(
        and(
          eq(monthlySelectionsTable.userID, userID),
          eq(monthlySelectionsTable.year, year)
        )
      );
    return reflections.length > 0;
  }

  private async createTriggerIfNotExists(
    userID: string, 
    type: 'weekly' | 'monthly' | 'yearly', 
    weekNumber: number | undefined, 
    month: number | undefined, 
    year: number
  ): Promise<void> {
    const existing = await this.db
      .select()
      .from(reflectionTriggersTable)
      .where(
        and(
          eq(reflectionTriggersTable.userID, userID),
          eq(reflectionTriggersTable.type, type),
          eq(reflectionTriggersTable.year, year),
          weekNumber ? eq(reflectionTriggersTable.weekNumber, weekNumber) : undefined,
          month ? eq(reflectionTriggersTable.month, month) : undefined
        )
      );

    if (existing.length === 0) {
      await this.db.insert(reflectionTriggersTable).values({
        userID,
        type,
        triggerDate: new Date().toISOString().split('T')[0],
        completed: 0,
        weekNumber,
        month,
        year,
      });
    }
  }

  private async markTriggerCompleted(
    userID: string, 
    type: 'weekly' | 'monthly' | 'yearly', 
    weekNumber: number | undefined, 
    month: number | undefined, 
    year: number
  ): Promise<void> {
    await this.db
      .update(reflectionTriggersTable)
      .set({ completed: 1 })
      .where(
        and(
          eq(reflectionTriggersTable.userID, userID),
          eq(reflectionTriggersTable.type, type),
          eq(reflectionTriggersTable.year, year),
          weekNumber ? eq(reflectionTriggersTable.weekNumber, weekNumber) : undefined,
          month ? eq(reflectionTriggersTable.month, month) : undefined
        )
      );
  }
}
