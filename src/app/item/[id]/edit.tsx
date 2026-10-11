import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ItemForm, ItemFormValues } from '@/components/items/ItemForm';
import { useItems } from '@/contexts/items.context';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTheme } from '@/hooks/use-theme';

export default function EditItemScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getItemById, updateItem } = useItems();
  const [loading, setLoading] = useState(false);

  const item = getItemById(id);

  if (!item) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <EmptyState
          icon="alert-circle-outline"
          title="Item not found"
          description="Cannot edit an item that does not exist."
          actionTitle="Back"
          onAction={() => router.back()}
        />
      </View>
    );
  }

  const handleSubmit = async (values: ItemFormValues) => {
    setLoading(true);
    try {
      await updateItem(item.id, {
        title: values.title,
        content: values.content,
        url: item.type === 'link' ? values.url : null,
        image_path: item.type === 'image' ? (values.imageUri ?? item.image_path) : null,
        tags: values.tags,
        imageUri: values.imageUri, // Passed to context for Supabase upload
      });
      router.back();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ItemForm
        initialItem={item}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        isLoading={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
