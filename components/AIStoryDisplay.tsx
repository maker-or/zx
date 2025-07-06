import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Reflection } from '../services/reflection';
import * as Haptics from 'expo-haptics';

interface AIStoryDisplayProps {
  reflection: Reflection;
  onClose: () => void;
  onSave?: () => void;
  showSaveOption?: boolean;
}

export const AIStoryDisplay: React.FC<AIStoryDisplayProps> = ({
  reflection,
  onClose,
  onSave,
  showSaveOption = true,
}) => {
  const [saved, setSaved] = useState(false);
  const insets = useSafeAreaInsets();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getReflectionTypeDisplay = (type: string) => {
    switch (type) {
      case 'weekly':
        return 'Weekly Reflection';
      case 'monthly':
        return 'Monthly Reflection';
      case 'yearly':
        return 'Yearly Reflection';
      default:
        return 'Reflection';
    }
  };

  const getStoryTypeDisplay = (type: string) => {
    switch (type) {
      case 'therapeutic':
        return 'Therapeutic Story';
      case 'inspirational':
        return 'Inspirational Story';
      default:
        return 'AI Story';
    }
  };

  const handleSave = async () => {
    if (onSave) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onSave();
      setSaved(true);
    }
  };

  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const wordCount = reflection.aiStory.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200); // Average reading speed

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={['#0c0c0c', '#0c0c0c']} style={styles.gradient}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
          <View style={styles.headerInfo}>
            <Text style={styles.reflectionType}>{getReflectionTypeDisplay(reflection.type)}</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.storyContainer}>
            <View style={styles.storyMeta}>
              <Text style={styles.wordCount}>
                {wordCount} words • {readingTime} min read
              </Text>
            </View>

            <Text style={styles.storyText}>{reflection.aiStory}</Text>
          </View>
        </ScrollView>

        {showSaveOption && (
          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 34) }]}>
            <TouchableOpacity
              style={[styles.saveButton, saved && styles.savedButton]}
              onPress={handleSave}
              disabled={saved}>
              <Text style={[styles.saveButtonText, saved && styles.savedButtonText]}>
                {saved ? '✓ Saved to Journal' : 'Save to Journal'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0c0c',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  headerInfo: {
    flex: 1,
  },
  reflectionType: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  storyType: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
  },
  closeButtonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: '300',
    lineHeight: 24,
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  storyContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  storyMeta: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  wordCount: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.6)',
    textAlign: 'center',
  },
  storyText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    fontFamily: 'InstrumentSerif-Regular',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 34,
    paddingTop: 20,
    backgroundColor: 'transparent',
  },
  saveButton: {
    backgroundColor: 'rgba(255, 255, 255,1)',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  savedButton: {
    backgroundColor: 'rgba(46, 125, 50, 0.9)',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  savedButtonText: {
    color: 'white',
  },
});
