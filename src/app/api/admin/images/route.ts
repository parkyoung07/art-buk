import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-static";

const rootDir = process.cwd();
const registryPath = path.join(rootDir, "public", "data", "verified-image-registry.json");

function getRegistry() {
  if (!fs.existsSync(registryPath)) {
    return {
      version: "1.0.0",
      last_updated: new Date().toISOString(),
      stats: { total_images: 0, approved: 0, pending: 0, rejected: 0, by_type: {} },
      images: []
    };
  }
  return JSON.parse(fs.readFileSync(registryPath, "utf8"));
}

function saveRegistry(data: any) {
  // 통계 재계산
  data.last_updated = new Date().toISOString();
  data.stats.total_images = data.images.length;
  data.stats.approved = data.images.filter((i: any) => i.status === "approved").length;
  data.stats.pending = data.images.filter((i: any) => i.status === "pending").length;
  data.stats.rejected = data.images.filter((i: any) => i.status === "rejected").length;

  const byType: Record<string, number> = { venue: 0, event: 0, market: 0, library: 0, nature: 0 };
  data.images.forEach((img: any) => {
    if (byType[img.entity_type] !== undefined) {
      byType[img.entity_type]++;
    }
  });
  data.stats.by_type = byType;

  fs.writeFileSync(registryPath, JSON.stringify(data, null, 2), "utf8");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const entityType = searchParams.get("entity_type");
    const query = searchParams.get("q")?.toLowerCase();

    const registry = getRegistry();
    let filtered = registry.images;

    if (status && status !== "all") {
      filtered = filtered.filter((img: any) => img.status === status);
    }

    if (entityType && entityType !== "all") {
      filtered = filtered.filter((img: any) => img.entity_type === entityType);
    }

    if (query) {
      filtered = filtered.filter(
        (img: any) =>
          img.entity_name?.toLowerCase().includes(query) ||
          img.entity_id?.toLowerCase().includes(query) ||
          img.original_title?.toLowerCase().includes(query) ||
          img.address?.toLowerCase().includes(query)
      );
    }

    return NextResponse.json({
      success: true,
      stats: registry.stats,
      last_updated: registry.last_updated,
      total: filtered.length,
      images: filtered
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, image_id, updates, new_image } = body;
    const registry = getRegistry();

    if (action === "update_status" && image_id) {
      const idx = registry.images.findIndex((img: any) => img.image_id === image_id);
      if (idx === -1) {
        return NextResponse.json({ success: false, error: "Image not found" }, { status: 404 });
      }

      registry.images[idx].status = updates.status;
      if (updates.status === "approved") {
        registry.images[idx].human_verified = true;
        registry.images[idx].verified_by = updates.verified_by || "admin_human";
        registry.images[idx].verified_at = new Date().toISOString();
      }
      if (updates.notes) {
        registry.images[idx].notes = updates.notes;
      }

      saveRegistry(registry);
      return NextResponse.json({ success: true, updated: registry.images[idx] });
    }

    if (action === "add_image" && new_image) {
      const newAsset = {
        image_id: new_image.image_id || `img-manual-${Date.now()}`,
        entity_type: new_image.entity_type || "venue",
        entity_id: new_image.entity_id || "general",
        entity_name: new_image.entity_name || "",
        address: new_image.address || "",
        region: new_image.region || "부울경",
        source_type: new_image.source_type || "admin_upload",
        source_url: new_image.source_url || "",
        source_content_id: new_image.source_content_id || `MANUAL-${Date.now()}`,
        original_title: new_image.original_title || "",
        license: new_image.license || "KOGL Type 1",
        photographer: new_image.photographer || "관리자 등록",
        image_url: new_image.image_url,
        vision_checked: true,
        human_verified: true,
        verified_at: new Date().toISOString(),
        verified_by: new_image.verified_by || "admin_human",
        status: new_image.status || "approved",
        notes: new_image.notes || "수동 검증 등록 자산"
      };

      registry.images.unshift(newAsset);
      saveRegistry(registry);
      return NextResponse.json({ success: true, created: newAsset });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
