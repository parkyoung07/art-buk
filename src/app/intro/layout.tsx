import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "서비스 소개 & 피드백 | 나드리 AI (nadriai.com)",
  },
  description: "부산·울산·경남 문화·전시·5일장·도서관 나들이 종합 플랫폼 나드리 AI 소개 및 사용자 의견 나누기. (나드리 nadriai.com)",
  keywords: [
    "나드리",
    "나드리AI",
    "나드리ai.com",
    "nadriai.com",
    "부울경나드리",
    "부산나드리",
    "문화나들이포털",
    "전시플랫폼",
    "5일장검색",
    "도서관북캉스",
    "AI나들이추천"
  ],
  openGraph: {
    title: "서비스 소개 & 피드백 | 나드리 AI (nadriai.com)",
    description: "부산·울산·경남 문화·전시·5일장·도서관 나들이 종합 플랫폼 나드리 AI 소개. 나드리ai.com",
    url: "https://nadriai.com/intro/",
    siteName: "나드리 AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "서비스 소개 | 나드리 AI (nadriai.com)",
    description: "부울경 문화 예술 나들이 플랫폼 나드리 AI",
  },
};

export default function IntroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
