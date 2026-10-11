import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ItemForm, ItemFormValues } from '@/components/items/ItemForm';
import { useItems } from '@/contexts/items.context';
import { useTheme } from '@/hooks/use-theme';
import { extractFirstUrl } from '@/utils/validation';

export default function NewItemScreen() {
  const theme = useTheme();
  const { createItem } = useItems();
  const [loading, setLoading] = useState(false);
  const params = useLocalSearchParams<{
    url?: string;
    text?: string;
    title?: string;
    type?: 'note' | 'link' | 'image';
    imageUri?: string;
    fileUri?: string;
  }>();

  const sharedImage = params.imageUri || params.fileUri || null;
  const detectedUrl = params.url || (params.text ? extractFirstUrl(params.text) : null);
  const isLink = Boolean(detectedUrl) && !sharedImage;
  const isImage = Boolean(sharedImage);

  const sharedUrl = detectedUrl || '';
  const sharedText = detectedUrl && params.text ? params.text.replace(detectedUrl, '').trim() : (params.text || '');

  const initialValues: Partial<ItemFormValues> = {
    type: params.type || (isImage ? 'image' : isLink ? 'link' : 'note'),
    title: params.title || (isImage ? 'Shared Image' : ''),
    url: sharedUrl,
    content: sharedText,
    imageUri: sharedImage,
  };

  const handleSubmit = async (values: ItemFormValues) => {
    setLoading(true);
    try {
      await createItem({
        type: values.type,
        title: values.title,
        content: values.content,
        url: values.url || undefined,
        image_path: values.type === 'image' ? values.imageUri : undefined,
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
        initialValues={initialValues}
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
