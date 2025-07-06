import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';

export type MoodType = 'amazing' | 'good' | 'okay' | 'bad' | 'terrible';

interface MoodOption {
  id: MoodType;
  emoji: string;
  label: string;
  color: string;
}

interface MoodTrackerProps {
  selectedMood?: MoodType;
  onMoodSelect: (mood: MoodType) => void;
  disabled?: boolean;
  compact?: boolean;
}

const moodOptions: MoodOption[] = [
  { id: 'amazing', emoji: '😄', label: 'Amazing', color: '#28A745' },
  { id: 'good', emoji: '😊', label: 'Good', color: '#20C997' },
  { id: 'okay', emoji: '😐', label: 'Okay', color: '#FFC107' },
  { id: 'bad', emoji: '😔', label: 'Bad', color: '#FD7E14' },
  { id: 'terrible', emoji: '😢', label: 'Terrible', color: '#DC3545' },
];

export const MoodTracker: React.FC<MoodTrackerProps> = ({
  selectedMood,
  onMoodSelect,
  disabled = false,
  compact = false,
}) => {
  const { theme } = useTheme();

  const handleMoodSelect = async (mood: MoodType) => {
    if (disabled) return;
    
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onMoodSelect(mood);
  };

  return (
    <View style={styles.container}>
      {!compact && (
        <Text style={[styles.title, { color: theme.colors.text }]}>
          How are you feeling today?
        </Text>
      )}
      
      <View style={[styles.moodContainer, compact && styles.moodContainerCompact]}>
        {moodOptions.map((mood) => {
          const isSelected = selectedMood === mood.id;
          
          return (
            <TouchableOpacity
              key={mood.id}
              style={[
                styles.moodButton,
                compact && styles.moodButtonCompact,
                {
                  backgroundColor: isSelected ? mood.color + '20' : theme.colors.surface,
                  borderColor: isSelected ? mood.color : theme.colors.border,
                  borderWidth: isSelected ? 2 : 1,
                },
                disabled && styles.moodButtonDisabled,
              ]}
              onPress={() => handleMoodSelect(mood.id)}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityLabel={`${mood.label} mood`}
              accessibilityState={{ selected: isSelected }}
            >
              <Text style={[styles.moodEmoji, compact && styles.moodEmojiCompact]}>
                {mood.emoji}
              </Text>
              {!compact && (
                <Text 
                  style={[
                    styles.moodLabel,
                    { 
                      color: isSelected ? mood.color : theme.colors.text,
                      fontWeight: isSelected ? '600' : 'normal',
                    }
                  ]}
                >
                  {mood.label}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

interface MoodDisplayProps {
  mood: MoodType;
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const MoodDisplay: React.FC<MoodDisplayProps> = ({
  mood,
  showLabel = true,
  size = 'medium',
}) => {
  const { theme } = useTheme();
  const moodOption = moodOptions.find(m => m.id === mood);
  
  if (!moodOption) return null;

  const sizeStyles = {
    small: { emoji: 16, label: 12 },
    medium: { emoji: 24, label: 14 },
    large: { emoji: 32, label: 16 },
  };

  return (
    <View style={styles.moodDisplay}>
      <Text style={[styles.displayEmoji, { fontSize: sizeStyles[size].emoji }]}>
        {moodOption.emoji}
      </Text>
      {showLabel && (
        <Text 
          style={[
            styles.displayLabel,
            { 
              color: theme.colors.textSecondary,
              fontSize: sizeStyles[size].label,
            }
          ]}
        >
          {moodOption.label}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  moodContainerCompact: {
    justifyContent: 'center',
    gap: 4,
  },
  moodButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    minHeight: 70,
    justifyContent: 'center',
  },
  moodButtonCompact: {
    flex: 0,
    minHeight: 40,
    width: 40,
  },
  moodButtonDisabled: {
    opacity: 0.5,
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodEmojiCompact: {
    fontSize: 18,
    marginBottom: 0,
  },
  moodLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  moodDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  displayEmoji: {
    // fontSize is set dynamically
  },
  displayLabel: {
    fontWeight: '500',
  },
});
