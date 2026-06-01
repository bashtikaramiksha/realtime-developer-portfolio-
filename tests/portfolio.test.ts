import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Helper to slugify a string (cloned from route for testing validation)
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') 
    .replace(/[^\w\-]+/g, '') 
    .replace(/\-\-+/g, '-') 
    .replace(/^-+/, '') 
    .replace(/-+$/, ''); 
}

describe('Portfolio Management - Slug Generation Utility', () => {
  it('should correctly slugify dynamic developer names and titles', () => {
    expect(slugify('John Doe')).toBe('john-doe');
    expect(slugify('React & Node.js Developer')).toBe('react-nodejs-developer');
    expect(slugify('   Sarah-Jane O\'Conner   ')).toBe('sarah-jane-oconner');
  });
});

describe('Portfolio Management - Zod Social URLs Validation', () => {
  const socialSchema = z.object({
    platform: z.string().min(1),
    url: z.string().url('Invalid URL format'),
  });

  it('should accept valid HTTP/HTTPS social profile links', () => {
    const valid = { platform: 'LinkedIn', url: 'https://linkedin.com/in/johndoe' };
    const result = socialSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('should reject malformed or non-URL link records', () => {
    const invalid = { platform: 'GitHub', url: 'github.com/johndoe' }; // missing protocol
    const result = socialSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

describe('Portfolio Management - Asset Upload Constraints Validation', () => {
  const resumeUploadSchema = z.object({
    size: z.number().max(5 * 1024 * 1024, 'Resume file size exceeds the 5MB limit'),
    type: z.enum([
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ], {
      invalid_type_error: 'Only PDF or DOC/DOCX documents are allowed'
    })
  });

  it('should accept valid PDF resume uploads below 5MB', () => {
    const sampleFile = { size: 3.5 * 1024 * 1024, type: 'application/pdf' };
    const result = resumeUploadSchema.safeParse(sampleFile);
    expect(result.success).toBe(true);
  });

  it('should reject resume documents that are too large', () => {
    const oversizedFile = { size: 6.2 * 1024 * 1024, type: 'application/pdf' };
    const result = resumeUploadSchema.safeParse(oversizedFile);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('exceeds the 5MB limit');
    }
  });

  it('should reject non-document formats (e.g. image files trying to load as resumes)', () => {
    const wrongFormat = { size: 1 * 1024 * 1024, type: 'image/png' };
    const result = resumeUploadSchema.safeParse(wrongFormat);
    expect(result.success).toBe(false);
  });
});

describe('Portfolio Management - Phone Number Format Validation', () => {
  const phoneSchema = z.string()
    .regex(/^\+?[0-9\s\-()]{7,18}$/, 'Invalid contact number format. Use numbers, spaces, dashes, or parentheses (7-18 chars).')
    .optional()
    .or(z.literal(''));

  it('should accept valid standard contact numbers in various formats', () => {
    expect(phoneSchema.safeParse('+15550192834').success).toBe(true);
    expect(phoneSchema.safeParse('+1 (555) 019-2834').success).toBe(true);
    expect(phoneSchema.safeParse('555-019-2834').success).toBe(true);
    expect(phoneSchema.safeParse('(555) 019 2834').success).toBe(true);
    expect(phoneSchema.safeParse('').success).toBe(true);
  });

  it('should reject invalid contact numbers with illegal symbols or wrong lengths', () => {
    expect(phoneSchema.safeParse('12345').success).toBe(false); // too short
    expect(phoneSchema.safeParse('123456789012345678901').success).toBe(false); // too long
    expect(phoneSchema.safeParse('555-019-2834#ext12').success).toBe(false); // illegal character #
    expect(phoneSchema.safeParse('555-019-2834ab').success).toBe(false); // illegal character letters
  });
});

