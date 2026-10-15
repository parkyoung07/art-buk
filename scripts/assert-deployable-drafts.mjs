import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const draftsPath = path.join(root, "data", "private", "content-drafts.json");
const allowedId = process.argv.find((arg) => arg.startsWith("--allow-approved="))?.split("=")[1] || "";
const drafts = JSON.parse(fs.readFileSync(draftsPath, "utf8"));
const approved = drafts.filter((draft) => draft.status === "approved").map((draft) => draft.id);
const unexpected = approved.filter((id) => id !== allowedId);

if (unexpected.length > 0 || (approved.length > 0 && !allowedId)) {
  console.error(`Deployment blocked: approved but unpublished drafts exist: ${approved.join(", ")}`);
  process.exit(1);
}
if (allowedId && (approved.length !== 1 || approved[0] !== allowedId)) {
  console.error(`Deployment blocked: expected only approved draft ${allowedId}, found ${approved.join(", ") || "none"}`);
  process.exit(1);
}
console.log(`Draft deployment gate passed (${approved.length} approved draft${approved.length === 1 ? "" : "s"}).`);
