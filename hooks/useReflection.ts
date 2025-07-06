import { useState, useEffect } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { ReflectionService, Reflection, ReflectionTrigger } from '../services/reflection';

export const useReflection = (userID: string, openRouterApiKey?: string) => {
  const db = useSQLiteContext();
  const [reflectionService] = useState(() => {
    console.log(`[DEBUG] useReflection - initializing with userID: ${userID}`);
    console.log(`[DEBUG] useReflection - API key provided: ${!!openRouterApiKey}`);

    if (!openRouterApiKey) {
      console.error('[ERROR] OpenRouter API key is required for reflection service');
      throw new Error('OpenRouter API key is required for reflection service');
    }

    if (!userID) {
      console.error('[ERROR] User ID is required for reflection service');
      throw new Error('User ID is required for reflection service');
    }

    return new ReflectionService(db, openRouterApiKey);
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingTriggers, setPendingTriggers] = useState<ReflectionTrigger[]>([]);

  // Load pending triggers on mount
  useEffect(() => {
    loadPendingTriggers();
  }, [userID]);

  const loadPendingTriggers = async () => {
    console.log(`[DEBUG] loadPendingTriggers - userID: ${userID}`);
    try {
      const triggers = await reflectionService.getPendingTriggers(userID);
      console.log(`[DEBUG] loadPendingTriggers - found ${triggers.length} triggers`);
      setPendingTriggers(triggers);
    } catch (err) {
      console.error('[ERROR] Failed to load pending triggers:', err);
      setError('Failed to load pending reflections');
    }
  };

  const getWeekMemories = async (weekNumber: number, year: number) => {
    console.log(`[DEBUG] getWeekMemories - week: ${weekNumber}, year: ${year}, userID: ${userID}`);
    setLoading(true);
    setError(null);

    try {
      const memories = await reflectionService.getWeekMemories(userID, weekNumber, year);
      console.log(`[DEBUG] getWeekMemories - found ${memories.length} memories`);
      setLoading(false);
      return memories;
    } catch (err) {
      console.error('[ERROR] Failed to get week memories:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load memories for this week';
      setError(errorMessage);
      setLoading(false);
      return [];
    }
  };

  const createWeeklyReflection = async (
    weekNumber: number,
    year: number,
    selectedMemoryId: string,
    storyType: 'therapeutic' | 'inspirational'
  ): Promise<Reflection | null> => {
    console.log(
      `[DEBUG] createWeeklyReflection - week: ${weekNumber}, year: ${year}, memoryId: ${selectedMemoryId}, storyType: ${storyType}`
    );
    setLoading(true);
    setError(null);

    try {
      const reflection = await reflectionService.createWeeklyReflection(
        userID,
        weekNumber,
        year,
        selectedMemoryId,
        storyType
      );

      console.log(`[DEBUG] createWeeklyReflection - success, reflection ID: ${reflection?.id}`);

      // Refresh pending triggers
      await loadPendingTriggers();

      setLoading(false);
      return reflection;
    } catch (err) {
      console.error('[ERROR] Failed to create weekly reflection:', err);
      let errorMessage = 'Failed to create reflection';

      if (err instanceof Error) {
        if (err.message.includes('API key')) {
          errorMessage = 'API key authentication failed. Please check your OpenRouter API key.';
        } else if (err.message.includes('Network error')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (err.message.includes('Rate limit')) {
          errorMessage = 'Rate limit exceeded. Please try again in a moment.';
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
      setLoading(false);
      return null;
    }
  };

  const getMonthlyReflectionOptions = async (month: number, year: number) => {
    console.log(`[DEBUG] getMonthlyReflectionOptions - month: ${month}, year: ${year}`);
    setLoading(true);
    setError(null);

    try {
      const options = await reflectionService.getMonthlyReflectionOptions(userID, month, year);
      console.log(`[DEBUG] getMonthlyReflectionOptions - found ${options.length} options`);
      setLoading(false);
      return options;
    } catch (err) {
      console.error('[ERROR] Failed to get monthly reflection options:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load monthly reflection options';
      setError(errorMessage);
      setLoading(false);
      return [];
    }
  };

  const createMonthlyReflection = async (
    month: number,
    year: number,
    selectedWeeklyReflectionId: string,
    storyType: 'therapeutic' | 'inspirational'
  ): Promise<Reflection | null> => {
    console.log(
      `[DEBUG] createMonthlyReflection - month: ${month}, year: ${year}, reflectionId: ${selectedWeeklyReflectionId}, storyType: ${storyType}`
    );
    setLoading(true);
    setError(null);

    try {
      const reflection = await reflectionService.createMonthlyReflection(
        userID,
        month,
        year,
        selectedWeeklyReflectionId,
        storyType
      );

      console.log(`[DEBUG] createMonthlyReflection - success, reflection ID: ${reflection?.id}`);

      // Refresh pending triggers
      await loadPendingTriggers();

      setLoading(false);
      return reflection;
    } catch (err) {
      console.error('[ERROR] Failed to create monthly reflection:', err);
      let errorMessage = 'Failed to create monthly reflection';

      if (err instanceof Error) {
        if (err.message.includes('API key')) {
          errorMessage = 'API key authentication failed. Please check your OpenRouter API key.';
        } else if (err.message.includes('Network error')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (err.message.includes('Rate limit')) {
          errorMessage = 'Rate limit exceeded. Please try again in a moment.';
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
      setLoading(false);
      return null;
    }
  };

  const getYearlyReflectionOptions = async (year: number) => {
    console.log(`[DEBUG] getYearlyReflectionOptions - year: ${year}`);
    setLoading(true);
    setError(null);

    try {
      const options = await reflectionService.getYearlyReflectionOptions(userID, year);
      console.log(`[DEBUG] getYearlyReflectionOptions - found ${options.length} options`);
      setLoading(false);
      return options;
    } catch (err) {
      console.error('[ERROR] Failed to get yearly reflection options:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load yearly reflection options';
      setError(errorMessage);
      setLoading(false);
      return [];
    }
  };

  const createYearlyReflection = async (
    year: number,
    selectedMonthlyReflectionId: string,
    storyType: 'therapeutic' | 'inspirational'
  ): Promise<Reflection | null> => {
    console.log(
      `[DEBUG] createYearlyReflection - year: ${year}, reflectionId: ${selectedMonthlyReflectionId}, storyType: ${storyType}`
    );
    setLoading(true);
    setError(null);

    try {
      const reflection = await reflectionService.createYearlyReflection(
        userID,
        year,
        selectedMonthlyReflectionId,
        storyType
      );

      console.log(`[DEBUG] createYearlyReflection - success, reflection ID: ${reflection?.id}`);

      // Refresh pending triggers
      await loadPendingTriggers();

      setLoading(false);
      return reflection;
    } catch (err) {
      console.error('[ERROR] Failed to create yearly reflection:', err);
      let errorMessage = 'Failed to create yearly reflection';

      if (err instanceof Error) {
        if (err.message.includes('API key')) {
          errorMessage = 'API key authentication failed. Please check your OpenRouter API key.';
        } else if (err.message.includes('Network error')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (err.message.includes('Rate limit')) {
          errorMessage = 'Rate limit exceeded. Please try again in a moment.';
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
      setLoading(false);
      return null;
    }
  };

  const getUserReflections = async (): Promise<Reflection[]> => {
    console.log(`[DEBUG] getUserReflections - userID: ${userID}`);
    setLoading(true);
    setError(null);

    try {
      const reflections = await reflectionService.getUserReflections(userID);
      console.log(`[DEBUG] getUserReflections - found ${reflections.length} reflections`);
      setLoading(false);
      return reflections;
    } catch (err) {
      console.error('[ERROR] Failed to get user reflections:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load reflections';
      setError(errorMessage);
      setLoading(false);
      return [];
    }
  };

  const createReflectionTriggers = async (): Promise<void> => {
    console.log(`[DEBUG] createReflectionTriggers - userID: ${userID}`);
    try {
      await reflectionService.createReflectionTriggers(userID);
      console.log(`[DEBUG] createReflectionTriggers - triggers created successfully`);
      await loadPendingTriggers();
    } catch (err) {
      console.error('[ERROR] Failed to create reflection triggers:', err);
      // Don't set error state here as this is a background operation
    }
  };

  // Helper function to get current week number
  const getCurrentWeekNumber = (): number => {
    const now = new Date();
    const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  // Helper function to check if there are pending weekly reflections
  const hasPendingWeeklyReflection = (): boolean => {
    return pendingTriggers.some((trigger) => trigger.type === 'weekly');
  };

  // Helper function to check if there are pending monthly reflections
  const hasPendingMonthlyReflection = (): boolean => {
    return pendingTriggers.some((trigger) => trigger.type === 'monthly');
  };

  // Helper function to check if there are pending yearly reflections
  const hasPendingYearlyReflection = (): boolean => {
    return pendingTriggers.some((trigger) => trigger.type === 'yearly');
  };

  return {
    // Core functions
    getWeekMemories,
    createWeeklyReflection,
    getMonthlyReflectionOptions,
    createMonthlyReflection,
    getYearlyReflectionOptions,
    createYearlyReflection,
    getUserReflections,
    createReflectionTriggers,

    // State
    loading,
    error,
    pendingTriggers,

    // Helper functions
    getCurrentWeekNumber,
    hasPendingWeeklyReflection,
    hasPendingMonthlyReflection,
    hasPendingYearlyReflection,
    loadPendingTriggers,
  };
};
