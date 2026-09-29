import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-static";

const rootDir = process.cwd();
const candidatesPath = path.join(rootDir, "public", "data", "naver-image-candidates.json");

function getCandidates() {
  if (!fs.existsSync(candidatesPath)) return [];
  try {
    return JSON.parse(fs.readFileSync(candidatesPath, "utf8"));
  } catch {
    return [];
  }
}

function saveCandidates(data: any[]) {
  fs.writeFileSync(candidatesPath, JSON.stringify(data, null, 2), "utf8");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get("place_id");
    const status = searchParams.get("status");
    const query = searchParams.get("q")?.toLowerCase();

    let candidates = getCandidates();

    if (placeId && placeId !== "all") {
      candidates = candidates.filter((c: any) => c.place_id === placeId);
    }

    if (status && status !== "all") {
      candidates = candidates.filter((c: any) => c.status === status);
    }

    if (query) {
      candidates = candidates.filter(
        (c: any) =>
          c.place_name?.toLowerCase().includes(query) ||
          c.title?.toLowerCase().includes(query) ||
          c.source_domain?.toLowerCase().includes(query)
      );
    }

    const stats = {
      total: candidates.length,
      approved: candidates.filter((c: any) => c.status === "approved").length,
      pending: candidates.filter((c: any) => c.status === "pending").length,
      rejected: candidates.filter((c: any) => c.status === "rejected").length
    };

    return NextResponse.json({
      success: true,
      stats,
      candidates
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { candidate_id, action, notes } = body;
    const candidates = getCandidates();

    const idx = candidates.findIndex((c: any) => c.candidate_id === candidate_id);
    if (idx === -1) {
      return NextResponse.json({ success: false, error: "Candidate not found" }, { status: 404 });
    }

    if (action === "approve") {
      candidates[idx].status = "approved";
      candidates[idx].reviewed_at = new Date().toISOString();
      candidates[idx].reviewed_by = "admin_human";
    } else if (action === "reject") {
      candidates[idx].status = "rejected";
      candidates[idx].reject_reason = notes || "관리자 수동 거절";
      candidates[idx].reviewed_at = new Date().toISOString();
      candidates[idx].reviewed_by = "admin_human";
    } else if (action === "set_cover") {
      candidates[idx].is_cover = true;
      candidates[idx].status = "approved";
      candidates[idx].reviewed_at = new Date().toISOString();
    }

    saveCandidates(candidates);
    return NextResponse.json({ success: true, updated: candidates[idx] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
