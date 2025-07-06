import { drizzle } from 'drizzle-orm/expo-sqlite';
import { eq, and, desc, asc } from 'drizzle-orm';
import {
  reflectionsTable,
  weeklySelectionsTable,
  monthlySelectionsTable,
  reflectionTriggersTable,
  usersTable,
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
        usersTable,
      },
    });
    this.aiService = new AIService(openRouterApiKey);
  }

  /**
   * Get memories for a specific week for reflection selection
   */
  async getWeekMemories(userID: string, weekNumber: number, year: number) {
    console.log(
      `[DEBUG] getWeekMemories - userID: ${userID}, weekNumber: ${weekNumber}, year: ${year}`
    );

    // Calculate start and end dates for the week
    const startDate = this.getWeekStartDate(year, weekNumber);
    const endDate = this.getWeekEndDate(year, weekNumber);

    console.log(
      `[DEBUG] Week ${weekNumber} date range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`
    );

    const memories = await this.db
      .select()
      .from(usersTable)
      .where(and(eq(usersTable.userID, userID), eq(usersTable.year, year)))
      .orderBy(asc(usersTable.date));

    console.log(`[DEBUG] Found ${memories.length} total memories for user in ${year}`);

    // Filter memories within the week range
    const startDateString = startDate.toISOString().split('T')[0];
    const endDateString = endDate.toISOString().split('T')[0];

    const weekMemories = memories.filter((memory) => {
      // Compare date strings directly for more reliable filtering
      const memoryDateString = memory.date;
      const isInWeek = memoryDateString >= startDateString && memoryDateString <= endDateString;
      if (isInWeek) {
        console.log(
          `[DEBUG] Memory in week: ${memory.date} - ${memory.memory.substring(0, 50)}...`
        );
      }
      return isInWeek;
    });

    console.log(`[DEBUG] Found ${weekMemories.length} memories for week ${weekNumber}`);
    return weekMemories;
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
    console.log(
      `[DEBUG] createWeeklyReflection - userID: ${userID}, weekNumber: ${weekNumber}, year: ${year}, memoryId: ${selectedMemoryId}, storyType: ${storyType}`
    );

    // Get the selected memory
    const memory = await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, selectedMemoryId))
      .limit(1);

    if (memory.length === 0) {
      console.error(`[ERROR] Selected memory not found: ${selectedMemoryId}`);
      throw new Error('Selected memory not found');
    }

    const selectedMemory = memory[0];
    console.log(
      `[DEBUG] Selected memory: ${selectedMemory.date} - ${selectedMemory.memory.substring(0, 100)}...`
    );

    try {
      // Generate AI story
      const aiRequest: AIStoryRequest = {
        memory: selectedMemory.memory,
        memoryDate: selectedMemory.date,
        storyType,
        reflectionType: 'weekly',
      };

      console.log(`[DEBUG] Generating AI story...`);
      const aiResponse = await this.aiService.generateStory(aiRequest);
      console.log(`[DEBUG] AI story generated successfully - ${aiResponse.wordCount} words`);

      // Save reflection
      const reflection = await this.db
        .insert(reflectionsTable)
        .values({
          userID,
          type: 'weekly',
          selectedMemoryId,
          aiStory: aiResponse.story,
          storyType: aiResponse.storyType,
          createdAt: new Date().toISOString(),
          weekNumber,
          year,
          promptUsed: aiResponse.promptUsed,
        })
        .returning();

      console.log(`[DEBUG] Reflection saved with ID: ${reflection[0].id}`);

      // Save weekly selection
      await this.db.insert(weeklySelectionsTable).values({
        userID,
        weekNumber,
        year,
        selectedMemoryId,
        reflectionId: reflection[0].id,
        createdAt: new Date().toISOString(),
      });

      console.log(`[DEBUG] Weekly selection saved`);

      // Mark trigger as completed
      await this.markTriggerCompleted(userID, 'weekly', weekNumber, undefined, year);
      console.log(`[DEBUG] Trigger marked as completed`);

      return reflection[0] as Reflection;
    } catch (error) {
      console.error(`[ERROR] Failed to create weekly reflection:`, error);
      throw error;
    }
  }

  /**
   * Get weekly selections for monthly reflection
   */
  async getMonthlyReflectionOptions(userID: string, month: number, year: number) {
    const weeklySelections = await this.db
      .select({
        selection: weeklySelectionsTable,
        reflection: reflectionsTable,
        memory: usersTable,
      })
      .from(weeklySelectionsTable)
      .leftJoin(reflectionsTable, eq(weeklySelectionsTable.reflectionId, reflectionsTable.id))
      .leftJoin(usersTable, eq(weeklySelectionsTable.selectedMemoryId, usersTable.id))
      .where(and(eq(weeklySelectionsTable.userID, userID), eq(weeklySelectionsTable.year, year)));

    // Filter by month using date string comparison
    return weeklySelections.filter((item) => {
      if (!item.memory) return false;
      const memoryDateString = item.memory.date; // YYYY-MM-DD format
      const memoryYear = parseInt(memoryDateString.split('-')[0]);
      const memoryMonth = parseInt(memoryDateString.split('-')[1]);
      return memoryYear === year && memoryMonth === month;
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
      userContext: `Previous weekly reflection: ${selectedReflection.aiStory}`,
    };

    const aiResponse = await this.aiService.generateStory(aiRequest);

    // Save monthly reflection
    const reflection = await this.db
      .insert(reflectionsTable)
      .values({
        userID,
        type: 'monthly',
        selectedMemoryId: selectedReflection.selectedMemoryId,
        aiStory: aiResponse.story,
        storyType: aiResponse.storyType,
        createdAt: new Date().toISOString(),
        month,
        year,
        promptUsed: aiResponse.promptUsed,
      })
      .returning();

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
      .where(and(eq(monthlySelectionsTable.userID, userID), eq(monthlySelectionsTable.year, year)))
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
      userContext: `Previous monthly reflection: ${selectedReflection.aiStory}`,
    };

    const aiResponse = await this.aiService.generateStory(aiRequest);

    // Save yearly reflection
    const reflection = await this.db
      .insert(reflectionsTable)
      .values({
        userID,
        type: 'yearly',
        selectedMemoryId: selectedReflection.selectedMemoryId,
        aiStory: aiResponse.story,
        storyType: aiResponse.storyType,
        createdAt: new Date().toISOString(),
        year,
        promptUsed: aiResponse.promptUsed,
      })
      .returning();

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
        and(eq(reflectionTriggersTable.userID, userID), eq(reflectionTriggersTable.completed, 0))
      )
      .orderBy(asc(reflectionTriggersTable.triggerDate));

    return results.map((result) => ({
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
    console.log(`[DEBUG] createReflectionTriggers for user: ${userID}`);

    const now = new Date();
    const currentWeek = this.getWeekNumber(now);
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    console.log(
      `[DEBUG] Current date info - week: ${currentWeek}, month: ${currentMonth}, year: ${currentYear}`
    );

    // Check if we need a weekly trigger (for last week and current week)
    const previousWeek = currentWeek - 1;
    const hasWeeklyMemories = await this.hasMemoriesForWeek(userID, previousWeek, currentYear);
    console.log(`[DEBUG] Has memories for week ${previousWeek}: ${hasWeeklyMemories}`);

    if (hasWeeklyMemories && previousWeek > 0) {
      console.log(`[DEBUG] Creating weekly trigger for week ${previousWeek}`);
      await this.createTriggerIfNotExists(userID, 'weekly', previousWeek, undefined, currentYear);
    }

    // Also check current week for immediate reflection
    const hasCurrentWeekMemories = await this.hasMemoriesForWeek(userID, currentWeek, currentYear);
    console.log(`[DEBUG] Has memories for current week ${currentWeek}: ${hasCurrentWeekMemories}`);

    if (hasCurrentWeekMemories) {
      console.log(`[DEBUG] Creating weekly trigger for current week ${currentWeek}`);
      await this.createTriggerIfNotExists(userID, 'weekly', currentWeek, undefined, currentYear);
    }

    // Check if we need a monthly trigger (first week of new month)
    if (currentWeek <= 1 && currentMonth > 1) {
      const hasMonthlyReflections = await this.hasWeeklyReflectionsForMonth(
        userID,
        currentMonth - 1,
        currentYear
      );
      console.log(
        `[DEBUG] Has weekly reflections for month ${currentMonth - 1}: ${hasMonthlyReflections}`
      );
      if (hasMonthlyReflections) {
        console.log(`[DEBUG] Creating monthly trigger for month ${currentMonth - 1}`);
        await this.createTriggerIfNotExists(
          userID,
          'monthly',
          undefined,
          currentMonth - 1,
          currentYear
        );
      }
    }

    // Check if we need a yearly trigger (first month of new year)
    if (currentMonth === 1 && currentWeek <= 1) {
      const hasYearlyReflections = await this.hasMonthlyReflectionsForYear(userID, currentYear - 1);
      console.log(
        `[DEBUG] Has monthly reflections for year ${currentYear - 1}: ${hasYearlyReflections}`
      );
      if (hasYearlyReflections) {
        console.log(`[DEBUG] Creating yearly trigger for year ${currentYear - 1}`);
        await this.createTriggerIfNotExists(
          userID,
          'yearly',
          undefined,
          undefined,
          currentYear - 1
        );
      }
    }
  }

  // Helper methods
  private getWeekNumber(date: Date): number {
    // Use a simpler week calculation that matches our getWeekStartDate logic
    const year = date.getFullYear();
    const jan1 = new Date(year, 0, 1);
    const jan1DayOfWeek = jan1.getDay();

    // Calculate how many days to add to get to the first Monday
    const daysToFirstMonday = jan1DayOfWeek === 0 ? 1 : 8 - jan1DayOfWeek;
    const firstMonday = new Date(year, 0, 1 + daysToFirstMonday);

    // If the current date is before the first Monday, it's week 0 (previous year)
    if (date < firstMonday) {
      const weekNum = Math.max(
        1,
        Math.ceil((date.getTime() - jan1.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1
      );
      console.log(
        `[DEBUG] getWeekNumber for ${date.toISOString().split('T')[0]}: ${weekNum} (before first Monday)`
      );
      return weekNum;
    }

    // Calculate week number from first Monday
    const weekNum =
      Math.ceil((date.getTime() - firstMonday.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
    console.log(`[DEBUG] getWeekNumber for ${date.toISOString().split('T')[0]}: ${weekNum}`);
    return weekNum;
  }

  private getWeekStartDate(year: number, weekNumber: number): Date {
    // Use a simpler approach: start from first day of year and add weeks
    const jan1 = new Date(year, 0, 1);
    const jan1DayOfWeek = jan1.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Calculate how many days to add to get to the first Monday
    const daysToFirstMonday = jan1DayOfWeek === 0 ? 1 : 8 - jan1DayOfWeek;

    // Week 1 starts on the first Monday of the year
    const firstMonday = new Date(year, 0, 1 + daysToFirstMonday);

    // Add weeks to get to the desired week
    const startDate = new Date(firstMonday.getTime() + (weekNumber - 1) * 7 * 24 * 60 * 60 * 1000);

    console.log(`[DEBUG] Week ${weekNumber} starts on: ${startDate.toISOString().split('T')[0]}`);
    return startDate;
  }

  private getWeekEndDate(year: number, weekNumber: number): Date {
    const startDate = this.getWeekStartDate(year, weekNumber);
    const endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
    console.log(`[DEBUG] Week ${weekNumber} ends on: ${endDate.toISOString().split('T')[0]}`);
    return endDate;
  }

  private async hasMemoriesForWeek(
    userID: string,
    weekNumber: number,
    year: number
  ): Promise<boolean> {
    console.log(`[DEBUG] Checking memories for week ${weekNumber}, year ${year}`);
    const memories = await this.getWeekMemories(userID, weekNumber, year);
    const hasMemories = memories.length > 0;
    console.log(
      `[DEBUG] Has memories for week ${weekNumber}: ${hasMemories} (${memories.length} memories)`
    );
    return hasMemories;
  }

  private async hasWeeklyReflectionsForMonth(
    userID: string,
    month: number,
    year: number
  ): Promise<boolean> {
    const reflections = await this.getMonthlyReflectionOptions(userID, month, year);
    return reflections.length > 0;
  }

  private async hasMonthlyReflectionsForYear(userID: string, year: number): Promise<boolean> {
    const reflections = await this.db
      .select()
      .from(monthlySelectionsTable)
      .where(and(eq(monthlySelectionsTable.userID, userID), eq(monthlySelectionsTable.year, year)));
    return reflections.length > 0;
  }

  private async createTriggerIfNotExists(
    userID: string,
    type: 'weekly' | 'monthly' | 'yearly',
    weekNumber: number | undefined,
    month: number | undefined,
    year: number
  ): Promise<void> {
    console.log(
      `[DEBUG] Creating trigger if not exists - type: ${type}, week: ${weekNumber}, month: ${month}, year: ${year}`
    );

    const whereConditions = [
      eq(reflectionTriggersTable.userID, userID),
      eq(reflectionTriggersTable.type, type),
      eq(reflectionTriggersTable.year, year),
    ];

    if (weekNumber !== undefined) {
      whereConditions.push(eq(reflectionTriggersTable.weekNumber, weekNumber));
    }
    if (month !== undefined) {
      whereConditions.push(eq(reflectionTriggersTable.month, month));
    }

    const existing = await this.db
      .select()
      .from(reflectionTriggersTable)
      .where(and(...whereConditions));

    console.log(`[DEBUG] Found ${existing.length} existing triggers`);

    if (existing.length === 0) {
      console.log(`[DEBUG] Creating new trigger`);
      await this.db.insert(reflectionTriggersTable).values({
        userID,
        type,
        triggerDate: new Date().toISOString().split('T')[0],
        completed: 0,
        weekNumber,
        month,
        year,
      });
      console.log(`[DEBUG] Trigger created successfully`);
    } else {
      console.log(`[DEBUG] Trigger already exists`);
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
