import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const rootDir = process.env.ARTBUK_ROOT_DIR
  ? path.resolve(process.env.ARTBUK_ROOT_DIR)
  : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const arg = (name) => process.argv.find((value) => value.startsWith(`--${name}=`))?.slice(name.length + 3) || "";
const required = (name) => {
  const value = arg(name);
  if (!value) throw new Error(`Missing required --${name}=... argument`);
  return value;
};
const nowIso = () => new Date().toISOString();
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const resolveInside = (base, ...segments) => {
  const resolvedBase = path.resolve(base);
  const resolved = path.resolve(resolvedBase, ...segments);
  const relative = path.relative(resolvedBase, resolved);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Resolved path is outside intended root: ${resolved}`);
  }
  return resolved;
};
const writeOutput = (key, value) => {
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
  console.log(`${key}=${value}`);
};

const phase = required("phase");
const draftId = required("id");
if (!/^\d{4}-\d{2}-\d{2}-(?:am|pm)$/.test(draftId)) {
  throw new Error(`Invalid draft ID: ${draftId}`);
}
const expectedDigest = required("expected-sha256");
if (!/^[0-9a-f]{64}$/.test(expectedDigest)) throw new Error("Invalid expected SHA-256 digest");
const privateDataRoot = path.join(rootDir, "data", "private");
const draftFilesRoot = path.join(rootDir, "src", "content", "drafts");
const draftsPath = resolveInside(privateDataRoot, "content-drafts.json");
const individualPath = resolveInside(draftFilesRoot, `${draftId}.json`);

if (!fs.existsSync(individualPath)) throw new Error(`Draft not found: ${draftId}`);
const originalDraftText = fs.readFileSync(individualPath, "utf8");
const drafts = JSON.parse(fs.readFileSync(draftsPath, "utf8"));
const index = drafts.findIndex((draft) => draft.id === draftId);
if (index < 0) throw new Error(`Draft ${draftId} is missing from aggregate data`);
const draft = drafts[index];
if (JSON.stringify(JSON.parse(originalDraftText)) !== JSON.stringify(draft)) {
  throw new Error(`Individual and aggregate draft state differ for ${draftId}`);
}
const postDate = draft.date;
const parsedPostDate = new Date(`${postDate}T00:00:00Z`);
if (
  !/^\d{4}-\d{2}-\d{2}$/.test(postDate)
  || Number.isNaN(parsedPostDate.getTime())
  || parsedPostDate.toISOString().slice(0, 10) !== postDate
  || postDate !== draftId.slice(0, 10)
) {
  throw new Error(`Invalid draft date: ${postDate}`);
}
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.slug) || draft.slug.length > 100) {
  throw new Error(`Invalid draft slug: ${draft.slug}`);
}
const postSlug = `${postDate}-${draft.slug}`;
const timestamp = nowIso();

if (phase === "approve") {
  if (draft.status !== "review_required") {
    throw new Error(`Draft ${draftId} must be review_required, found ${draft.status}`);
  }
  const actualDigest = sha256(originalDraftText);
  if (actualDigest !== expectedDigest) {
    throw new Error(`Draft digest mismatch for ${draftId}: expected ${expectedDigest}, got ${actualDigest}`);
  }

  const postsDir = path.join(rootDir, "src", "content", "posts");
  fs.mkdirSync(postsDir, { recursive: true });
  const postPath = resolveInside(postsDir, `${postSlug}.md`);
  if (fs.existsSync(postPath)) throw new Error(`Published-area file already exists: ${path.relative(rootDir, postPath)}`);

  const frontmatter = {
    title: draft.title,
    date: postDate,
    summary: draft.summary,
    category: draft.category || "전시 리뷰",
    tags: draft.tags || [],
    region: draft.region || "부울경",
    subRegion: draft.subRegion || "",
    thumbnail: draft.thumbnail || "",
    eventId: draft.venues?.[0]?.name ? `${draft.slug}-event` : "",
  };
  fs.writeFileSync(postPath, matter.stringify(draft.content || "", frontmatter), "utf8");

  draft.status = "approved";
  draft.approvedAt = timestamp;
  draft.updatedAt = timestamp;
  draft.approvalDigest = actualDigest;
  draft.approvedBy = arg("actor") || "github-actions";
  draft.approvalRunId = arg("run-id") || "";
  drafts[index] = draft;
  fs.writeFileSync(individualPath, `${JSON.stringify(draft, null, 2)}\n`, "utf8");
  fs.writeFileSync(draftsPath, `${JSON.stringify(drafts, null, 2)}\n`, "utf8");

  writeOutput("post_slug", postSlug);
  writeOutput("live_url", `https://nadriai.com/blog/${postSlug}/`);
  writeOutput("approval_digest", actualDigest);
  writeOutput("status", "approved");
} else if (phase === "finalize") {
  if (draft.status !== "approved") {
    throw new Error(`Draft ${draftId} must be approved, found ${draft.status}`);
  }
  if (draft.approvalDigest !== expectedDigest) {
    throw new Error(`Approval digest mismatch for ${draftId}`);
  }

  const deployedSha = required("deployed-sha");
  const liveUrl = required("live-url");
  const deploymentId = required("deployment-id");
  const deploymentUrl = required("deployment-url");
  const verifiedAt = required("verified-at");
  if (!/^[0-9a-f]{40}$/.test(deployedSha)) throw new Error("Invalid deployed SHA");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(deploymentId)) {
    throw new Error("Invalid deployment-id");
  }
  const immutableUrl = new URL(deploymentUrl);
  if (immutableUrl.protocol !== "https:" || !immutableUrl.hostname.endsWith(".pages.dev") || immutableUrl.pathname !== "/") {
    throw new Error("Invalid deployment-url");
  }
  if (liveUrl !== `https://nadriai.com/blog/${postSlug}/`) throw new Error("Live URL does not match approved draft");
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(verifiedAt) || Number.isNaN(Date.parse(verifiedAt))) {
    throw new Error("Invalid verified-at timestamp");
  }
  draft.status = "published";
  draft.publishedAt = timestamp;
  draft.updatedAt = timestamp;
  draft.verifiedAt = verifiedAt;
  draft.deployedSha = deployedSha;
  draft.liveUrl = liveUrl;
  draft.cloudflareDeploymentId = deploymentId;
  draft.immutableDeploymentUrl = immutableUrl.origin;
  drafts[index] = draft;
  fs.writeFileSync(individualPath, `${JSON.stringify(draft, null, 2)}\n`, "utf8");
  fs.writeFileSync(draftsPath, `${JSON.stringify(drafts, null, 2)}\n`, "utf8");

  writeOutput("status", "published");
  writeOutput("published_at", timestamp);
} else {
  throw new Error(`Unsupported phase: ${phase}`);
}
