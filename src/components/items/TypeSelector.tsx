import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ItemType } from '@/types/item';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing, TouchTarget, Typography } from '@/constants/theme';

interface TypeOption {
  type: ItemType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const TYPE_OPTIONS: TypeOption[] = [
  { type: 'note', label: 'Note', icon: 'document-text-outline' },
  { type: 'link', label: 'Link', icon: 'link-outline' },
  { type: 'image', label: 'Image', icon: 'image-outline' },
];

export interface TypeSelectorProps {
  selected: ItemType;
  onSelect: (type: ItemType) => void;
  disabled?: boolean;
}

export function TypeSelector({
  selected,
  onSelect,
  disabled = false,
}: TypeSelectorProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: theme.border,
        },
      ]}>
      {TYPE_OPTIONS.map((opt) => {
        const isSelected = selected === opt.type;

        return (
          <TouchableOpacity
            key={opt.type}
            accessibilityRole="button"
            accessibilityLabel={`Select ${opt.label} type`}
            accessibilityState={{ selected: isSelected }}
            disabled={disabled}
            onPress={() => onSelect(opt.type)}
            style={[
              styles.option,
              {
                backgroundColor: isSelected ? theme.card : 'transparent',
                borderColor: isSelected ? theme.border : 'transparent',
              },
            ]}>
            <Ionicons
              name={opt.icon}
              size={18}
              color={isSelected ? theme.primary : theme.textSecondary}
            />
            <Text
              style={[
                styles.label,
                {
                  color: isSelected ? theme.text : theme.textSecondary,
                  fontWeight: isSelected ? '700' : '500',
                },
              ]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: 3,
    marginBottom: Spacing.three,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: TouchTarget.min - 8,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: Spacing.half,
  },
  label: {
    fontSize: Typography.sm,
  },
});
