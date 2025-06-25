import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Memory } from '../services/memory';

interface MemorySelectorProps {
  memories: Memory[];
  title: string;
  subtitle: string;
  onSelect: (memoryId: string) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const MemorySelector: React.FC<MemorySelectorProps> = ({
  memories,
  title,
  subtitle,
  onSelect,
  onCancel,
  loading = false
}) => {
  const [selectedMemoryId, setSelectedMemoryId] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getMemoryPreview = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleSelect = () => {
    if (selectedMemoryId) {
      onSelect(selectedMemoryId);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <ScrollView style={styles.memoryList} showsVerticalScrollIndicator={false}>
        {memories.map((memory) => (
          <TouchableOpacity
            key={memory.id}
            style={[
              styles.memoryCard,
              selectedMemoryId === memory.id && styles.selectedMemoryCard
            ]}
            onPress={() => setSelectedMemoryId(memory.id)}
            activeOpacity={0.7}
          >
            <View style={styles.memoryHeader}>
              <Text style={styles.memoryDate}>{formatDate(memory.date)}</Text>
              <View style={[
                styles.selectionIndicator,
                selectedMemoryId === memory.id && styles.selectedIndicator
              ]} />
            </View>
            
            <Text style={styles.memoryText}>
              {getMemoryPreview(memory.memory)}
            </Text>
            
            <View style={styles.memoryFooter}>
              <Text style={styles.memoryStats}>
                {memory.memory.split(/\s+/).length} words
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {memories.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No memories found for this period</Text>
          <Text style={styles.emptyStateSubtext}>
            You need at least one memory to create a reflection
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.button,
            styles.selectButton,
            (!selectedMemoryId || loading) && styles.disabledButton
          ]}
          onPress={handleSelect}
          disabled={!selectedMemoryId || loading}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.selectButtonText,
            (!selectedMemoryId || loading) && styles.disabledButtonText
          ]}>
            {loading ? 'Generating...' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0c0c',
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    fontFamily: 'InstrumentSerif',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 22,
    fontFamily: 'InstrumentSerif',
  },
  memoryList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  memoryCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedMemoryCard: {
    borderColor: '#4A90E2',
    backgroundColor: '#252525',
  },
  memoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  memoryDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
    fontFamily: 'InstrumentSerif',
  },
  selectionIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  selectedIndicator: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  memoryText: {
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 24,
    marginBottom: 12,
    fontFamily: 'InstrumentSerif',
  },
  memoryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memoryStats: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontFamily: 'InstrumentSerif',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'InstrumentSerif',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    fontFamily: 'InstrumentSerif',
  },
  footer: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cancelButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'InstrumentSerif',
  },
  selectButton: {
    backgroundColor: '#4A90E2',
  },
  selectButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'InstrumentSerif',
  },
  disabledButton: {
    backgroundColor: 'rgba(74, 144, 226, 0.3)',
  },
  disabledButtonText: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
});

export default MemorySelector;
