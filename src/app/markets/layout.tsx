import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "부산·울산·경남 5일장 & 전통시장 전체보기 | 나드리 AI (nadriai.com)",
  },
  description: "부산·울산·경남 지역 5일장 및 전통시장의 오늘·내일 장날 주기, 대표 먹거리, 특산물, 주차 정보를 한눈에 확인하세요. (나드리 nadriai.com)",
  keywords: [
    "나드리",
    "나드리AI",
    "나드리ai.com",
    "nadriai.com",
    "부산5일장",
    "울산5일장",
    "경남5일장",
    "부울경5일장",
    "부산전통시장",
    "울산전통시장",
    "경남전통시장",
    "구포시장",
    "자갈치시장",
    "화개장터",
    "밀양아리랑시장",
    "언양시장",
    "남창옹기종기시장",
    "장날계산기",
    "전통시장먹거리",
    "주말시장나들이"
  ],
  openGraph: {
    title: "부산·울산·경남 5일장 & 전통시장 전체보기 | 나드리 AI (nadriai.com)",
    description: "부산·울산·경남 지역 5일장 및 전통시장의 실시간 장날과 대표 먹거리를 확인하세요. 나드리ai.com",
    url: "https://nadriai.com/markets/",
    siteName: "나드리 AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "부산·울산·경남 5일장 & 전통시장 전체보기 | 나드리 AI",
    description: "부산·울산·경남 지역 5일장 실시간 장날 주기 및 전통 먹거리 정보",
  },
};

export default function MarketsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
