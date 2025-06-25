import 'react-native-get-random-values';
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Platform,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { Link } from 'expo-router';
import { style } from './_style';
import { Animated } from 'react-native';
import { usersTable } from '../db/schema';
import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import { v4 as uuidv4 } from "uuid";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { useSQLiteContext } from 'expo-sqlite';
import * as schema from '../db/schema';
import { useMemory } from '../hooks/useMemory';
import { Memory } from '../services/memory';

const { width } = Dimensions.get('window');

// Navigation Header Component
const NavigationHeader = ({ 
  currentMonth, 
  currentYear, 
  onPreviousMonth, 
  onNextMonth, 
  onToday,
  onReflection
}: {
  currentMonth: number;
  currentYear: number;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;  
  onReflection: () => void;
}) => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <View style={style.navigationHeader}>
      <TouchableOpacity 
        style={style.navButton} 
        onPress={onPreviousMonth}
        accessibilityLabel="Previous month"
        accessibilityRole="button"
      >
        <Text style={style.navButtonText}>‹</Text>
      </TouchableOpacity>
      
      <View style={style.monthYearContainer}>
        <Text style={style.monthYearText}>
          {monthNames[currentMonth]} {currentYear}
        </Text>
      </View>
      
      <TouchableOpacity 
        style={style.navButton} 
        onPress={onNextMonth}
        accessibilityLabel="Next month"
        accessibilityRole="button"
      >
        <Text style={style.navButtonText}>›</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={style.todayButton} 
        onPress={onToday}
        accessibilityLabel="Go to today"
        accessibilityRole="button"
      >
        <Text style={style.todayButtonText}>Today</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={style.reflectionButton} 
        onPress={onReflection}
        accessibilityLabel="AI Reflections"
        accessibilityRole="button"
      >
        <Text style={style.reflectionButtonText}>🧠</Text>
      </TouchableOpacity>
    </View>
  );
};

