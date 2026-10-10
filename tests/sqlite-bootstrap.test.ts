import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { prepareVercelSqlite } from "../src/lib/sqlite-bootstrap";

const previous = process.env.DATABASE_URL;

afterEach(() => {
  if (previous === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = previous;
});

describe("prepareVercelSqlite", () => {
  it("leaves the configured database alone when not on Vercel", () => {
    const dest = path.join(mkdtempSync(path.join(tmpdir(), "callout-")), "unused.db");
    const result = prepareVercelSqlite({ vercel: false, dest, cwd: "/missing" });
    expect(result.ok).toBe(false);
    expect(process.env.DATABASE_URL).toBe(previous);
  });

  it("copies the bundled database and points Prisma at the copy", () => {
    const root = mkdtempSync(path.join(tmpdir(), "callout-src-"));
    const bundled = path.join(root, "prisma");
    mkdirSync(bundled);
    writeFileSync(path.join(bundled, "callout.db"), "sqlite-bytes");
    const dest = path.join(mkdtempSync(path.join(tmpdir(), "callout-dst-")), "callout.db");

    const result = prepareVercelSqlite({ vercel: true, dest, cwd: root });

    expect(result.ok).toBe(true);
    expect(result.source).toBe(path.join(root, "prisma", "callout.db"));
    expect(process.env.DATABASE_URL).toBe(`file:${dest}`);
  });
});
