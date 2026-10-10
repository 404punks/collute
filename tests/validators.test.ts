import { describe, expect, it } from "vitest";
import { classifyQuery, isMintAddress, postSchema, safeNextPath, settingsSchema } from "@/lib/validators";

describe("validators", () => {
  it("classifies mint addresses separately from text", () => {
    expect(classifyQuery("9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump")).toBe("mint");
    expect(classifyQuery("fartcoin")).toBe("text");
    expect(isMintAddress("not a mint")).toBe(false);
    expect(isMintAddress("0OIl")).toBe(false);
  });

  it("rejects open redirects", () => {
    expect(safeNextPath("https://evil.example")).toBe("/");
    expect(safeNextPath("//evil.example")).toBe("/");
    expect(safeNextPath("/bookmarks")).toBe("/bookmarks");
  });

  it("accepts a platform post with an optional mint", () => {
    expect(postSchema.parse({ body: "hello" }).mint).toBeUndefined();
    expect(postSchema.parse({ body: "hello", mint: "" }).mint).toBeUndefined();
    expect(() => postSchema.parse({ body: "hello", mint: "nope" })).toThrow();
  });

  it("rejects private-key shaped wallet input that is not a public address", () => {
    const result = settingsSchema.safeParse({
      displayName: "Ada",
      bio: "",
      walletAddress: "seed phrase words do not belong here at all",
      reduceMotion: false,
      compactFeed: false,
      showMarketData: true,
    });
    expect(result.success).toBe(false);
  });
});
