import { describe, expect, it } from "vitest";
import { hashPassword, hashSessionToken, verifyPassword } from "@/lib/auth/password";

describe("passwords and sessions", () => {
  it("verifies a matching password and rejects a different one", async () => {
    const stored = await hashPassword("CalloutDemo!2026");
    expect(await verifyPassword("CalloutDemo!2026", stored)).toBe(true);
    expect(await verifyPassword("wrong-password", stored)).toBe(false);
    expect(await verifyPassword("CalloutDemo!2026", "not-a-hash")).toBe(false);
  });

  it("hashes session tokens deterministically", async () => {
    const first = await hashSessionToken("abc");
    const second = await hashSessionToken("abc");
    expect(first).toBe(second);
    expect(first).not.toBe("abc");
  });
});
