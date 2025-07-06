import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MemorySelector } from '../../../../components/MemorySelector';
import { AIStoryDisplay } from '../../../../components/AIStoryDisplay';
import { useReflection } from '../../../../hooks/useReflection';
import { Memory } from '../../../../services/memory';
import { Reflection } from '../../../../services/reflection';
import * as Haptics from 'expo-haptics';

import { useAuth } from '@clerk/clerk-expo';

export default function WeeklyReflectionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { userId } = useAuth();

  // Safe back navigation function
  const handleSafeBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(app)/reflection');
    }
  };

  if (userId === null || userId === undefined) {
    console.error('no userId');
  }

  // Get parameters from route
  const weekNumber = parseInt(params.weekNumber as string);
  const year = parseInt(params.year as string);

  // Get OpenRouter API key from environment
  const openRouterApiKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;

  // Hooks
  const { getWeekMemories, createWeeklyReflection, loading, error } = useReflection(
    userId || '',
    openRouterApiKey || ''
  );

  // State
  const [weekMemories, setWeekMemories] = useState<Memory[]>([]);
  const [currentStep, setCurrentStep] = useState<
    'loading' | 'selection' | 'story_type' | 'story_display'
  >('loading');
  const [selectedMemoryId, setSelectedMemoryId] = useState<string | null>(null);
  const [storyType, setStoryType] = useState<'therapeutic' | 'inspirational' | null>(null);
  const [generatedReflection, setGeneratedReflection] = useState<Reflection | null>(null);

  useEffect(() => {
    loadWeekMemories();
  }, [weekNumber, year]);

  const loadWeekMemories = async () => {
    console.log(
      `[DEBUG] WeeklyReflection - Loading memories for week ${weekNumber}, year ${year}, userID: ${userId}`
    );

    try {
      const memories = await getWeekMemories(weekNumber, year);
      console.log(
        `[DEBUG] WeeklyReflection - Found ${memories.length} memories for week ${weekNumber}`
      );
      setWeekMemories(memories);

      if (memories.length === 0) {
        console.log(
          `[DEBUG] WeeklyReflection - No memories found for week ${weekNumber}, year ${year}`
        );
        Alert.alert(
          'No Memories Found',
          `There are no memories for week ${weekNumber} of ${year} to reflect on. Try creating some memories first, or check a different week.`,
          [
            { text: 'OK', onPress: handleSafeBack },
            { text: 'Debug Info', onPress: () => showDebugInfo() },
          ]
        );
        return;
      }

      setCurrentStep('selection');
    } catch (err) {
      console.error('[ERROR] WeeklyReflection - Failed to load week memories:', err);
      Alert.alert(
        'Error Loading Memories',
        `Failed to load memories for week ${weekNumber} of ${year}. ${err instanceof Error ? err.message : 'Unknown error'}`,
        [
          { text: 'OK', onPress: handleSafeBack },
          { text: 'Retry', onPress: loadWeekMemories },
        ]
      );
    }
  };

  const showDebugInfo = () => {
    const debugInfo = `
Debug Information:
- User ID: ${userId}
- Week Number: ${weekNumber}
- Year: ${year}
- API Key Available: ${!!process.env.EXPO_PUBLIC_OPENROUTER_API_KEY}
- Loading State: ${loading}
- Error State: ${error || 'None'}
    `;

    Alert.alert('Debug Information', debugInfo, [{ text: 'OK' }]);
  };

  const handleMemorySelect = async (memoryId: string) => {
    console.log(`[DEBUG] WeeklyReflection - Memory selected: ${memoryId}`);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedMemoryId(memoryId);
    setCurrentStep('story_type');
  };

  const handleStoryTypeSelect = async (type: 'therapeutic' | 'inspirational') => {
    console.log(
      `[DEBUG] WeeklyReflection - Story type selected: ${type}, memory: ${selectedMemoryId}`
    );
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStoryType(type);

    if (!selectedMemoryId) {
      console.error('[ERROR] WeeklyReflection - No memory selected');
      Alert.alert('Error', 'Please select a memory first.');
      return;
    }

    try {
      console.log(`[DEBUG] WeeklyReflection - Creating weekly reflection...`);
      const reflection = await createWeeklyReflection(weekNumber, year, selectedMemoryId, type);

      if (reflection) {
        console.log(`[DEBUG] WeeklyReflection - Reflection created successfully: ${reflection.id}`);
        setGeneratedReflection(reflection);
        setCurrentStep('story_display');
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        console.error(
          '[ERROR] WeeklyReflection - No reflection returned from createWeeklyReflection'
        );
        Alert.alert(
          'Error',
          'Failed to generate your reflection story. No reflection was created.',
          [{ text: 'OK' }]
        );
      }
    } catch (err) {
      console.error('[ERROR] WeeklyReflection - Failed to create reflection:', err);
      let errorMessage = 'Failed to generate your reflection story. Please try again.';

      if (err instanceof Error) {
        if (err.message.includes('API key')) {
          errorMessage = 'API key issue. Please check your OpenRouter API key configuration.';
        } else if (err.message.includes('Network error')) {
          errorMessage = 'Network connection issue. Please check your internet connection.';
        } else if (err.message.includes('Rate limit')) {
          errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
        } else {
          errorMessage = `Error: ${err.message}`;
        }
      }

      Alert.alert('Failed to Generate Reflection', errorMessage, [
        { text: 'OK' },
        { text: 'Retry', onPress: () => handleStoryTypeSelect(type) },
      ]);
    }
  };

  const handleBack = async () => {
    console.log(`[DEBUG] WeeklyReflection - Back button pressed, current step: ${currentStep}`);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (currentStep === 'story_type') {
      setCurrentStep('selection');
      setSelectedMemoryId(null);
      setStoryType(null);
    } else if (currentStep === 'selection') {
      handleSafeBack();
    }
  };

  const handleStoryClose = () => {
    handleSafeBack();
  };

  const handleStorySave = () => {
    // Story is automatically saved when created, this is just UI feedback
    console.log('Story already saved to database');
  };

  const getWeekDateRange = () => {
    const startDate = new Date(year, 0, 1 + (weekNumber - 1) * 7);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    return {
      start: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      end: endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
  };

  if (!openRouterApiKey) {
    console.error('[ERROR] WeeklyReflection - OpenRouter API key not configured');
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.gradient}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Configuration Required</Text>
            <Text style={styles.errorText}>
              Please configure your OpenRouter API key in the environment variables to use AI
              reflections.
            </Text>
            <Text style={styles.errorText}>
              Expected: EXPO_PUBLIC_OPENROUTER_API_KEY in your .env file
            </Text>
            <TouchableOpacity style={styles.backButton} onPress={handleSafeBack}>
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (currentStep === 'loading') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading memories for week {weekNumber}...</Text>
            {__DEV__ && (
              <Text style={styles.debugText}>
                User: {userId?.substring(0, 8)}...{'\n'}
                Week: {weekNumber}, Year: {year}
              </Text>
            )}
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (currentStep === 'story_display' && generatedReflection) {
    return (
      <AIStoryDisplay
        reflection={generatedReflection}
        onClose={handleStoryClose}
        onSave={handleStorySave}
      />
    );
  }

  const dateRange = getWeekDateRange();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={['#0c0c0c', '#0c0c0c']} style={styles.gradient}>
        {currentStep === 'selection' && (
          <>
            <MemorySelector
              memories={weekMemories}
              title="Weekly Reflection"
              subtitle={`Choose a memory from week ${weekNumber} (${dateRange.start} - ${dateRange.end}) that still haunts you - one that feels emotionally significant and worth reflecting on.`}
              onSelect={handleMemorySelect}
              onCancel={handleSafeBack}
              loading={loading}
            />
            {__DEV__ && (
              <View style={styles.debugContainer}>
                <Text style={styles.debugText}>
                  Debug: {weekMemories.length} memories found for week {weekNumber}
                </Text>
              </View>
            )}
          </>
        )}

        {currentStep === 'story_type' && (
          <View style={styles.storyTypeContainer}>
            <View style={styles.header}>
              <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
                <Text style={styles.backBtnText}>← Back</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.storyTypeContent}>
              <Text style={styles.storyTypeTitle}>Choose Your Story Type</Text>
              <Text style={styles.storyTypeSubtitle}>
                How would you like to reframe this memory?
              </Text>

              <TouchableOpacity
                style={styles.storyTypeOption}
                onPress={() => handleStoryTypeSelect('therapeutic')}
                disabled={loading}>
                <Text style={styles.storyTypeOptionTitle}>🌱 Therapeutic Reframing</Text>
                <Text style={styles.storyTypeOptionDesc}>
                  Transform this memory into a story of healing and growth. Focus on lessons learned
                  and strength gained.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.storyTypeOption}
                onPress={() => handleStoryTypeSelect('inspirational')}
                disabled={loading}>
                <Text style={styles.storyTypeOptionTitle}>✨ Inspirational Journey</Text>
                <Text style={styles.storyTypeOptionDesc}>
                  Turn this memory into an empowering narrative about your resilience and the
                  courage you've shown.
                </Text>
              </TouchableOpacity>

              {loading && (
                <View style={styles.generatingContainer}>
                  <Text style={styles.generatingText}>
                    Generating your personalized reflection story...
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            {__DEV__ && (
              <TouchableOpacity style={styles.debugButton} onPress={showDebugInfo}>
                <Text style={styles.debugButtonText}>Show Debug Info</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  storyTypeContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backBtn: {
    alignSelf: 'flex-start',
  },
  backBtnText: {
    color: 'white',
    fontSize: 16,
  },
  storyTypeContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  storyTypeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  storyTypeSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 40,
  },
  storyTypeOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
  storyTypeOptionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  storyTypeOptionDesc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  generatingContainer: {
    marginTop: 32,
    alignItems: 'center',
  },
  generatingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  debugContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 10,
    borderRadius: 8,
  },
  debugText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    textAlign: 'center',
  },
  debugButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 4,
    marginTop: 10,
  },
  debugButtonText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
  },
});
