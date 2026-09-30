import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-static";

const draftsFilePath = path.join(process.cwd(), "public", "data", "content-drafts.json");
const draftsDir = path.join(process.cwd(), "src", "content", "drafts");

function getDrafts() {
  if (!fs.existsSync(draftsFilePath)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(draftsFilePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveDrafts(drafts: any[]) {
  if (!fs.existsSync(draftsDir)) {
    fs.mkdirSync(draftsDir, { recursive: true });
  }
  fs.writeFileSync(draftsFilePath, JSON.stringify(drafts, null, 2), "utf8");
}

export async function GET() {
  const drafts = getDrafts();
  return NextResponse.json({ success: true, drafts });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, draftId, updatedDraft, status, rejectReason } = body;

    const drafts = getDrafts();
    const index = drafts.findIndex((d: any) => d.id === draftId);

    if (action === "update") {
      if (index !== -1) {
        drafts[index] = {
          ...drafts[index],
          ...updatedDraft,
          status: "review_required", // 수정 시 항상 review_required로 재지정 (룰 14)
          updatedAt: new Date().toISOString()
        };
      } else if (updatedDraft) {
        drafts.unshift(updatedDraft);
      }
      saveDrafts(drafts);
      return NextResponse.json({ success: true, draft: drafts[index] || updatedDraft });
    }

    if (action === "update_status") {
      if (index === -1) {
        return NextResponse.json({ success: false, error: "Draft not found" }, { status: 404 });
      }
      drafts[index].status = status;
      drafts[index].updatedAt = new Date().toISOString();
      if (rejectReason) {
        drafts[index].rejectReason = rejectReason;
      }
      saveDrafts(drafts);
      return NextResponse.json({ success: true, draft: drafts[index] });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
