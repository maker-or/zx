import { useState, useEffect } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { ReflectionService, Reflection, ReflectionTrigger } from '../services/reflection';

export const useReflection = (userID: string = 'default-user', openRouterApiKey?: string) => {
  const db = useSQLiteContext();
  const [reflectionService] = useState(() => {
    if (!openRouterApiKey) {
      throw new Error('OpenRouter API key is required for reflection service');
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
    try {
      const triggers = await reflectionService.getPendingTriggers(userID);
      setPendingTriggers(triggers);
    } catch (err) {
      console.error('Failed to load pending triggers:', err);
    }
  };

  const getWeekMemories = async (weekNumber: number, year: number) => {
    setLoading(true);
    setError(null);

    try {
      const memories = await reflectionService.getWeekMemories(userID, weekNumber, year);
      setLoading(false);
      return memories;
    } catch (err) {
      console.error('Failed to get week memories:', err);
      setError('Failed to load memories for this week');
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
      
      // Refresh pending triggers
      await loadPendingTriggers();
      
      setLoading(false);
      return reflection;
    } catch (err) {
      console.error('Failed to create weekly reflection:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create reflection';
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  };

  const getMonthlyReflectionOptions = async (month: number, year: number) => {
    setLoading(true);
    setError(null);

    try {
      const options = await reflectionService.getMonthlyReflectionOptions(userID, month, year);
      setLoading(false);
      return options;
    } catch (err) {
      console.error('Failed to get monthly reflection options:', err);
      setError('Failed to load monthly reflection options');
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
      
      // Refresh pending triggers
      await loadPendingTriggers();
      
      setLoading(false);
      return reflection;
    } catch (err) {
      console.error('Failed to create monthly reflection:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create reflection';
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  };

  const getYearlyReflectionOptions = async (year: number) => {
    setLoading(true);
    setError(null);

    try {
      const options = await reflectionService.getYearlyReflectionOptions(userID, year);
      setLoading(false);
      return options;
    } catch (err) {
      console.error('Failed to get yearly reflection options:', err);
      setError('Failed to load yearly reflection options');
      setLoading(false);
      return [];
    }
  };

  const createYearlyReflection = async (
    year: number,
    selectedMonthlyReflectionId: string,
    storyType: 'therapeutic' | 'inspirational'
  ): Promise<Reflection | null> => {
    setLoading(true);
    setError(null);

    try {
      const reflection = await reflectionService.createYearlyReflection(
        userID,
        year,
        selectedMonthlyReflectionId,
        storyType
      );
      
      // Refresh pending triggers
      await loadPendingTriggers();
      
      setLoading(false);
      return reflection;
    } catch (err) {
      console.error('Failed to create yearly reflection:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create yearly reflection';
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  };

  const getUserReflections = async (): Promise<Reflection[]> => {
    setLoading(true);
    setError(null);

    try {
      const reflections = await reflectionService.getUserReflections(userID);
      setLoading(false);
      return reflections;
    } catch (err) {
      console.error('Failed to get user reflections:', err);
      setError('Failed to load reflections');
      setLoading(false);
      return [];
    }
  };

  const createReflectionTriggers = async (): Promise<void> => {
    try {
      await reflectionService.createReflectionTriggers(userID);
      await loadPendingTriggers();
    } catch (err) {
      console.error('Failed to create reflection triggers:', err);
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
    return pendingTriggers.some(trigger => trigger.type === 'weekly');
  };

  // Helper function to check if there are pending monthly reflections
  const hasPendingMonthlyReflection = (): boolean => {
    return pendingTriggers.some(trigger => trigger.type === 'monthly');
  };

  // Helper function to check if there are pending yearly reflections
  const hasPendingYearlyReflection = (): boolean => {
    return pendingTriggers.some(trigger => trigger.type === 'yearly');
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
