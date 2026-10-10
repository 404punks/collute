import { z } from "zod";

const base58 = /^[1-9A-HJ-NP-Za-km-z]+$/;

export function isMintAddress(value: string): boolean {
  return value.length >= 32 && value.length <= 44 && base58.test(value);
}

export function classifyQuery(query: string): "mint" | "text" {
  const trimmed = query.trim();
  return isMintAddress(trimmed) ? "mint" : "text";
}

export function safeNextPath(value: string | undefined | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return "/";
  }
  return value;
}

export const registerSchema = z.object({
  email: z.string().trim().email().max(120),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_]{3,20}$/, "Use 3–20 letters, numbers, or underscores."),
  displayName: z.string().trim().min(1).max(40),
  password: z.string().min(8).max(72),
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(120),
  password: z.string().min(1).max(72),
});

export const postSchema = z.object({
  body: z.string().trim().min(1).max(500),
  mint: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined))
    .refine((value) => value === undefined || isMintAddress(value), "Enter a valid mint address."),
});

export const settingsSchema = z.object({
  displayName: z.string().trim().min(1).max(40),
  bio: z.string().trim().max(280),
  walletAddress: z
    .string()
    .trim()
    .max(44)
    .refine((value) => value === "" || isMintAddress(value), "Enter a public wallet address."),
  reduceMotion: z.boolean(),
  compactFeed: z.boolean(),
  showMarketData: z.boolean(),
});

export const bookmarkSchema = z.object({
  targetType: z.enum(["native_post", "token", "dev_callout"]),
  targetId: z.string().trim().min(1).max(80),
});

export const followSchema = z.object({
  userId: z.string().trim().min(1).max(40),
});

export function httpsUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}
