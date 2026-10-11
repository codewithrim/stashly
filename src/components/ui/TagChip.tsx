import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing, Typography } from '@/constants/theme';

export interface TagChipProps {
  tag: string;
  onPress?: () => void;
  onRemove?: () => void;
  selected?: boolean;
  style?: ViewStyle;
}

export function TagChip({
  tag,
  onPress,
  onRemove,
  selected = false,
  style,
}: TagChipProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: selected
            ? theme.primary
            : theme.backgroundElement,
          borderColor: selected ? theme.primary : theme.border,
        },
        style,
      ]}>
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        style={styles.labelContainer}>
        <Text
          style={[
            styles.text,
            {
              color: selected ? theme.primaryForeground : theme.textSecondary,
              fontWeight: selected ? '600' : '500',
            },
          ]}>
          #{tag}
        </Text>
      </Pressable>

      {onRemove && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remove tag ${tag}`}
          hitSlop={8}
          onPress={onRemove}
          style={styles.removeButton}>
          <Ionicons
            name="close"
            size={14}
            color={selected ? theme.primaryForeground : theme.textMuted}
          />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: Spacing.one,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: 4,
  },
  labelContainer: {
    justifyContent: 'center',
  },
  text: {
    fontSize: Typography.xs,
  },
  removeButton: {
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
