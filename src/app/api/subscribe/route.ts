import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-static";

const subscribersFilePath = path.join(process.cwd(), "public/data/subscribers.json");

interface Subscriber {
  id: string;
  phone: string;
  subscribedAt: string;
  source?: string;
  userAgent?: string;
}

function loadSubscribers(): Subscriber[] {
  try {
    if (fs.existsSync(subscribersFilePath)) {
      const content = fs.readFileSync(subscribersFilePath, "utf8");
      return JSON.parse(content);
    }
  } catch (e) {
    console.error("Failed to load subscribers:", e);
  }
  return [];
}

function saveSubscribers(subscribers: Subscriber[]): boolean {
  try {
    const dir = path.dirname(subscribersFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(subscribersFilePath, JSON.stringify(subscribers, null, 2), "utf8");
    return true;
  } catch (e) {
    console.error("Failed to save subscribers:", e);
    return false;
  }
}

// 1. GET: 구독자 현황 조회 (총 신청자 수 등)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const adminKey = searchParams.get("key");
  const subscribers = loadSubscribers();

  // 관리자 키가 있을 경우 전체 목록 반환, 아닐 경우 총인원 카운트 반환
  if (adminKey === "nadri-admin-2026") {
    return NextResponse.json({
      ok: true,
      totalCount: subscribers.length,
      subscribers: subscribers.reverse(),
    });
  }

  return NextResponse.json({
    ok: true,
    totalCount: subscribers.length,
  });
}

// 2. POST: 새로운 알림톡 신청자 등록
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, source = "kakao_modal" } = body;

    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { ok: false, error: "전화번호가 올바르지 않습니다." },
        { status: 400 }
      );
    }

    // 숫자 및 하이픈 정제
    const cleanedPhone = phone.replace(/[^0-9-]/g, "").trim();
    if (cleanedPhone.length < 9) {
      return NextResponse.json(
        { ok: false, error: "유효한 전화번호를 입력해 주세요." },
        { status: 400 }
      );
    }

    const subscribers = loadSubscribers();

    // 중복 체크 (하이픈 제외 번호 비교)
    const rawNumber = cleanedPhone.replace(/-/g, "");
    const isDuplicate = subscribers.some(
      (s) => s.phone.replace(/-/g, "") === rawNumber
    );

    if (isDuplicate) {
      return NextResponse.json({
        ok: true,
        message: "이미 알림톡 신청이 완료된 번호입니다. 매주 알림이 정상 발송됩니다.",
        isDuplicate: true,
        totalCount: subscribers.length,
      });
    }

    const userAgent = req.headers.get("user-agent") || "unknown";

    const newSubscriber: Subscriber = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      phone: cleanedPhone,
      subscribedAt: new Date().toISOString(),
      source,
      userAgent: userAgent.substring(0, 150),
    };

    subscribers.push(newSubscriber);
    const success = saveSubscribers(subscribers);

    if (!success) {
      return NextResponse.json(
        { ok: false, error: "저장 처리 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "카카오 알림톡 신청이 성공적으로 완료되었습니다!",
      totalCount: subscribers.length,
    });
  } catch (e) {
    console.error("Error in /api/subscribe POST:", e);
    return NextResponse.json(
      { ok: false, error: "서버 처리 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
