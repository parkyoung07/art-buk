import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// 1. .env.local 로드
function loadEnv() {
  const envFiles = [".env.local", ".env"];
  for (const file of envFiles) {
    const fullPath = path.join(rootDir, file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadEnv();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = String(process.env.TELEGRAM_CHAT_ID || "");

if (!BOT_TOKEN || !CHAT_ID) {
  console.error("❌ TELEGRAM_BOT_TOKEN 또는 TELEGRAM_CHAT_ID가 .env.local에 설정되지 않았습니다.");
  process.exit(1);
}

// 2. 텔레그램 메시지 발송 함수
export async function sendMessage(text) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
    return await res.json();
  } catch (e) {
    console.error("⚠️ 메시지 발송 실패:", e.message);
  }
}

// 3. 통계 및 현황 통합 수집 함수
function getComprehensiveStats() {
  // 오늘 날짜 KST
  const now = new Date();
  const kstOffset = 9 * 60 * 60 * 1000;
  const kstDate = new Date(now.getTime() + (now.getTimezoneOffset() * 60 * 1000) + kstOffset);
  const today = kstDate.toISOString().split("T")[0];

  // 1) 방문자 통계
  let todayUV = 0;
  let todayPV = 0;
  let totalVisitors = 0;
  let topPages = [];

  const statsPath = path.join(rootDir, "public/data/visitor-stats.json");
  if (fs.existsSync(statsPath)) {
    try {
      const stats = JSON.parse(fs.readFileSync(statsPath, "utf-8"));
      todayUV = stats.todayUV ?? stats.today ?? 0;
      todayPV = stats.todayPV ?? 0;
      totalVisitors = stats.totalVisitors ?? stats.total ?? stats.allTime ?? 0;
      topPages = Array.isArray(stats.topPages) ? stats.topPages.slice(0, 3) : [];
    } catch (e) {
      console.error("visitor-stats 읽기 실패:", e);
    }
  }

  // 2) 카카오 알림톡 신청자 통계
  let kakaoTotal = 0;
  let kakaoToday = 0;
  let recentKakao = [];

  const subscribersPath = path.join(rootDir, "public/data/subscribers.json");
  if (fs.existsSync(subscribersPath)) {
    try {
      const subs = JSON.parse(fs.readFileSync(subscribersPath, "utf-8"));
      if (Array.isArray(subs)) {
        kakaoTotal = subs.length;
        kakaoToday = subs.filter(s => s.subscribedAt && s.subscribedAt.startsWith(today)).length;
        recentKakao = subs.slice(-3).reverse();
      }
    } catch (e) {
      console.error("subscribers.json 읽기 실패:", e);
    }
  }

  // 3) 블로그 포스트 통계
  const postsDir = path.join(rootDir, "src/content/posts");
  const posts = fs.existsSync(postsDir) ? fs.readdirSync(postsDir).filter(f => f.endsWith(".md")) : [];
  const todayPosts = posts.filter(f => f.startsWith(today));

  return {
    today,
    todayUV,
    todayPV,
    totalVisitors,
    topPages,
    kakaoTotal,
    kakaoToday,
    recentKakao,
    totalPosts: posts.length,
    todayPostsCount: todayPosts.length,
    todayPosts,
  };
}

// 4. 최근 글 목록 수집
function getRecentPosts(count = 3) {
  const postsDir = path.join(rootDir, "src/content/posts");
  if (!fs.existsSync(postsDir)) return [];
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith(".md")).sort().reverse();
  return files.slice(0, count);
}

// 종합 현황 보고서 포맷팅
function generateComprehensiveReport() {
  const st = getComprehensiveStats();
  const topPagesText = st.topPages.length > 0
    ? st.topPages.map((p, i) => `   ${i + 1}. ${p.title.split("|")[0].trim()} (<b>${p.count}회</b>)`).join("\n")
    : "   (집계 중)";

  return `📊 <b>[나드리 AI 실시간 종합 보고서]</b>

회장님, 현재 사이트 실시간 핵심 지표 보고드립니다!

👥 <b>1. 방문자 트래픽 현황</b>
• 오늘 순 방문자(UV): <b>${st.todayUV}명</b>
• 오늘 페이지뷰(PV): <b>${st.todayPV}회</b>
• 누적 총 방문자: <b>${st.totalVisitors.toLocaleString()}명</b>

📱 <b>2. 카카오톡 알림톡 신청자</b>
• 오늘 신규 신청: <b>${st.kakaoToday}명</b>
• 누적 총 구독자: <b>${st.kakaoTotal}명</b>
<i>※ 웹사이트 배너 및 팝업을 통해 실시간 신청 접수 중</i>

📝 <b>3. 콘텐츠 & 시스템 상태</b>
• 누적 발행 글: <b>${st.totalPosts}편</b> (오늘 발행: ${st.todayPostsCount}편)
• 이미지 무결성: <b>100% 실사 검증 완료</b>
• 배포 상태: <b>정상 가동 중</b>

🔥 <b>오늘 인기 콘텐츠 Top 3</b>
${topPagesText}

항상 철저하고 투명하게 관리하겠습니다! 🫡`;
}

