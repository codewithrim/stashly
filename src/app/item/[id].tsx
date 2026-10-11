import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Href, router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { useItems } from '@/contexts/items.context';
import { Button } from '@/components/ui/Button';
import { TagChip } from '@/components/ui/TagChip';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatRelativeTime, extractDomain } from '@/utils/formatters';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing, Typography } from '@/constants/theme';

export default function ItemDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getItemById, deleteItem, toggleArchive, setSelectedTag } = useItems();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const item = getItemById(id);

  if (!item) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <EmptyState
          icon="alert-circle-outline"
          title="Item not found"
          description="This item may have been deleted or does not exist."
          actionTitle="Back to Inbox"
          onAction={() => router.back()}
        />
      </View>
    );
  }

  const handleOpenLink = async () => {
    if (item.url) {
      try {
        await WebBrowser.openBrowserAsync(item.url);
      } catch (error) {
        console.error('Failed to open browser:', error);
      }
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await deleteItem(item.id);
      setShowDeleteDialog(false);
      router.back();
    } catch (error) {
      console.error('Failed to delete item:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTagPress = (tag: string) => {
    setSelectedTag(tag);
    router.replace('/');
  };

  const getTypeBadgeStyle = () => {
    switch (item.type) {
      case 'note':
        return { bg: theme.badgeNote, color: theme.badgeNoteText, label: 'Note' };
      case 'link':
        return { bg: theme.badgeLink, color: theme.badgeLinkText, label: 'Link' };
      case 'image':
        return { bg: theme.badgeImage, color: theme.badgeImageText, label: 'Image' };
    }
  };

  const badge = getTypeBadgeStyle();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Type Badge & Archive Status */}
        <View style={styles.badgeRow}>
          <View style={[styles.typeBadge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.typeBadgeText, { color: badge.color }]}>
              {badge.label}
            </Text>
          </View>

          {item.is_archived && (
            <View
              style={[
                styles.archiveBadge,
                { backgroundColor: theme.backgroundElement },
              ]}>
              <Ionicons name="archive" size={12} color={theme.textSecondary} />
              <Text style={[styles.archiveBadgeText, { color: theme.textSecondary }]}>
                Archived
              </Text>
            </View>
          )}

          <Text style={[styles.dateText, { color: theme.textMuted }]}>
            Saved {formatRelativeTime(item.created_at)}
          </Text>
        </View>

        {/* Title */}
        <Text
          style={[styles.title, { color: theme.text }]}
          selectable>
          {item.title}
        </Text>

        {/* Link Card (if link) */}
        {item.type === 'link' && item.url && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`Open link: ${item.url}`}
            activeOpacity={0.8}
            onPress={handleOpenLink}
            style={[
              styles.linkBox,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
            ]}>
            <View style={styles.linkHeader}>
              <Ionicons name="globe-outline" size={20} color={theme.primary} />
              <Text style={[styles.linkDomain, { color: theme.primary }]}>
                {extractDomain(item.url)}
              </Text>
              <Ionicons
                name="open-outline"
                size={16}
                color={theme.textMuted}
                style={{ marginLeft: 'auto' }}
              />
            </View>
            <Text
              style={[styles.fullUrl, { color: theme.textSecondary }]}
              numberOfLines={2}>
              {item.url}
            </Text>
          </TouchableOpacity>
        )}

        {/* Image Viewer (if image) */}
        {item.type === 'image' && item.image_path && (
          <View
            style={[
              styles.imageContainer,
              { borderColor: theme.border, backgroundColor: theme.card },
            ]}>
            <Image
              source={{ uri: item.image_path }}
              style={styles.detailImage}
              resizeMode="contain"
            />
          </View>
        )}

        {/* Content Body */}
        {item.content ? (
          <View
            style={[
              styles.contentCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
            ]}>
            <Text
              style={[styles.contentText, { color: theme.text }]}
              selectable>
              {item.content}
            </Text>
          </View>
        ) : null}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsSection}>
            <Text style={[styles.sectionHeading, { color: theme.textSecondary }]}>
              Tags
            </Text>
            <View style={styles.tagsContainer}>
              {item.tags.map((tag) => (
                <TagChip
                  key={tag}
                  tag={tag}
                  onPress={() => handleTagPress(tag)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Timestamps */}
        <View style={styles.metaSection}>
          <Text style={[styles.metaText, { color: theme.textMuted }]}>
            Created: {new Date(item.created_at).toLocaleString()}
          </Text>
          {item.updated_at !== item.created_at && (
            <Text style={[styles.metaText, { color: theme.textMuted }]}>
              Updated: {new Date(item.updated_at).toLocaleString()}
            </Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <Button
            title="Edit"
            variant="outline"
            icon={<Ionicons name="pencil-outline" size={16} color={theme.text} style={{ marginRight: 4 }} />}
            onPress={() => router.push(`/item/${item.id}/edit` as Href)}
            style={styles.actionBtn}
          />
          <Button
            title={item.is_archived ? 'Restore' : 'Archive'}
            variant="secondary"
            icon={
              <Ionicons
                name={item.is_archived ? 'arrow-undo-outline' : 'archive-outline'}
                size={16}
                color={theme.text}
                style={{ marginRight: 4 }}
              />
            }
            onPress={() => toggleArchive(item.id)}
            style={styles.actionBtn}
          />
          <Button
            title="Delete"
            variant="destructive"
            icon={<Ionicons name="trash-outline" size={16} color={theme.primaryForeground} style={{ marginRight: 4 }} />}
            onPress={() => setShowDeleteDialog(true)}
            style={styles.actionBtn}
          />
        </View>
      </ScrollView>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        visible={showDeleteDialog}
        title="Delete item?"
        message="Are you sure you want to permanently delete this item? This action cannot be undone."
        confirmLabel="Delete"
        isDestructive
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    marginBottom: Spacing.two,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  typeBadgeText: {
    fontSize: Typography.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  archiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  archiveBadgeText: {
    fontSize: Typography.xs,
    fontWeight: '600',
  },
  dateText: {
    fontSize: Typography.xs,
    marginLeft: 'auto',
  },
  title: {
    fontSize: Typography.xxl,
    fontWeight: '800',
    lineHeight: 32,
    marginBottom: Spacing.three,
  },
  linkBox: {
    padding: Spacing.three,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.three,
  },
  linkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    marginBottom: 4,
  },
  linkDomain: {
    fontSize: Typography.sm,
    fontWeight: '700',
  },
  fullUrl: {
    fontSize: Typography.xs,
    lineHeight: 16,
  },
  imageContainer: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
    height: 260,
    marginBottom: Spacing.three,
  },
  detailImage: {
    width: '100%',
    height: '100%',
  },
  contentCard: {
    padding: Spacing.three,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.three,
  },
  contentText: {
    fontSize: Typography.base,
    lineHeight: 24,
  },
  tagsSection: {
    marginBottom: Spacing.three,
  },
  sectionHeading: {
    fontSize: Typography.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: Spacing.one,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  metaSection: {
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E4E4E7',
    marginBottom: Spacing.two,
    gap: 4,
  },
  metaText: {
    fontSize: Typography.xs,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.one,
    marginTop: Spacing.two,
  },
  actionBtn: {
    flex: 1,
  },
});
