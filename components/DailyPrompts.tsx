import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';

interface DailyPrompt {
  id: string;
  prompt: string;
  category: 'reflection' | 'gratitude' | 'growth' | 'creativity' | 'mindfulness';
}

const dailyPrompts: DailyPrompt[] = [
  // Reflection
  { id: '1', prompt: 'What moment from today will you remember in a year?', category: 'reflection' },
  { id: '2', prompt: 'What challenged you today and how did you handle it?', category: 'reflection' },
  { id: '3', prompt: 'What did you learn about yourself today?', category: 'reflection' },
  { id: '4', prompt: 'What would you tell your morning self about how today went?', category: 'reflection' },
  
  // Gratitude
  { id: '5', prompt: 'What small moment brought you joy today?', category: 'gratitude' },
  { id: '6', prompt: 'Who made your day a little better and how?', category: 'gratitude' },
  { id: '7', prompt: 'What are three things you appreciated about today?', category: 'gratitude' },
  { id: '8', prompt: 'What simple pleasure did you enjoy today?', category: 'gratitude' },
  
  // Growth
  { id: '9', prompt: 'What step did you take toward a goal today?', category: 'growth' },
  { id: '10', prompt: 'What would you do differently if you could repeat today?', category: 'growth' },
  { id: '11', prompt: 'What strength did you discover or use today?', category: 'growth' },
  { id: '12', prompt: 'How did you push beyond your comfort zone today?', category: 'growth' },
  
  // Creativity
  { id: '13', prompt: 'What sparked your curiosity or imagination today?', category: 'creativity' },
  { id: '14', prompt: 'If today was a color, what would it be and why?', category: 'creativity' },
  { id: '15', prompt: 'What story would you tell about today?', category: 'creativity' },
  { id: '16', prompt: 'What creative solution did you find to a problem today?', category: 'creativity' },
  
  // Mindfulness
  { id: '17', prompt: 'What did you notice about your surroundings that you usually miss?', category: 'mindfulness' },
  { id: '18', prompt: 'How did your body feel throughout the day?', category: 'mindfulness' },
  { id: '19', prompt: 'What emotions visited you today and how did you welcome them?', category: 'mindfulness' },
  { id: '20', prompt: 'What moment made you pause and be present?', category: 'mindfulness' },
];

const categoryEmojis = {
  reflection: '🤔',
  gratitude: '🙏',
  growth: '🌱',
  creativity: '🎨',
  mindfulness: '🧘',
};

const categoryColors = {
  reflection: '#6366F1',
  gratitude: '#10B981',
  growth: '#F59E0B',
  creativity: '#EF4444',
  mindfulness: '#8B5CF6',
};

interface DailyPromptsProps {
  onPromptSelect: (prompt: string) => void;
  selectedPrompt?: string;
}

export const DailyPrompts: React.FC<DailyPromptsProps> = ({
  onPromptSelect,
  selectedPrompt,
}) => {
  const { theme } = useTheme();
  const [todaysPrompt, setTodaysPrompt] = useState<DailyPrompt | null>(null);
  const [showAllPrompts, setShowAllPrompts] = useState(false);

  useEffect(() => {
    // Generate a consistent prompt for today based on the date
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const promptIndex = dayOfYear % dailyPrompts.length;
    setTodaysPrompt(dailyPrompts[promptIndex]);
  }, []);

  const handlePromptSelect = async (prompt: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPromptSelect(prompt);
  };

  const PromptCard = ({ prompt, isHighlighted = false }: { prompt: DailyPrompt; isHighlighted?: boolean }) => (
    <TouchableOpacity
      style={[
        styles.promptCard,
        {
          backgroundColor: theme.colors.surface,
          borderColor: isHighlighted ? categoryColors[prompt.category] : theme.colors.border,
          borderWidth: isHighlighted ? 2 : 1,
        }
      ]}
      onPress={() => handlePromptSelect(prompt.prompt)}
      accessibilityRole="button"
      accessibilityLabel={`Prompt: ${prompt.prompt}`}
    >
      <View style={styles.promptHeader}>
        <Text style={[styles.categoryEmoji]}>
          {categoryEmojis[prompt.category]}
        </Text>
        <Text 
          style={[
            styles.categoryText,
            { color: categoryColors[prompt.category] }
          ]}
        >
          {prompt.category.charAt(0).toUpperCase() + prompt.category.slice(1)}
        </Text>
      </View>
      <Text style={[styles.promptText, { color: theme.colors.text }]}>
        {prompt.prompt}
      </Text>
      {isHighlighted && (
        <Text style={[styles.todayBadge, { color: categoryColors[prompt.category] }]}>
          Today's Prompt
        </Text>
      )}
    </TouchableOpacity>
  );

  if (!todaysPrompt) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Daily Inspiration
        </Text>
        <TouchableOpacity
          style={[styles.toggleButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowAllPrompts(!showAllPrompts);
          }}
          accessibilityRole="button"
          accessibilityLabel={showAllPrompts ? "Show today's prompt only" : "Show all prompts"}
        >
          <Text style={[styles.toggleText, { color: theme.colors.primary }]}>
            {showAllPrompts ? 'Today Only' : 'More Prompts'}
          </Text>
        </TouchableOpacity>
      </View>

      {!showAllPrompts ? (
        <PromptCard prompt={todaysPrompt} isHighlighted />
      ) : (
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          <PromptCard prompt={todaysPrompt} isHighlighted />
          
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            More Prompts to Explore
          </Text>
          
          {dailyPrompts
            .filter(p => p.id !== todaysPrompt.id)
            .map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          
          <View style={styles.bottomSpacing} />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'InstrumentSerif',
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    maxHeight: 300,
  },
  promptCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  promptText: {
    fontSize: 16,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  todayBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginVertical: 16,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 20,
  },
});
