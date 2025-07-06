import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  style?: any;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'small',
  color,
  text,
  style
}) => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator 
        size={size} 
        color={color || theme.colors.primary} 
        accessibilityLabel={text || 'Loading'}
      />
      {text && (
        <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
          {text}
        </Text>
      )}
    </View>
  );
};

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  style?: any;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  style
}) => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.errorContainer, style]}>
      <Text style={[styles.errorText, { color: theme.colors.error }]}>
        {message}
      </Text>
      {onRetry && (
        <Text 
          style={[styles.retryText, { color: theme.colors.primary }]}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Retry"
        >
          Tap to retry
        </Text>
      )}
    </View>
  );
};

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
  style?: any;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  style
}) => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.emptyContainer, style]}>
      {icon && (
        <Text style={[styles.emptyIcon, { color: theme.colors.textSecondary }]}>
          {icon}
        </Text>
      )}
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        {title}
      </Text>
      {description && (
        <Text style={[styles.emptyDescription, { color: theme.colors.textSecondary }]}>
          {description}
        </Text>
      )}
      {action && (
        <Text 
          style={[styles.emptyAction, { color: theme.colors.primary }]}
          onPress={action.onPress}
          accessibilityRole="button"
          accessibilityLabel={action.label}
        >
          {action.label}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  text: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  retryText: {
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  emptyAction: {
    fontSize: 16,
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});
