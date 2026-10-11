import React, { useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Href, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/auth.context';
import { useItems } from '@/contexts/items.context';
import { ItemCard } from '@/components/items/ItemCard';
import { FilterChips } from '@/components/ui/FilterChips';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorView } from '@/components/ui/ErrorView';
import { ItemListSkeleton } from '@/components/ui/LoadingSkeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useTheme } from '@/hooks/use-theme';
import { useBiometrics } from '@/contexts/biometrics.context';
import { BorderRadius, Spacing, TouchTarget, Typography } from '@/constants/theme';
import { SavedItem } from '@/types/item';

export default function InboxScreen() {
  const theme = useTheme();
  const { isSupported, isBiometricEnabled, enableBiometrics, disableBiometrics } = useBiometrics();
  const {
    filteredItems,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    selectedTag,
    setSelectedTag,
    counts,
    isLoading,
    error,
    refreshItems,
    toggleArchive,
  } = useItems();
  const { user, signOut } = useAuth();

  const [refreshing, setRefreshing] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshItems();
    setRefreshing(false);
  };

  const getEmptyStateDetails = () => {
    if (searchQuery.trim().length > 0) {
      return {
        icon: 'search-outline' as const,
        title: 'No items match your search',
        description: `We couldn't find anything matching "${searchQuery}".`,
        actionTitle: 'Clear Search',
        onAction: () => setSearchQuery(''),
      };
    }

    if (selectedTag) {
      return {
        icon: 'pricetag-outline' as const,
        title: `No items with #${selectedTag}`,
        description: 'Try clearing the tag filter to see all your saved items.',
        actionTitle: 'Clear Tag Filter',
        onAction: () => setSelectedTag(null),
      };
    }

    switch (filter) {
      case 'note':
        return {
          icon: 'document-text-outline' as const,
          title: 'No notes saved yet',
          description: 'Keep your thoughts, code snippets, and ideas organized.',
          actionTitle: 'Create a Note',
          onAction: () => router.push('/item/new' as Href),
        };
      case 'link':
        return {
          icon: 'link-outline' as const,
          title: 'No links saved yet',
          description: 'Save articles, videos, and websites to read later.',
          actionTitle: 'Save a Link',
          onAction: () => router.push('/item/new' as Href),
        };
      case 'image':
        return {
          icon: 'image-outline' as const,
          title: 'No images saved yet',
          description: 'Keep screenshots, photos, and visual references handy.',
          actionTitle: 'Save an Image',
          onAction: () => router.push('/item/new' as Href),
        };
      case 'archived':
        return {
          icon: 'archive-outline' as const,
          title: 'No archived items',
          description: 'Items you archive will be kept safe here.',
        };
      default:
        return {
          icon: 'file-tray-outline' as const,
          title: 'Your stash is empty',
          description: 'Save notes, links, and images for whenever you need them.',
          actionTitle: 'Save First Item',
          onAction: () => router.push('/item/new' as Href),
        };
    }
  };

  const emptyDetails = getEmptyStateDetails();

  const renderItem = ({ item }: { item: SavedItem }) => (
    <ItemCard
      item={item}
      onPress={() => router.push(`/item/${item.id}` as Href)}
      onToggleArchive={() => toggleArchive(item.id)}
    />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* App Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.appName, { color: theme.text }]}>Stashly</Text>
          <Text style={[styles.itemCounter, { color: theme.textSecondary }]}>
            {counts.all} {counts.all === 1 ? 'item' : 'items'} saved
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {isSupported && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={isBiometricEnabled ? 'Disable biometric lock' : 'Enable biometric lock'}
              hitSlop={12}
              onPress={() => {
                if (isBiometricEnabled) {
                  disableBiometrics();
                } else {
                  enableBiometrics();
                }
              }}
              style={[
                styles.userLogoutBtn,
                {
                  backgroundColor: isBiometricEnabled ? theme.badgeNote : theme.backgroundElement,
                  borderColor: theme.border,
                },
              ]}>
              <Ionicons
                name={isBiometricEnabled ? 'shield-checkmark' : 'shield-outline'}
                size={18}
                color={isBiometricEnabled ? theme.primary : theme.textSecondary}
              />
            </TouchableOpacity>
          )}

          {user && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Log out"
              hitSlop={12}
              onPress={() => setShowLogoutDialog(true)}
              style={[
                styles.userLogoutBtn,
                { backgroundColor: theme.backgroundElement, borderColor: theme.border },
              ]}>
              <Ionicons name="log-out-outline" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}>
          <Ionicons
            name="search-outline"
            size={18}
            color={theme.textMuted}
            style={styles.searchIcon}
          />
          <TextInput
            accessibilityLabel="Search your saved items"
            placeholder="Search notes, links, tags..."
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: theme.text }]}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              hitSlop={12}
              onPress={() => setSearchQuery('')}
              style={styles.clearSearchBtn}>
              <Ionicons name="close-circle" size={18} color={theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <FilterChips selected={filter} onSelect={setFilter} counts={counts} />

      {/* Tag filter indicator banner */}
      {selectedTag && (
        <View
          style={[
            styles.selectedTagBanner,
            { backgroundColor: theme.badgeNote, borderColor: theme.border },
          ]}>
          <Text style={[styles.selectedTagText, { color: theme.badgeNoteText }]}>
            Filtering by tag: <Text style={{ fontWeight: '700' }}>#{selectedTag}</Text>
          </Text>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Clear tag filter"
            hitSlop={8}
            onPress={() => setSelectedTag(null)}>
            <Ionicons name="close-circle" size={18} color={theme.badgeNoteText} />
          </TouchableOpacity>
        </View>
      )}

      {/* Content Area */}
      {isLoading && !refreshing ? (
        <ItemListSkeleton count={4} />
      ) : error ? (
        <ErrorView message={error} onRetry={refreshItems} />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            filteredItems.length === 0 && styles.listContentEmpty,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.primary}
              colors={[theme.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon={emptyDetails.icon}
              title={emptyDetails.title}
              description={emptyDetails.description}
              actionTitle={emptyDetails.actionTitle}
              onAction={emptyDetails.onAction}
            />
          }
        />
      )}

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Add new item"
        activeOpacity={0.85}
        onPress={() => router.push('/item/new' as Href)}
        style={[
          styles.fab,
          {
            backgroundColor: theme.primary,
            shadowColor: theme.primary,
          },
        ]}>
        <Ionicons name="add" size={28} color={theme.primaryForeground} />
      </TouchableOpacity>

      <ConfirmDialog
        visible={showLogoutDialog}
        title="Log out?"
        message="Are you sure you want to log out of Stashly?"
        confirmLabel="Log Out"
        isDestructive
        onConfirm={async () => {
          setShowLogoutDialog(false);
          await signOut();
        }}
        onCancel={() => setShowLogoutDialog(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.one,
  },
  userLogoutBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: Typography.xxl,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  itemCounter: {
    fontSize: Typography.xs,
    fontWeight: '500',
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.two,
    minHeight: TouchTarget.inputHeight - 4,
  },
  searchIcon: {
    marginRight: Spacing.one,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.sm,
    paddingVertical: 8,
  },
  clearSearchBtn: {
    padding: 4,
  },
  selectedTagBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: Spacing.three,
    marginVertical: Spacing.half,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  selectedTagText: {
    fontSize: Typography.xs,
  },
  listContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: 96,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.four,
    right: Spacing.four,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
