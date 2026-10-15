import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export const dynamic = "force-static";

const draftsFilePath = path.join(process.cwd(), "data", "private", "content-drafts.json");
const isLocalDevelopment = () => process.env.NODE_ENV === "development";

export async function GET() {
  if (!isLocalDevelopment()) {
    return NextResponse.json({ error: "Production draft API is disabled" }, { status: 410 });
  }
  if (!fs.existsSync(draftsFilePath)) return NextResponse.json([]);
  return NextResponse.json(JSON.parse(fs.readFileSync(draftsFilePath, "utf8")));
}

export async function POST() {
  return NextResponse.json(
    { error: "Draft changes must use the approved GitHub Actions workflow" },
    { status: 405, headers: { Allow: "GET" } },
  );
}
