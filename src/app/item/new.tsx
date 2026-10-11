import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ItemForm, ItemFormValues } from '@/components/items/ItemForm';
import { useItems } from '@/contexts/items.context';
import { useTheme } from '@/hooks/use-theme';

export default function NewItemScreen() {
  const theme = useTheme();
  const { createItem } = useItems();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: ItemFormValues) => {
    setLoading(true);
    try {
      await createItem({
        type: values.type,
        title: values.title,
        content: values.content,
        url: values.url,
        image_path: values.imageUri, // In Stage 1: local image URI stored in image_path
        tags: values.tags,
      });
      router.back();
    } catch (error) {
      console.error('Failed to create item:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ItemForm
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