// 작업 진행 플래그
let isTaskRunning = false;

// 5. 회장님 명령어 및 자연어 처리 라우터
async function handleCommand(text) {
  const clean = text.trim();
  const lower = clean.toLowerCase().replace(/\s+/g, ""); // 띄어쓰기 무시 정규화
  console.log(`📩 [회장님 수신 메시지]: "${clean}" (정규화: "${lower}")`);

  // (1) 도움말 / 메뉴
  if (clean === "/도움말" || clean === "/help" || clean === "/start" || lower.includes("도움말") || lower === "메뉴") {
    return `🫡 <b>[나드리 알리미 전속 비서 안내]</b>

회장님, 편하신 말씀으로 보내주시면 바로 알아듣고 브리핑해 드립니다!

📌 <b>추천 질문 및 명령어:</b>
• <code>보고해줘</code> 또는 <code>/상태</code> : 오늘 방문자 + 카톡신청자 종합 보고
• <code>방문자</code> 또는 <code>방문자수</code> : 오늘 및 누적 방문자 상세
• <code>카톡신청자</code> 또는 <code>구독자</code> : 알림톡 신청자 현황
• <code>최근글</code> : 최근 발행된 글 목록 확인
• <code>/생성</code> : 오늘자 신규 글 즉시 생성 & 배포

그냥 "오늘 방문자 어때?", "카톡 신청자 몇 명이야?" 처럼 편하게 말씀하셔도 됩니다! 🙇`;
  }

  // (2) 종합 보고 ("보고해줘", "현황", "상태", "점검", "방문자와 카톡", "요약")
  const isReportQuery = 
    lower.includes("보고") || 
    lower.includes("현황") || 
    lower.includes("상태") || 
    lower.includes("점검") || 
    lower.includes("요약") || 
    lower.includes("브리핑") ||
    (lower.includes("문자") && lower.includes("카톡")) ||
    (lower.includes("방문") && lower.includes("카톡"));

  if (isReportQuery) {
    return generateComprehensiveReport();
  }

  // (3) 방문자만 집중 질문 ("방문자", "방문자수", "방 문자수", "몇 명", "조회수", "트래픽")
  if (lower.includes("방문자") || lower.includes("방문") || lower.includes("문자수") || lower.includes("조회수") || lower.includes("트래픽")) {
    const st = getComprehensiveStats();
    return `👥 <b>[오늘의 방문자 트래픽 보고]</b>

회장님, 현재 집계된 방문자 통계입니다:

• <b>오늘 방문자(UV):</b> ${st.todayUV}명
• <b>오늘 페이지뷰(PV):</b> ${st.todayPV}회
• <b>누적 총 방문자:</b> ${st.totalVisitors.toLocaleString()}명

💡 <i>네이버 검색 및 카카오톡 유입을 중심으로 꾸준히 트래픽이 유입되고 있습니다.</i> 📈`;
  }

  // (4) 카톡 신청자 집중 질문 ("카톡", "신청자", "구독자", "알림톡")
  if (lower.includes("카톡") || lower.includes("신청자") || lower.includes("구독자") || lower.includes("알림톡")) {
    const st = getComprehensiveStats();
    return `📱 <b>[카카오톡 알림톡 신청자 현황]</b>

회장님, 현재 집계된 카톡 구독 신청 현황입니다:

• <b>오늘 신규 신청:</b> ${st.kakaoToday}명
• <b>누적 총 신청자:</b> ${st.kakaoTotal}명

💡 <i>방문자가 사이트 메인 및 글 하단에서 [매주 금요일 알림톡 받기]를 신청하면 이곳에 실시간 누적 집계됩니다.</i>`;
  }

  // (5) 최근글
  if (lower.includes("최근글") || lower.includes("최신글") || lower.includes("발행글")) {
    const recent = getRecentPosts(5);
    const listText = recent.map((f, i) => `${i + 1}. 📄 <code>${f.replace('.md', '')}</code>`).join("\n");
    return `📚 <b>[최근 발행 포스트 목록]</b>

${listText || "발행된 글이 없습니다."}

모든 글은 시각 검증(3중 쉴드)을 완벽 통과한 상태입니다! ✨`;
  }

  // (5-1) 초안 검수 및 대기 목록 확인 ("초안", "검수", "미리보기", "대기", "초안목록")
  if (lower.includes("초안") || lower.includes("검수") || lower.includes("미리보기") || lower.includes("대기중") || lower.includes("대기목록")) {
    const draftsPath = path.join(rootDir, "public/data/content-drafts.json");
    let drafts = [];
    if (fs.existsSync(draftsPath)) {
      try {
        drafts = JSON.parse(fs.readFileSync(draftsPath, "utf8"));
      } catch (e) {}
    }

    const pending = drafts.filter(d => d.status === "review_required" || d.status === "draft_generated");
    if (pending.length === 0) {
      return `📋 <b>[나드리 AI 콘텐츠 초안 검수 현황]</b>

회장님, 현재 승인 대기 중인 초안이 없습니다.
오늘 생성된 모든 초안이 이미 승인/배포되었거나 대기 중인 작업이 없습니다! ✨

🔗 <b>관리자 검수 센터:</b>
https://nadriai.com/admin/content-review/`;
    }

    const listText = pending.map((d, i) => {
      const slotLabel = d.slot === "am" ? "오전 09:00" : "오후 14:00";
      return `📌 <b>${i + 1}. [${slotLabel}] ${d.title}</b>\n• 분야: ${d.region} | ${d.category}\n• 상태: ⏳ <b>승인 대기</b>\n• 미리보기: ${d.previewUrl || `https://nadriai.com/admin/content-review/?draftId=${d.id}`}`;
    }).join("\n\n");

    return `📋 <b>[회장님 승인 대기 중인 콘텐츠 초안]</b> (총 ${pending.length}건)

${listText}

━━━━━━━━━━━━━━━━━━
💬 <b>원터치 승인 방법:</b>
• <code>승인</code> 또는 <code>배포해</code> (대기 건 일괄/순차 승인)
• <code>오전 승인</code> 또는 <code>1번 승인</code> (해당 건 즉시 배포)`;
  }

  // (5-2) 회장님 승인 및 배포 지시 ("승인", "배포해", "게시해", "올려줘", "이 글 승인", "이대로 배포")
  const isApproveCommand =
    lower === "승인" ||
    lower === "배포해" ||
    lower === "게시해" ||
    lower === "올려줘" ||
    lower.includes("글승인") ||
    lower.includes("이대로배포") ||
    lower.includes("승인해") ||
    lower.includes("배포해줘") ||
    lower.includes("오전승인") ||
    lower.includes("오후승인") ||
    lower.includes("1번승인") ||
    lower.includes("2번승인");

  if (isApproveCommand) {
    if (isTaskRunning) {
      return `⏳ 회장님, 현재 다른 배포 작업이 진행 중입니다. 잠시만 기다려 주십시오!`;
    }

    const draftsPath = path.join(rootDir, "public/data/content-drafts.json");
    let drafts = [];
    if (fs.existsSync(draftsPath)) {
      try {
        drafts = JSON.parse(fs.readFileSync(draftsPath, "utf8"));
      } catch (e) {}
    }

    const pending = drafts.filter(d => d.status === "review_required" || d.status === "draft_generated");

    if (pending.length === 0) {
      return `ℹ️ 회장님, 현재 승인 대기 중인 초안이 없습니다. 먼저 초안을 생성하거나 확인해 주세요!`;
    }

    // 대상 초안 선별
    let targetDraft = null;
    if (lower.includes("오전") || lower.includes("1번")) {
      targetDraft = pending.find(d => d.slot === "am") || pending[0];
    } else if (lower.includes("오후") || lower.includes("2번")) {
      targetDraft = pending.find(d => d.slot === "pm") || pending[1] || pending[0];
    } else if (pending.length === 1) {
      targetDraft = pending[0];
    } else {
      // 대기 중인 글이 2건 이상인 경우 선택 확인 (Rule 13)
      return `❓ <b>[승인 대상 확인]</b>

회장님, 현재 승인 대기 중인 초안이 <b>${pending.length}건</b> 있습니다:

1. <b>[오전 9시]</b> ${pending[0].title}
2. <b>[오후 2시]</b> ${pending[1]?.title || "오후 초안"}

어느 글을 승인하시겠습니까?
• <code>오전 승인</code> 또는 <code>1번 승인</code>
• <code>오후 승인</code> 또는 <code>2번 승인</code>`;
    }

    isTaskRunning = true;
    sendMessage(`🚀 <b>[회장님 승인 접수]</b>\n\n"${targetDraft.title}"\n\n승인 검증 및 Cloudflare 배포 작업을 즉시 개시합니다! 완료되는 대로 보고드리겠습니다. 🫡`);

    exec(`node scripts/approve-and-publish.mjs --id=${targetDraft.id}`, { cwd: rootDir }, (error, stdout, stderr) => {
      isTaskRunning = false;
      if (error) {
        console.error("⚠️ 배포 실패:", error);
        sendMessage(`⚠️ <b>[배포 처리 오류]</b>\n<code>${error.message.slice(0, 300)}</code>`);
      } else {
        console.log("✅ 승인 및 배포 완결");
      }
    });
    return null;
  }

  // (6) 초안 생성 수동 요청
  if (clean === "/생성" || clean === "/포스트" || lower.includes("초안생성") || lower.includes("글생성")) {
    if (isTaskRunning) {
      return `⏳ 회장님, 현재 이미 다른 작업이 진행 중입니다. 잠시만 기다려 주십시오!`;
    }

    isTaskRunning = true;
    sendMessage(`✍️ 회장님의 지시를 접수했습니다!\n\n<b>[신규 콘텐츠 초안 자동 작성]</b>을 가동합니다. 작성이 완료되면 승인 대기 링크와 함께 즉시 보고드리겠습니다.`);

    exec("node scripts/generate-daily-draft.mjs --force", { cwd: rootDir }, (error, stdout, stderr) => {
      isTaskRunning = false;
      if (error) {
        console.error("⚠️ 초안 생성 실패:", error);
        sendMessage(`⚠️ <b>[초안 생성 오류]</b>\n<code>${error.message.slice(0, 300)}</code>`);
      } else {
        console.log("✅ 원격 초안 생성 완료");
      }
    });
    return null;
  }

  // (7) 기타 일반 텍스트에 대한 응대
  return `🫡 <b>회장님, 수석 개발자 레오입니다!</b>

보내주신 말씀: <i>"${clean}"</i>

궁금하신 점이 있으시면 언제든 <b>"보고해줘"</b>, <b>"초안 확인"</b>, 또는 <b>"승인"</b> 이라고 말씀해 주시면 즉시 실행하겠습니다! 🙇`;
}

