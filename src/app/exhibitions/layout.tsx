import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "부산·울산·경남 전시 전체보기 | 나드리 AI (nadriai.com)",
  },
  description: "부산·울산·경남 지역 미술관과 갤러리에서 현재 진행 중인 주요 전시, 무료 관람 정보, AI 추천 포인트를 한눈에 확인하세요. (나드리 nadriai.com)",
  keywords: [
    "나드리",
    "나드리AI",
    "나드리ai.com",
    "nadriai.com",
    "부산전시",
    "울산전시",
    "경남전시",
    "부산전시회",
    "울산전시회",
    "경남전시회",
    "부산미술관",
    "울산미술관",
    "경남도립미술관",
    "부산현대미술관",
    "부산시립미술관",
    "부산비엔날레",
    "무료전시",
    "주말데이트",
    "부울경전시일정"
  ],
  openGraph: {
    title: "부산·울산·경남 전시 전체보기 | 나드리 AI (nadriai.com)",
    description: "부산·울산·경남 지역 미술관과 갤러리에서 현재 진행 중인 주요 전시를 한눈에 확인하세요. 나드리ai.com",
    url: "https://nadriai.com/exhibitions/",
    siteName: "나드리 AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "부산·울산·경남 전시 전체보기 | 나드리 AI",
    description: "부산·울산·경남 주요 미술관 전시 일정 및 AI 큐레이션 추천",
  },
};

export default function ExhibitionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
