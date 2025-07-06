import React, { useState, useEffect } from 'react'; 
import { LinearGradient } from 'expo-linear-gradient';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useMemory } from '../../../hooks/useMemory';
import { Memory } from '../../../services/memory';
import { BlurView } from 'expo-blur';
import { useAuth } from '@clerk/clerk-expo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WeekScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // Safe back navigation function
  const handleSafeBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(app)');
    }
  };

  const today = new Date();
  const [currentWeek, setCurrentWeek] = useState<Date[]>([]);
  const [weekMemories, setWeekMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  
  const { userId, isLoaded } = useAuth();
  const { getMemoriesForMonth } = useMemory(userId || '');

  // Month names for navigation
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Navigation handlers
  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
    router.replace('/'); // Go back to daily view
  };

  const handleReflection = () => {
    router.push('/reflection');
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  // Get all weeks for the current month
  useEffect(() => {
    const getMonthWeeks = () => {
      const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
      const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
      
      const weeks: Date[][] = [];
      let week: Date[] = [];
      
      // Add days from previous month to fill the first week
      for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
        const date = new Date(firstDayOfMonth);
        date.setDate(firstDayOfMonth.getDate() - (firstDayOfMonth.getDay() - i));
        week.push(date);
      }
      
      // Add all days of the current month
      for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
        const date = new Date(currentYear, currentMonth, i);
        week.push(date);
        
        if (week.length === 7) {
          weeks.push(week);
          week = [];
        }
      }
      
      // Add days from next month to fill the last week
      if (week.length > 0) {
        const remainingDays = 7 - week.length;
        for (let i = 1; i <= remainingDays; i++) {
          const date = new Date(lastDayOfMonth);
          date.setDate(lastDayOfMonth.getDate() + i);
          week.push(date);
        }
        weeks.push(week);
      }
      
      setCurrentWeek(weeks.flat());
    };
    
    getMonthWeeks();
  }, [currentMonth, currentYear]);

  // Load memories for the selected month
  useEffect(() => {
    const loadMonthMemories = async () => {
      if (!userId) return;
      
      setLoading(true);
      try {
        const memories = await getMemoriesForMonth(currentMonth, currentYear);
        setWeekMemories(memories);
      } catch (error) {
        console.error('Failed to load month memories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMonthMemories();
  }, [currentMonth, currentYear, userId]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });
  };

  const getMemoryForDate = (date: Date): Memory | undefined => {
    return weekMemories.find(memory => {
      const memoryDate = new Date(memory.date);
      return memoryDate.getDate() === date.getDate() &&
             memoryDate.getMonth() === date.getMonth() &&
             memoryDate.getFullYear() === date.getFullYear();
    });
  };

  const getMonthStats = () => {
    const memoriesCount = weekMemories.length;
    const totalWords = weekMemories.reduce((total, memory) => 
      total + memory.memory.split(' ').length, 0
    );
    const avgWordsPerMemory = memoriesCount > 0 ? Math.round(totalWords / memoriesCount) : 0;
    
    return { memoriesCount, totalWords, avgWordsPerMemory };
  };

  const stats = getMonthStats();

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0c0c0c' }}>
      <LinearGradient
        colors={[
          '#B6C874',
          '#D9BA72', 
          '#6FD9E5',
          '#0c0c0c',
          '#0c0c0c',
          '#0c0c0c',
        ]}
        style={styles.container}
      >
        <StatusBar style="light" />
        
        {/* Simple header with just title */}
        <View style={[styles.simpleHeader, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleSafeBack}
          >
            <Text style={styles.backButtonText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>This Month</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Week Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.memoriesCount}</Text>
            <Text style={styles.statLabel}>Memories</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.totalWords}</Text>
            <Text style={styles.statLabel}>Total Words</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.avgWordsPerMemory}</Text>
            <Text style={styles.statLabel}>Avg Words</Text>
          </View>
        </View>

        {/* Week Days Grid */}
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.weekGrid}>
            {currentWeek.map((date, index) => {
              const memory = getMemoryForDate(date);
              const isToday = date.toDateString() === today.toDateString();
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayCard,
                    memory && styles.dayCardWithMemory,
                    isToday && styles.todayCard
                  ]}
                  onPress={() => router.replace('/')} // Navigate back to daily view
                >
                  <Text style={[
                    styles.dayDate,
                    memory && styles.dayDateWithMemory,
                    isToday && styles.todayText
                  ]}>
                    {formatDate(date)}
                  </Text>
                  
                  {memory ? (
                    <View style={styles.memoryPreview}>
                      <Text style={styles.memoryText} numberOfLines={4}>
                        {memory.memory}
                      </Text>
                      <Text style={styles.wordCount}>
                        {memory.memory.split(' ').length} words
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.noMemoryText}>
                      {isToday ? 'Write today\'s memory' : 'No memory'}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Floating Bottom Navigation */}
        <View style={styles.bottomNavContainer}>
          {Platform.OS === 'ios' ? (
            <BlurView 
              intensity={100} 
              tint="dark" 
              style={styles.bottomNavBlur}
            >
              <View style={styles.bottomNavContent}>
                <TouchableOpacity 
                  style={styles.navButton} 
                  onPress={handlePreviousMonth}
                  accessibilityLabel="Previous month"
                  accessibilityRole="button"
                >
                  <Text style={styles.navButtonText}>‹</Text>
                </TouchableOpacity>
                
                <View style={styles.monthYearContainer}>
                  <Text style={styles.monthYearText}>
                    {monthNames[currentMonth]} {currentYear}
                  </Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.navButton} 
                  onPress={handleNextMonth}
                  accessibilityLabel="Next month"
                  accessibilityRole="button"
                >
                  <Text style={styles.navButtonText}>›</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.todayButton} 
                  onPress={handleToday}
                  accessibilityLabel="Go to today"
                  accessibilityRole="button"
                >
                  <Text style={styles.todayButtonText}>Today</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.reflectionButton} 
                  onPress={handleReflection}
                  accessibilityLabel="AI Reflections"
                  accessibilityRole="button"
                >
                  <Text style={styles.reflectionButtonText}>🧠</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.settingsButton} 
                  onPress={handleSettings}
                  accessibilityLabel="Settings"
                  accessibilityRole="button"
                >
                  <Text style={styles.settingsButtonText}>⚙️</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          ) : (
            <View style={styles.bottomNavFallback}>
              <View style={styles.bottomNavContent}>
                <TouchableOpacity 
                  style={styles.navButton} 
                  onPress={handlePreviousMonth}
                  accessibilityLabel="Previous month"
                  accessibilityRole="button"
                >
                  <Text style={styles.navButtonText}>‹</Text>
                </TouchableOpacity>
                
                <View style={styles.monthYearContainer}>
                  <Text style={styles.monthYearText}>
                    {monthNames[currentMonth]} {currentYear}
                  </Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.navButton} 
                  onPress={handleNextMonth}
                  accessibilityLabel="Next month"
                  accessibilityRole="button"
                >
                  <Text style={styles.navButtonText}>›</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.todayButton} 
                  onPress={handleToday}
                  accessibilityLabel="Go to today"
                  accessibilityRole="button"
                >
                  <Text style={styles.todayButtonText}>Today</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.reflectionButton} 
                  onPress={handleReflection}
                  accessibilityLabel="AI Reflections"
                  accessibilityRole="button"
                >
                  <Text style={styles.reflectionButtonText}>🧠</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.settingsButton} 
                  onPress={handleSettings}
                  accessibilityLabel="Settings"
                  accessibilityRole="button"
                >
                  <Text style={styles.settingsButtonText}>⚙️</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0c0c',
  },
  simpleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'rgba(12, 12, 12, 0.8)',
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 60, // Same width as back button for balance
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: '#4A90E2',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 120, // Add padding for floating navigation
  },
  weekGrid: {
    paddingVertical: 16,
  },
  dayCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 120,
  },
  dayCardWithMemory: {
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    borderColor: 'rgba(74, 144, 226, 0.3)',
  },
  todayCard: {
    borderColor: '#4A90E2',
    borderWidth: 2,
  },
  dayDate: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  dayDateWithMemory: {
    color: '#4A90E2',
  },
  todayText: {
    color: '#4A90E2',
    fontWeight: '700',
  },
  memoryPreview: {
    flex: 1,
  },
  memoryText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  wordCount: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontWeight: '500',
  },
  noMemoryText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  
  // Floating Bottom Navigation Styles
  bottomNavContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 20,
    left: 16,
    right: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  bottomNavBlur: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(12, 12, 12, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  bottomNavFallback: {
    backgroundColor: 'rgba(12, 12, 12, 0.9)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  bottomNavContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 70,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  navButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  monthYearContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 12,
  },
  monthYearText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    marginLeft: 8,
  },
  todayButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  reflectionButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#070911',
    borderRadius: 24,
    marginLeft: 6,
  },
  reflectionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  settingsButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  settingsButtonText: {
    fontSize: 16,
  },
});