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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useMemory } from '../../hooks/useMemory';
import { Memory } from '../../services/memory';

export default function WeekScreen() {
  const router = useRouter();
  const today = new Date();
  const [currentWeek, setCurrentWeek] = useState<Date[]>([]);
  const [weekMemories, setWeekMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  
  const userId = 'default-user';
  const { getMemoriesForMonth } = useMemory(userId);

  // Get current week dates
  useEffect(() => {
    const getWeekDates = () => {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday
      
      const week = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        week.push(date);
      }
      setCurrentWeek(week);
    };
    
    getWeekDates();
  }, []);

  // Load memories for current week
  useEffect(() => {
    const loadWeekMemories = async () => {
      if (currentWeek.length === 0) return;
      
      setLoading(true);
      try {
        const memories = await getMemoriesForMonth(today.getMonth(), today.getFullYear());
        const weekMemories = memories.filter(memory => {
          const memoryDate = new Date(memory.date);
          return currentWeek.some(weekDate => 
            weekDate.getDate() === memoryDate.getDate() &&
            weekDate.getMonth() === memoryDate.getMonth() &&
            weekDate.getFullYear() === memoryDate.getFullYear()
          );
        });
        setWeekMemories(weekMemories);
      } catch (error) {
        console.error('Failed to load week memories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWeekMemories();
  }, [currentWeek]);

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

  const getWeekStats = () => {
    const memoriesCount = weekMemories.length;
    const totalWords = weekMemories.reduce((total, memory) => 
      total + memory.memory.split(' ').length, 0
    );
    const avgWordsPerMemory = memoriesCount > 0 ? Math.round(totalWords / memoriesCount) : 0;
    
    return { memoriesCount, totalWords, avgWordsPerMemory };
  };

  const stats = getWeekStats();

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
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>This Week</Text>
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
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
                  onPress={() => router.back()} // Navigate back to daily view
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
      </LinearGradient>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0c0c',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingTop: 60,
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
});