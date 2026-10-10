import { copyFileSync, existsSync, statSync } from "node:fs";
import path from "node:path";

export const VERCEL_DB_PATH = "/tmp/callout.db";

export function bundledDatabaseCandidates(cwd = process.cwd(), here = cwd): string[] {
  return [
    path.join(cwd, "prisma", "callout.db"),
    path.join(cwd, ".next", "server", "prisma", "callout.db"),
    path.join(here, "prisma", "callout.db"),
    path.join(here, "..", "prisma", "callout.db"),
    path.join(here, "..", "..", "prisma", "callout.db"),
    path.join(here, "..", "..", "..", "prisma", "callout.db"),
    "/var/task/prisma/callout.db",
    "/var/task/.next/server/prisma/callout.db",
  ];
}

export function isNonEmptyFile(file: string): boolean {
  try {
    return existsSync(file) && statSync(file).size > 0;
  } catch {
    return false;
  }
}

export function prepareVercelSqlite(options?: {
  vercel?: boolean;
  dest?: string;
  cwd?: string;
  here?: string;
}): { ok: boolean; source: string | null; dest: string } {
  const vercel = options?.vercel ?? Boolean(process.env.VERCEL);
  const dest = options?.dest ?? VERCEL_DB_PATH;
  if (!vercel) return { ok: false, source: null, dest };

  if (isNonEmptyFile(dest)) {
    process.env.DATABASE_URL = `file:${dest}`;
    return { ok: true, source: dest, dest };
  }

  const source =
    bundledDatabaseCandidates(options?.cwd, options?.here).find((candidate) => isNonEmptyFile(candidate)) ?? null;
  if (!source) {
    console.error("[callout] bundled sqlite missing");
    return { ok: false, source: null, dest };
  }

  copyFileSync(source, dest);
  for (const suffix of ["-wal", "-shm"]) {
    const extra = source + suffix;
    if (isNonEmptyFile(extra)) copyFileSync(extra, dest + suffix);
  }
  process.env.DATABASE_URL = `file:${dest}`;
  console.info(`[callout] sqlite ready at ${dest}`);
  return { ok: true, source, dest };
}
