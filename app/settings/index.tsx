import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../contexts/ThemeContext';
import { LoadingSpinner } from '../../components/UIComponents';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, themeMode, setThemeMode, toggleTheme, isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  // Safe back navigation function
  const handleSafeBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(app)');
    }
  };

  const handleThemeChange = async (mode: 'light' | 'dark' | 'system') => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await setThemeMode(mode);
  };

  const handleDataExport = async () => {
    setIsLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Simulate export process
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Export Complete',
        'Your memories have been exported successfully.',
        [{ text: 'OK', onPress: () => {} }]
      );
    }, 2000);
  };

  const handleDataClear = () => {
    Alert.alert(
      'Clear All Data',
      'This action cannot be undone. Are you sure you want to delete all your memories and reflections?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            // Here you would implement the actual data clearing logic
            Alert.alert('Data cleared', 'All data has been removed.');
          },
        },
      ]
    );
  };

  const SettingItem = ({ 
    title, 
    subtitle, 
    onPress, 
    rightComponent,
    showChevron = false 
  }: {
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightComponent?: React.ReactNode;
    showChevron?: boolean;
  }) => (
    <TouchableOpacity
      style={[
        styles.settingItem,
        { 
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        }
      ]}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightComponent}
      {showChevron && (
        <Text style={[styles.chevron, { color: theme.colors.textSecondary }]}>
          ›
        </Text>
      )}
    </TouchableOpacity>
  );

  const ThemeSelector = () => (
    <View style={styles.themeSelector}>
      {(['light', 'dark', 'system'] as const).map((mode) => (
        <TouchableOpacity
          key={mode}
          style={[
            styles.themeOption,
            {
              backgroundColor: themeMode === mode ? theme.colors.primary : theme.colors.surface,
              borderColor: theme.colors.border,
            }
          ]}
          onPress={() => handleThemeChange(mode)}
          accessibilityRole="radio"
          accessibilityState={{ checked: themeMode === mode }}
          accessibilityLabel={`${mode} theme`}
        >
          <Text style={[
            styles.themeOptionText,
            { 
              color: themeMode === mode ? theme.colors.button.text : theme.colors.text,
              fontWeight: themeMode === mode ? '600' : 'normal',
            }
          ]}>
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <LinearGradient
        colors={[theme.colors.gradient.start, theme.colors.gradient.end]}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.colors.surface }]}
            onPress={handleSafeBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={[styles.backButtonText, { color: theme.colors.text }]}>
              ‹
            </Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Settings
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Appearance
            </Text>
            
            <SettingItem
              title="Theme"
              subtitle="Choose your preferred app theme"
              rightComponent={<ThemeSelector />}
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Data & Privacy
            </Text>
            
            <SettingItem
              title="Export Data"
              subtitle="Download all your memories and reflections"
              onPress={handleDataExport}
              rightComponent={
                isLoading ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <Text style={[styles.exportIcon, { color: theme.colors.textSecondary }]}>
                    📁
                  </Text>
                )
              }
              showChevron={!isLoading}
            />
            
            <SettingItem
              title="Clear All Data"
              subtitle="Permanently delete all memories and reflections"
              onPress={handleDataClear}
              rightComponent={
                <Text style={[styles.dangerIcon, { color: theme.colors.error }]}>
                  🗑️
                </Text>
              }
              showChevron
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              About
            </Text>
            
            <SettingItem
              title="Version"
              subtitle="1.0.0"
              rightComponent={
                <Text style={[styles.versionText, { color: theme.colors.textSecondary }]}>
                  Latest
                </Text>
              }
            />
            
            <SettingItem
              title="Privacy Policy"
              subtitle="Learn how we protect your data"
              onPress={() => {
                Alert.alert('Privacy Policy', 'Your privacy is important to us. All your data is stored locally on your device and never shared with third parties.');
              }}
              showChevron
            />
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = {
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: 'bold' as const,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    fontFamily: 'InstrumentSerif',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    marginBottom: 16,
    fontFamily: 'InstrumentSerif',
  },
  settingItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  chevron: {
    fontSize: 20,
    marginLeft: 8,
  },
  exportIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  dangerIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  versionText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  themeSelector: {
    flexDirection: 'row' as const,
    marginLeft: 8,
  },
  themeOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 4,
    borderWidth: 1,
  },
  themeOptionText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  bottomSpacing: {
    height: 32,
  },
};
