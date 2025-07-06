import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useReflection } from '../hooks/useReflection';
import { ReflectionTrigger } from '../services/reflection';
import * as Haptics from 'expo-haptics';

import { useAuth } from '@clerk/clerk-expo';

interface ReflectionNotificationProps {
  openRouterApiKey?: string;
}

export const ReflectionNotification: React.FC<ReflectionNotificationProps> = ({ openRouterApiKey }) => {
  const router = useRouter();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [isVisible, setIsVisible] = useState(false);
  const { userId } = useAuth();
  
  const { 
    pendingTriggers, 
    loadPendingTriggers,
    createReflectionTriggers
  } = useReflection(userID, openRouterApiKey);

  useEffect(() => {
    checkForPendingReflections();
  }, []);

  useEffect(() => {
    if (pendingTriggers.length > 0 && !isVisible) {
      showNotification();
    } else if (pendingTriggers.length === 0 && isVisible) {
      hideNotification();
    }
  }, [pendingTriggers]);

  const checkForPendingReflections = async () => {
    try {
      await createReflectionTriggers();
      await loadPendingTriggers();
    } catch (err) {
      console.error('Failed to check for pending reflections:', err);
    }
  };

  const showNotification = () => {
    setIsVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const hideNotification = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsVisible(false);
    });
  };

  const handleStartReflection = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/reflection');
  };

  const handleDismiss = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    hideNotification();
  };

  const getNotificationText = () => {
    const weeklyCount = pendingTriggers.filter(t => t.type === 'weekly').length;
    const monthlyCount = pendingTriggers.filter(t => t.type === 'monthly').length;
    const yearlyCount = pendingTriggers.filter(t => t.type === 'yearly').length;

    if (yearlyCount > 0) {
      return 'Your yearly reflection is ready! 🌟';
    } else if (monthlyCount > 0) {
      return 'Time for your monthly reflection ✨';
    } else if (weeklyCount > 0) {
      return 'Your weekly reflection awaits 🌱';
    }
    
    return 'Reflection ready';
  };

  if (!isVisible || pendingTriggers.length === 0) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.notification}>
        <View style={styles.content}>
          <Text style={styles.text}>{getNotificationText()}</Text>
          <Text style={styles.subtext}>
            Transform your memories into stories of growth
          </Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.dismissButton}
            onPress={handleDismiss}
          >
            <Text style={styles.dismissText}>Later</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.startButton}
            onPress={handleStartReflection}
          >
            <Text style={styles.startText}>Start</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  notification: {
    backgroundColor: 'rgba(102, 126, 234, 0.95)',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flex: 1,
    marginRight: 16,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  dismissButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dismissText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  startButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  startText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
});
