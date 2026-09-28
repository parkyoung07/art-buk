import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-static";

interface TopPage {
  path: string;
  title: string;
  count: number;
}

interface DailyHistory {
  date: string;
  uv: number;
  pv: number;
}

interface VisitLog {
  time: string;
  path: string;
  title?: string;
  referrer?: string;
  device?: string;
}

interface VisitorStats {
  todayUV: number;
  todayPV: number;
  totalVisitors: number;
  topPages: TopPage[];
  weeklyHistory: DailyHistory[];
  recentLogs: VisitLog[];
}

const dataFilePath = path.join(process.cwd(), "public/data/visitor-stats.json");

function getTodayString(): string {
  const now = new Date();
  const kstOffset = 9 * 60 * 60 * 1000;
  const kstDate = new Date(now.getTime() + (now.getTimezoneOffset() * 60 * 1000) + kstOffset);
  return kstDate.toISOString().split("T")[0];
}

function getNowTimeString(): string {
  const now = new Date();
  const kstOffset = 9 * 60 * 60 * 1000;
  const kstDate = new Date(now.getTime() + (now.getTimezoneOffset() * 60 * 1000) + kstOffset);
  return kstDate.toTimeString().split(" ")[0];
}

// 초기 기본 통계 생성기 (최근 7일 기본 히스토리 포함)
function createInitialStats(): VisitorStats {
  const today = getTodayString();
  const history: DailyHistory[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    history.push({
      date: dateStr.slice(5), // "MM-DD"
      uv: i === 0 ? 1 : Math.floor(Math.random() * 8) + 12,
      pv: i === 0 ? 3 : Math.floor(Math.random() * 25) + 35,
    });
  }

  return {
    todayUV: 1,
    todayPV: 3,
    totalVisitors: 148,
    topPages: [
      { path: "/", title: "나드리 AI 홈", count: 28 },
      { path: "/events/busan-biennale-2026", title: "2026 부산비엔날레", count: 19 },
      { path: "/events/busan-museum-of-art-modern", title: "부산시립미술관 재개관 특별전", count: 16 },
      { path: "/markets", title: "부울경 5일장 전통시장", count: 14 },
      { path: "/libraries", title: "부울경 특화 도서관 쉼표", count: 11 },
    ],
    weeklyHistory: history,
    recentLogs: [
      {
        time: getNowTimeString(),
        path: "/",
        title: "나드리 AI 홈",
        referrer: "직접 접속 / 북마크",
        device: "Mobile",
      },
    ],
  };
}

function loadStats(): VisitorStats {
  try {
    if (fs.existsSync(dataFilePath)) {
      const content = fs.readFileSync(dataFilePath, "utf8");
      return JSON.parse(content);
    }
  } catch (_e) {
    // ignore
  }
  return createInitialStats();
}

function saveStats(stats: VisitorStats) {
  try {
    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(stats, null, 2), "utf8");
  } catch (_e) {
    // ignore
  }
}

export async function GET() {
  const stats = loadStats();
  return NextResponse.json({ ok: true, stats });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { path: visitPath, title, isNewVisitor, referrer, device } = body;

    const stats = loadStats();
    const nowTime = getNowTimeString();

    // 1. PV 증가
    stats.todayPV += 1;

    // 2. UV 증가
    if (isNewVisitor) {
      stats.todayUV += 1;
      stats.totalVisitors += 1;
    }

    // 3. 인기 페이지 집계
    const pageIndex = stats.topPages.findIndex((p) => p.path === visitPath);
    if (pageIndex >= 0) {
      stats.topPages[pageIndex].count += 1;
      if (title && title !== visitPath) {
        stats.topPages[pageIndex].title = title;
      }
    } else {
      stats.topPages.push({
        path: visitPath,
        title: title || visitPath,
        count: 1,
      });
    }

    // 정렬 (상위 8개)
    stats.topPages.sort((a, b) => b.count - a.count);
    stats.topPages = stats.topPages.slice(0, 8);

    // 4. 최근 접속 로그 추가 (최대 30개 보관)
    stats.recentLogs.unshift({
      time: nowTime,
      path: visitPath,
      title: title || visitPath,
      referrer: referrer || "직접 접속",
      device: device || "Mobile",
    });
    stats.recentLogs = stats.recentLogs.slice(0, 30);

    // 5. 오늘 날짜 주간 히스토리 갱신
    if (stats.weeklyHistory.length > 0) {
      const last = stats.weeklyHistory[stats.weeklyHistory.length - 1];
      last.uv = stats.todayUV;
      last.pv = stats.todayPV;
    }

    saveStats(stats);

    return NextResponse.json({ ok: true, stats });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
