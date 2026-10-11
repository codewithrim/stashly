import { ItemType } from '../types/item';

export interface ValidationResult {
  isValid: boolean;
  errors: {
    title?: string;
    url?: string;
    image?: string;
  };
}

export function validateTitle(title: string): string | null {
  const trimmed = title.trim();
  if (trimmed.length === 0) {
    return 'Title is required';
  }
  if (trimmed.length > 200) {
    return 'Title must be 200 characters or fewer';
  }
  return null;
}

export function validateUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) {
    return 'URL is required for links';
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return 'URL must start with http:// or https://';
    }
    if (!parsed.hostname || parsed.hostname.length === 0) {
      return 'Please enter a valid web address';
    }
    return null;
  } catch {
    return 'Please enter a valid URL (e.g. https://example.com)';
  }
}

export function normalizeTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const tag of tags) {
    const cleaned = tag.trim().toLowerCase().replace(/^#+/, '');
    if (cleaned.length > 0 && !seen.has(cleaned)) {
      seen.add(cleaned);
      normalized.push(cleaned);
    }
  }

  return normalized;
}

export function validateItemInput(params: {
  type: ItemType;
  title: string;
  url?: string | null;
  hasImage?: boolean;
}): ValidationResult {
  const errors: ValidationResult['errors'] = {};

  const titleError = validateTitle(params.title);
  if (titleError) {
    errors.title = titleError;
  }

  if (params.type === 'link') {
    const urlError = validateUrl(params.url ?? '');
    if (urlError) {
      errors.url = urlError;
    }
  }

  if (params.type === 'image') {
    if (!params.hasImage) {
      errors.image = 'An image is required';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