const DatePage = ({ 
  date, 
  isToday, 
  hasMemory = false 
}: { 
  date: Date; 
  isToday: boolean; 
  hasMemory?: boolean;
}) => {
  const [inputFocused, setInputFocused] = useState(false);
  const inputAnimation = useRef(new Animated.Value(0)).current;
  const [inputValue, setInputValue] = useState('');
  const [existingMemory, setExistingMemory] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const userId = 'default-user'; // Simple hardcoded user ID since auth is removed

  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema});
  useDrizzleStudio(db);
  
  const { saveMemory, getMemoryByDate, canEditMemory, isToday: isTodayCheck, loading: memoryLoading, error: memoryError } = useMemory(userId);

  // Check if this date can be edited
  const canEdit = canEditMemory(date);
  const isTodayDate = isTodayCheck(date);

  // Load existing memory when date changes
  useEffect(() => {
    const loadMemory = async () => {
      const memory = await getMemoryByDate(date);
      if (memory) {
        setExistingMemory(memory.memory);
        setInputValue(memory.memory);
        setIsEditing(false); // Start in read-only mode for existing memories
      } else {
        setExistingMemory('');
        setInputValue('');
        // Only start in edit mode if it's today (can edit)
        setIsEditing(canEdit);
      }
      setHasUnsavedChanges(false);
    };

    loadMemory();
  }, [date, canEdit]);

  useEffect(() => {
    Animated.spring(inputAnimation, {
      toValue: inputFocused ? 1 : 0,
      useNativeDriver: true,
      damping: 12,
      mass: 1,
      stiffness: 120,
    }).start();
  }, [inputFocused]);

  const animatedInputStyle = {
    transform: [
      {
        scale: inputAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.05],
        }),
      },
    ],
    shadowOpacity: inputAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.15, 0.25],
    }),
    shadowRadius: inputAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [8, 16],
    }),
    borderColor: inputAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: ['#ccc', '#4A90E2'],
    }),
  };

  const onFocus = () => {
    setInputFocused(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const onBlur = () => {
    setInputFocused(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const getWeekNumber = (d: Date) => {
    const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
    const pastDaysOfYear = (d.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const handleTextChange = (text: string) => {
    setInputValue(text);
    setHasUnsavedChanges(text !== existingMemory);
  };

  const handleEdit = () => {
    if (!canEdit) {
      // Show a message that editing is not allowed
      return;
    }
    setIsEditing(true);
    setInputFocused(true);
  };

  const handleCancel = () => {
    setInputValue(existingMemory);
    setIsEditing(false);
    setHasUnsavedChanges(false);
  };

  const handleSubmit = async () => {
    if (!inputValue.trim()) return;

    try {
      const result = await saveMemory(date, inputValue);
      if (result.success) {
        console.log('Memory saved successfully!');
        setExistingMemory(inputValue);
        setIsEditing(false);
        setHasUnsavedChanges(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        // Error is already set in the hook
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error) {
      console.error('Failed to save memory:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <SafeAreaView style={style.container}>
      <View style={style.datePageContainer}>
        <View style={style.contentContainer}>
          <View style={style.dateSection}>
            <Text style={style.dateText}>
              {date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            <View style={style.bord}>
              <LinearGradient
                colors={[
                  '#0c0c0c50',
                  '#D9BA72',
                  '#f7eee350',
                  '#0c0c0c',
                  '#0c0c0c',
                  '#0c0c0c',
                ]}
                style={style.in}
              >
                <Animated.View style={[style.inputContainer, animatedInputStyle]}>
                  {memoryLoading ? (
                    <View style={style.loadingContainer}>
                      <Text style={style.loadingText}>Loading memory...</Text>
                    </View>
                  ) : (
                    <>
                      <TextInput
                        style={[style.textInput, { 
                          borderColor: inputFocused ? '#4A90E2' : '#ccc',
                          opacity: !canEdit && existingMemory ? 0.7 : 1.0
                        }]}
                        multiline
                        placeholder={
                          !canEdit && !existingMemory 
                            ? "No memory recorded for this day" 
                            : existingMemory 
                              ? (canEdit ? "Your memory for this day..." : "Memory from this day (read-only)")
                              : "Write your thoughts for today..."
                        }
                        placeholderTextColor="rgba(255, 255, 255, 0.4)"
                        onFocus={onFocus}
                        onBlur={onBlur}
                        selectionColor="#4A90E2"
                        accessibilityLabel="Daily journal entry"
                        accessibilityHint={canEdit ? "Write your thoughts, ideas, or experiences for today" : "View memory from this date (read-only)"}
                        accessibilityRole="text"
                        importantForAccessibility="yes"
                        autoCorrect={true}
                        spellCheck={true}
                        clearButtonMode="while-editing"
                        value={inputValue}
                        onChangeText={handleTextChange}
                        editable={isEditing && canEdit}
                      />
                      
                      {/* Bottom section with character count, buttons, and week number */}
                      <View style={style.bottomSection}>
                        {/* Character count */}
                        {inputValue.length > 0 && (
                          <Text style={style.charCountText}>
                            {inputValue.length} characters
                          </Text>
                        )}
                        
                        {/* Action Buttons */}
                        {existingMemory && !isEditing ? (
                          // Read-only mode with conditional edit button
                          <View style={style.buttonContainer}>
                            {canEdit ? (
                              <TouchableOpacity
                                style={[style.button, style.editButton]}
                                onPress={handleEdit}
                                activeOpacity={0.8}
                                accessibilityLabel="Edit memory"
                                accessibilityHint="Edit your memory for this day"
                                accessibilityRole="button"
                              >
                                <Text style={style.buttonText}>Edit Memory</Text>
                              </TouchableOpacity>
                            ) : (
                              <View style={style.lockedContainer}>
                                <Text style={style.lockedText}>
                                  🔒 This memory is locked
                                </Text>
                                <Text style={style.lockedSubtext}>
                                  You can only edit memories from today to preserve authentic thoughts from each day.
                                </Text>
                              </View>
                            )}
                          </View>
                        ) : isEditing && canEdit && (inputValue.trim().length > 0 || hasUnsavedChanges) ? (
                          // Edit mode with save/cancel buttons (only if editing is allowed)
                          <View style={style.buttonContainer}>
                            <View style={style.buttonRow}>
                              {existingMemory && (
                                <TouchableOpacity
                                  style={[style.button, style.cancelButton]}
                                  onPress={handleCancel}
                                  activeOpacity={0.8}
                                  accessibilityLabel="Cancel editing"
                                  accessibilityRole="button"
                                >
                                  <Text style={[style.buttonText, style.cancelButtonText]}>Cancel</Text>
                                </TouchableOpacity>
                              )}
                              <TouchableOpacity
                                style={[style.button, memoryLoading && style.buttonDisabled]}
                                onPress={handleSubmit}
                                activeOpacity={0.8}
                                disabled={memoryLoading}
                                accessibilityLabel="Save memory"
                                accessibilityHint="Save your written memory to the database"
                                accessibilityRole="button"
                              >
                                <Text style={style.buttonText}>
                                  {memoryLoading ? "Saving..." : "Save Memory"}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        ) : !canEdit && !existingMemory ? (
                          // Past date with no memory
                          <View style={style.buttonContainer}>
                            <View style={style.lockedContainer}>
                              <Text style={style.lockedText}>
                                📅 No memory from this day
                              </Text>
                              <Text style={style.lockedSubtext}>
                                You can only create memories for today. Past dates cannot be edited.
                              </Text>
                            </View>
                          </View>
                        ) : null}
                        
                        {/* Error message */}
                        {memoryError && (
                          <Text style={style.errorText}>{memoryError}</Text>
                        )}
                        
                        {/* Week number at the bottom */}
                        <Text style={style.weekNumberText}>
                          Week {getWeekNumber(date)}
                        </Text>
                      </View>
                    </>
                  )}
                </Animated.View>
              </LinearGradient>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

// Week Overview Component
const WeekOverview = ({ 
  week, 
  weekIndex, 
  currentMonth, 
  currentYear, 
  hasMemoryForDate 
}: {
  week: Date[];
  weekIndex: number;
  currentMonth: number;
  currentYear: number;
  hasMemoryForDate: (date: Date) => boolean;
}) => {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  
  return (
    <View style={style.weekOverviewContainer}>
      <Text style={style.weekTitle}>
        Week {weekIndex + 1}
      </Text>
      <View style={style.weekDaysGrid}>
        {week.map((date, index) => {
          const hasMemory = hasMemoryForDate(date);
          const isToday = date.getDate() === today.getDate() &&
                         date.getMonth() === today.getMonth() &&
                         date.getFullYear() === today.getFullYear();
          
          return (
            <View 
              key={index} 
              style={[
                style.dayItem,
                hasMemory && style.dayItemWithMemory
              ]}
            >
              <Text style={[
                style.dayNumber,
                hasMemory && style.dayNumberWithMemory,
                isToday && { color: '#4A90E2', fontWeight: '800' }
              ]}>
                {date.getDate()}
              </Text>
              <Text style={style.dayName}>
                {dayNames[date.getDay()]}
              </Text>
              {hasMemory && <View style={style.memoryIndicator} />}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const HomeScreen = () => {
  const today = new Date();
  const router = useRouter();
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [currentDateIndex, setCurrentDateIndex] = useState(0);
  const weekScrollViewRef = useRef<ScrollView | null>(null);
  const dateScrollViewRef = useRef<ScrollView | null>(null);
  const [monthWeeks, setMonthWeeks] = useState<Date[][]>([]);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [initialScrollDone, setInitialScrollDone] = useState(false);
  const [memoryDates, setMemoryDates] = useState<Set<string>>(new Set()); // Track dates with memories
  const [fontsLoaded] = useFonts({
    InstrumentSerif: require('assets/fonts/InstrumentSerif-Regular.ttf'),
  });

  const userId = 'default-user';
  const { getMemoriesForMonth } = useMemory(userId);

  // Load memories for current month to show indicators
  useEffect(() => {
    const loadMemoriesForMonth = async () => {
      try {
        const memories = await getMemoriesForMonth(currentMonth, currentYear);
        const dates = new Set(memories.map((memory: Memory) => 
          new Date(memory.date).toDateString()
        ));
        setMemoryDates(dates);
      } catch (error) {
        console.error('Failed to load memories for month:', error);
      }
    };

    if (currentMonth !== undefined && currentYear !== undefined) {
      loadMemoriesForMonth();
    }
  }, [currentMonth, currentYear]);

  const navigateToMonth = (monthOffset: number) => {
    let newMonth = currentMonth + monthOffset;
    let newYear = currentYear;
    
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    setInitialScrollDone(false); // Reset to trigger scroll to appropriate week
  };

  const navigateToToday = () => {
    const todayDate = new Date();
    setCurrentMonth(todayDate.getMonth());
    setCurrentYear(todayDate.getFullYear());
    setInitialScrollDone(false); // Reset to trigger scroll to today
  };

  const navigateToReflection = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/reflection');
  };

  const hasMemoryForDate = (date: Date): boolean => {
    return memoryDates.has(date.toDateString());
  };

  useEffect(() => {
    generateMonthWeeks(currentMonth, currentYear);
  }, [currentMonth, currentYear]);

  useEffect(() => {
    if (monthWeeks.length > 0 && !initialScrollDone) {
      const todayDate = new Date();

      const weekIndex = monthWeeks.findIndex((week) =>
        week.some(
          (date) =>
            date.getDate() === todayDate.getDate() &&
            date.getMonth() === todayDate.getMonth() &&
            date.getFullYear() === todayDate.getFullYear()
        )
      );

      const dateIndex =
        weekIndex !== -1
          ? monthWeeks[weekIndex].findIndex(
            (date) =>
              date.getDate() === todayDate.getDate() &&
              date.getMonth() === todayDate.getMonth() &&
              date.getFullYear() === todayDate.getFullYear()
          )
          
          : 0;

      if (weekIndex !== -1) {
        weekScrollViewRef.current?.scrollTo({
          y: weekIndex * Dimensions.get('window').height,
          animated: true,
        });
        setCurrentWeekIndex(weekIndex);

        if (dateIndex !== -1) {
          setTimeout(() => {
            dateScrollViewRef.current?.scrollTo({
              x: dateIndex * width,
              animated: true,
            });
            setCurrentDateIndex(dateIndex);
          }, 100);
        }
      }
      setInitialScrollDone(true);
    }
  }, [monthWeeks, initialScrollDone]);

  const generateMonthWeeks = (month: number, year: number) => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];

    for (let i = firstDayOfMonth.getDay() - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      currentWeek.push(date);
    }

    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(year, month, day);
      currentWeek.push(date);

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      const daysToAdd = 7 - currentWeek.length;
      for (let i = 1; i <= daysToAdd; i++) {
        const date = new Date(year, month + 1, i);
        currentWeek.push(date);
      }
      weeks.push(currentWeek);
    }

    setMonthWeeks(weeks);
  };

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleDateScroll = (event: {
    nativeEvent: { contentOffset: { x: number } };
  }) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    if (index !== currentDateIndex) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentDateIndex(index);
    }
  };

  const handleWeekScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const newIndex = Math.round(offsetY / Dimensions.get('window').height);

    if (newIndex !== currentWeekIndex) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentWeekIndex(newIndex);
    }
  };

  // Gesture handlers
  const panGesture = Gesture.Pan()
    .onEnd((event) => {
      if (event.velocityY > 1000) {
        // Fast swipe down to go to week view
        router.push('/week');
      }
    });

  // Navigation handlers
  const handlePreviousMonth = () => {
    navigateToMonth(-1);
  };

  const handleNextMonth = () => {
    navigateToMonth(1);
  };

  const handleToday = () => {
    navigateToToday();
  };

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
        style={style.container}
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar style="light" />
          
          {/* Navigation Header */}  
          <NavigationHeader
            currentMonth={currentMonth}
            currentYear={currentYear}
            onPreviousMonth={handlePreviousMonth}
            onNextMonth={handleNextMonth}
            onToday={handleToday}
            onReflection={navigateToReflection}
          />
          
          <GestureDetector gesture={panGesture}>
            <ScrollView
              ref={weekScrollViewRef}
              pagingEnabled
              showsVerticalScrollIndicator={false}
              onMomentumScrollEnd={handleWeekScroll}
              snapToInterval={Dimensions.get('window').height - 100} // Account for fixed header height
              decelerationRate="fast"
              contentContainerStyle={{
                flexGrow: 1,
              }}
            >
            {monthWeeks.map((week, weekIndex) => (
              <View
                key={weekIndex}
                style={{
                  width: '100%',
                  height: Dimensions.get('window').height - 100, // Account for fixed header height
                }}
              >
                {/* Week Overview */}
                <WeekOverview
                  week={week}
                  weekIndex={weekIndex}
                  currentMonth={currentMonth}
                  currentYear={currentYear}
                  hasMemoryForDate={hasMemoryForDate}
                />
                
                <ScrollView
                  ref={dateScrollViewRef}
                  horizontal
                  pagingEnabled
                  nestedScrollEnabled={true}
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={handleDateScroll}
                  snapToInterval={width}
                  decelerationRate="fast"
                  contentContainerStyle={{
                    flexGrow: 1,
                  }}
                >
                  {week.map((date, dateIndex) => (
                    <View
                      key={dateIndex}
                      style={{
                        width: Dimensions.get('window').width,
                        height: Dimensions.get('window').height - 180, // Account for header and week overview
                      }}
                    >
                      <DatePage
                        date={date}
                        isToday={
                          date.getDate() === today.getDate() &&
                          date.getMonth() === today.getMonth() &&
                          date.getFullYear() === today.getFullYear()
                        }
                        hasMemory={hasMemoryForDate(date)}
                      />
                    </View>
                  ))}
                </ScrollView>
              </View>
            ))}
          </ScrollView>
          </GestureDetector>
          
          {/* Bottom Navigation Hint */}
          <View style={style.bottomNavigationHint}>
            <Text style={style.bottomHintText}>
              💡 Swipe down quickly to access week view
            </Text>
          </View>
        </GestureHandlerRootView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default HomeScreen;
