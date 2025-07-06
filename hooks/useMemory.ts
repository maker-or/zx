import { useState, useEffect } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { MemoryService, Memory } from '../services/memory';

export const useMemory = (userID: string) => {
  const db = useSQLiteContext();
  const [memoryService] = useState(() => new MemoryService(db));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Check if a date is today (same day, ignoring time)
   */
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  /**
   * Check if editing is allowed for a given date
   * Only allow editing on the same day
   */
  const canEditMemory = (date: Date): boolean => {
    return isToday(date);
  };

  const saveMemory = async (
    date: Date, 
    memoryText: string, 
    mood?: string, 
    prompt?: string
  ): Promise<{ success: boolean; message?: string }> => {
    if (!memoryText.trim()) {
      setError('Memory cannot be empty');
      return { success: false, message: 'Memory cannot be empty' };
    }

    // Check if editing is allowed for this date
    if (!canEditMemory(date)) {
      const errorMessage = 'You can only edit memories from today. Past memories are locked to preserve your authentic thoughts from that day.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }

    setLoading(true);
    setError(null);

    try {
      await memoryService.saveMemory(userID, date, memoryText.trim(), mood, prompt);
      setLoading(false);
      return { success: true };
    } catch (err) {
      console.error('Failed to save memory:', err);
      const errorMessage = 'Failed to save memory. Please try again.';
      setError(errorMessage);
      setLoading(false);
      return { success: false, message: errorMessage };
    }
  };

  const getMemoryByDate = async (date: Date): Promise<Memory | null> => {
    setLoading(true);
    setError(null);

    try {
      const memory = await memoryService.getMemoryByDate(userID, date);
      setLoading(false);
      return memory;
    } catch (err) {
      console.error('Failed to get memory:', err);
      setError('Failed to load memory');
      setLoading(false);
      return null;
    }
  };

  const getMemoriesForMonth = async (month: number, year: number): Promise<Memory[]> => {
    setLoading(true);
    setError(null);

    try {
      const memories = await memoryService.getMemoriesForMonth(userID, month, year);
      setLoading(false);
      return memories;
    } catch (err) {
      console.error('Failed to get memories for month:', err);
      setError('Failed to load memories');
      setLoading(false);
      return [];
    }
  };

  const deleteMemory = async (date: Date): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await memoryService.deleteMemory(userID, date);
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Failed to delete memory:', err);
      setError('Failed to delete memory');
      setLoading(false);
      return false;
    }
  };

  const getDatesWithMemories = async (month: number, year: number): Promise<string[]> => {
    try {
      return await memoryService.getDatesWithMemories(userID, month, year);
    } catch (err) {
      console.error('Failed to get dates with memories:', err);
      return [];
    }
  };

  return {
    saveMemory,
    getMemoryByDate,
    getMemoriesForMonth,
    deleteMemory,
    getDatesWithMemories,
    canEditMemory,
    isToday,
    loading,
    error,
  };
};
