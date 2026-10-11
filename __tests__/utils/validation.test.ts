import {
  validateTitle,
  validateUrl,
  normalizeTags,
  validateItemInput,
} from '../../src/utils/validation';

describe('validation utils', () => {
  describe('validateTitle', () => {
    it('rejects empty and whitespace-only titles', () => {
      expect(validateTitle('')).toBe('Title is required');
      expect(validateTitle('   ')).toBe('Title is required');
    });

    it('rejects titles longer than 200 characters', () => {
      const longTitle = 'a'.repeat(201);
      expect(validateTitle(longTitle)).toBe('Title must be 200 characters or fewer');
    });

    it('accepts valid titles within 1..200 characters', () => {
      expect(validateTitle('My First Note')).toBeNull();
      expect(validateTitle('a'.repeat(200))).toBeNull();
    });
  });

  describe('validateUrl', () => {
    it('rejects empty url', () => {
      expect(validateUrl('')).toBe('URL is required for links');
      expect(validateUrl('   ')).toBe('URL is required for links');
    });

    it('rejects urls without http/https protocol', () => {
      expect(validateUrl('ftp://example.com')).toBe('URL must start with http:// or https://');
      expect(validateUrl('javascript:alert(1)')).toBe('URL must start with http:// or https://');
      expect(validateUrl('file:///etc/passwd')).toBe('URL must start with http:// or https://');
    });

    it('rejects malformed urls', () => {
      expect(validateUrl('not-a-valid-url')).toBe('Please enter a valid URL (e.g. https://example.com)');
    });

    it('accepts valid http and https urls', () => {
      expect(validateUrl('https://stashly.app')).toBeNull();
      expect(validateUrl('http://localhost:3000')).toBeNull();
      expect(validateUrl('https://example.com/path?query=1#hash')).toBeNull();
    });
  });

  describe('normalizeTags', () => {
    it('lowercases, strips leading hashes, trims, and deduplicates', () => {
      const tags = ['#React', 'react', '  NodeJS  ', '#NODEJS', '', '   '];
      expect(normalizeTags(tags)).toEqual(['react', 'nodejs']);
    });
  });

  describe('validateItemInput', () => {
    it('validates note items', () => {
      const result = validateItemInput({ type: 'note', title: 'Test note' });
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('validates link items requiring a valid URL', () => {
      const invalid = validateItemInput({ type: 'link', title: 'Test link', url: 'invalid' });
      expect(invalid.isValid).toBe(false);
      expect(invalid.errors.url).toBeDefined();

      const valid = validateItemInput({ type: 'link', title: 'Test link', url: 'https://example.com' });
      expect(valid.isValid).toBe(true);
    });

    it('validates image items requiring an image', () => {
      const invalid = validateItemInput({ type: 'image', title: 'My Image', hasImage: false });
      expect(invalid.isValid).toBe(false);
      expect(invalid.errors.image).toBe('An image is required');

      const valid = validateItemInput({ type: 'image', title: 'My Image', hasImage: true });
      expect(valid.isValid).toBe(true);
    });
  });
});
