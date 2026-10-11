import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TagChip } from './TagChip';
import { normalizeTags } from '@/utils/validation';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing, TouchTarget, Typography } from '@/constants/theme';

export interface TagInputProps {
  tags: string[];
  onChangeTags: (tags: string[]) => void;
  label?: string;
  error?: string | null;
}

export function TagInput({
  tags,
  onChangeTags,
  label = 'Tags',
  error,
}: TagInputProps) {
  const theme = useTheme();
  const [currentText, setCurrentText] = useState('');

  const addTag = (textToAdd: string) => {
    const split = textToAdd.split(/[\s,]+/);
    const combined = normalizeTags([...tags, ...split]);
    onChangeTags(combined);
    setCurrentText('');
  };

  const removeTag = (tagToRemove: string) => {
    onChangeTags(tags.filter((t) => t !== tagToRemove));
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>

      <View
        style={[
          styles.inputRow,
          {
            backgroundColor: theme.card,
            borderColor: error ? theme.destructive : theme.border,
          },
        ]}>
        <TextInput
          accessibilityLabel="Add tags"
          placeholder="Type tag and press enter (or comma)"
          placeholderTextColor={theme.textMuted}
          value={currentText}
          onChangeText={setCurrentText}
          onSubmitEditing={() => addTag(currentText)}
          style={[styles.input, { color: theme.text }]}
          returnKeyType="done"
        />

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Add tag button"
          onPress={() => addTag(currentText)}
          disabled={!currentText.trim()}
          style={[
            styles.addButton,
            {
              backgroundColor: currentText.trim()
                ? theme.primary
                : theme.backgroundElement,
            },
          ]}>
          <Ionicons
            name="add"
            size={18}
            color={
              currentText.trim() ? theme.primaryForeground : theme.textMuted
            }
          />
        </TouchableOpacity>
      </View>

      {error ? (
        <Text style={[styles.errorText, { color: theme.destructive }]}>
          {error}
        </Text>
      ) : null}

      {tags.length > 0 && (
        <View style={styles.chipsContainer}>
          {tags.map((tag) => (
            <TagChip
              key={tag}
              tag={tag}
              onRemove={() => removeTag(tag)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: Spacing.two,
  },
  label: {
    fontSize: Typography.sm,
    fontWeight: '600',
    marginBottom: Spacing.half,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.two,
    minHeight: TouchTarget.inputHeight,
  },
  input: {
    flex: 1,
    fontSize: Typography.base,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.one,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
    marginTop: Spacing.one,
  },
  errorText: {
    fontSize: Typography.xs,
    marginTop: Spacing.quarter,
    paddingHorizontal: Spacing.half,
  },
});
