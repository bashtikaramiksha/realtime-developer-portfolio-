import { describe, it, expect, beforeAll } from 'vitest';
import { hashPassword, comparePassword, signAccessToken, verifyToken } from '../lib/auth/utils';
import { z } from 'zod';

// Mock process.env for test JWT signature verification
beforeAll(() => {
  process.env.JWT_SECRET = 'super-secret-jwt-key-minimum-32-characters-long-123456';
});

describe('Authentication Utilities - Password Hashing', () => {
  it('should successfully hash a password and verify it matches the correct source', async () => {
    const rawPassword = 'my-secure-password-123';
    const hashed = await hashPassword(rawPassword);

    expect(hashed).toBeDefined();
    expect(hashed).not.toEqual(rawPassword);

    const isMatch = await comparePassword(rawPassword, hashed);
    expect(isMatch).toBe(true);

    const isIncorrectMatch = await comparePassword('wrong-password', hashed);
    expect(isIncorrectMatch).toBe(false);
  });
});

describe('Authentication Utilities - JWT Token Creation & Verification', () => {
  it('should successfully sign an Access Token and verify its payload contents', async () => {
    const mockPayload = { userId: '123e4567-e89b-12d3-a456-426614174000', role: 'admin' };
    const token = await signAccessToken(mockPayload);

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    const decodedPayload = await verifyToken(token);
    expect(decodedPayload).toBeDefined();
    expect(decodedPayload?.userId).toBe(mockPayload.userId);
    expect(decodedPayload?.role).toBe(mockPayload.role);
  });

  it('should return null or fail when verifying an invalid or corrupted JWT token', async () => {
    const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature';
    const decoded = await verifyToken(invalidToken);
    expect(decoded).toBeNull();
  });
});

describe('Authentication Utilities - Input Validation using Zod', () => {
  const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
  });

  it('should validate correctly structured registration payloads', () => {
    const validPayload = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password123',
    };

    const parseResult = registerSchema.safeParse(validPayload);
    expect(parseResult.success).toBe(true);
  });

  it('should fail validation when name, email, or password criteria are not met', () => {
    const invalidPayload = {
      name: 'J', // too short
      email: 'invalid-email-format', // invalid email
      password: '123', // too short
    };

    const parseResult = registerSchema.safeParse(invalidPayload);
    expect(parseResult.success).toBe(false);
    if (!parseResult.success) {
      const errorMap = parseResult.error.format();
      expect(errorMap.name?._errors).toBeDefined();
      expect(errorMap.email?._errors).toBeDefined();
      expect(errorMap.password?._errors).toBeDefined();
    }
  });
});
