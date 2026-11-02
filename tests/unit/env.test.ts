import { describe, it, expect } from 'vitest';
import { parseEnv } from '../../src/lib/env';

describe('Environment Variable Validation Foundation', () => {
  it('should parse valid default environment values', () => {
    const validEnv = {
      NODE_ENV: 'test',
      NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
      DEMO_MODE: 'true',
    };

    const parsed = parseEnv(validEnv);
    expect(parsed.NODE_ENV).toBe('test');
    expect(parsed.NEXT_PUBLIC_SITE_URL).toBe('http://localhost:3000');
    expect(parsed.DEMO_MODE).toBe('true');
  });

  it('should parse complete environment variables with database and auth values', () => {
    const fullEnv = {
      NODE_ENV: 'development',
      NEXT_PUBLIC_SITE_URL: 'https://siddwhizz.demo',
      DEMO_MODE: 'true',
      DATABASE_URL: 'postgres://user:pass@ep-pooler.aws.neon.tech/neondb',
      DIRECT_URL: 'postgres://user:pass@ep-direct.aws.neon.tech/neondb',
      BETTER_AUTH_SECRET: 'supersecretstringatleast16charslong',
      BOOKING_NOTIFICATION_EMAIL: 'leads@siddwhizz.demo',
    };

    const parsed = parseEnv(fullEnv);
    expect(parsed.DATABASE_URL).toBe(fullEnv.DATABASE_URL);
    expect(parsed.BETTER_AUTH_SECRET).toBe(fullEnv.BETTER_AUTH_SECRET);
    expect(parsed.BOOKING_NOTIFICATION_EMAIL).toBe(fullEnv.BOOKING_NOTIFICATION_EMAIL);
  });

  it('should reject invalid URL in NEXT_PUBLIC_SITE_URL', () => {
    const invalidEnv = {
      NEXT_PUBLIC_SITE_URL: 'not-a-valid-url',
    };

    expect(() => parseEnv(invalidEnv)).toThrowError(/Environment validation failed/);
  });

  it('should reject invalid NODE_ENV value', () => {
    const invalidEnv = {
      NODE_ENV: 'invalid_env',
    };

    expect(() => parseEnv(invalidEnv)).toThrowError(/Environment validation failed/);
  });

  it('should reject invalid email in BOOKING_NOTIFICATION_EMAIL', () => {
    const invalidEnv = {
      BOOKING_NOTIFICATION_EMAIL: 'not-an-email',
    };

    expect(() => parseEnv(invalidEnv)).toThrowError(/Environment validation failed/);
  });
});

