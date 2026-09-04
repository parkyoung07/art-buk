"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * 사이트 방문자 수 및 페이지뷰를 자동으로 집계하는 백그라운드 트래커 컴포넌트
 */
export default function VisitorTracker() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    // 관리자 페이지는 집계에서 제외
    if (pathname.startsWith("/admin")) return;

    // 동일 경로 중복 트래킹 방지
    if (lastTrackedPath.current === pathname) return;
    lastTrackedPath.current = pathname;

    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const sessionKey = `artbuk_visited_${todayStr}`;
      const hasVisitedToday = sessionStorage.getItem(sessionKey);
      const isNewVisitor = !hasVisitedToday;

      if (isNewVisitor) {
        sessionStorage.setItem(sessionKey, "true");
      }

      // 디바이스 구분
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      const device = isMobile ? "Mobile" : "Desktop";

      // 유입 경로 추출
      let referrerText = "직접 접속 / 북마크";
      if (document.referrer) {
        try {
          const refUrl = new URL(document.referrer);
          if (refUrl.hostname.includes("naver.com")) referrerText = "네이버 검색/블로그";
          else if (refUrl.hostname.includes("daum.net") || refUrl.hostname.includes("kakao.com"))
            referrerText = "카카오 / 다음";
          else if (refUrl.hostname.includes("google.com")) referrerText = "구글 검색";
          else if (refUrl.hostname.includes("instagram.com")) referrerText = "인스타그램";
          else if (refUrl.hostname.includes("daangn.com") || refUrl.hostname.includes("karrot"))
            referrerText = "당근마켓";
          else if (!refUrl.hostname.includes(window.location.hostname)) {
            referrerText = refUrl.hostname;
          }
        } catch {
          referrerText = document.referrer.slice(0, 30);
        }
      }

      // 방문자 통계 API 전송 (비동기)
      fetch("/api/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: pathname,
          title: document.title || pathname,
          isNewVisitor,
          referrer: referrerText,
          device,
        }),
      }).catch(() => {
        // 에러 무시 (사용자 환경에 영향 없도록)
      });
    } catch {
      // ignore
    }
  }, [pathname]);

  return null;
}
