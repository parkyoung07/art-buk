import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// .env.local 및 .env 로드 함수 (외부 의존성 없이 가볍게 파싱)
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
          // 따옴표 제거
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
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

/**
 * 텔레그램 메시지 발송 함수
 * @param {string} text - 보낼 메시지 (HTML or Markdown)
 * @param {object} options - 옵션 ({ parseMode: 'HTML' | 'Markdown' })
 */
export async function sendTelegramMessage(text, options = { parseMode: "HTML" }) {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.error("❌ [Telegram] TELEGRAM_BOT_TOKEN 또는 TELEGRAM_CHAT_ID 환경변수가 설정되지 않았습니다.");
    return { success: false, error: "ENV_NOT_SET" };
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const payload = {
    chat_id: CHAT_ID,
    text: text,
    parse_mode: options.parseMode || "HTML",
    disable_web_page_preview: options.disablePreview ?? false,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!data.ok) {
      console.error("❌ [Telegram] 발송 실패 응답:", data);
      return { success: false, data };
    }

    console.log("✅ [Telegram] 메시지 발송 성공!");
    return { success: true, data };
  } catch (error) {
    console.error("❌ [Telegram] 네트워크 또는 통신 에러:", error.message);
    return { success: false, error: error.message };
  }
}

// 직접 CLI에서 실행되었을 때 테스트 메시지 전송
if (process.argv[1] === __filename) {
  const customMsg = process.argv.slice(2).join(" ");
  const now = new Date();
  const kstTime = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now);

  const testMessage = customMsg || `🛎️ <b>[나드리 AI 폰 알림 비서 테스트]</b>

회장님, 수석 개발자 레오입니다!
텔레그램 실시간 알림 연동이 정상적으로 완료되었습니다.

⏰ <b>연결 시각:</b> ${kstTime} (KST)
🤖 <b>수신 채널:</b> 회장님 전용 직통 폰 알림
✨ <b>상태:</b> 정상 가동 (정상 수신 완료)

앞으로 나드리 AI의 일일 포스트 발행 및 주요 시스템 리포트를 실시간으로 정중히 보고드리겠습니다! 🫡`;

  console.log("📡 텔레그램 테스트 메시지 전송 시도 중...");
  sendTelegramMessage(testMessage).then((res) => {
    if (res.success) {
      console.log("🎉 테스트 메시지가 회장님의 텔레그램으로 정상 전송되었습니다!");
      process.exit(0);
    } else {
      console.error("⚠️ 테스트 메시지 전송에 실패했습니다. 확인이 필요합니다.");
      process.exit(1);
    }
  });
}
