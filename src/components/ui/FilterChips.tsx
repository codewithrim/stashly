import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FilterCategory } from '@/types/item';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing, Typography } from '@/constants/theme';

interface FilterOption {
  key: FilterCategory;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const FILTER_OPTIONS: FilterOption[] = [
  { key: 'all', label: 'All', icon: 'albums-outline' },
  { key: 'note', label: 'Notes', icon: 'document-text-outline' },
  { key: 'link', label: 'Links', icon: 'link-outline' },
  { key: 'image', label: 'Images', icon: 'image-outline' },
  { key: 'archived', label: 'Archived', icon: 'archive-outline' },
];

export interface FilterChipsProps {
  selected: FilterCategory;
  onSelect: (category: FilterCategory) => void;
  counts?: Partial<Record<FilterCategory, number>>;
}

export function FilterChips({ selected, onSelect, counts }: FilterChipsProps) {
  const theme = useTheme();

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {FILTER_OPTIONS.map((item) => {
          const isSelected = selected === item.key;
          const count = counts?.[item.key];

          return (
            <TouchableOpacity
              key={item.key}
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${item.label}`}
              accessibilityState={{ selected: isSelected }}
              activeOpacity={0.7}
              onPress={() => onSelect(item.key)}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected
                    ? theme.primary
                    : theme.backgroundElement,
                  borderColor: isSelected ? theme.primary : theme.border,
                },
              ]}>
              <Ionicons
                name={item.icon}
                size={16}
                color={isSelected ? theme.primaryForeground : theme.textSecondary}
              />
              <Text
                style={[
                  styles.label,
                  {
                    color: isSelected ? theme.primaryForeground : theme.text,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}>
                {item.label}
              </Text>
              {typeof count === 'number' && (
                <View
                  style={[
                    styles.countBadge,
                    {
                      backgroundColor: isSelected
                        ? 'rgba(255,255,255,0.25)'
                        : theme.border,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.countText,
                      {
                        color: isSelected
                          ? theme.primaryForeground
                          : theme.textSecondary,
                      },
                    ]}>
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: Spacing.one,
  },
  scrollContent: {
    paddingHorizontal: Spacing.three,
    gap: Spacing.one,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    minHeight: 40,
    gap: Spacing.half,
  },
  label: {
    fontSize: Typography.sm,
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.full,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: Typography.xs,
    fontWeight: '600',
  },
});