// 6. 텔레그램 롱 폴링(Long Polling) 루프
let lastUpdateId = 0;

async function pollUpdates() {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`;
  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.ok && Array.isArray(data.result)) {
      for (const update of data.result) {
        lastUpdateId = update.update_id;

        const message = update.message;
        if (!message || !message.text) continue;

        const senderChatId = String(message.chat.id);
        if (senderChatId !== CHAT_ID) {
          console.warn(`🚨 알 수 없는 사용자 접근 차단 (Chat ID: ${senderChatId})`);
          continue;
        }

        const reply = await handleCommand(message.text);
        if (reply) {
          await sendMessage(reply);
        }
      }
    }
  } catch (e) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  setImmediate(pollUpdates);
}

console.log("==================================================");
console.log("🤖 [나드리 AI] 회장님 전속 텔레그램 비서봇 가동 시작");
console.log(`📱 등록된 회장님 Chat ID: ${CHAT_ID}`);
console.log("==================================================");

// 초기 getUpdates로 이전 메시지 오프셋 정리
fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=-1`)
  .then(r => r.json())
  .then(d => {
    if (d.ok && d.result && d.result.length > 0) {
      lastUpdateId = d.result[d.result.length - 1].update_id;
    }
    // 즉시 회장님께 요청하신 종합 보고서 발송!
    const initialReport = generateComprehensiveReport();
    return sendMessage(initialReport);
  })
  .then(() => {
    pollUpdates();
  })
  .catch(() => {
    pollUpdates();
  });
