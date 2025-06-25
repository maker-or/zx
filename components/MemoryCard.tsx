import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Memory } from '../services/memory';

interface MemoryCardProps {
  memory: Memory;
  onEdit?: () => void;
  onDelete?: () => void;
  isReadOnly?: boolean;
  canEdit?: boolean;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({ 
  memory, 
  onEdit, 
  onDelete, 
  isReadOnly = false,
  canEdit = true 
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).length;
  };

  const getCharacterCount = (text: string) => {
    return text.length;
  };

  const isToday = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  return (
    <View style={[styles.container, !canEdit && styles.lockedContainer]}>
      <View style={styles.header}>
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{formatDate(memory.date)}</Text>
          {!canEdit && (
            <Text style={styles.lockedBadge}>🔒 Locked</Text>
          )}
        </View>
        <View style={styles.stats}>
          <Text style={styles.statText}>
            {getWordCount(memory.memory)} words • {getCharacterCount(memory.memory)} chars
          </Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.memoryText, !canEdit && styles.lockedMemoryText]}>{memory.memory}</Text>
      </View>
      
      {!isReadOnly && (
        <View style={styles.actions}>
          {onEdit && canEdit && (
            <TouchableOpacity style={styles.editButton} onPress={onEdit}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
          {onDelete && canEdit && (
            <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          )}
          {!canEdit && (
            <Text style={styles.lockedMessage}>
              This memory is from a past day and cannot be edited
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'InstrumentSerif',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontFamily: 'InstrumentSerif',
  },
  content: {
    marginBottom: 12,
  },
  memoryText: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'InstrumentSerif',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  lockedContainer: {
    backgroundColor: '#2a2a2a',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0.8,
  },
  dateContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  lockedBadge: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginTop: 2,
    fontStyle: 'italic',
  },
  lockedMemoryText: {
    opacity: 0.8,
    fontStyle: 'italic',
  },
  lockedMessage: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default MemoryCard;
