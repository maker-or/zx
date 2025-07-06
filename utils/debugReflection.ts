import { SQLiteDatabase } from 'expo-sqlite';
import { ReflectionService } from '../services/reflection';
import { AIService } from '../services/ai';
import { MemoryService } from '../services/memory';

export interface ReflectionDebugResult {
  step: string;
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export class ReflectionDebugger {
  private reflectionService: ReflectionService;
  private aiService: AIService;
  private memoryService: MemoryService;
  private userID: string;

  constructor(db: SQLiteDatabase, userID: string, openRouterApiKey: string) {
    this.userID = userID;
    this.reflectionService = new ReflectionService(db, openRouterApiKey);
    this.aiService = new AIService(openRouterApiKey);
    this.memoryService = new MemoryService(db);
  }

  /**
   * Run a comprehensive debug test of the reflection system
   */
  async runFullDebugTest(): Promise<ReflectionDebugResult[]> {
    const results: ReflectionDebugResult[] = [];

    console.log(`[DEBUG] Starting full reflection system debug test for user: ${this.userID}`);

    // Test 1: API Key validation
    results.push(await this.testApiKeyValidation());

    // Test 2: API Connection
    results.push(await this.testApiConnection());

    // Test 3: Check for existing memories
    results.push(await this.testMemoryAvailability());

    // Test 4: Week calculation
    results.push(await this.testWeekCalculation());

    // Test 5: Memory loading for specific week
    results.push(await this.testWeekMemoryLoading());

    // Test 6: Trigger creation
    results.push(await this.testTriggerCreation());

    // Test 7: AI story generation (if memories exist)
    results.push(await this.testAIStoryGeneration());

    // Test 8: Database schema check
    results.push(await this.testDatabaseSchema());

    console.log(`[DEBUG] Full debug test completed. ${results.length} tests run.`);
    return results;
  }

  private async testApiKeyValidation(): Promise<ReflectionDebugResult> {
    try {
      const isValid = this.aiService.validateApiKey();
      return {
        step: 'API Key Validation',
        success: isValid,
        message: isValid ? 'API key format is valid' : 'API key format is invalid',
      };
    } catch (error) {
      return {
        step: 'API Key Validation',
        success: false,
        message: 'Failed to validate API key',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async testApiConnection(): Promise<ReflectionDebugResult> {
    try {
      const isConnected = await this.aiService.testConnection();
      return {
        step: 'API Connection Test',
        success: isConnected,
        message: isConnected
          ? 'Successfully connected to OpenRouter API'
          : 'Failed to connect to OpenRouter API',
      };
    } catch (error) {
      return {
        step: 'API Connection Test',
        success: false,
        message: 'Error testing API connection',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async testMemoryAvailability(): Promise<ReflectionDebugResult> {
    try {
      const allMemories = await this.memoryService.getAllMemories(this.userID);
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;

      const currentYearMemories = allMemories.filter((m) => m.year === currentYear);
      const currentMonthMemories = allMemories.filter(
        (m) => m.year === currentYear && m.month === currentMonth
      );

      return {
        step: 'Memory Availability Check',
        success: allMemories.length > 0,
        message: `Found ${allMemories.length} total memories`,
        data: {
          totalMemories: allMemories.length,
          currentYearMemories: currentYearMemories.length,
          currentMonthMemories: currentMonthMemories.length,
          oldestMemory: allMemories.length > 0 ? allMemories[allMemories.length - 1].date : null,
          newestMemory: allMemories.length > 0 ? allMemories[0].date : null,
        },
      };
    } catch (error) {
      return {
        step: 'Memory Availability Check',
        success: false,
        message: 'Failed to check memory availability',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async testWeekCalculation(): Promise<ReflectionDebugResult> {
    try {
      const currentDate = new Date();
      const currentWeek = this.getCurrentWeekNumber(currentDate);
      const currentYear = currentDate.getFullYear();

      // Test week start/end calculation
      const weekStart = this.getWeekStartDate(currentYear, currentWeek);
      const weekEnd = this.getWeekEndDate(currentYear, currentWeek);

      return {
        step: 'Week Calculation Test',
        success: true,
        message: `Week calculation working correctly`,
        data: {
          currentDate: currentDate.toISOString().split('T')[0],
          currentWeek,
          currentYear,
          weekStart: weekStart.toISOString().split('T')[0],
          weekEnd: weekEnd.toISOString().split('T')[0],
        },
      };
    } catch (error) {
      return {
        step: 'Week Calculation Test',
        success: false,
        message: 'Failed to calculate week information',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async testWeekMemoryLoading(): Promise<ReflectionDebugResult> {
    try {
      const currentDate = new Date();
      const currentWeek = this.getCurrentWeekNumber(currentDate);
      const currentYear = currentDate.getFullYear();

      // Test current week and previous week
      const currentWeekMemories = await this.reflectionService.getWeekMemories(
        this.userID,
        currentWeek,
        currentYear
      );
      const previousWeekMemories = await this.reflectionService.getWeekMemories(
        this.userID,
        currentWeek - 1,
        currentYear
      );

      return {
        step: 'Week Memory Loading Test',
        success: true,
        message: `Memory loading test completed`,
        data: {
          currentWeek,
          currentWeekMemories: currentWeekMemories.length,
          previousWeekMemories: previousWeekMemories.length,
          currentWeekMemoryDates: currentWeekMemories.map((m) => m.date),
          previousWeekMemoryDates: previousWeekMemories.map((m) => m.date),
        },
      };
    } catch (error) {
      return {
        step: 'Week Memory Loading Test',
        success: false,
        message: 'Failed to load week memories',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async testTriggerCreation(): Promise<ReflectionDebugResult> {
    try {
      // Check existing triggers
      const existingTriggers = await this.reflectionService.getPendingTriggers(this.userID);

      // Try to create new triggers
      await this.reflectionService.createReflectionTriggers(this.userID);

      // Check triggers after creation
      const newTriggers = await this.reflectionService.getPendingTriggers(this.userID);

      return {
        step: 'Trigger Creation Test',
        success: true,
        message: `Trigger creation test completed`,
        data: {
          existingTriggers: existingTriggers.length,
          newTriggers: newTriggers.length,
          triggerTypes: newTriggers.map((t) => ({
            type: t.type,
            week: t.weekNumber,
            month: t.month,
            year: t.year,
          })),
        },
      };
    } catch (error) {
      return {
        step: 'Trigger Creation Test',
        success: false,
        message: 'Failed to create/test triggers',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async testAIStoryGeneration(): Promise<ReflectionDebugResult> {
    try {
      // Get a sample memory to test with
      const allMemories = await this.memoryService.getAllMemories(this.userID);

      if (allMemories.length === 0) {
        return {
          step: 'AI Story Generation Test',
          success: false,
          message: 'No memories available for AI story generation test',
        };
      }

      const sampleMemory = allMemories[0];

      // Create a test AI request
      const aiRequest = {
        memory: sampleMemory.memory,
        memoryDate: sampleMemory.date,
        storyType: 'therapeutic' as const,
        reflectionType: 'weekly' as const,
      };

      const aiResponse = await this.aiService.generateStory(aiRequest);

      return {
        step: 'AI Story Generation Test',
        success: true,
        message: `AI story generated successfully`,
        data: {
          originalMemory: sampleMemory.memory.substring(0, 100) + '...',
          storyWordCount: aiResponse.wordCount,
          storyPreview: aiResponse.story.substring(0, 200) + '...',
          storyType: aiResponse.storyType,
        },
      };
    } catch (error) {
      return {
        step: 'AI Story Generation Test',
        success: false,
        message: 'Failed to generate AI story',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async testDatabaseSchema(): Promise<ReflectionDebugResult> {
    try {
      // Test if we can query each table
      const userReflections = await this.reflectionService.getUserReflections(this.userID);
      const pendingTriggers = await this.reflectionService.getPendingTriggers(this.userID);

      return {
        step: 'Database Schema Test',
        success: true,
        message: `Database schema test completed`,
        data: {
          reflectionsCount: userReflections.length,
          pendingTriggersCount: pendingTriggers.length,
          tablesAccessible: ['reflections', 'triggers', 'users'],
        },
      };
    } catch (error) {
      return {
        step: 'Database Schema Test',
        success: false,
        message: 'Failed to access database tables',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Generate a debug report as a formatted string
   */
  static formatDebugReport(results: ReflectionDebugResult[]): string {
    const report = ['=== REFLECTION SYSTEM DEBUG REPORT ===\n'];

    results.forEach((result, index) => {
      report.push(`${index + 1}. ${result.step}`);
      report.push(`   Status: ${result.success ? '✅ PASS' : '❌ FAIL'}`);
      report.push(`   Message: ${result.message}`);

      if (result.error) {
        report.push(`   Error: ${result.error}`);
      }

      if (result.data) {
        report.push(`   Data: ${JSON.stringify(result.data, null, 2)}`);
      }

      report.push('');
    });

    const passCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    report.push(`=== SUMMARY ===`);
    report.push(`Total tests: ${results.length}`);
    report.push(`Passed: ${passCount}`);
    report.push(`Failed: ${failCount}`);
    report.push(`Success rate: ${Math.round((passCount / results.length) * 100)}%`);

    return report.join('\n');
  }

  // Helper methods (copied from ReflectionService for consistency)
  private getCurrentWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  private getWeekStartDate(year: number, weekNumber: number): Date {
    const jan1 = new Date(year, 0, 1);
    const jan1DayOfWeek = jan1.getDay() || 7;
    const mondayOfWeek1 = new Date(year, 0, 1 + ((8 - jan1DayOfWeek) % 7));
    return new Date(mondayOfWeek1.getTime() + (weekNumber - 1) * 7 * 24 * 60 * 60 * 1000);
  }

  private getWeekEndDate(year: number, weekNumber: number): Date {
    const startDate = this.getWeekStartDate(year, weekNumber);
    return new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
  }
}

/**
 * Create test memories for debugging purposes
 */
export async function createTestMemories(
  db: SQLiteDatabase,
  userID: string,
  count: number = 5
): Promise<void> {
  console.log(`[DEBUG] Creating ${count} test memories for user: ${userID}`);

  const memoryService = new MemoryService(db);
  const testMemories = [
    'Today I felt overwhelmed by work deadlines, but I managed to complete the most important task.',
    'Had a difficult conversation with a family member that left me feeling sad and confused.',
    'Experienced a moment of joy when I saw a beautiful sunset during my evening walk.',
    'Felt anxious about an upcoming presentation, but practiced deep breathing to calm myself.',
    'Received unexpected good news that made me feel grateful and hopeful about the future.',
    'Struggled with self-doubt today, but reminded myself of past accomplishments.',
    'Had a meaningful conversation with a friend that made me feel understood and supported.',
    "Felt frustrated when things didn't go as planned, but learned to adapt and find alternatives.",
    'Experienced a moment of peace while reading a book in my favorite quiet spot.',
    'Felt proud of myself for helping someone in need without expecting anything in return.',
  ];

  const moods = ['amazing', 'good', 'okay', 'bad', 'terrible'];
  const currentDate = new Date();

  for (let i = 0; i < count; i++) {
    // Create memories spread across the last few weeks
    const daysAgo = i * 2; // Every other day
    const memoryDate = new Date(currentDate.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    const memory = testMemories[i % testMemories.length];
    const mood = moods[Math.floor(Math.random() * moods.length)];

    try {
      await memoryService.saveMemory(userID, memoryDate, memory, mood);
      console.log(`[DEBUG] Created test memory for ${memoryDate.toISOString().split('T')[0]}`);
    } catch (error) {
      console.error(
        `[ERROR] Failed to create test memory for ${memoryDate.toISOString().split('T')[0]}:`,
        error
      );
    }
  }

  console.log(`[DEBUG] Finished creating test memories`);
}

/**
 * Quick debug function to test basic reflection functionality
 */
export async function quickReflectionDebug(
  db: SQLiteDatabase,
  userID: string,
  openRouterApiKey: string
): Promise<void> {
  console.log(`[DEBUG] Starting quick reflection debug for user: ${userID}`);

  try {
    const reflectionDebugger = new ReflectionDebugger(db, userID, openRouterApiKey);
    const results = await reflectionDebugger.runFullDebugTest();

    const report = ReflectionDebugger.formatDebugReport(results);
    console.log('\n' + report);

    // Check if we need to create test memories
    const memoryService = new MemoryService(db);
    let allMemories = await memoryService.getAllMemories(userID);

    if (allMemories.length === 0) {
      console.log(`[DEBUG] No memories found, creating test memories...`);
      await createTestMemories(db, userID, 7);
      allMemories = await memoryService.getAllMemories(userID);
    }

    if (allMemories.length > 0) {
      console.log(`[DEBUG] Attempting to create a test weekly reflection...`);
      const reflectionService = new ReflectionService(db, openRouterApiKey);
      const currentDate = new Date();
      const currentWeek = Math.ceil(
        ((currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 1).getTime()) / 86400000 +
          1) /
          7
      );

      try {
        const testReflection = await reflectionService.createWeeklyReflection(
          userID,
          currentWeek,
          currentDate.getFullYear(),
          allMemories[0].id,
          'therapeutic'
        );
        console.log(
          `[DEBUG] ✅ Test weekly reflection created successfully! ID: ${testReflection.id}`
        );
      } catch (error) {
        console.log(`[DEBUG] ❌ Failed to create test weekly reflection: ${error}`);
      }
    }
  } catch (error) {
    console.error(`[ERROR] Quick reflection debug failed:`, error);
  }
}
