import { execFileSync } from "node:child_process";
import { existsSync, statSync, unlinkSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dbPath = path.join(root, "prisma", "callout.db");
const prismaBin = path.join(root, "node_modules", ".bin", "prisma");
const tsxBin = path.join(root, "node_modules", ".bin", "tsx");

if (!dbPath.endsWith(`${path.sep}callout.db`)) {
  throw new Error("Refusing to prepare a database that is not prisma/callout.db");
}

for (const suffix of ["", "-journal", "-wal", "-shm"]) {
  const file = dbPath + suffix;
  if (existsSync(file)) unlinkSync(file);
}

const env = { ...process.env, DATABASE_URL: `file:${dbPath}` };

function run(bin, args, extra = {}) {
  execFileSync(bin, args, { cwd: root, env, stdio: "inherit", ...extra });
}

run(prismaBin, ["generate"]);
run(prismaBin, ["db", "push", "--skip-generate", "--accept-data-loss"]);
run(prismaBin, ["db", "execute", "--stdin", "--schema", "prisma/schema.prisma"], {
  input: "PRAGMA journal_mode=DELETE;\n",
});
run(tsxBin, ["prisma/seed.ts"]);
run(prismaBin, ["db", "execute", "--stdin", "--schema", "prisma/schema.prisma"], {
  input: "PRAGMA wal_checkpoint(FULL);\n",
});

for (const suffix of ["-journal", "-wal", "-shm"]) {
  const file = dbPath + suffix;
  if (existsSync(file)) unlinkSync(file);
}

const size = existsSync(dbPath) ? statSync(dbPath).size : 0;
if (size < 1024) {
  throw new Error(`prisma/callout.db is missing or too small (${size} bytes)`);
}

console.log(`Prepared ${dbPath} (${size} bytes)`);
