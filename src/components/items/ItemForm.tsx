import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { ItemType, SavedItem } from '@/types/item';
import { TypeSelector } from './TypeSelector';
import { Input } from '../ui/Input';
import { TagInput } from '../ui/TagInput';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { validateItemInput } from '@/utils/validation';
import { saveDraft, getDraft, clearDraft } from '@/services/draft.service';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing, Typography } from '@/constants/theme';

export interface ItemFormValues {
  type: ItemType;
  title: string;
  content: string;
  url: string;
  imageUri: string | null;
  tags: string[];
}

export interface ItemFormProps {
  initialItem?: SavedItem;
  initialType?: ItemType;
  initialValues?: Partial<ItemFormValues>;
  onSubmit: (values: ItemFormValues) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ItemForm({
  initialItem,
  initialType = 'note',
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: ItemFormProps) {
  const theme = useTheme();
  const isEditing = Boolean(initialItem);

  const [type, setType] = useState<ItemType>(
    initialItem?.type ?? initialValues?.type ?? initialType
  );
  const [title, setTitle] = useState(
    initialItem?.title ?? initialValues?.title ?? ''
  );
  const [content, setContent] = useState(
    initialItem?.content ?? initialValues?.content ?? ''
  );
  const [url, setUrl] = useState(
    initialItem?.url ?? initialValues?.url ?? ''
  );
  const [imageUri, setImageUri] = useState<string | null>(
    initialValues?.imageUri ?? null
  );
  const [tags, setTags] = useState<string[]>(
    initialItem?.tags ?? initialValues?.tags ?? []
  );

  const [errors, setErrors] = useState<{
    title?: string;
    url?: string;
    image?: string;
  }>({});

  const [draftRestored, setDraftRestored] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check for saved draft on mount if creating new item
  useEffect(() => {
    if (isEditing) return;

    let mounted = true;
    (async () => {
      const draft = await getDraft();
      if (draft && mounted) {
        setType(draft.type);
        setTitle(draft.title);
        setContent(draft.content);
        setUrl(draft.url);
        if (draft.image_uri) {
          setImageUri(draft.image_uri);
        }
        setTags(draft.tags ?? []);
        setDraftRestored(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [isEditing]);

  // Debounced draft saving on changes (only when creating)
  const triggerDraftSave = useCallback(() => {
    if (isEditing) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      saveDraft({
        type,
        title,
        content,
        url,
        image_uri: imageUri,
        tags,
      });
    }, 600);
  }, [isEditing, type, title, content, url, imageUri, tags]);

  useEffect(() => {
    triggerDraftSave();
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [triggerDraftSave]);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setErrors((prev) => ({
        ...prev,
        image: 'Permission to access gallery is required',
      }));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.85,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
      setErrors((prev) => ({ ...prev, image: undefined }));
    }
  };

  const isDirty = () => {
    if (isEditing && initialItem) {
      return (
        title !== initialItem.title ||
        content !== initialItem.content ||
        url !== (initialItem.url ?? '') ||
        JSON.stringify(tags) !== JSON.stringify(initialItem.tags)
      );
    }
    return (
      title.trim().length > 0 ||
      content.trim().length > 0 ||
      url.trim().length > 0 ||
      Boolean(imageUri) ||
      tags.length > 0
    );
  };

  const handleCancelClick = () => {
    if (isDirty()) {
      setShowDiscardDialog(true);
    } else {
      onCancel();
    }
  };

  const handleDiscardConfirm = async () => {
    setShowDiscardDialog(false);
    if (!isEditing) {
      await clearDraft();
    }
    onCancel();
  };

  const handleSubmit = async () => {
    const validation = validateItemInput({
      type,
      title,
      url,
      hasImage: Boolean(imageUri || initialItem?.image_path),
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});

    await onSubmit({
      type,
      title: title.trim(),
      content: content.trim(),
      url: url.trim(),
      imageUri,
      tags,
    });

    if (!isEditing) {
      await clearDraft();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardAvoid}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        {draftRestored && !isEditing && (
          <View
            style={[
              styles.draftBanner,
              { backgroundColor: theme.badgeNote, borderColor: theme.badgeNoteText },
            ]}>
            <Ionicons name="document-text-outline" size={16} color={theme.badgeNoteText} />
            <Text style={[styles.draftBannerText, { color: theme.badgeNoteText }]}>
              Restored unsaved draft
            </Text>
            <TouchableOpacity
              onPress={async () => {
                await clearDraft();
                setTitle('');
                setContent('');
                setUrl('');
                setImageUri(null);
                setTags([]);
                setDraftRestored(false);
              }}
              style={styles.draftClearBtn}>
              <Text style={[styles.draftClearText, { color: theme.badgeNoteText }]}>
                Clear
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Type Selector (locked if editing) */}
        {!isEditing ? (
          <TypeSelector
            selected={type}
            onSelect={(newType) => {
              setType(newType);
              setErrors({});
            }}
          />
        ) : null}

        {/* Title Input */}
        <Input
          label="Title *"
          placeholder={
            type === 'note'
              ? 'e.g. Ideas for app redesign'
              : type === 'link'
              ? 'e.g. Supabase documentation'
              : 'e.g. Architecture diagram'
          }
          value={title}
          onChangeText={(val) => {
            setTitle(val);
            if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
          }}
          error={errors.title}
          maxLength={200}
          helperText={`${title.trim().length}/200 characters`}
          returnKeyType="next"
        />

        {/* URL Input (for links) */}
        {type === 'link' && (
          <Input
            label="URL *"
            placeholder="https://example.com"
            value={url}
            onChangeText={(val) => {
              setUrl(val);
              if (errors.url) setErrors((prev) => ({ ...prev, url: undefined }));
            }}
            error={errors.url}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            returnKeyType="next"
          />
        )}

        {/* Image Attachment (for images) */}
        {type === 'image' && (
          <View style={styles.imageSection}>
            <Text style={[styles.sectionLabel, { color: theme.text }]}>Image *</Text>

            {imageUri || initialItem?.image_path ? (
              <View
                style={[
                  styles.imagePreviewContainer,
                  { borderColor: theme.border, backgroundColor: theme.card },
                ]}>
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={styles.previewImage} />
                ) : (
                  <View style={styles.existingImageNotice}>
                    <Ionicons name="image" size={32} color={theme.primary} />
                    <Text style={[styles.existingImageText, { color: theme.textSecondary }]}>
                      Current image attached
                    </Text>
                  </View>
                )}
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Change image"
                  onPress={handlePickImage}
                  style={[styles.changeImageBtn, { backgroundColor: theme.primary }]}>
                  <Ionicons name="camera-reverse" size={16} color={theme.primaryForeground} />
                  <Text style={[styles.changeImageText, { color: theme.primaryForeground }]}>
                    Replace
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Choose image from library"
                onPress={handlePickImage}
                style={[
                  styles.pickImageBtn,
                  {
                    backgroundColor: theme.backgroundElement,
                    borderColor: errors.image ? theme.destructive : theme.border,
                  },
                ]}>
                <Ionicons name="cloud-upload-outline" size={32} color={theme.primary} />
                <Text style={[styles.pickImageTitle, { color: theme.text }]}>
                  Tap to select an image
                </Text>
                <Text style={[styles.pickImageSubtitle, { color: theme.textSecondary }]}>
                  PNG, JPG, WEBP or GIF (up to 10MB)
                </Text>
              </TouchableOpacity>
            )}

            {errors.image ? (
              <Text style={[styles.errorText, { color: theme.destructive }]}>
                {errors.image}
              </Text>
            ) : null}
          </View>
        )}

        {/* Content Input */}
        <Input
          label={type === 'note' ? 'Content' : 'Notes / Description (Optional)'}
          placeholder="Write your note or thoughts here..."
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={5}
        />

        {/* Tag Input */}
        <TagInput tags={tags} onChangeTags={setTags} />

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={handleCancelClick}
            disabled={isLoading}
            style={styles.actionBtn}
          />
          <Button
            title={isEditing ? 'Save Changes' : 'Create Item'}
            variant="primary"
            onPress={handleSubmit}
            loading={isLoading}
            style={styles.actionBtn}
          />
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={showDiscardDialog}
        title="Discard changes?"
        message="You have unsaved changes. Are you sure you want to discard them?"
        confirmLabel="Discard"
        isDestructive
        onConfirm={handleDiscardConfirm}
        onCancel={() => setShowDiscardDialog(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.three,
    paddingBottom: Spacing.six,
  },
  draftBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.two,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.three,
    gap: Spacing.one,
  },
  draftBannerText: {
    fontSize: Typography.xs,
    fontWeight: '600',
    flex: 1,
  },
  draftClearBtn: {
    paddingHorizontal: Spacing.one,
  },
  draftClearText: {
    fontSize: Typography.xs,
    textDecorationLine: 'underline',
  },
  sectionLabel: {
    fontSize: Typography.sm,
    fontWeight: '600',
    marginBottom: Spacing.half,
  },
  imageSection: {
    marginBottom: Spacing.two,
  },
  pickImageBtn: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    minHeight: 120,
  },
  pickImageTitle: {
    fontSize: Typography.sm,
    fontWeight: '600',
    marginTop: Spacing.one,
  },
  pickImageSubtitle: {
    fontSize: Typography.xs,
    marginTop: 2,
  },
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  existingImageNotice: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
  },
  existingImageText: {
    fontSize: Typography.sm,
  },
  changeImageBtn: {
    position: 'absolute',
    bottom: Spacing.two,
    right: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  changeImageText: {
    fontSize: Typography.xs,
    fontWeight: '700',
  },
  errorText: {
    fontSize: Typography.xs,
    marginTop: Spacing.quarter,
    paddingHorizontal: Spacing.half,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.four,
  },
  actionBtn: {
    flex: 1,
  },
});
