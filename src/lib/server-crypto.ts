/**
 * SIDD.WHIZZ — Server-Only Cryptographic & Rate-Limiting Primitives
 *
 * Built on standard Web Crypto API (`globalThis.crypto.subtle`) so password hashing,
 * constant-time verification, and session token hashing run identically on
 * Node.js 22+, Vercel Serverless Functions, Nitro/Edge workers, and Vitest.
 */

const PBKDF2_ITERATIONS = 210_000;
const SALT_BYTES = 16;
const KEY_BYTES = 32;
const HASH_PREFIX = "pbkdf2_sha256";

function bytesToHex(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i]!.toString(16).padStart(2, "0");
  }
  return out;
}

function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) throw new Error("Invalid hex input");
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i]! ^ b[i]!;
  }
  return diff === 0;
}

export async function hashPassword(plaintext: string): Promise<string> {
  const salt = new Uint8Array(SALT_BYTES);
  globalThis.crypto.getRandomValues(salt);

  const enc = new TextEncoder();
  const baseKey = await globalThis.crypto.subtle.importKey(
    "raw",
    enc.encode(plaintext),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const derivedBits = await globalThis.crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt,
      iterations: PBKDF2_ITERATIONS,
    },
    baseKey,
    KEY_BYTES * 8
  );

  const derived = new Uint8Array(derivedBits);
  return `${HASH_PREFIX}$${PBKDF2_ITERATIONS}$${bytesToHex(salt)}$${bytesToHex(derived)}`;
}

export async function verifyPassword(plaintext: string, storedHash: string): Promise<boolean> {
  if (!storedHash || !storedHash.startsWith(`${HASH_PREFIX}$`)) {
    return false;
  }
  const parts = storedHash.split("$");
  if (parts.length !== 4) return false;

  const iterations = Number(parts[1]);
  const saltHex = parts[2];
  const expectedHex = parts[3];
  if (!Number.isFinite(iterations) || iterations < 10_000 || !saltHex || !expectedHex) {
    return false;
  }

  try {
    const salt = hexToBytes(saltHex);
    const expected = hexToBytes(expectedHex);
    const enc = new TextEncoder();

    const baseKey = await globalThis.crypto.subtle.importKey(
      "raw",
      enc.encode(plaintext),
      "PBKDF2",
      false,
      ["deriveBits"]
    );

    const derivedBits = await globalThis.crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        hash: "SHA-256",
        salt: salt as BufferSource,
        iterations,
      },
      baseKey,
      expected.length * 8
    );

    return constantTimeEqual(new Uint8Array(derivedBits), expected);
  } catch {
    return false;
  }
}

export function generateSecureToken(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength);
  globalThis.crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

export async function sha256Hex(value: string): Promise<string> {
  const digest = await globalThis.crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value)
  );
  return bytesToHex(new Uint8Array(digest));
}

// ============================================================================
// SLIDING-WINDOW SERVER RATE LIMITER (Per IP + Bucket Key)
// ============================================================================

interface RateBucket {
  timestamps: number[];
}

const rateBuckets = new Map<string, RateBucket>();

export function checkServerRateLimit(params: {
  key: string;
  maxRequests: number;
  windowMs: number;
}): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const cutoff = now - params.windowMs;
  const bucket = rateBuckets.get(params.key) ?? { timestamps: [] };

  bucket.timestamps = bucket.timestamps.filter((t) => t > cutoff);

  if (bucket.timestamps.length >= params.maxRequests) {
    const oldest = bucket.timestamps[0] ?? now;
    const retryAfterSec = Math.max(1, Math.ceil((oldest + params.windowMs - now) / 1000));
    rateBuckets.set(params.key, bucket);
    return { allowed: false, retryAfterSec };
  }

  bucket.timestamps.push(now);
  rateBuckets.set(params.key, bucket);

  // Periodic map pruning to prevent unbounded growth
  if (rateBuckets.size > 2000) {
    for (const [k, v] of rateBuckets.entries()) {
      if (v.timestamps.every((t) => t <= cutoff)) {
        rateBuckets.delete(k);
      }
    }
  }

  return { allowed: true, retryAfterSec: 0 };
}

