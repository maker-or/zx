import React from 'react';
import { View, Text, StyleSheet, AccessibilityInfo, Platform } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface AccessibilityWrapperProps {
  children: React.ReactNode;
  label?: string;
  hint?: string;
  role?: 'button' | 'text' | 'image' | 'none' | 'header' | 'link' | 'search' | 'summary';
  state?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean;
    expanded?: boolean;
    busy?: boolean;
  };
  live?: 'none' | 'polite' | 'assertive';
  autoFocus?: boolean;
}

export const AccessibilityWrapper: React.FC<AccessibilityWrapperProps> = ({
  children,
  label,
  hint,
  role,
  state,
  live = 'none',
  autoFocus = false,
}) => {
  const { theme } = useTheme();

  return (
    <View
      accessible={!!label}
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityRole={role}
      accessibilityState={state}
      accessibilityLiveRegion={live}
      importantForAccessibility={autoFocus ? 'yes' : 'auto'}
    >
      {children}
    </View>
  );
};

interface SkipLinkProps {
  onSkip: () => void;
  text?: string;
}

export const SkipLink: React.FC<SkipLinkProps> = ({
  onSkip,
  text = 'Skip to main content',
}) => {
  const { theme } = useTheme();

  // Only show on focus (for screen readers)
  return (
    <View style={[styles.skipLink, { backgroundColor: theme.colors.primary }]}>
      <Text
        style={[styles.skipLinkText, { color: theme.colors.button.text }]}
        onPress={onSkip}
        accessibilityRole="button"
        accessibilityLabel={text}
      >
        {text}
      </Text>
    </View>
  );
};

interface ScreenReaderAnnouncementProps {
  message: string;
  politeness?: 'polite' | 'assertive';
}

export const ScreenReaderAnnouncement: React.FC<ScreenReaderAnnouncementProps> = ({
  message,
  politeness = 'polite',
}) => {
  React.useEffect(() => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      AccessibilityInfo.announceForAccessibility(message);
    }
  }, [message]);

  return (
    <View
      accessible={false}
      accessibilityLiveRegion={politeness}
      importantForAccessibility="no"
    >
      <Text style={styles.srOnly}>{message}</Text>
    </View>
  );
};

interface FocusManagerProps {
  children: React.ReactNode;
  trapFocus?: boolean;
  restoreFocus?: boolean;
}

export const FocusManager: React.FC<FocusManagerProps> = ({
  children,
  trapFocus = false,
  restoreFocus = false,
}) => {
  const previousFocus = React.useRef<any>(null);

  React.useEffect(() => {
    if (restoreFocus && Platform.OS !== 'web') {
      // Store previous focus for restoration
      // This is more relevant for web but we'll keep the pattern
      return () => {
        // Restore focus when component unmounts
      };
    }
  }, [restoreFocus]);

  return (
    <View style={trapFocus ? styles.focusTrap : undefined}>
      {children}
    </View>
  );
};

interface HighContrastModeProps {
  children: React.ReactNode;
  enabled?: boolean;
}

export const HighContrastMode: React.FC<HighContrastModeProps> = ({
  children,
  enabled = false,
}) => {
  const { theme } = useTheme();

  const highContrastStyles = enabled ? {
    backgroundColor: '#000000',
    borderColor: '#FFFFFF',
    borderWidth: 2,
  } : {};

  return (
    <View style={[styles.highContrast, highContrastStyles]}>
      {children}
    </View>
  );
};

export const useAccessibilityInfo = () => {
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = React.useState(false);
  const [isReduceMotionEnabled, setIsReduceMotionEnabled] = React.useState(false);
  const [isHighContrastEnabled, setIsHighContrastEnabled] = React.useState(false);

  React.useEffect(() => {
    const checkAccessibilitySettings = async () => {
      try {
        const screenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
        setIsScreenReaderEnabled(screenReaderEnabled);

        if (Platform.OS === 'ios') {
          const reduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
          setIsReduceMotionEnabled(reduceMotionEnabled);
        }

        // High contrast is platform-specific and may not be available on all devices
        // This is a placeholder for when the API becomes available
      } catch (error) {
        console.warn('Failed to check accessibility settings:', error);
      }
    };

    checkAccessibilitySettings();

    // Listen for changes
    const screenReaderListener = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setIsScreenReaderEnabled
    );

    let reduceMotionListener: any = null;
    if (Platform.OS === 'ios') {
      reduceMotionListener = AccessibilityInfo.addEventListener(
        'reduceMotionChanged',
        setIsReduceMotionEnabled
      );
    }

    return () => {
      screenReaderListener?.remove();
      reduceMotionListener?.remove();
    };
  }, []);

  return {
    isScreenReaderEnabled,
    isReduceMotionEnabled,
    isHighContrastEnabled,
  };
};

const styles = StyleSheet.create({
  skipLink: {
    position: 'absolute',
    top: -40,
    left: 0,
    right: 0,
    zIndex: 9999,
    padding: 8,
  },
  skipLinkText: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  srOnly: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    opacity: 0,
  },
  focusTrap: {
    // Focus trap styling if needed
  },
  highContrast: {
    // High contrast mode base styles
  },
});
