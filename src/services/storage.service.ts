import { supabase } from './supabase';

const BUCKET_NAME = 'saved-items';
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export interface UploadImageResult {
  imagePath: string;
}

function getContentType(extension: string): string {
  switch (extension.toLowerCase()) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    default:
      return 'image/jpeg';
  }
}

export async function uploadImage(params: {
  userId: string;
  localUri: string;
}): Promise<UploadImageResult> {
  const { userId, localUri } = params;

  // Extract extension
  const cleanUri = localUri.split('?')[0];
  const parts = cleanUri.split('.');
  const ext = parts.length > 1 ? parts.pop()?.toLowerCase() || 'jpg' : 'jpg';

  if (!['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
    throw new Error('Only JPEG, PNG, WEBP, and GIF images are supported.');
  }

  const contentType = getContentType(ext);

  // Convert local URI to ArrayBuffer for reliable upload in React Native
  const response = await fetch(localUri);
  const blob = await response.blob();

  if (blob.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error('Image size exceeds the 10 MB limit.');
  }

  const arrayBuffer = await new Response(blob).arrayBuffer();

  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
  const filePath = `${userId}/${fileName}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, arrayBuffer, {
      contentType,
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  return { imagePath: filePath };
}

export async function getSignedImageUrl(
  imagePath: string,
  expiresInSeconds = 3600
): Promise<string | null> {
  if (!imagePath) return null;

  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(imagePath, expiresInSeconds);

    if (error || !data?.signedUrl) {
      console.warn('Storage signed URL error (file may be missing):', error?.message);
      return null;
    }

    return data.signedUrl;
  } catch (err) {
    console.warn('Failed to generate signed URL:', err);
    return null;
  }
}

export async function deleteImage(imagePath: string): Promise<void> {
  if (!imagePath) return;

  try {
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([imagePath]);
    if (error) {
      console.warn('Failed to delete image from storage:', error.message);
    }
  } catch (err) {
    console.warn('Storage deletion error:', err);
  }
}
