import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "AI 맞춤 나들이 코스 플래너 | 나드리 AI (nadriai.com)",
  },
  description: "지역, 동행자, 소요시간, 예산에 맞춰 부산·울산·경남 전시·5일장·도서관 최적 동선을 AI가 약 1분 만에 스마트하게 구성해드립니다. (나드리 nadriai.com)",
  keywords: [
    "나드리",
    "나드리AI",
    "나드리ai.com",
    "nadriai.com",
    "AI나들이플래너",
    "부울경여행코스",
    "부산데이트코스",
    "울산데이트코스",
    "경남드라이브코스",
    "주말가족나들이",
    "AI코스추천",
    "문화생활플래너",
    "원스톱나들이코스"
  ],
  openGraph: {
    title: "AI 맞춤 나들이 코스 플래너 | 나드리 AI (nadriai.com)",
    description: "지역, 동행자, 소요시간, 예산 맞춤 나드리 코스를 AI가 추천합니다. 나드리ai.com",
    url: "https://nadriai.com/ai-trip/",
    siteName: "나드리 AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI 맞춤 나들이 코스 플래너 | 나드리 AI",
    description: "1분 만에 완성하는 부산·울산·경남 AI 맞춤 문화 나들이 동선 플래너",
  },
};

export default function AiTripLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
