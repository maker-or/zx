import * as Haptics from 'expo-haptics';
import 'react-native-get-random-values';

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Platform,
  StyleSheet,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { BlurView } from 'expo-blur';

import { useRouter } from 'expo-router';
import { useMemory } from '../../hooks/useMemory';
import { useAuth } from '@clerk/clerk-expo';
import { LoadingSpinner } from '../../components/UIComponents';

const { width, height } = Dimensions.get('window');

// const { width, height } = Dimensions.get('window');

// Time-based greeting component
const TimeBasedGreeting = () => {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) {
        setGreeting('Good Morning');
      } else if (hour >= 12 && hour < 17) {
        setGreeting('Good Afternoon');
      } else {
        setGreeting('Good Evening');
      }
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={newStyles.greetingContainer}>
      <Text style={newStyles.greetingText}>{greeting}.</Text>
    </View>
  );
};

// Week calendar component
const WeekCalendar = ({
  selectedDate,
  onDateSelect,
  isEditingUnlocked,
  onUnlockEditing,
}: {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  isEditingUnlocked: boolean;
  onUnlockEditing: () => void;
}) => {
  const [currentWeek, setCurrentWeek] = useState<Date[]>([]);
  const today = new Date();

  useEffect(() => {
    const generateCurrentWeek = () => {
      const week: Date[] = [];
      const startOfWeek = new Date(today);
      const dayOfWeek = startOfWeek.getDay();

      // Adjust to start from Monday
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      startOfWeek.setDate(startOfWeek.getDate() + mondayOffset);

      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        week.push(date);
      }

      setCurrentWeek(week);
    };

    generateCurrentWeek();
  }, []);

  const dayNames = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

  const handleDatePress = async (date: Date) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDateSelect(date);
  };

  const handleDateLongPress = async (date: Date) => {
    const isToday = date.toDateString() === today.toDateString();
    if (isToday) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      onUnlockEditing();
    }
  };

  return (
    <View style={newStyles.weekContainer}>
      <View style={newStyles.weekDaysRow}>
        {currentWeek.map((date, index) => {
          const isToday = date.toDateString() === today.toDateString();
          const isSelected = date.toDateString() === selectedDate.toDateString();

          return (
            <TouchableOpacity
              key={index}
              style={[
                newStyles.dayContainer,
                isSelected && newStyles.selectedDayContainer,
                isToday && isEditingUnlocked && newStyles.unlockedDayContainer,
              ]}
              onPress={() => handleDatePress(date)}
              onLongPress={() => handleDateLongPress(date)}
              activeOpacity={0.7}>
              <Text
                style={[
                  newStyles.dayNumber,
                  isToday && newStyles.todayNumber,
                  isSelected && newStyles.selectedDayNumber,
                  isToday && isEditingUnlocked && newStyles.unlockedDayNumber,
                ]}>
                {date.getDate()}
              </Text>
              <Text
                style={[
                  newStyles.dayName,
                  isToday && newStyles.todayName,
                  isSelected && newStyles.selectedDayName,
                  isToday && isEditingUnlocked && newStyles.unlockedDayName,
                ]}>
                {dayNames[index]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// Memory text area component
const MemoryTextArea = ({
  selectedDate,
  isEditingUnlocked,
}: {
  selectedDate: Date;
  isEditingUnlocked: boolean;
}) => {
  const [memoryText, setMemoryText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { userId } = useAuth();
  const { saveMemory, getMemoryByDate } = useMemory(userId || '');

  useEffect(() => {
    const loadMemoryForDate = async () => {
      if (!userId) return;

      try {
        const memory = await getMemoryByDate(selectedDate);
        if (memory) {
          setMemoryText(memory.memory);
        } else {
          setMemoryText('');
        }
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('Failed to load memory for selected date:', error);
        setMemoryText('');
      }
    };

    loadMemoryForDate();
  }, [userId, selectedDate, getMemoryByDate]);

  const handleTextChange = (text: string) => {
    if (canEdit) {
      setMemoryText(text);
      setHasUnsavedChanges(true);
    }
  };

  const handleSave = async () => {
    if (!memoryText.trim() || !userId) return;

    setIsLoading(true);
    try {
      const result = await saveMemory(selectedDate, memoryText);
      if (result.success) {
        setHasUnsavedChanges(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error) {
      console.error('Failed to save memory:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const today = new Date();
  const isSelectedDateToday = selectedDate.toDateString() === today.toDateString();
  const canEdit = isSelectedDateToday && isEditingUnlocked;

  const getPlaceholder = () => {
    if (isSelectedDateToday) {
      return isEditingUnlocked
        ? "What's on you mind today, alway remember that no matter what tomorrow is going to be great"
        : "Long press on today's date to unlock editing";
    } else {
      return `Memory from ${selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`;
    }
  };

  return (
    <View style={newStyles.memoryContainer}>
      <View
        style={[newStyles.memoryTextContainer, !canEdit && newStyles.memoryTextContainerReadOnly]}>
        <TextInput
          key={`${selectedDate.toDateString()}-${isEditingUnlocked}`}
          style={[newStyles.memoryTextInput, !canEdit && newStyles.memoryTextInputReadOnly]}
          multiline
          placeholder={getPlaceholder()}
          placeholderTextColor={canEdit ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.3)'}
          value={memoryText}
          onChangeText={handleTextChange}
          textAlignVertical="top"
          autoCorrect={true}
          spellCheck={true}
          editable={canEdit}
          selectTextOnFocus={canEdit}
          pointerEvents={canEdit ? 'auto' : 'none'}
        />
        {/* {!canEdit && memoryText === '' && (
          <View style={newStyles.emptyStateContainer}>
            <Text style={newStyles.emptyStateText}>
              {isSelectedDateToday ? '🔒 Tap and hold today to unlock editing' : '📖 View only'}
            </Text>
          </View>
        )} */}
      </View>

      {hasUnsavedChanges && canEdit && (
        <TouchableOpacity
          style={newStyles.saveButton}
          onPress={handleSave}
          disabled={isLoading}
          activeOpacity={0.8}>
          <Text style={newStyles.saveButtonText}>{isLoading ? 'Saving...' : 'Save Memory'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Hamburger menu component
const HamburgerMenu = ({ isVisible, onClose }: { isVisible: boolean; onClose: () => void }) => {
  const router = useRouter();

  const navigateToReflection = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose();
    router.push('/reflection');
  };

  const navigateToSettings = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose();
    router.push('/settings');
  };

  const handleOverlayPress = () => {
    onClose();
  };

  if (!isVisible) return null;

  return (
    <View style={newStyles.modalOverlay}>
      <TouchableOpacity
        style={newStyles.modalBackdrop}
        activeOpacity={1}
        onPress={handleOverlayPress}
      />
      <View style={newStyles.modalContainer}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={100} tint="dark" style={newStyles.modalContent}>
            <View style={newStyles.menuItems}>
              <TouchableOpacity
                style={newStyles.menuItem}
                onPress={navigateToReflection}
                activeOpacity={0.8}>
                <Text style={newStyles.menuItemText}>Reflection</Text>
              </TouchableOpacity>

              <View style={newStyles.menuDivider} />

              <TouchableOpacity
                style={newStyles.menuItem}
                onPress={navigateToSettings}
                activeOpacity={0.8}>
                <Text style={newStyles.menuItemText}>Settings</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        ) : (
          <View style={newStyles.modalContentFallback}>
            <View style={newStyles.menuItems}>
              <TouchableOpacity
                style={newStyles.menuItem}
                onPress={navigateToReflection}
                activeOpacity={0.8}>
                <Text style={newStyles.menuItemText}>Reflection</Text>
              </TouchableOpacity>

              <View style={newStyles.menuDivider} />

              <TouchableOpacity
                style={newStyles.menuItem}
                onPress={navigateToSettings}
                activeOpacity={0.8}>
                <Text style={newStyles.menuItemText}>Settings</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

// Hamburger icon component
const HamburgerIcon = ({ onPress }: { onPress: () => void }) => {
  return (
    <TouchableOpacity style={newStyles.hamburgerContainer} onPress={onPress} activeOpacity={0.8}>
      <View style={newStyles.hamburgerLine} />
    </TouchableOpacity>
  );
};

// Main home screen component
const HomeScreen = () => {
  const { userId, isLoaded } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isEditingUnlocked, setIsEditingUnlocked] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [fontsLoaded, fontError] = useFonts({
    InstrumentSerif: require('../../assets/fonts/InstrumentSerif-Regular.ttf'),
  });

  if (!isLoaded || !fontsLoaded) {
    return <LoadingSpinner />;
  }

  if (fontError) {
    console.error('Font loading error:', fontError);
    // Optionally, return a view with an error message
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // Lock editing when switching to a different date
    const today = new Date();
    if (date.toDateString() !== today.toDateString()) {
      setIsEditingUnlocked(false);
    }
  };

  const handleUnlockEditing = () => {
    setIsEditingUnlocked(true);
  };

  const handleMenuPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsMenuVisible(true);
  };

  const handleMenuClose = () => {
    setIsMenuVisible(false);
  };

  return (
    <SafeAreaView style={newStyles.container}>
      <StatusBar style="light" />
      <View style={newStyles.content}>
        <TimeBasedGreeting />
        <WeekCalendar
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          isEditingUnlocked={isEditingUnlocked}
          onUnlockEditing={handleUnlockEditing}
        />
        <MemoryTextArea selectedDate={selectedDate} isEditingUnlocked={isEditingUnlocked} />
      </View>

      <HamburgerIcon onPress={handleMenuPress} />
      <HamburgerMenu isVisible={isMenuVisible} onClose={handleMenuClose} />
    </SafeAreaView>
  );
};

// New styles for the redesigned home screen
const newStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0c0c',
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 120,
  },

  // Greeting styles
  greetingContainer: {
    marginBottom: 40,
  },
  greetingText: {
    fontSize: 48,
    fontWeight: '300',
    color: '#FFFFFF',
    fontFamily: 'InstrumentSerif',
    letterSpacing: -2,
  },

  // Week calendar styles
  weekContainer: {
    marginBottom: 40,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayContainer: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 12,
    minHeight: 60,
    justifyContent: 'center',
  },
  selectedDayContainer: {
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.3)',
  },
  unlockedDayContainer: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  dayNumber: {
    fontSize: 36,
    fontWeight: '300',
    color: '#FFFFFF',

    marginBottom: 4,
  },
  todayNumber: {
    color: '#FF6B35', // Orange color for today
    fontWeight: '600',
  },
  dayName: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  todayName: {
    color: '#FF6B35', // Orange color for today
    fontWeight: '600',
  },
  selectedDayNumber: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  selectedDayName: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  unlockedDayNumber: {
    color: '#22C55E',
    fontWeight: '600',
  },
  unlockedDayName: {
    color: '#22C55E',
    fontWeight: '600',
  },
  lockIcon: {
    fontSize: 10,
    marginTop: 2,
    opacity: 0.6,
  },
  unlockIcon: {
    fontSize: 10,
    marginTop: 2,
    opacity: 0.8,
  },

  // Memory text area styles
  memoryContainer: {
    flex: 1,
    marginBottom: 20,
  },
  memoryTextContainer: {
    flex: 1,
    backgroundColor: '#0c0c0c',
    borderRadius: 20,
    padding: 20,
  },
  memoryTextInput: {
    flex: 1,
    fontSize: 24,
    color: '#FFFFFF',
    fontFamily: 'InstrumentSerif',
    lineHeight: 28,
    textAlignVertical: 'top',
    backgroundColor: '#0c0c0c',
    padding: 10,
  },
  memoryTextContainerReadOnly: {
    opacity: 0.7,
  },
  memoryTextInputReadOnly: {
    opacity: 0.8,
  },
  emptyStateContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    transform: [{ translateY: -10 }],
  },
  emptyStateText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 16,
    fontFamily: 'InstrumentSerif',
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'InstrumentSerif',
  },

  // Hamburger menu styles
  hamburgerContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 60,
    left: 36,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  hamburgerLine: {
    width: 48,
    height: 12,
    backgroundColor: '#FFFFFF',
    marginVertical: 2,
    borderRadius: 100,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  modalContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 100,
    left: 24,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(12, 12, 12, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalContentFallback: {
    backgroundColor: 'rgba(12, 12, 12, 0.95)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  menuItems: {
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: 12,
  },

  menuItemText: {
    fontSize: 18,
    color: '#0c0c0c',
    fontWeight: '400',
  },
  menuDivider: {
    height: 2,
    backgroundColor: '#C9C6C6',
    marginVertical: 8,
  },
});

export default HomeScreen;
