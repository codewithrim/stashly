import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SavedItem } from '@/types/item';
import { TagChip } from '../ui/TagChip';
import { formatRelativeTime, extractDomain } from '@/utils/formatters';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing, Typography } from '@/constants/theme';

export interface ItemCardProps {
  item: SavedItem;
  onPress: () => void;
  onToggleArchive?: () => void;
}

export function ItemCard({ item, onPress, onToggleArchive }: ItemCardProps) {
  const theme = useTheme();

  const getTypeBadge = () => {
    switch (item.type) {
      case 'note':
        return {
          icon: 'document-text' as const,
          label: 'Note',
          bg: theme.badgeNote,
          color: theme.badgeNoteText,
        };
      case 'link':
        return {
          icon: 'link' as const,
          label: 'Link',
          bg: theme.badgeLink,
          color: theme.badgeLinkText,
        };
      case 'image':
        return {
          icon: 'image' as const,
          label: 'Image',
          bg: theme.badgeImage,
          color: theme.badgeImageText,
        };
    }
  };

  const badge = getTypeBadge();
  const domain = item.url ? extractDomain(item.url) : null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.type}: ${item.title}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          opacity: pressed ? 0.92 : 1,
        },
      ]}>
      {/* Header Row: Type Badge + Time + Archive Button */}
      <View style={styles.headerRow}>
        <View style={[styles.typeBadge, { backgroundColor: badge.bg }]}>
          <Ionicons name={badge.icon} size={12} color={badge.color} />
          <Text style={[styles.typeBadgeText, { color: badge.color }]}>
            {badge.label}
          </Text>
        </View>

        <View style={styles.headerRight}>
          <Text style={[styles.dateText, { color: theme.textMuted }]}>
            {formatRelativeTime(item.created_at)}
          </Text>

          {onToggleArchive && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={item.is_archived ? 'Restore item' : 'Archive item'}
              hitSlop={12}
              onPress={onToggleArchive}
              style={styles.archiveIconBtn}>
              <Ionicons
                name={item.is_archived ? 'arrow-undo-outline' : 'archive-outline'}
                size={18}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Title */}
      <Text
        style={[styles.title, { color: theme.text }]}
        numberOfLines={2}
        ellipsizeMode="tail">
        {item.title}
      </Text>

      {/* Content preview or link domain */}
      {domain ? (
        <View style={styles.domainRow}>
          <Ionicons name="globe-outline" size={14} color={theme.textSecondary} />
          <Text
            style={[styles.domainText, { color: theme.textSecondary }]}
            numberOfLines={1}>
            {domain}
          </Text>
        </View>
      ) : item.content ? (
        <Text
          style={[styles.contentPreview, { color: theme.textSecondary }]}
          numberOfLines={2}
          ellipsizeMode="tail">
          {item.content}
        </Text>
      ) : null}

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.slice(0, 4).map((tag) => (
            <TagChip key={tag} tag={tag} />
          ))}
          {item.tags.length > 4 && (
            <Text style={[styles.moreTagsText, { color: theme.textMuted }]}>
              +{item.tags.length - 4}
            </Text>
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.three,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.two,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.one,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  typeBadgeText: {
    fontSize: Typography.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  dateText: {
    fontSize: Typography.xs,
  },
  archiveIconBtn: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.base,
    fontWeight: '700',
    marginBottom: Spacing.half,
    lineHeight: 22,
  },
  domainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.one,
  },
  domainText: {
    fontSize: Typography.xs,
    fontWeight: '500',
  },
  contentPreview: {
    fontSize: Typography.sm,
    lineHeight: 18,
    marginBottom: Spacing.one,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.half,
    marginTop: Spacing.half,
  },
  moreTagsText: {
    fontSize: Typography.xs,
  },
});
