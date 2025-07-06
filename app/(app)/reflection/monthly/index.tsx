import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AIStoryDisplay } from '../../../../components/AIStoryDisplay';
import { useReflection } from '../../../../hooks/useReflection';
import { Reflection } from '../../../../services/reflection';
import * as Haptics from 'expo-haptics';

interface WeeklyReflectionOption {
  selection: any;
  reflection: Reflection | null;
  memory: any;
}

import { useAuth } from '@clerk/clerk-expo';

export default function MonthlyReflectionScreen() {
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

    if(userId === null || userId === undefined){
    console.error("no userId");
  }
  
  // Get parameters from route
  const month = parseInt(params.month as string);
  const year = parseInt(params.year as string);
  
  // Get OpenRouter API key from environment
  const openRouterApiKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;
  
  // Hooks
  const { 
    getMonthlyReflectionOptions, 
    createMonthlyReflection, 
    loading, 
    error 
  } = useReflection(userId || '', openRouterApiKey || '');

  // State
  const [weeklyOptions, setWeeklyOptions] = useState<WeeklyReflectionOption[]>([]);
  const [currentStep, setCurrentStep] = useState<'loading' | 'selection' | 'story_type' | 'story_display'>('loading');
  const [selectedReflectionId, setSelectedReflectionId] = useState<string | null>(null);
  const [storyType, setStoryType] = useState<'therapeutic' | 'inspirational' | null>(null);
  const [generatedReflection, setGeneratedReflection] = useState<Reflection | null>(null);

  useEffect(() => {
    loadMonthlyOptions();
  }, [month, year]);

  const loadMonthlyOptions = async () => {
    try {
      const options = await getMonthlyReflectionOptions(month, year);
      // Filter out options with null reflections
      const validOptions = options.filter(option => option.reflection !== null) as WeeklyReflectionOption[];
      setWeeklyOptions(validOptions);
      
      if (validOptions.length === 0) {
        Alert.alert(
          'No Weekly Reflections Found',
          'You need to complete at least one weekly reflection in this month before creating a monthly reflection.',
          [{ text: 'OK', onPress: handleSafeBack }]
        );
        return;
      }
      
      setCurrentStep('selection');
    } catch (err) {
      console.error('Failed to load monthly options:', err);
      Alert.alert(
        'Error',
        'Failed to load weekly reflections for this month.',
        [{ text: 'OK', onPress: handleSafeBack }]
      );
    }
  };

  const handleReflectionSelect = async (reflectionId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedReflectionId(reflectionId);
    setCurrentStep('story_type');
  };

  const handleStoryTypeSelect = async (type: 'therapeutic' | 'inspirational') => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStoryType(type);
    
    if (!selectedReflectionId) return;
    
    try {
      const reflection = await createMonthlyReflection(
        month,
        year,
        selectedReflectionId,
        type
      );
      
      if (reflection) {
        setGeneratedReflection(reflection);
        setCurrentStep('story_display');
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err) {
      console.error('Failed to create monthly reflection:', err);
      Alert.alert(
        'Error',
        'Failed to generate your monthly reflection story. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (currentStep === 'story_type') {
      setCurrentStep('selection');
      setSelectedReflectionId(null);
    } else if (currentStep === 'selection') {
      handleSafeBack();
    }
  };

  const handleStoryClose = () => {
    handleSafeBack();
  };

  const handleStorySave = () => {
    // Story is automatically saved when created, this is just UI feedback
    console.log('Monthly reflection story already saved to database');
  };

  const getMonthName = (monthNumber: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStoryPreview = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (!openRouterApiKey) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.gradient}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Configuration Required</Text>
            <Text style={styles.errorText}>
              Please configure your OpenRouter API key in the environment variables to use AI reflections.
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
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading weekly reflections...</Text>
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

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.gradient}>
        
        {currentStep === 'selection' && (
          <View style={styles.selectionContainer}>
            <View style={styles.header}>
              <TouchableOpacity onPress={handleSafeBack} style={styles.backBtn}>
                <Text style={styles.backBtnText}>← Back</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.content}>
              <Text style={styles.title}>Monthly Reflection</Text>
              <Text style={styles.subtitle}>
                Choose one of your weekly reflections from {getMonthName(month)} {year} that resonates most deeply with you.
              </Text>

              <View style={styles.optionsList}>
                {weeklyOptions.map((option, index) => (
                  <TouchableOpacity
                    key={option.reflection!.id}
                    style={styles.reflectionOption}
                    onPress={() => handleReflectionSelect(option.reflection!.id)}
                  >
                    <View style={styles.reflectionHeader}>
                      <Text style={styles.reflectionTitle}>
                        Week {option.selection?.weekNumber || index + 1} Reflection
                      </Text>
                      <Text style={styles.reflectionDate}>
                        {formatDate(option.reflection!.createdAt)}
                      </Text>
                    </View>
                    <View style={styles.reflectionType}>
                      <Text style={styles.reflectionTypeText}>
                        {option.reflection!.storyType === 'therapeutic' ? '🌱 Therapeutic' : '✨ Inspirational'}
                      </Text>
                    </View>
                    <Text style={styles.reflectionPreview}>
                      {getStoryPreview(option.reflection!.aiStory)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
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
                How would you like to explore this monthly reflection?
              </Text>

              <TouchableOpacity
                style={styles.storyTypeOption}
                onPress={() => handleStoryTypeSelect('therapeutic')}
                disabled={loading}
              >
                <Text style={styles.storyTypeOptionTitle}>🌱 Deeper Healing</Text>
                <Text style={styles.storyTypeOptionDesc}>
                  Explore the deeper patterns and insights from this month's journey.
                  Focus on profound healing and understanding.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.storyTypeOption}
                onPress={() => handleStoryTypeSelect('inspirational')}
                disabled={loading}
              >
                <Text style={styles.storyTypeOptionTitle}>✨ Empowering Vision</Text>
                <Text style={styles.storyTypeOptionDesc}>
                  Transform this month's experiences into a powerful narrative about
                  your growth and the strength you've discovered.
                </Text>
              </TouchableOpacity>

              {loading && (
                <View style={styles.generatingContainer}>
                  <Text style={styles.generatingText}>
                    Generating your monthly reflection story...
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
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
  selectionContainer: {
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  optionsList: {
    flex: 1,
  },
  reflectionOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  reflectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reflectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  reflectionDate: {
    fontSize: 14,
    color: '#666',
  },
  reflectionType: {
    marginBottom: 12,
  },
  reflectionTypeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  reflectionPreview: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  storyTypeContainer: {
    flex: 1,
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
});
