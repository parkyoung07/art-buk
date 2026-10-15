import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const defaultRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const root = path.resolve(process.env.ARTBUK_ROOT_DIR || defaultRoot);
const outDir = path.join(root, "out");
const draftsPath = path.join(root, "data", "private", "content-drafts.json");
const legacyPayload = path.join(outDir, "data", "content-drafts.json");

if (!fs.existsSync(draftsPath)) {
  throw new Error("Private draft registry is missing: data/private/content-drafts.json");
}

if (fs.existsSync(legacyPayload)) {
  fs.rmSync(legacyPayload, { force: true });
  console.log("Removed unpublished draft payload from static output: out/data/content-drafts.json");
}

const drafts = JSON.parse(fs.readFileSync(draftsPath, "utf8"));
const unpublishedIds = drafts
  .filter((draft) => draft.status !== "published")
  .map((draft) => String(draft.id))
  .filter(Boolean);

const files = [];
function collect(current) {
  if (!fs.existsSync(current)) return;
  for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
    const full = path.join(current, entry.name);
    if (entry.isDirectory()) collect(full);
    else files.push(full);
  }
}
collect(outDir);

for (const file of files) {
  const body = fs.readFileSync(file);
  for (const id of unpublishedIds) {
    if (body.includes(Buffer.from(id))) {
      throw new Error(`Unpublished draft leaked into static output: ${id} in ${path.relative(outDir, file)}`);
    }
  }
}

console.log(`Static output privacy gate passed for ${unpublishedIds.length} unpublished drafts.`);
