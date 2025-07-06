import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useReflection } from '../../../hooks/useReflection';
import { ReflectionTrigger } from '../../../services/reflection';
import { quickReflectionDebug, createTestMemories } from '../../../utils/debugReflection';
import * as Haptics from 'expo-haptics';
import { useSQLiteContext } from 'expo-sqlite';

import { useAuth } from '@clerk/clerk-expo';

export default function ReflectionHomeScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const db = useSQLiteContext();
  const openRouterApiKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;

  // Safe back navigation function
  const handleSafeBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(app)');
    }
  };

  const {
    pendingTriggers,
    loading,
    error,
    loadPendingTriggers,
    createReflectionTriggers,
    getUserReflections,
  } = useReflection(userId || '', openRouterApiKey);

  const [userReflections, setUserReflections] = useState<any[]>([]);
  const [isDebugging, setIsDebugging] = useState(false);
  const [debugResults, setDebugResults] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await loadPendingTriggers();
      await createReflectionTriggers();
      const reflections = await getUserReflections();
      setUserReflections(reflections);
    } catch (err) {
      console.error('Failed to load reflection data:', err);
    }
  };

  const handleDebugReflection = async () => {
    if (!userId || !openRouterApiKey) {
      Alert.alert('Error', 'Missing user ID or API key for debugging');
      return;
    }

    setIsDebugging(true);
    setDebugResults('');

    try {
      console.log('[DEBUG] Starting reflection system debug...');
      await quickReflectionDebug(db, userId, openRouterApiKey);

      Alert.alert(
        'Debug Complete',
        'Debug results have been logged to the console. Check your development console for detailed information.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('[ERROR] Debug failed:', error);
      Alert.alert(
        'Debug Failed',
        `Debug test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsDebugging(false);
    }
  };

  const handleCreateTestMemories = async () => {
    if (!userId) {
      Alert.alert('Error', 'Missing user ID for creating test memories');
      return;
    }

    setIsDebugging(true);

    try {
      console.log('[DEBUG] Creating test memories...');
      await createTestMemories(db, userId, 7);

      Alert.alert(
        'Test Memories Created',
        'Successfully created 7 test memories for the past week. You can now test the reflection system.',
        [{ text: 'OK' }]
      );

      // Refresh the data to show new memories
      await loadData();
    } catch (error) {
      console.error('[ERROR] Failed to create test memories:', error);
      Alert.alert(
        'Failed to Create Test Memories',
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsDebugging(false);
    }
  };

  const handleStartReflection = async (
    type: 'weekly' | 'monthly' | 'yearly',
    trigger: ReflectionTrigger
  ) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const params = {
      userID: userId,
      year: trigger.year.toString(),
      ...(trigger.weekNumber && { weekNumber: trigger.weekNumber.toString() }),
      ...(trigger.month && { month: trigger.month.toString() }),
    };

    router.push({
      pathname: `/reflection/${type}`,
      params,
    });
  };

  const handleManualReflection = async (type: 'weekly' | 'monthly' | 'yearly') => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentWeek = Math.ceil(
      (currentDate.getTime() - new Date(currentYear, 0, 1).getTime()) / 86400000 / 7
    );
    const currentMonth = currentDate.getMonth() + 1;

    const params = {
      userID: userId,
      year: currentYear.toString(),
      ...(type === 'weekly' && { weekNumber: currentWeek.toString() }),
      ...(type === 'monthly' && { month: currentMonth.toString() }),
    };

    router.push({
      pathname: `/reflection/${type}`,
      params,
    });
  };

  const getReflectionCounts = () => {
    const counts = {
      weekly: 0,
      monthly: 0,
      yearly: 0,
    };

    userReflections.forEach((reflection) => {
      counts[reflection.type as keyof typeof counts]++;
    });

    return counts;
  };

  const formatTriggerText = (trigger: ReflectionTrigger) => {
    switch (trigger.type) {
      case 'weekly':
        return `Week ${trigger.weekNumber} of ${trigger.year}`;
      case 'monthly':
        return `${getMonthName(trigger.month!)} ${trigger.year}`;
      case 'yearly':
        return `Year ${trigger.year}`;
      default:
        return 'Reflection';
    }
  };

  const getMonthName = (monthNumber: number) => {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return months[monthNumber - 1];
  };

  if (!openRouterApiKey) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Configuration Required</Text>
          <Text style={styles.errorText}>
            Please configure your OpenRouter API key in the environment variables to use AI
            reflections.
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={handleSafeBack}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const reflectionCounts = getReflectionCounts();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Pending Reflections */}
        {pendingTriggers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ready for Reflection</Text>
            {pendingTriggers.map((trigger, index) => (
              <TouchableOpacity
                key={`${trigger.type}-${trigger.year}-${trigger.weekNumber}-${trigger.month}`}
                style={styles.pendingReflectionCard}
                onPress={() => handleStartReflection(trigger.type, trigger)}>
                <View style={styles.pendingReflectionContent}>
                  <Text style={styles.pendingReflectionType}>
                    {trigger.type === 'weekly' && '🌱 Weekly'}
                    {trigger.type === 'monthly' && '✨ Monthly'}
                    {trigger.type === 'yearly' && '🌟 Yearly'}
                  </Text>
                  <Text style={styles.pendingReflectionText}>{formatTriggerText(trigger)}</Text>
                  <Text style={styles.pendingReflectionDesc}>
                    {trigger.type === 'weekly' &&
                      'Select a haunting memory for therapeutic reframing'}
                    {trigger.type === 'monthly' &&
                      'Choose from your weekly reflections for deeper insight'}
                    {trigger.type === 'yearly' && 'Pick your most meaningful monthly reflection'}
                  </Text>
                </View>
                <Text style={styles.pendingReflectionArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Manual Reflections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reflection</Text>
          <TouchableOpacity
            style={styles.manualReflectionCard}
            onPress={() => handleManualReflection('weekly')}>
            <View style={styles.manualReflectionContent}>
              <Text style={styles.manualReflectionType}>Weekly Reflection</Text>
              <Text style={styles.manualReflectionDesc}>
                Choose a haunting memory from this week for therapeutic reframing
              </Text>
              <Text style={styles.manualReflectionCount}>{reflectionCounts.weekly} completed</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.manualReflectionCard}
            onPress={() => handleManualReflection('monthly')}>
            <View style={styles.manualReflectionContent}>
              <Text style={styles.manualReflectionType}>Monthly Reflection</Text>
              <Text style={styles.manualReflectionDesc}>
                Select from your weekly reflections for deeper insights
              </Text>
              <Text style={styles.manualReflectionCount}>{reflectionCounts.monthly} completed</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.manualReflectionCard}
            onPress={() => handleManualReflection('yearly')}>
            <View style={styles.manualReflectionContent}>
              <Text style={styles.manualReflectionType}>Yearly Reflection</Text>
              <Text style={styles.manualReflectionDesc}>
                Choose your most meaningful monthly reflection of the year
              </Text>
              <Text style={styles.manualReflectionCount}>{reflectionCounts.yearly} completed</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Past Reflections Preview */}
        {userReflections.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Reflections</Text>
            {userReflections.slice(0, 3).map((reflection, index) => (
              <View key={reflection.id} style={styles.pastReflectionCard}>
                <Text style={styles.pastReflectionType}>
                  {reflection.type === 'weekly' && '🌱 Weekly'}
                  {reflection.type === 'monthly' && '✨ Monthly'}
                  {reflection.type === 'yearly' && '🌟 Yearly'}
                </Text>
                <Text style={styles.pastReflectionDate}>
                  {new Date(reflection.createdAt).toLocaleDateString()}
                </Text>
                <Text style={styles.pastReflectionPreview}>
                  {reflection.aiStory.substring(0, 100)}...
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Debug Section (only in development) */}
        {__DEV__ && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Debug Tools</Text>
            <TouchableOpacity
              style={[styles.manualReflectionCard, styles.debugCard]}
              onPress={handleDebugReflection}
              disabled={isDebugging}>
              <View style={styles.manualReflectionContent}>
                <Text style={styles.manualReflectionType}>
                  {isDebugging ? 'Running Debug...' : 'Debug Reflection System'}
                </Text>
                <Text style={styles.manualReflectionDesc}>
                  Test all reflection system components including API connectivity, memory loading,
                  and AI generation
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.manualReflectionCard, styles.debugCard]}
              onPress={handleCreateTestMemories}
              disabled={isDebugging}>
              <View style={styles.manualReflectionContent}>
                <Text style={styles.manualReflectionType}>
                  {isDebugging ? 'Creating Memories...' : 'Create Test Memories'}
                </Text>
                <Text style={styles.manualReflectionDesc}>
                  Create 7 test memories for the past week to test the reflection system
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 60 : 80,
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backBtnText: {
    color: 'white',
    fontSize: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  pendingReflectionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pendingReflectionContent: {
    flex: 1,
  },
  pendingReflectionType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  pendingReflectionText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  pendingReflectionDesc: {
    fontSize: 14,
    color: '#888',
    lineHeight: 18,
  },
  pendingReflectionArrow: {
    fontSize: 20,
    color: '#667eea',
    marginLeft: 10,
  },
  manualReflectionCard: {
    backgroundColor: '#FFFBFB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  manualReflectionContent: {
    flex: 1,
  },
  manualReflectionType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  manualReflectionDesc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  manualReflectionCount: {
    fontSize: 12,
    color: '#888',
  },
  pastReflectionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  pastReflectionType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  pastReflectionDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  pastReflectionPreview: {
    fontSize: 12,
    color: '#555',
    lineHeight: 16,
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
  debugCard: {
    backgroundColor: '#2D2D2D',
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
});
