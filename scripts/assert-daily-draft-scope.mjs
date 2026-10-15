import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const registryPath = path.join(root, "data", "private", "content-drafts.json");
const draftsRoot = path.join(root, "src", "content", "drafts");
const arg = (name) => process.argv.find((value) => value.startsWith(`--${name}=`))?.slice(name.length + 3) || "";
const digest = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const normalize = (value) => value.replaceAll("\\", "/");

function individualHashes() {
  if (!fs.existsSync(draftsRoot)) return {};
  return Object.fromEntries(
    fs.readdirSync(draftsRoot)
      .filter((name) => name.endsWith(".json"))
      .sort()
      .map((name) => [`src/content/drafts/${name}`, digest(path.join(draftsRoot, name))]),
  );
}

const snapshotPath = arg("snapshot");
if (snapshotPath) {
  const snapshot = {
    drafts: JSON.parse(fs.readFileSync(registryPath, "utf8")),
    individualHashes: individualHashes(),
  };
  fs.writeFileSync(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`);
  console.log(`Draft snapshot written: ${snapshotPath}`);
  process.exit(0);
}

const verifyPath = arg("verify");
if (!verifyPath) throw new Error("Use --snapshot=<path> or --verify=<path>");
const before = JSON.parse(fs.readFileSync(verifyPath, "utf8"));
const after = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const beforeById = new Map(before.drafts.map((draft) => [draft.id, draft]));
for (const draft of before.drafts) {
  const current = after.find((candidate) => candidate.id === draft.id);
  if (JSON.stringify(current) !== JSON.stringify(draft)) {
    throw new Error(`Existing draft changed: ${draft.id}`);
  }
}
const additions = after.filter((draft) => !beforeById.has(draft.id));
if (additions.length !== 1 || additions[0].status !== "review_required") {
  throw new Error("Daily workflow must add exactly one review_required draft");
}
const added = additions[0];
if (!/^\d{4}-\d{2}-\d{2}-(?:am|pm)$/.test(added.id)) throw new Error(`Invalid new draft ID: ${added.id}`);
const individualRelative = `src/content/drafts/${added.id}.json`;
const individual = JSON.parse(fs.readFileSync(path.join(root, individualRelative), "utf8"));
if (JSON.stringify(individual) !== JSON.stringify(added)) throw new Error("Aggregate and individual draft do not match");

for (const [relative, expected] of Object.entries(before.individualHashes)) {
  const absolute = path.join(root, relative);
  if (!fs.existsSync(absolute) || digest(absolute) !== expected) throw new Error(`Existing individual draft changed: ${relative}`);
}

const porcelain = execFileSync("git", ["status", "--porcelain=v1", "--untracked-files=all", "-z"], { encoding: "utf8" });
const changed = porcelain.split("\0").filter(Boolean).map((entry) => normalize(entry.slice(3)));
const expectedChanged = new Set(["data/private/content-drafts.json", individualRelative]);
const unexpected = changed.filter((file) => !expectedChanged.has(file));
if (unexpected.length || changed.length !== expectedChanged.size || [...expectedChanged].some((file) => !changed.includes(file))) {
  throw new Error(`Unexpected changed files; expected exactly aggregate plus matching individual draft: ${unexpected.join(", ") || changed.join(", ")}`);
}
console.log(`Daily draft scope passed for ${added.id}.`);
